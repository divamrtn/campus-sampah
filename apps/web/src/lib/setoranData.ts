import { get, post } from "./api";
import type { Kategori, StatusData } from "./sampahData";

export interface Setoran {
  id: string;
  tanggal: string; // YYYY-MM-DD
  lokasi: string;
  kategori: Kategori;
  beratKg: number;
  status: StatusData;
  /** Poin yang sudah diterima. Bernilai 0 sampai setoran terverifikasi. */
  poin: number;
  catatan?: string;
}

export interface SetoranInput {
  tanggal: string;
  lokasi: string;
  kategori: Kategori;
  beratKg: number;
  catatan?: string;
}

export const LOKASI_SETOR = ["Bank Sampah Kampus", "TPS Gedung A", "TPS Kantin", "TPS Asrama"];

/** Hanya untuk estimasi di form. Poin resmi dihitung server saat verifikasi. */
export const POIN_PER_KG: Record<Kategori, number> = {
  Organik: 5,
  Anorganik: 10,
  B3: 15,
};

export function hitungPoin(kategori: Kategori, beratKg: number): number {
  return Math.round(POIN_PER_KG[kategori] * beratKg);
}

/** Setoran milik mahasiswa yang sedang login, terbaru di urutan pertama. */
export const getSetoran = () => get<Setoran[]>("/setoran");

export const addSetoran = (input: SetoranInput) => post<Setoran>("/setoran", input);

export function totalPoin(list: Setoran[]): number {
  return list.reduce((sum, s) => sum + s.poin, 0);
}

/** Dipertahankan agar kode logout lama tetap jalan. Data kini ada di server. */
export function clearSetoran(): void {}