import { Kategori } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "../../../shared/utils/pagination.js";
import { optionalBool } from "../../../shared/utils/validators.js";

const base = z.object({
  kode: z.string().trim().toUpperCase().min(2).max(30),
  nama: z.string().trim().min(2).max(100),
  kategori: z.nativeEnum(Kategori),
  deskripsi: z.string().trim().max(500).nullable().optional(),
  gambarUrl: z.string().url().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const createJenisSchema = base;
export const updateJenisSchema = base
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "Tidak ada data yang diubah" });

export const listJenisQuery = paginationSchema.extend({
  kategori: z.nativeEnum(Kategori).optional(),
  isActive: optionalBool,
  search: z.string().trim().optional(),
});
