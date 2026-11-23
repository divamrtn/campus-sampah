import { StatusLaporan } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "../../shared/utils/pagination.js";
import { intId } from "../../shared/utils/validators.js";

export const createLaporanSchema = z.object({
  judul: z.string().trim().min(3).max(150),
  deskripsi: z.string().trim().min(5).max(2000),
  lokasi: z.string().trim().min(2).max(150),
  fotoUrl: z.string().url().max(500).optional(),
});

export const tanggapiSchema = z
  .object({
    status: z.enum([StatusLaporan.Diproses, StatusLaporan.Selesai, StatusLaporan.Ditolak]),
    tanggapan: z.string().trim().min(3).max(1000).optional(),
  })
  .refine((d) => d.status !== StatusLaporan.Ditolak || !!d.tanggapan, {
    message: "tanggapan wajib diisi saat menolak laporan",
    path: ["tanggapan"],
  });

export const listLaporanQuery = paginationSchema.extend({
  status: z.nativeEnum(StatusLaporan).optional(),
  userId: intId.optional(), // diabaikan untuk mahasiswa
  search: z.string().trim().optional(),
});
