import { z } from "zod";
import { paginationSchema } from "../../../shared/utils/pagination.js";
import { optionalBool } from "../../../shared/utils/validators.js";

const base = z.object({
  kode: z.string().trim().toUpperCase().min(2).max(30),
  nama: z.string().trim().min(2).max(100),
  lokasi: z.string().trim().min(2).max(150),
  deskripsi: z.string().trim().max(500).nullable().optional(),
  latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
  kapasitasKg: z.coerce.number().positive().nullable().optional(),
  jamBuka: z.string().trim().max(50).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const createTpsSchema = base;
export const updateTpsSchema = base
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "Tidak ada data yang diubah" });

export const listTpsQuery = paginationSchema.extend({
  isActive: optionalBool,
  search: z.string().trim().optional(),
});
