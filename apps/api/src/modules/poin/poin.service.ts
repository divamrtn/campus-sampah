import { Prisma, TipeTransaksiPoin } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { badRequest } from "../../shared/errors/app-error.js";
import type { Actor } from "../../shared/types/actor.js";
import { buildMeta, getPagination } from "../../shared/utils/pagination.js";
import { createNotifikasi } from "../notifikasi/notifikasi.service.js";

const ledgerInclude = {
  user: { select: { id: true, name: true, mahasiswa: { select: { nim: true } } } },
  sampah: { select: { id: true, kategori: true, beratKg: true } },
  penukaran: { select: { id: true, kode: true } },
} satisfies Prisma.TransaksiPoinInclude;

export async function list(query: { page?: number; limit?: number; userId?: number; tipe?: TipeTransaksiPoin }) {
  const { page, limit, skip, take } = getPagination(query);
  const where: Prisma.TransaksiPoinWhereInput = { userId: query.userId, tipe: query.tipe };
  const [items, total] = await Promise.all([
    prisma.transaksiPoin.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: ledgerInclude }),
    prisma.transaksiPoin.count({ where }),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
}

export async function listMine(userId: number, query: { page?: number; limit?: number; tipe?: TipeTransaksiPoin }) {
  const [{ items, meta }, mhs] = await Promise.all([
    list({ ...query, userId }),
    prisma.mahasiswa.findUnique({ where: { userId }, select: { totalPoin: true } }),
  ]);
  return { items, meta, saldo: mhs?.totalPoin ?? 0 };
}

export async function leaderboard(limit: number) {
  const rows = await prisma.mahasiswa.findMany({
    where: { user: { status: "Aktif" } },
    orderBy: [{ totalPoin: "desc" }, { id: "asc" }],
    take: limit,
    select: { totalPoin: true, prodi: true, fakultas: true, user: { select: { id: true, name: true, fotoUrl: true } } },
  });
  return rows.map((r, i) => ({
    peringkat: i + 1,
    userId: r.user.id,
    nama: r.user.name,
    fotoUrl: r.user.fotoUrl,
    prodi: r.prodi,
    fakultas: r.fakultas,
    totalPoin: r.totalPoin,
  }));
}

/** Penyesuaian manual oleh admin; saldo tidak boleh menjadi negatif. */
export async function adjust(actor: Actor, input: { userId: number; jumlah: number; keterangan: string }) {
  return prisma.$transaction(async (tx) => {
    const res = await tx.mahasiswa.updateMany({
      where: { userId: input.userId, ...(input.jumlah < 0 ? { totalPoin: { gte: -input.jumlah } } : {}) },
      data: { totalPoin: { increment: input.jumlah } },
    });
    if (res.count === 0) {
      const exists = await tx.mahasiswa.findUnique({ where: { userId: input.userId }, select: { id: true } });
      throw badRequest(exists ? "Saldo poin mahasiswa tidak cukup untuk pengurangan ini" : "Mahasiswa tidak ditemukan");
    }
    const { totalPoin } = await tx.mahasiswa.findUniqueOrThrow({
      where: { userId: input.userId },
      select: { totalPoin: true },
    });
    const trx = await tx.transaksiPoin.create({
      data: {
        userId: input.userId,
        tipe: TipeTransaksiPoin.Penyesuaian,
        jumlah: input.jumlah,
        saldoSetelah: totalPoin,
        keterangan: input.keterangan,
        dibuatOleh: actor.id,
      },
      include: ledgerInclude,
    });
    await createNotifikasi(tx, {
      userId: input.userId,
      judul: "Penyesuaian poin",
      pesan: `Poin Anda ${input.jumlah > 0 ? "bertambah" : "berkurang"} ${Math.abs(input.jumlah)}: ${input.keterangan}`,
      link: "/poin",
    });
    return trx;
  });
}
