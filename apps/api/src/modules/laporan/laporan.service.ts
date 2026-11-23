import { Prisma, StatusLaporan } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { isStaff } from "../../shared/constants/roles.js";
import { conflict, notFound } from "../../shared/errors/app-error.js";
import type { Actor } from "../../shared/types/actor.js";
import { buildMeta, getPagination } from "../../shared/utils/pagination.js";
import { createNotifikasi } from "../notifikasi/notifikasi.service.js";

const include = {
  pelapor: { select: { id: true, name: true, mahasiswa: { select: { nim: true } } } },
  penangan: { select: { id: true, name: true } },
} satisfies Prisma.LaporanSampahInclude;

export async function list(
  actor: Actor,
  query: { page?: number; limit?: number; status?: StatusLaporan; userId?: number; search?: string },
) {
  const { page, limit, skip, take } = getPagination(query);
  const where: Prisma.LaporanSampahWhereInput = {
    userId: isStaff(actor.role) ? query.userId : actor.id,
    status: query.status,
    ...(query.search
      ? {
          OR: [
            { judul: { contains: query.search, mode: "insensitive" } },
            { lokasi: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.laporanSampah.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include }),
    prisma.laporanSampah.count({ where }),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
}

export async function getById(actor: Actor, id: number) {
  const row = await prisma.laporanSampah.findUnique({ where: { id }, include });
  if (!row || (!isStaff(actor.role) && row.userId !== actor.id)) throw notFound("Laporan tidak ditemukan");
  return row;
}

export async function create(actor: Actor, input: { judul: string; deskripsi: string; lokasi: string; fotoUrl?: string }) {
  return prisma.$transaction(async (tx) => {
    const row = await tx.laporanSampah.create({ data: { ...input, userId: actor.id }, include });
    // beri tahu semua admin & petugas aktif
    const staff = await tx.user.findMany({
      where: { role: { in: ["admin", "petugas"] }, status: "Aktif" },
      select: { id: true },
    });
    if (staff.length)
      await tx.notifikasi.createMany({
        data: staff.map((s) => ({
          userId: s.id,
          judul: "Laporan sampah baru",
          pesan: `${actor.name} melaporkan: ${input.judul} (${input.lokasi})`,
          link: `/laporan/${row.id}`,
        })),
      });
    return row;
  });
}

export async function tanggapi(actor: Actor, id: number, input: { status: StatusLaporan; tanggapan?: string }) {
  return prisma.$transaction(async (tx) => {
    const row = await tx.laporanSampah.findUnique({ where: { id } });
    if (!row) throw notFound("Laporan tidak ditemukan");
    if (row.status === StatusLaporan.Selesai || row.status === StatusLaporan.Ditolak)
      throw conflict(`Laporan sudah berstatus ${row.status}`);

    const updated = await tx.laporanSampah.update({
      where: { id },
      data: {
        status: input.status,
        tanggapan: input.tanggapan ?? row.tanggapan,
        ditanganiOleh: actor.id,
        ditanganiAt: new Date(),
      },
      include,
    });
    await createNotifikasi(tx, {
      userId: row.userId,
      judul: `Laporan ${input.status.toLowerCase()}`,
      pesan: `Laporan "${row.judul}" kini berstatus ${input.status}.${input.tanggapan ? ` Tanggapan: ${input.tanggapan}` : ""}`,
      link: `/laporan/${id}`,
    });
    return updated;
  });
}

export async function removeOwn(actor: Actor, id: number) {
  const row = await prisma.laporanSampah.findUnique({ where: { id } });
  if (!row || row.userId !== actor.id) throw notFound("Laporan tidak ditemukan");
  if (row.status !== StatusLaporan.Baru) throw conflict("Hanya laporan berstatus Baru yang bisa dihapus");
  await prisma.laporanSampah.delete({ where: { id } });
}
