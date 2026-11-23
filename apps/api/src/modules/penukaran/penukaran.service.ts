import { Prisma, StatusPenukaran } from "@prisma/client";
import { prisma, type Db } from "../../config/database.js";
import { isStaff } from "../../shared/constants/roles.js";
import { badRequest, conflict, notFound } from "../../shared/errors/app-error.js";
import type { Actor } from "../../shared/types/actor.js";
import { nextPenukaranKode } from "../../shared/utils/id-generator.js";
import { buildMeta, getPagination } from "../../shared/utils/pagination.js";
import { createNotifikasi } from "../notifikasi/notifikasi.service.js";

const include = {
  reward: { select: { id: true, nama: true, gambarUrl: true, poinDibutuhkan: true } },
  user: { select: { id: true, name: true, mahasiswa: { select: { nim: true } } } },
  pemroses: { select: { id: true, name: true } },
} satisfies Prisma.PenukaranRewardInclude;

export async function list(
  actor: Actor,
  query: { page?: number; limit?: number; status?: StatusPenukaran; userId?: number; rewardId?: number },
) {
  const { page, limit, skip, take } = getPagination(query);
  const where: Prisma.PenukaranRewardWhereInput = {
    userId: isStaff(actor.role) ? query.userId : actor.id,
    status: query.status,
    rewardId: query.rewardId,
  };
  const [items, total] = await Promise.all([
    prisma.penukaranReward.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include }),
    prisma.penukaranReward.count({ where }),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
}

export async function getById(actor: Actor, id: number) {
  const row = await prisma.penukaranReward.findUnique({ where: { id }, include });
  if (!row || (!isStaff(actor.role) && row.userId !== actor.id)) throw notFound("Penukaran tidak ditemukan");
  return row;
}

/** Mahasiswa menukar poin dengan reward. Stok dan saldo dikurangi atomik. */
export async function create(actor: Actor, input: { rewardId: number; jumlah: number; catatan?: string }) {
  return prisma.$transaction(async (tx) => {
    const reward = await tx.reward.findUnique({ where: { id: input.rewardId } });
    if (!reward || !reward.isActive) throw notFound("Reward tidak ditemukan atau sudah tidak aktif");

    const totalPoin = reward.poinDibutuhkan * input.jumlah;

    const stok = await tx.reward.updateMany({
      where: { id: reward.id, isActive: true, stok: { gte: input.jumlah } },
      data: { stok: { decrement: input.jumlah } },
    });
    if (stok.count === 0) throw conflict("Stok reward tidak mencukupi");

    const saldoRes = await tx.mahasiswa.updateMany({
      where: { userId: actor.id, totalPoin: { gte: totalPoin } },
      data: { totalPoin: { decrement: totalPoin } },
    });
    if (saldoRes.count === 0) throw badRequest(`Poin tidak cukup. Dibutuhkan ${totalPoin} poin.`);

    const { totalPoin: saldo } = await tx.mahasiswa.findUniqueOrThrow({
      where: { userId: actor.id },
      select: { totalPoin: true },
    });

    const kode = await nextPenukaranKode(tx);
    const row = await tx.penukaranReward.create({
      data: {
        kode,
        userId: actor.id,
        rewardId: reward.id,
        jumlah: input.jumlah,
        totalPoin,
        catatan: input.catatan,
      },
      include,
    });

    await tx.transaksiPoin.create({
      data: {
        userId: actor.id,
        tipe: "Penukaran",
        jumlah: -totalPoin,
        saldoSetelah: saldo,
        keterangan: `Penukaran ${reward.nama} x${input.jumlah} (${kode})`,
        penukaranId: row.id,
      },
    });
    await createNotifikasi(tx, {
      userId: actor.id,
      judul: "Penukaran reward diproses",
      pesan: `Penukaran ${kode} (${reward.nama}) sedang diproses.`,
      link: `/penukaran/${row.id}`,
    });
    return row;
  });
}

async function changeStatus(
  tx: Db,
  actor: Actor,
  id: number,
  status: "Selesai" | "Dibatalkan",
  catatan?: string,
  onlyOwnerId?: number,
) {
  const row = await tx.penukaranReward.findUnique({ where: { id }, include: { reward: { select: { nama: true } } } });
  if (!row || (onlyOwnerId !== undefined && row.userId !== onlyOwnerId)) throw notFound("Penukaran tidak ditemukan");
  if (row.status !== StatusPenukaran.Diproses) throw conflict(`Penukaran sudah berstatus ${row.status}`);

  const r = await tx.penukaranReward.updateMany({
    where: { id, status: StatusPenukaran.Diproses },
    data: { status, catatan: catatan ?? row.catatan, diprosesOleh: actor.id, processedAt: new Date() },
  });
  if (r.count === 0) throw conflict("Penukaran sudah diproses");

  if (status === "Dibatalkan") {
    await tx.reward.update({ where: { id: row.rewardId }, data: { stok: { increment: row.jumlah } } });
    const mhs = await tx.mahasiswa.update({
      where: { userId: row.userId },
      data: { totalPoin: { increment: row.totalPoin } },
      select: { totalPoin: true },
    });
    await tx.transaksiPoin.create({
      data: {
        userId: row.userId,
        tipe: "Penukaran",
        jumlah: row.totalPoin,
        saldoSetelah: mhs.totalPoin,
        keterangan: `Pengembalian poin penukaran ${row.kode} (dibatalkan)`,
        penukaranId: id,
      },
    });
  }

  if (row.userId !== actor.id)
    await createNotifikasi(tx, {
      userId: row.userId,
      judul: status === "Selesai" ? "Penukaran selesai" : "Penukaran dibatalkan",
      pesan:
        status === "Selesai"
          ? `Penukaran ${row.kode} (${row.reward.nama}) sudah selesai. Silakan ambil reward Anda.`
          : `Penukaran ${row.kode} dibatalkan dan ${row.totalPoin} poin dikembalikan.${catatan ? ` Catatan: ${catatan}` : ""}`,
      link: `/penukaran/${id}`,
    });
  return tx.penukaranReward.findUniqueOrThrow({ where: { id }, include });
}

export const updateStatus = (actor: Actor, id: number, status: "Selesai" | "Dibatalkan", catatan?: string) =>
  prisma.$transaction((tx) => changeStatus(tx, actor, id, status, catatan));

/** Mahasiswa membatalkan penukarannya sendiri selama masih Diproses. */
export const cancelOwn = (actor: Actor, id: number, catatan?: string) =>
  prisma.$transaction((tx) => changeStatus(tx, actor, id, "Dibatalkan", catatan, actor.id));
