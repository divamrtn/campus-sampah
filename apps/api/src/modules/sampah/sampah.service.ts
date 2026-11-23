import { Kategori, Prisma, Status } from "@prisma/client";
import { prisma, type Db } from "../../config/database.js";
import { isStaff } from "../../shared/constants/roles.js";
import { badRequest, conflict, forbidden, notFound } from "../../shared/errors/app-error.js";
import type { Actor } from "../../shared/types/actor.js";
import { nextSampahId } from "../../shared/utils/id-generator.js";
import { buildMeta, getPagination } from "../../shared/utils/pagination.js";
import { createNotifikasi } from "../notifikasi/notifikasi.service.js";
import { sampahInclude } from "./sampah.type.js";
import type { CreateSampahInput, UpdateSampahInput, VerifikasiInput } from "./sampah.validation.js";

/** Menurunkan kategori dari jenis & lokasi dari TPS, sekaligus memvalidasi keduanya. */
async function resolveRefs(
  db: Db,
  input: { kategori?: Kategori; jenisId?: number; tpsId?: number; lokasi?: string },
) {
  let kategori = input.kategori;
  let lokasi = input.lokasi;

  if (input.jenisId) {
    const jenis = await db.jenisSampah.findUnique({ where: { id: input.jenisId } });
    if (!jenis || !jenis.isActive) throw badRequest("Jenis sampah tidak valid atau nonaktif");
    if (input.kategori && input.kategori !== jenis.kategori)
      throw badRequest(`Kategori tidak sesuai dengan jenis sampah (${jenis.nama} = ${jenis.kategori})`);
    kategori = jenis.kategori;
  }
  if (input.tpsId) {
    const tps = await db.titikPengumpulan.findUnique({ where: { id: input.tpsId } });
    if (!tps || !tps.isActive) throw badRequest("Titik pengumpulan tidak valid atau nonaktif");
    lokasi = lokasi ?? tps.nama;
  }
  return { kategori, lokasi };
}

