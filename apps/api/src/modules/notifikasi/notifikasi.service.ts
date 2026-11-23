import { prisma, type Db } from "../../config/database.js";
import { notFound } from "../../shared/errors/app-error.js";
import { buildMeta, getPagination } from "../../shared/utils/pagination.js";

/** Dipanggil dari service lain (boleh di dalam transaksi). */
export function createNotifikasi(
  db: Db,
  data: { userId: number; judul: string; pesan: string; link?: string },
) {
  return db.notifikasi.create({ data });
}

export async function list(userId: number, query: { page?: number; limit?: number; isRead?: boolean }) {
  const { page, limit, skip, take } = getPagination(query);
  const where = { userId, isRead: query.isRead };
  const [items, total] = await Promise.all([
    prisma.notifikasi.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.notifikasi.count({ where }),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
}

export const unreadCount = (userId: number) =>
  prisma.notifikasi.count({ where: { userId, isRead: false } });

export async function markRead(userId: number, id: number) {
  const res = await prisma.notifikasi.updateMany({ where: { id, userId }, data: { isRead: true } });
  if (res.count === 0) throw notFound("Notifikasi tidak ditemukan");
}

export const markAllRead = (userId: number) =>
  prisma.notifikasi.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });

export async function remove(userId: number, id: number) {
  const res = await prisma.notifikasi.deleteMany({ where: { id, userId } });
  if (res.count === 0) throw notFound("Notifikasi tidak ditemukan");
}
