import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../auth";
import {
  KATEGORI,
  all,
  besokISO,
  get,
  hariIniISO,
  nextSampahId,
  run,
  toApi,
  tx,
  type SampahRow,
} from "../db";

const router = Router();
router.use(requireAuth, requireRole("mahasiswa"));

const setoranSchema = z.object({
  lokasi: z.string().min(2, "Lokasi wajib diisi.").max(100),
  kategori: z.enum(KATEGORI),
  beratKg: z.coerce.number().positive("Berat harus lebih dari 0.").max(1000),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  catatan: z.string().max(300).optional(),
});

router.get("/", (req, res) => {
  const rows = all<SampahRow>(
    "SELECT * FROM sampah WHERE user_id = ? ORDER BY tanggal DESC, id DESC",
    req.auth!.id,
  );
  res.json(rows.map(toApi));
});

router.get("/ringkasan", (req, res) => {
  const r = get<{ total_poin: number | null; jumlah: number; berat: number | null }>(
    `SELECT SUM(poin) AS total_poin, COUNT(*) AS jumlah, SUM(berat_kg) AS berat
     FROM sampah WHERE user_id = ? AND status = 'Terverifikasi'`,
    req.auth!.id,
  );
  res.json({
    totalPoin: r?.total_poin ?? 0,
    jumlahSetoran: r?.jumlah ?? 0,
    totalBeratKg: r?.berat ?? 0,
  });
});

router.post("/", (req, res) => {
  const parsed = setoranSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0].message });
    return;
  }
  const d = parsed.data;
  const tanggal = d.tanggal ?? hariIniISO();
  if (tanggal > besokISO()) {
    res.status(400).json({ message: "Tanggal tidak boleh di masa depan." });
    return;
  }
  const id = tx(() => {
    const newId = nextSampahId();
    run(
      `INSERT INTO sampah (id, tanggal, lokasi, kategori, berat_kg, status, poin, catatan, user_id, created_by)
       VALUES (?, ?, ?, ?, ?, 'Menunggu', 0, ?, ?, ?)`,
      newId,
      tanggal,
      d.lokasi,
      d.kategori,
      d.beratKg,
      d.catatan ?? null,
      req.auth!.id,
      req.auth!.id,
    );
    return newId;
  });
  res.status(201).json(toApi(get<SampahRow>("SELECT * FROM sampah WHERE id = ?", id)!));
});

export default router;