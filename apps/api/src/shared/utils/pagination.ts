import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function getPagination(query: { page?: number; limit?: number }) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function buildMeta(total: number, page: number, limit: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
