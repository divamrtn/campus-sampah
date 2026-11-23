import { Role } from "@prisma/client";
import { ALL_ROLES, STAFF_ROLES } from "./roles.js";

const A: Role[] = [Role.admin];
const M: Role[] = [Role.mahasiswa];

/** Matriks hak akses per resource. Dipakai di file *.route.ts lewat authorize(). */
export const PERMISSIONS = {
  users: { manage: A },
  master: { read: ALL_ROLES, write: A },
  sampah: { create: ALL_ROLES, read: ALL_ROLES, verify: STAFF_ROLES },
  poin: { readOwn: M, readAll: STAFF_ROLES, adjust: A, leaderboard: ALL_ROLES },
  reward: { read: ALL_ROLES, write: A },
  penukaran: { create: M, read: ALL_ROLES, process: STAFF_ROLES },
  jadwal: { read: ALL_ROLES, create: A, update: STAFF_ROLES },
  laporan: { create: M, read: ALL_ROLES, handle: STAFF_ROLES },
  edukasi: { manage: STAFF_ROLES },
  audit: { read: A },
  dashboard: { staff: STAFF_ROLES, mahasiswa: M },
} as const;
