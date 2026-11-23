import { Kategori } from "@prisma/client";
import { prisma } from "../../../config/database.js";

/** Selalu mengembalikan 3 kategori; yang belum ada di DB tampil dengan nilai 0. */
export async function list() {
  const rows = await prisma.pengaturanPoin.findMany();
  return Object.values(Kategori).map(
    (kategori) => rows.find((r) => r.kategori === kategori) ?? { id: null, kategori, poinPerKg: 0, hargaPerKg: "0", updatedAt: null },
  );
}

export const upsert = (kategori: Kategori, data: { poinPerKg: number; hargaPerKg?: number }) =>
  prisma.pengaturanPoin.upsert({
    where: { kategori },
    create: { kategori, poinPerKg: data.poinPerKg, hargaPerKg: data.hargaPerKg ?? 0 },
    update: { poinPerKg: data.poinPerKg, ...(data.hargaPerKg !== undefined ? { hargaPerKg: data.hargaPerKg } : {}) },
  });
