import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { notFound } from "../../shared/errors/app-error.js";
import { buildMeta, getPagination } from "../../shared/utils/pagination.js";

const authorSelect = { select: { id: true, name: true } } as const;

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

async function uniqueSlug(base: string, ignoreId?: number) {
  const root = base || "artikel";
  let slug = root;
  for (let i = 2; ; i++) {
    const exists = await prisma.edukasi.findUnique({ where: { slug }, select: { id: true } });
    if (!exists || exists.id === ignoreId) return slug;
    slug = `${root}-${i}`;
  }
}

export async function list(query: { page?: number; limit?: number; search?: string; isPublished?: boolean }, publicOnly: boolean) {
  const { page, limit, skip, take } = getPagination(query);
  const where: Prisma.EdukasiWhereInput = {
    isPublished: publicOnly ? true : query.isPublished,
    ...(query.search
      ? {
          OR: [
            { judul: { contains: query.search, mode: "insensitive" } },
            { ringkasan: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.edukasi.findMany({
      where,
      skip,
      take,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      // daftar tidak perlu membawa isi artikel yang panjang
      select: {
        id: true, judul: true, slug: true, ringkasan: true, gambarUrl: true,
        isPublished: true, publishedAt: true, createdAt: true, author: authorSelect,
      },
    }),
    prisma.edukasi.count({ where }),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
}

export async function getBySlug(slug: string) {
  const row = await prisma.edukasi.findFirst({
    where: { slug, isPublished: true },
    include: { author: authorSelect },
  });
  if (!row) throw notFound("Artikel tidak ditemukan");
  return row;
}

export async function getById(id: number) {
  const row = await prisma.edukasi.findUnique({ where: { id }, include: { author: authorSelect } });
  if (!row) throw notFound("Artikel tidak ditemukan");
  return row;
}

export async function create(
  authorId: number,
  input: { judul: string; slug?: string; ringkasan?: string | null; konten: string; gambarUrl?: string | null; isPublished?: boolean },
) {
  const slug = await uniqueSlug(input.slug ?? slugify(input.judul));
  return prisma.edukasi.create({
    data: {
      ...input,
      slug,
      authorId,
      publishedAt: input.isPublished ? new Date() : null,
    },
    include: { author: authorSelect },
  });
}

export async function update(
  id: number,
  input: { judul?: string; slug?: string; ringkasan?: string | null; konten?: string; gambarUrl?: string | null; isPublished?: boolean },
) {
  const existing = await getById(id);
  const data: Prisma.EdukasiUpdateInput = { ...input };

  if (input.slug) data.slug = await uniqueSlug(input.slug, id);
  if (input.isPublished === true && !existing.publishedAt) data.publishedAt = new Date();
  if (input.isPublished === false) data.publishedAt = null;

  return prisma.edukasi.update({ where: { id }, data, include: { author: authorSelect } });
}

export async function remove(id: number) {
  await getById(id);
  await prisma.edukasi.delete({ where: { id } });
}
