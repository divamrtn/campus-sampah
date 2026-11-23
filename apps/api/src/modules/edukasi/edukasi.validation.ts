import { z } from "zod";
import { paginationSchema } from "../../shared/utils/pagination.js";
import { optionalBool } from "../../shared/utils/validators.js";

const base = z.object({
  judul: z.string().trim().min(3).max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda -")
    .max(200)
    .optional(),
  ringkasan: z.string().trim().max(500).nullable().optional(),
  konten: z.string().min(10),
  gambarUrl: z.string().url().max(500).nullable().optional(),
  isPublished: z.boolean().optional(),
});

export const createEdukasiSchema = base;
export const updateEdukasiSchema = base
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "Tidak ada data yang diubah" });

export const listEdukasiQuery = paginationSchema.extend({
  search: z.string().trim().optional(),
  isPublished: optionalBool, // hanya berlaku di /edukasi/admin/semua
});

export const slugParam = z.object({ slug: z.string().trim().min(1).max(200) });
