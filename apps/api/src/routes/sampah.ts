import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../auth";
import {
  KATEGORI,
  all,
  besokISO,
  get,
  hitungPoin,
  nextSampahId,
  run,
  toApi,
  tx,
  type SampahRow,
} from "../db";

const router = Router();
router.use(requireAuth, requireRole("admin", "petugas"));

const createSchema = z.object({
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD."),
  lokasi: z.string().min(2, "Lokasi wajib diisi.").max(100),
  petugas: z.string().max(80).optional(),
  kategori: z.enum(KATEGORI),
  beratKg: z.coerce.number().positive("Berat harus lebih dari 0.").max(100000),
  catatan: z.string().max(300).optional(),
});

const statusSchema = z.object({
  status: z.enum(["Terverifikasi", "Ditolak"]),
});

router.get("/", (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : null;
  const rows = status
    ? all<SampahRow>("SELECT * FROM sampah WHERE status = ? ORDER BY tanggal DESC, id DESC", status)
    : all<SampahRow>("SELECT * FROM sampah ORDER BY tanggal DESC, id DESC");
  res.json(rows.map(toApi));
});

router.post("/", (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0].message });
    return;
  }
  const d = parsed.data;
  if (d.tanggal > besokISO()) {
    res.status(400).json({ message: "Tanggal tidak boleh di masa depan." });
    return;
  }
  const id = tx(() => {
    const newId = nextSampahId();
    run(
      `INSERT INTO sampah (id, tanggal, lokasi, petugas, kategori, berat_kg, status, poin, catatan, created_by)
       VALUES (?, ?, ?, ?, ?, ?, 'Menunggu', 0, ?, ?)`,
      newId,
      d.tanggal,
      d.lokasi,
      d.petugas || req.auth!.name,
      d.kategori,
      d.beratKg,
      d.catatan ?? null,
      req.auth!.id,
    );
    return newId;
  });
  const row = get<SampahRow>("SELECT * FROM sampah WHERE id = ?", id)!;
  res.status(201).json(toApi(row));
});

// Verifikasi atau tolak data. Poin hanya dihitung untuk setoran mahasiswa.
router.patch("/:id/status", (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Status harus Terverifikasi atau Ditolak." });
    return;
  }
  const row = get<SampahRow>("SELECT * FROM sampah WHERE id = ?", String(req.params.id));
  if (!row) {
    res.status(404).json({ message: "Data tidak ditemukan." });
    return;
  }
  if (row.status !== "Menunggu") {
    res.status(409).json({ message: "Data ini sudah diproses." });
    return;
  }
  const { status } = parsed.data;
  const poin =
    status === "Terverifikasi" && row.user_id !== null
      ? hitungPoin(row.kategori, row.berat_kg)
      : 0;
  run(
    "UPDATE sampah SET status = ?, poin = ?, petugas = COALESCE(petugas, ?), verified_by = ?, verified_at = datetime('now') WHERE id = ?",
    status,
    poin,
    req.auth!.name,
    req.auth!.id,
    row.id,
  );
  res.json(toApi(get<SampahRow>("SELECT * FROM sampah WHERE id = ?", row.id)!));
});

router.delete("/:id", requireRole("admin"), (req, res) => {
  const result = run("DELETE FROM sampah WHERE id = ?", String(req.params.id));
  if (Number(result.changes) === 0) {
    res.status(404).json({ message: "Data tidak ditemukan." });
    return;
  }
  res.status(204).end();
});

export default router;