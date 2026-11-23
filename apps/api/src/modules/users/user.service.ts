import { Prisma, Role } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { badRequest, conflict, notFound } from "../../shared/errors/app-error.js";
import { hashPassword } from "../../shared/utils/password.js";
import { buildMeta, getPagination } from "../../shared/utils/pagination.js";
import { userSafeSelect } from "./user.type.js";
import type { CreateUserInput, UpdateUserInput } from "./user.validation.js";

export async function list(query: {
  page?: number;
  limit?: number;
  role?: Role;
  status?: "Aktif" | "Nonaktif";
  search?: string;
}) {
  const { page, limit, skip, take } = getPagination(query);
  const where: Prisma.UserWhereInput = {
    role: query.role,
    status: query.status,
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { username: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
            { mahasiswa: { nim: { contains: query.search } } },
            { petugas: { nip: { contains: query.search } } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, select: userSafeSelect }),
    prisma.user.count({ where }),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
}

export async function getById(id: number) {
  const user = await prisma.user.findUnique({ where: { id }, select: userSafeSelect });
  if (!user) throw notFound("User tidak ditemukan");
  return user;
}

export async function create(input: CreateUserInput) {
  const passwordHash = await hashPassword(input.password);
  const base = {
    username: input.username,
    email: input.email,
    name: input.name,
    phone: input.phone,
    status: input.status,
    role: input.role,
    passwordHash,
  };

  return prisma.user.create({
    data: {
      ...base,
      ...(input.role === Role.mahasiswa && {
        mahasiswa: {
          create: { nim: input.nim, prodi: input.prodi, fakultas: input.fakultas, angkatan: input.angkatan },
        },
      }),
      ...(input.role === Role.petugas && {
        petugas: { create: { nip: input.nip, jabatan: input.jabatan, tpsId: input.tpsId } },
      }),
    },
    select: userSafeSelect,
  });
}

export async function update(id: number, input: UpdateUserInput, actorId: number) {
  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!existing) throw notFound("User tidak ditemukan");
  if (id === actorId && input.status === "Nonaktif") throw badRequest("Anda tidak bisa menonaktifkan akun sendiri");

  const { password, nim, prodi, fakultas, angkatan, nip, jabatan, tpsId, ...userFields } = input;

  const mhs = Object.fromEntries(
    Object.entries({ nim, prodi, fakultas, angkatan }).filter(([, v]) => v !== undefined),
  );
  const ptg = Object.fromEntries(
    Object.entries({ nip, jabatan, tpsId }).filter(([, v]) => v !== undefined),
  );
  if (existing.role !== Role.mahasiswa && Object.keys(mhs).length)
    throw badRequest("Field profil mahasiswa hanya untuk role mahasiswa");
  if (existing.role !== Role.petugas && Object.keys(ptg).length)
    throw badRequest("Field profil petugas hanya untuk role petugas");

  return prisma.user.update({
    where: { id },
    data: {
      ...userFields,
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
      ...(Object.keys(mhs).length ? { mahasiswa: { update: mhs } } : {}),
      ...(Object.keys(ptg).length ? { petugas: { update: ptg } } : {}),
    },
    select: userSafeSelect,
  });
}

export async function remove(id: number, actorId: number) {
  if (id === actorId) throw badRequest("Anda tidak bisa menghapus akun sendiri");
  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw notFound("User tidak ditemukan");
  try {
    await prisma.user.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003")
      throw conflict("User punya riwayat penukaran/edukasi. Nonaktifkan saja akunnya.");
    throw e;
  }
}

export async function updateMe(id: number, data: { name?: string; phone?: string | null; fotoUrl?: string | null }) {
  return prisma.user.update({ where: { id }, data, select: userSafeSelect });
}
