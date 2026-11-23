import { StatusJadwal } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "../../shared/utils/pagination.js";
import { intId } from "../../shared/utils/validators.js";

const jam = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam harus HH:mm");

const base = z.object({
  tpsId: intId,
  petugasId: intId.nullable().optional(),
  tanggal: z.coerce.date(),
  jamMulai: jam,
  jamSelesai: jam.nullable().optional(),
  status: z.nativeEnum(StatusJadwal).optional(),
  catatan: z.string().trim().max(500).nullable().optional(),
});

export const createJadwalSchema = base.refine((d) => !d.jamSelesai || d.jamSelesai > d.jamMulai, {
  message: "jamSelesai harus setelah jamMulai",
  path: ["jamSelesai"],
});

export const updateJadwalSchema = base
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "Tidak ada data yang diubah" });

export const listJadwalQuery = paginationSchema.extend({
  tpsId: intId.optional(),
  petugasId: intId.optional(),
  status: z.nativeEnum(StatusJadwal).optional(),
  mine: z.enum(["true", "false"]).transform((v) => v === "true").optional(), // jadwal milik petugas yang login
  dari: z.coerce.date().optional(),
  sampai: z.coerce.date().optional(),
});
