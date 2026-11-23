import { Role } from "@prisma/client";

export const ROLES = {
  ADMIN: Role.admin,
  PETUGAS: Role.petugas,
  MAHASISWA: Role.mahasiswa,
} as const;

export const ALL_ROLES: Role[] = [Role.admin, Role.petugas, Role.mahasiswa];
export const STAFF_ROLES: Role[] = [Role.admin, Role.petugas];

export const isStaff = (role: Role) => STAFF_ROLES.includes(role);
