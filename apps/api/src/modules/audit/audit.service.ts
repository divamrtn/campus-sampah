import type { Request } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { buildMeta, getPagination } from "../../shared/utils/pagination.js";

interface AuditInput {
  aksi: string; // LOGIN, CREATE, UPDATE, DELETE, VERIFIKASI, dst.
  entitas: string; // sampah, reward, users, ...
  entitasId?: string | number | null;
  detail?: Prisma.InputJsonValue;
  userId?: number | null; // isi manual jika req.user belum ada (mis. login)
}

/** Tidak pernah melempar error: kegagalan audit tidak boleh menggagalkan request. */
export function recordAudit(req: Request, input: AuditInput) {
  return prisma.logAktivitas
    .create({
      data: {
        userId: input.userId ?? req.user?.id ?? null,
        aksi: input.aksi,
        entitas: input.entitas,
        entitasId: input.entitasId != null ? String(input.entitasId) : null,
        detail: input.detail,
        ipAddress: req.ip,
        userAgent: req.get("user-agent")?.slice(0, 255),
      },
    })
    .catch((err) => console.error("Gagal mencatat audit:", err));
}

export async function list(query: {
  page?: number;
  limit?: number;
  userId?: number;
  aksi?: string;
  entitas?: string;
  dari?: Date;
  sampai?: Date;
}) {
  const { page, limit, skip, take } = getPagination(query);
  const where: Prisma.LogAktivitasWhereInput = {
    userId: query.userId,
    aksi: query.aksi,
    entitas: query.entitas,
    createdAt: { gte: query.dari, lte: query.sampai },
  };
  const [items, total] = await Promise.all([
    prisma.logAktivitas.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, username: true, role: true } } },
    }),
    prisma.logAktivitas.count({ where }),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
}
