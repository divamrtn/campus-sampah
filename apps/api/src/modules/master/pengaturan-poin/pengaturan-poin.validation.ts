import { Kategori } from "@prisma/client";
import { z } from "zod";

export const kategoriParam = z.object({ kategori: z.nativeEnum(Kategori) });
export const upsertPengaturanSchema = z.object({
  poinPerKg: z.coerce.number().int().min(0).max(100000),
  hargaPerKg: z.coerce.number().min(0).max(1_000_000_000).optional(),
});
