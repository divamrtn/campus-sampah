import { Prisma, StatusJadwal } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { badRequest, forbidden, notFound } from "../../shared/errors/app-error.js";
import type { Actor } from "../../shared/types/actor.js";
import { buildMeta, getPagination } from "../../shared/utils/pagination.js";

const include = {
  tps: { select: { id: true, kode: true, nama: true, lokasi: true } },
  petugas: { select: { id: true, nip: true, user: { select: { id: true, name: true } } } },
} satisfies Prisma.JadwalPengangkutanInclude;

export async function list(
  actor: Actor,
  query: {
    page?: number;
    limit?: number;
    tpsId?: number;
    petugasId?: number;
    status?: StatusJadwal;
    mine?: boolean;
    dari?: Date;
    sampai?: Date;
  },
) {
  const { page, limit, skip, take } = getPagination(query);
  let petugasId = query.petugasId;
  if (query.mine) {
    const me = await prisma.petugas.findUnique({ where: { userId: actor.id }, select: { id: true } });
    petugasId = me?.id ?? -1; // bukan petugas => hasil kosong
  }
  const where: Prisma.JadwalPengangkutanWhereInput = {
    tpsId: query.tpsId,
    petugasId,
    status: query.status,
    tanggal: { gte: query.dari, lte: query.sampai },
  };
  const [items, total] = await Promise.all([
    prisma.jadwalPengangkutan.findMany({ where, skip, take, orderBy: [{ tanggal: "asc" }, { jamMulai: "asc" }], include }),
    prisma.jadwalPengangkutan.count({ where }),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
}

export async function getById(id: number) {
  const row = await prisma.jadwalPengangkutan.findUnique({ where: { id }, include });
  if (!row) throw notFound("Jadwal tidak ditemukan");
  return row;
}

async function assertRefs(tpsId?: number, petugasId?: number | null) {
  if (tpsId) {
    const tps = await prisma.titikPengumpulan.findUnique({ where: { id: tpsId }, select: { id: true } });
    if (!tps) throw badRequest("Titik pengumpulan tidak ditemukan");
  }
  if (petugasId) {
    const p = await prisma.petugas.findUnique({ where: { id: petugasId }, select: { id: true } });
    if (!p) throw badRequest("Petugas tidak ditemukan");
  }
}

export async function create(input: Prisma.JadwalPengangkutanUncheckedCreateInput) {
  await assertRefs(input.tpsId, input.petugasId);
  return prisma.jadwalPengangkutan.create({ data: input, include });
}

export async function update(actor: Actor, id: number, input: Prisma.JadwalPengangkutanUncheckedUpdateInput) {
  const row = await getById(id);

  if (actor.role === "petugas") {
    const me = await prisma.petugas.findUnique({ where: { userId: actor.id }, select: { id: true } });
    if (!me || row.petugasId !== me.id) throw forbidden("Anda hanya bisa mengubah jadwal yang ditugaskan kepada Anda");
    if (Object.keys(input).some((k) => !["status", "catatan"].includes(k)))
      throw forbidden("Petugas hanya boleh mengubah status dan catatan");
  }

  await assertRefs(input.tpsId as number | undefined, input.petugasId as number | null | undefined);
  return prisma.jadwalPengangkutan.update({ where: { id }, data: input, include });
}

export async function remove(id: number) {
  await getById(id);
  await prisma.jadwalPengangkutan.delete({ where: { id } });
}
