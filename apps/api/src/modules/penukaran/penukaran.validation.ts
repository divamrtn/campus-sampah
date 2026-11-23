import { StatusPenukaran } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "../../shared/utils/pagination.js";
import { intId } from "../../shared/utils/validators.js";

export const createPenukaranSchema = z.object({
  rewardId: intId,
  jumlah: z.coerce.number().int().min(1).max(100).default(1),
  catatan: z.string().trim().max(300).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum([StatusPenukaran.Selesai, StatusPenukaran.Dibatalkan]),
  catatan: z.string().trim().max(300).optional(),
});

export const cancelSchema = z.object({ catatan: z.string().trim().max(300).optional() });

export const listPenukaranQuery = paginationSchema.extend({
  status: z.nativeEnum(StatusPenukaran).optional(),
  userId: intId.optional(), // diabaikan untuk mahasiswa
  rewardId: intId.optional(),
});
