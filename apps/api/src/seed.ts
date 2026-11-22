import bcrypt from "bcryptjs";
import { get, hariIniISO, hitungPoin, nextSampahId, run, tx, type Kategori, type Role, type Status } from "./db";

const USERS: Array<{ username: string; email: string; name: string; password: string; role: Role }> = [
  { username: "admin", email: "admin@campus.ac.id", name: "Admin Kampus", password: "admin123", role: "admin" },
  { username: "petugas", email: "petugas@campus.ac.id", name: "Agus Prasetyo", password: "petugas123", role: "petugas" },
  { username: "mahasiswa", email: "mahasiswa@campus.ac.id", name: "Mahasiswa Demo", password: "mahasiswa123", role: "mahasiswa" },
];

/** [id, tanggal, lokasi, petugas, kategori, berat, status] */
const ADMIN_ROWS: Array<[string, string, string, string, Kategori, number, Status]> = [
  ["SMP-1030", "2026-11-06", "TPS Kenanga", "Agus Prasetyo", "Anorganik", 38.5, "Menunggu"],
  ["SMP-1020", "2026-11-06", "TPS Kenanga", "Budi Santoso", "Anorganik", 124.5, "Menunggu"],
  ["SMP-1010", "2026-11-06", "TPS Kenanga", "Agus Prasetyo", "Anorganik", 210.3, "Terverifikasi"],
  ["SMP-1029", "2026-11-05", "Bank Sampah Melati", "Siti Aminah", "Organik", 97.2, "Terverifikasi"],
  ["SMP-1019", "2026-11-05", "Bank Sampah Melati", "Dewi Lestari", "Organik", 86, "Terverifikasi"],
  ["SMP-1009", "2026-11-05", "Bank Sampah Melati", "Siti Aminah", "Organik", 12.8, "Menunggu"],
  ["SMP-1028", "2026-11-04", "TPS Mawar", "Budi Santoso", "B3", 124.5, "Terverifikasi"],
  ["SMP-1018", "2026-11-04", "TPS Mawar", "Agus Prasetyo", "B3", 210.3, "Ditolak"],
];

const MHS_KATEGORI: Kategori[] = ["Anorganik", "Organik", "Anorganik", "B3", "Organik"];
const MHS_STATUS: Status[] = ["Menunggu", "Terverifikasi", "Terverifikasi", "Terverifikasi", "Ditolak"];
const MHS_BERAT = [2.5, 4, 1.2, 0.4, 3.1];
const MHS_LOKASI = ["Bank Sampah Kampus", "TPS Gedung A", "TPS Kantin", "TPS Asrama", "Bank Sampah Kampus"];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Mengisi akun dan data contoh hanya kalau database masih kosong. */
export function seedIfEmpty(): void {
  const jumlah = get<{ n: number }>("SELECT COUNT(*) AS n FROM users")?.n ?? 0;
  if (jumlah > 0) return;

  tx(() => {
    const ids: Record<string, number> = {};
    for (const u of USERS) {
      const res = run(
        "INSERT INTO users (username, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        u.username,
        u.email,
        u.name,
        bcrypt.hashSync(u.password, 10),
        u.role,
      );
      ids[u.username] = Number(res.lastInsertRowid);
    }

    for (const [id, tgl, lokasi, petugas, kategori, berat, status] of ADMIN_ROWS) {
      const verified = status !== "Menunggu";
      run(
        `INSERT INTO sampah (id, tanggal, lokasi, petugas, kategori, berat_kg, status, poin, user_id, created_by, verified_by, verified_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?, ?)`,
        id, tgl, lokasi, petugas, kategori, berat, status,
        ids.admin,
        verified ? ids.petugas : null,
        verified ? `${tgl} 12:00:00` : null,
      );
    }

    // Beberapa setoran contoh untuk akun mahasiswa
    const sekarang = new Date();
    MHS_KATEGORI.forEach((kategori, i) => {
      const tgl = new Date(sekarang);
      tgl.setDate(tgl.getDate() - i * 2);
      const tanggal = i === 0 ? hariIniISO() : iso(tgl);
      const status = MHS_STATUS[i];
      const verified = status !== "Menunggu";
      run(
        `INSERT INTO sampah (id, tanggal, lokasi, petugas, kategori, berat_kg, status, poin, user_id, created_by, verified_by, verified_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        nextSampahId(), tanggal, MHS_LOKASI[i],
        verified ? "Agus Prasetyo" : null,
        kategori, MHS_BERAT[i], status,
        status === "Terverifikasi" ? hitungPoin(kategori, MHS_BERAT[i]) : 0,
        ids.mahasiswa, ids.mahasiswa,
        verified ? ids.petugas : null,
        verified ? `${tanggal} 12:00:00` : null,
      );
    });
  });

  console.log("Database kosong, akun dan data contoh dibuat (admin/admin123, petugas/petugas123, mahasiswa/mahasiswa123).");
}