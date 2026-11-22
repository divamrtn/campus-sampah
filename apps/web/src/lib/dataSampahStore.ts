import { del, patch, post } from "./api";
import { fetchSampah, type Kategori, type StatusData } from "./sampahData";

export interface DataSampahRow {
  id: string;
  tanggal: string; // YYYY-MM-DD
  lokasi: string;
  petugas: string;
  kategori: Kategori;
  beratKg: number;
  status: StatusData;
  catatan?: string;
}

export interface DataSampahInput {
  tanggal: string;
  lokasi: string;
  petugas: string;
  kategori: Kategori;
  beratKg: number;
  catatan?: string;
}

/** Pilihan di form. Sesuaikan dengan lokasi dan petugas kamu. */
export const LOKASI_LIST = ["TPS Kenanga", "TPS Mawar", "Bank Sampah Melati"];
export const PETUGAS_LIST = ["Agus Prasetyo", "Budi Santoso", "Siti Aminah", "Dewi Lestari"];

/** Data terbaru berada di urutan pertama. */
export const getDataSampah = (): Promise<DataSampahRow[]> => fetchSampah();

export const addDataSampah = (input: DataSampahInput) =>
  post<DataSampahRow>("/sampah", input);

export const updateStatusSampah = (id: string, status: Exclude<StatusData, "Menunggu">) =>
  patch<DataSampahRow>(`/sampah/${encodeURIComponent(id)}/status`, { status });

/** Khusus admin. */
export const deleteDataSampah = (id: string) =>
  del<void>(`/sampah/${encodeURIComponent(id)}`);