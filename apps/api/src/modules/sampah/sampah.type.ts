import type { Prisma } from "@prisma/client";

export const sampahInclude = {
  jenis: { select: { id: true, kode: true, nama: true } },
  tps: { select: { id: true, kode: true, nama: true } },
  user: { select: { id: true, name: true, username: true, mahasiswa: { select: { nim: true } } } },
  verifikator: { select: { id: true, name: true } },
} satisfies Prisma.SampahRowInclude;