// ---------------------------------------------------------------- list & detail
export async function list(
  actor: Actor,
  query: {
    page?: number;
    limit?: number;
    status?: Status;
    kategori?: Kategori;
    tpsId?: number;
    jenisId?: number;
    userId?: number;
    tipe?: "setoran" | "umum";
    dari?: Date;
    sampai?: Date;
    search?: string;
  },
) {
  const { page, limit, skip, take } = getPagination(query);
  const staff = isStaff(actor.role);

  let userFilter: Prisma.SampahRowWhereInput["userId"];
  if (!staff) userFilter = actor.id;
  else if (query.userId) userFilter = query.userId;
  else if (query.tipe === "setoran") userFilter = { not: null };
  else if (query.tipe === "umum") userFilter = null;

  const where: Prisma.SampahRowWhereInput = {
    userId: userFilter,
    status: query.status,
    kategori: query.kategori,
    tpsId: query.tpsId,
    jenisId: query.jenisId,
    tanggal: { gte: query.dari, lte: query.sampai },
    ...(query.search
      ? {
          OR: [
            { id: { contains: query.search, mode: "insensitive" } },
            { lokasi: { contains: query.search, mode: "insensitive" } },
            { petugas: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total, agg] = await Promise.all([
    prisma.sampahRow.findMany({
      where,
      skip,
      take,
      orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
      include: sampahInclude,
    }),
    prisma.sampahRow.count({ where }),
    prisma.sampahRow.aggregate({ where, _sum: { beratKg: true, poin: true } }),
  ]);
  return {
    items,
    meta: buildMeta(total, page, limit),
    summary: { totalBeratKg: agg._sum.beratKg ?? 0, totalPoin: agg._sum.poin ?? 0 },
  };
}

export async function getById(actor: Actor, id: string) {
  const row = await prisma.sampahRow.findUnique({ where: { id }, include: sampahInclude });
  if (!row || (!isStaff(actor.role) && row.userId !== actor.id)) throw notFound("Data sampah tidak ditemukan");
  return row;
}

// ---------------------------------------------------------------- create
export async function create(actor: Actor, input: CreateSampahInput) {
  const staff = isStaff(actor.role);
  if (!staff && input.userId && input.userId !== actor.id)
    throw forbidden("Mahasiswa hanya bisa membuat setoran atas nama sendiri");
  if (!staff && input.langsungVerifikasi) throw forbidden("Hanya admin/petugas yang boleh langsung memverifikasi");

  const ownerId = staff ? (input.userId ?? null) : actor.id;

  return prisma.$transaction(async (tx) => {
    if (ownerId) {
      const owner = await tx.user.findUnique({
        where: { id: ownerId },
        select: { role: true, status: true, mahasiswa: { select: { id: true } } },
      });
      if (!owner || owner.role !== "mahasiswa" || !owner.mahasiswa) throw badRequest("userId harus berupa mahasiswa");
      if (owner.status !== "Aktif") throw badRequest("Akun mahasiswa nonaktif");
    }

    const { kategori, lokasi } = await resolveRefs(tx, input);
    if (!kategori || !lokasi) throw badRequest("kategori dan lokasi wajib dapat ditentukan");

    const id = await nextSampahId(tx);
    await tx.sampahRow.create({
      data: {
        id,
        tanggal: input.tanggal ?? new Date(),
        lokasi,
        kategori,
        beratKg: input.beratKg,
        petugas: staff ? actor.name : null,
        catatan: input.catatan,
        fotoUrl: input.fotoUrl,
        jenisId: input.jenisId,
        tpsId: input.tpsId,
        userId: ownerId,
        createdBy: actor.id,
      },
    });

    if (staff && input.langsungVerifikasi) await verifyInTx(tx, id, actor, { status: Status.Terverifikasi });
    return tx.sampahRow.findUniqueOrThrow({ where: { id }, include: sampahInclude });
  });
}

// ---------------------------------------------------------------- update & delete
export async function update(actor: Actor, id: string, input: UpdateSampahInput) {
  const row = await prisma.sampahRow.findUnique({ where: { id } });
  if (!row || (!isStaff(actor.role) && row.userId !== actor.id)) throw notFound("Data sampah tidak ditemukan");
  if (row.status !== Status.Menunggu) throw conflict("Hanya data berstatus Menunggu yang bisa diubah");

  const { kategori, lokasi } = await resolveRefs(prisma, {
    kategori: input.kategori,
    // jenis lama ikut dicek hanya bila kategori diubah tanpa mengganti jenis
    jenisId: input.jenisId ?? (input.kategori ? (row.jenisId ?? undefined) : undefined),
    tpsId: input.tpsId ?? undefined,
    lokasi: input.lokasi,
  });

  return prisma.sampahRow.update({
    where: { id },
    data: {
      tanggal: input.tanggal,
      lokasi,
      kategori,
      beratKg: input.beratKg,
      catatan: input.catatan,
      fotoUrl: input.fotoUrl,
      jenisId: input.jenisId,
      tpsId: input.tpsId,
    },
    include: sampahInclude,
  });
}

export async function remove(actor: Actor, id: string) {
  const row = await prisma.sampahRow.findUnique({ where: { id } });
  if (!row || (!isStaff(actor.role) && row.userId !== actor.id)) throw notFound("Data sampah tidak ditemukan");
  if (row.status === Status.Terverifikasi && row.userId)
    throw conflict("Setoran terverifikasi sudah menghasilkan poin dan tidak bisa dihapus");
  await prisma.sampahRow.delete({ where: { id } });
}

// ---------------------------------------------------------------- verifikasi
async function verifyInTx(tx: Db, id: string, actor: Actor, input: VerifikasiInput) {
  const row = await tx.sampahRow.findUnique({ where: { id } });
  if (!row) throw notFound("Data sampah tidak ditemukan");
  if (row.status !== Status.Menunggu) throw conflict(`Data sudah berstatus ${row.status}`);

  const now = new Date();

  if (input.status === Status.Ditolak) {
    const r = await tx.sampahRow.updateMany({
      where: { id, status: Status.Menunggu },
      data: { status: Status.Ditolak, alasanTolak: input.alasanTolak, verifiedBy: actor.id, verifiedAt: now, poin: 0 },
    });
    if (r.count === 0) throw conflict("Data sudah diproses oleh petugas lain");
    if (row.userId)
      await createNotifikasi(tx, {
        userId: row.userId,
        judul: "Setoran ditolak",
        pesan: `Setoran ${id} ditolak: ${input.alasanTolak}`,
        link: `/sampah/${id}`,
      });
    return;
  }

  const beratKg = input.beratKg ?? row.beratKg;
  let poin = 0;
  if (row.userId) {
    const setting = await tx.pengaturanPoin.findUnique({ where: { kategori: row.kategori } });
    poin = Math.floor(beratKg * (setting?.poinPerKg ?? 0));
  }

  const r = await tx.sampahRow.updateMany({
    where: { id, status: Status.Menunggu },
    data: { status: Status.Terverifikasi, beratKg, poin, alasanTolak: null, verifiedBy: actor.id, verifiedAt: now },
  });
  if (r.count === 0) throw conflict("Data sudah diproses oleh petugas lain");

  if (row.userId) {
    if (poin > 0) {
      const mhs = await tx.mahasiswa.update({
        where: { userId: row.userId },
        data: { totalPoin: { increment: poin } },
        select: { totalPoin: true },
      });
      await tx.transaksiPoin.create({
        data: {
          userId: row.userId,
          tipe: "Setoran",
          jumlah: poin,
          saldoSetelah: mhs.totalPoin,
          keterangan: `Setoran ${id} (${beratKg} kg ${row.kategori})`,
          sampahId: id,
        },
      });
    }
    await createNotifikasi(tx, {
      userId: row.userId,
      judul: "Setoran terverifikasi",
      pesan: `Setoran ${id} sebesar ${beratKg} kg disetujui${poin > 0 ? `, +${poin} poin` : ""}.`,
      link: `/sampah/${id}`,
    });
  }
}

export async function verifikasi(actor: Actor, id: string, input: VerifikasiInput) {
  return prisma.$transaction(async (tx) => {
    await verifyInTx(tx, id, actor, input);
    return tx.sampahRow.findUniqueOrThrow({ where: { id }, include: sampahInclude });
  });
}
