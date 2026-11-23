import type { Prisma } from "@prisma/client";

/** Field user yang aman dikirim ke client (tanpa passwordHash). */
export const userSafeSelect = {
  id: true,
  username: true,
  email: true,
  name: true,
  role: true,
  status: true,
  phone: true,
  fotoUrl: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  mahasiswa: {
    select: { id: true, nim: true, prodi: true, fakultas: true, angkatan: true, totalPoin: true },
  },
  petugas: {
    select: {
      id: true,
      nip: true,
      jabatan: true,
      tpsId: true,
      tps: { select: { id: true, kode: true, nama: true } },
    },
  },
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof userSafeSelect }>;
