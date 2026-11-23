import { TipeTransaksiPoin } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "../../shared/utils/pagination.js";
import { intId } from "../../shared/utils/validators.js";

export const listPoinQuery = paginationSchema.extend({
  userId: intId.optional(), // diabaikan pada /poin/saya
  tipe: z.nativeEnum(TipeTransaksiPoin).optional(),
});

export const leaderboardQuery = z.object({ limit: z.coerce.number().int().min(1).max(50).default(10) });

export const penyesuaianSchema = z.object({
  userId: intId,
  jumlah: z.coerce
    .number()
    .int()
    .refine((n) => n !== 0, { message: "Jumlah tidak boleh 0" }),
  keterangan: z.string().trim().min(3, "Keterangan wajib diisi").max(200),
});
