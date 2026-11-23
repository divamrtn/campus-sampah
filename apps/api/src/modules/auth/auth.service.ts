import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../config/database.js";
import { env, isProd } from "../../config/env.js";
import { badRequest, forbidden, unauthorized } from "../../shared/errors/app-error.js";
import { signToken } from "../../shared/utils/jwt.js";
import { comparePassword, generateToken, hashPassword, hashToken } from "../../shared/utils/password.js";
import { userSafeSelect } from "../users/user.type.js";
import type { AuthResult } from "./auth.type.js";
import type { loginSchema, registerSchema } from "./auth.validation.js";

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

export async function register(input: RegisterInput): Promise<AuthResult> {
  const user = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      name: input.name,
      phone: input.phone,
      role: Role.mahasiswa,
      passwordHash: await hashPassword(input.password),
      mahasiswa: {
        create: { nim: input.nim, prodi: input.prodi, fakultas: input.fakultas, angkatan: input.angkatan },
      },
    },
    select: userSafeSelect,
  });
  return { token: signToken({ uid: user.id, role: user.role }), user };
}

export async function login(input: LoginInput): Promise<AuthResult & { userId: number }> {
  const found = await prisma.user.findFirst({
    where: { OR: [{ username: input.identifier }, { email: input.identifier }] },
    select: { id: true, passwordHash: true, status: true, role: true },
  });
  // Pesan sengaja sama agar tidak membocorkan akun mana yang terdaftar
  if (!found || !(await comparePassword(input.password, found.passwordHash)))
    throw unauthorized("Username/email atau password salah");
  if (found.status !== "Aktif") throw forbidden("Akun Anda nonaktif. Hubungi admin.");

  const user = await prisma.user.update({
    where: { id: found.id },
    data: { lastLoginAt: new Date() },
    select: userSafeSelect,
  });
  return { token: signToken({ uid: user.id, role: user.role }), user, userId: user.id };
}

export async function changePassword(userId: number, oldPassword: string, newPassword: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { passwordHash: true } });
  if (!(await comparePassword(oldPassword, user.passwordHash))) throw badRequest("Password lama salah");
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(newPassword) } });
}

/**
 * Belum ada layanan email, jadi token hanya dikembalikan saat bukan production
 * agar bisa dites. Di production sambungkan ke pengirim email di sini.
 */
export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, status: true } });
  let devToken: string | undefined;

  if (user && user.status === "Aktif") {
    const token = generateToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + env.RESET_TOKEN_TTL_MINUTES * 60_000),
      },
    });
    if (!isProd) devToken = token;
  }
  return { resetToken: devToken };
}

export async function resetPassword(token: string, newPassword: string) {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date())
    throw badRequest("Token reset tidak valid atau sudah kedaluwarsa");

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await hashPassword(newPassword) } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // batalkan token reset lain yang masih aktif milik user yang sama
    prisma.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null, id: { not: record.id } },
      data: { usedAt: new Date() },
    }),
  ]);
  return record.userId;
}
