import { Kategori, Status } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "../../shared/utils/pagination.js";
import { intId } from "../../shared/utils/validators.js";

const berat = z.coerce.number().positive("Berat harus lebih dari 0").max(100000);

const sampahBase = z.object({
  tanggal: z.coerce.date().optional(),
  lokasi: z.string().trim().min(1).max(150).optional(),
  kategori: z.nativeEnum(Kategori).optional(),
  beratKg: berat,
  jenisId: intId.optional(),
  tpsId: intId.optional(),
  userId: intId.optional(), // khusus admin/petugas: input setoran atas nama mahasiswa
  catatan: z.string().trim().max(500).optional(),
  fotoUrl: z.string().url().max(500).optional(),
  langsungVerifikasi: z.boolean().optional(), // khusus admin/petugas
});

export const createSampahSchema = sampahBase
  .refine((d) => d.kategori || d.jenisId, { message: "kategori atau jenisId wajib diisi", path: ["kategori"] })
  .refine((d) => d.lokasi || d.tpsId, { message: "lokasi atau tpsId wajib diisi", path: ["lokasi"] });
export type CreateSampahInput = z.infer<typeof createSampahSchema>;

export const updateSampahSchema = sampahBase
  .omit({ userId: true, langsungVerifikasi: true, jenisId: true, tpsId: true })
  .extend({ jenisId: intId.nullable().optional(), tpsId: intId.nullable().optional() })
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "Tidak ada data yang diubah" });
export type UpdateSampahInput = z.infer<typeof updateSampahSchema>;

export const verifikasiSchema = z
  .object({
    status: z.enum([Status.Terverifikasi, Status.Ditolak]),
    alasanTolak: z.string().trim().min(3).max(300).optional(),
    beratKg: berat.optional(), // koreksi berat hasil timbang petugas
  })
  .refine((d) => d.status !== Status.Ditolak || !!d.alasanTolak, {
    message: "alasanTolak wajib diisi saat menolak",
    path: ["alasanTolak"],
  });
export type VerifikasiInput = z.infer<typeof verifikasiSchema>;

export const listSampahQuery = paginationSchema.extend({
  status: z.nativeEnum(Status).optional(),
  kategori: z.nativeEnum(Kategori).optional(),
  tpsId: intId.optional(),
  jenisId: intId.optional(),
  userId: intId.optional(), // diabaikan untuk mahasiswa
  tipe: z.enum(["setoran", "umum"]).optional(), // setoran = milik mahasiswa, umum = input petugas tanpa pemilik
  dari: z.coerce.date().optional(),
  sampai: z.coerce.date().optional(),
  search: z.string().trim().optional(),
});
