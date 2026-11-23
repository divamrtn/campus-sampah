import { Role, StatusUser } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "../../shared/utils/pagination.js";
import { intId } from "../../shared/utils/validators.js";

export const usernameField = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9_.]+$/, "Username hanya boleh huruf, angka, titik, dan underscore");
export const emailField = z.string().trim().toLowerCase().email().max(120);
export const passwordField = z.string().min(8, "Password minimal 8 karakter").max(72);
const phoneField = z.string().trim().min(5).max(20);

const baseUser = {
  username: usernameField,
  email: emailField,
  name: z.string().trim().min(2).max(100),
  password: passwordField,
  phone: phoneField.optional(),
  status: z.nativeEnum(StatusUser).optional(),
};

export const mahasiswaProfile = {
  nim: z.string().trim().min(3).max(30),
  prodi: z.string().trim().min(2).max(100),
  fakultas: z.string().trim().min(2).max(100),
  angkatan: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 1),
};

export const createUserSchema = z.discriminatedUnion("role", [
  z.object({ ...baseUser, role: z.literal(Role.admin) }),
  z.object({
    ...baseUser,
    role: z.literal(Role.petugas),
    nip: z.string().trim().min(3).max(30),
    jabatan: z.string().trim().max(100).optional(),
    tpsId: intId.optional(),
  }),
  z.object({ ...baseUser, role: z.literal(Role.mahasiswa), ...mahasiswaProfile }),
]);
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    username: usernameField,
    email: emailField,
    name: z.string().trim().min(2).max(100),
    password: passwordField,
    phone: phoneField.nullable(),
    fotoUrl: z.string().url().max(500).nullable(),
    status: z.nativeEnum(StatusUser),
    // profil mahasiswa
    nim: mahasiswaProfile.nim,
    prodi: mahasiswaProfile.prodi,
    fakultas: mahasiswaProfile.fakultas,
    angkatan: mahasiswaProfile.angkatan,
    // profil petugas
    nip: z.string().trim().min(3).max(30),
    jabatan: z.string().trim().max(100).nullable(),
    tpsId: intId.nullable(),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "Tidak ada data yang diubah" });
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    phone: phoneField.nullable(),
    fotoUrl: z.string().url().max(500).nullable(),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "Tidak ada data yang diubah" });

export const listUserQuery = paginationSchema.extend({
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(StatusUser).optional(),
  search: z.string().trim().optional(),
});
