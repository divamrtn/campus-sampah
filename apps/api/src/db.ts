import { DatabaseSync } from "node:sqlite";
import { DB_PATH } from "./config";

export const ROLES = ["admin", "petugas", "mahasiswa"] as const;
export const KATEGORI = ["Organik", "Anorganik", "B3"] as const;
export const STATUS = ["Menunggu", "Terverifikasi", "Ditolak"] as const;

export type Role = (typeof ROLES)[number];
export type Kategori = (typeof KATEGORI)[number];
export type Status = (typeof STATUS)[number];

export const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','petugas','mahasiswa')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Satu tabel untuk data sampah input admin/petugas dan setoran mahasiswa.
  -- Baris setoran mahasiswa punya user_id; poin hanya terisi untuk baris itu.
  CREATE TABLE IF NOT EXISTS sampah (
    id TEXT PRIMARY KEY,
    tanggal TEXT NOT NULL,
    lokasi TEXT NOT NULL,
    petugas TEXT,
    kategori TEXT NOT NULL CHECK (kategori IN ('Organik','Anorganik','B3')),
    berat_kg REAL NOT NULL CHECK (berat_kg > 0),
    status TEXT NOT NULL DEFAULT 'Menunggu' CHECK (status IN ('Menunggu','Terverifikasi','Ditolak')),
    poin INTEGER NOT NULL DEFAULT 0,
    catatan TEXT,
    user_id INTEGER REFERENCES users(id),
    created_by INTEGER REFERENCES users(id),
    verified_by INTEGER REFERENCES users(id),
    verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_sampah_status ON sampah(status);
  CREATE INDEX IF NOT EXISTS idx_sampah_user ON sampah(user_id);
`);

// Migrasi: tambah kolom phone jika belum ada (aman untuk database lama)
const userCols = db.prepare("PRAGMA table_info(users)").all() as unknown as { name: string }[];
if (!userCols.some((c) => c.name === "phone")) {
  db.exec("ALTER TABLE users ADD COLUMN phone TEXT");
}

type Param = string | number | null;

export function get<T>(sql: string, ...p: Param[]): T | undefined {
  return db.prepare(sql).get(...p) as unknown as T | undefined;
}

export function all<T>(sql: string, ...p: Param[]): T[] {
  return db.prepare(sql).all(...p) as unknown as T[];
}

export function run(sql: string, ...p: Param[]) {
  return db.prepare(sql).run(...p);
}

/** Jalankan beberapa query sebagai satu kesatuan: semua berhasil atau semua dibatalkan. */
export function tx<T>(fn: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

/** Poin per kilogram. Sesuaikan dengan aturan kampus kamu. */
export const POIN_PER_KG: Record<Kategori, number> = { Organik: 5, Anorganik: 10, B3: 15 };

export function hitungPoin(kategori: Kategori, beratKg: number): number {
  return Math.round(POIN_PER_KG[kategori] * beratKg);
}

export function nextSampahId(): string {
  const row = get<{ maks: number | null }>(
    "SELECT MAX(CAST(SUBSTR(id, 5) AS INTEGER)) AS maks FROM sampah",
  );
  return `SMP-${Math.max(row?.maks ?? 0, 1000) + 1}`;
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const hariIniISO = () => iso(new Date());

/** Batas atas tanggal input (besok), supaya perbedaan zona waktu tidak menolak input yang sah. */
export const besokISO = () => iso(new Date(Date.now() + 24 * 60 * 60 * 1000));

export interface SampahRow {
  id: string;
  tanggal: string;
  lokasi: string;
  petugas: string | null;
  kategori: Kategori;
  berat_kg: number;
  status: Status;
  poin: number;
  catatan: string | null;
  user_id: number | null;
}

/** Bentuk data yang dikirim ke frontend. */
export function toApi(r: SampahRow) {
  return {
    id: r.id,
    tanggal: r.tanggal,
    lokasi: r.lokasi,
    petugas: r.petugas ?? "",
    kategori: r.kategori,
    beratKg: r.berat_kg,
    status: r.status,
    poin: r.poin,
    catatan: r.catatan ?? undefined,
    dariMahasiswa: r.user_id !== null,
  };
}