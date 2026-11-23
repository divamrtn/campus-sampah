import { z } from "zod";
import { paginationSchema } from "../../shared/utils/pagination.js";
import { optionalBool } from "../../shared/utils/validators.js";

const base = z.object({
  nama: z.string().trim().min(2).max(100),
  deskripsi: z.string().trim().max(1000).nullable().optional(),
  poinDibutuhkan: z.coerce.number().int().positive(),
  stok: z.coerce.number().int().min(0),
  gambarUrl: z.string().url().max(500).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const createRewardSchema = base;
export const updateRewardSchema = base
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "Tidak ada data yang diubah" });

export const listRewardQuery = paginationSchema.extend({
  isActive: optionalBool,
  search: z.string().trim().optional(),
});
