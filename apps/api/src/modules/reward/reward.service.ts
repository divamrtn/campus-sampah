import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { conflict, notFound } from "../../shared/errors/app-error.js";
import { buildMeta, getPagination } from "../../shared/utils/pagination.js";

export async function list(
  query: { page?: number; limit?: number; isActive?: boolean; search?: string },
  onlyActive: boolean,
) {
  const { page, limit, skip, take } = getPagination(query);
  const where: Prisma.RewardWhereInput = {
    isActive: onlyActive ? true : query.isActive,
    ...(query.search ? { nama: { contains: query.search, mode: "insensitive" } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.reward.findMany({ where, skip, take, orderBy: [{ poinDibutuhkan: "asc" }, { nama: "asc" }] }),
    prisma.reward.count({ where }),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
}

export async function getById(id: number, onlyActive: boolean) {
  const row = await prisma.reward.findUnique({ where: { id } });
  if (!row || (onlyActive && !row.isActive)) throw notFound("Reward tidak ditemukan");
  return row;
}

export const create = (data: Prisma.RewardCreateInput) => prisma.reward.create({ data });

export async function update(id: number, data: Prisma.RewardUpdateInput) {
  await getById(id, false);
  return prisma.reward.update({ where: { id }, data });
}

export async function remove(id: number) {
  await getById(id, false);
  const dipakai = await prisma.penukaranReward.count({ where: { rewardId: id } });
  if (dipakai > 0) throw conflict("Reward sudah pernah ditukar. Nonaktifkan saja (isActive = false).");
  await prisma.reward.delete({ where: { id } });
}
