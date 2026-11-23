import { Kategori, Prisma } from "@prisma/client";
import { prisma } from "../../../config/database.js";
import { notFound } from "../../../shared/errors/app-error.js";
import { buildMeta, getPagination } from "../../../shared/utils/pagination.js";

export async function list(
  query: { page?: number; limit?: number; kategori?: Kategori; isActive?: boolean; search?: string },
  onlyActive: boolean,
) {
  const { page, limit, skip, take } = getPagination(query);
  const where: Prisma.JenisSampahWhereInput = {
    kategori: query.kategori,
    isActive: onlyActive ? true : query.isActive,
    ...(query.search
      ? {
          OR: [
            { nama: { contains: query.search, mode: "insensitive" } },
            { kode: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.jenisSampah.findMany({ where, skip, take, orderBy: [{ kategori: "asc" }, { nama: "asc" }] }),
    prisma.jenisSampah.count({ where }),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
}

export async function getById(id: number) {
  const row = await prisma.jenisSampah.findUnique({ where: { id } });
  if (!row) throw notFound("Jenis sampah tidak ditemukan");
  return row;
}

export const create = (data: Prisma.JenisSampahCreateInput) => prisma.jenisSampah.create({ data });

export async function update(id: number, data: Prisma.JenisSampahUpdateInput) {
  await getById(id);
  return prisma.jenisSampah.update({ where: { id }, data });
}

export async function remove(id: number) {
  await getById(id);
  await prisma.jenisSampah.delete({ where: { id } }); // sampah.jenis_id => SET NULL
}
