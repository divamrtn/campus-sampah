import { Prisma } from "@prisma/client";
import { prisma } from "../../../config/database.js";
import { notFound } from "../../../shared/errors/app-error.js";
import { buildMeta, getPagination } from "../../../shared/utils/pagination.js";

export async function list(
  query: { page?: number; limit?: number; isActive?: boolean; search?: string },
  onlyActive: boolean,
) {
  const { page, limit, skip, take } = getPagination(query);
  const where: Prisma.TitikPengumpulanWhereInput = {
    isActive: onlyActive ? true : query.isActive,
    ...(query.search
      ? {
          OR: [
            { nama: { contains: query.search, mode: "insensitive" } },
            { lokasi: { contains: query.search, mode: "insensitive" } },
            { kode: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.titikPengumpulan.findMany({ where, skip, take, orderBy: { nama: "asc" } }),
    prisma.titikPengumpulan.count({ where }),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
}

export async function getById(id: number) {
  const row = await prisma.titikPengumpulan.findUnique({ where: { id } });
  if (!row) throw notFound("Titik pengumpulan tidak ditemukan");
  return row;
}

export const create = (data: Prisma.TitikPengumpulanCreateInput) => prisma.titikPengumpulan.create({ data });

export async function update(id: number, data: Prisma.TitikPengumpulanUpdateInput) {
  await getById(id);
  return prisma.titikPengumpulan.update({ where: { id }, data });
}

export async function remove(id: number) {
  await getById(id);
  await prisma.titikPengumpulan.delete({ where: { id } }); // petugas/sampah => SET NULL, jadwal => CASCADE
}
