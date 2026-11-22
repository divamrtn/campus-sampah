import { get } from "./api";

export type Kategori = "Organik" | "Anorganik" | "B3";
export type StatusData = "Terverifikasi" | "Menunggu" | "Ditolak";

export interface SampahRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  lokasi: string;
  petugas: string;
  kategori: Kategori;
  beratKg: number;
  status: StatusData;
  poin?: number;
  catatan?: string;
  dariMahasiswa?: boolean;
}

export const KATEGORI_LIST: Kategori[] = ["Organik", "Anorganik", "B3"];
export const STATUS_LIST: StatusData[] = ["Terverifikasi", "Menunggu", "Ditolak"];

const pad = (n: number) => String(n).padStart(2, "0");

export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Semua data sampah dari server (khusus admin dan petugas). */
export const fetchSampah = () => get<SampahRecord[]>("/sampah");

export function formatTanggal(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatBerat(kg: number): string {
  return `${kg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`;
}