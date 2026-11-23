import { recordAudit } from "../audit/audit.service.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { sendCreated, sendSuccess } from "../../shared/utils/response.js";
import * as service from "./edukasi.service.js";

export const listPublic = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query as any, true);
  sendSuccess(res, items, "Daftar artikel edukasi", 200, meta);
});

export const listAll = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query as any, false);
  sendSuccess(res, items, "Semua artikel edukasi", 200, meta);
});

export const getBySlug = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.getBySlug(String(req.params.slug)));
});

export const getById = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.getById(Number(req.params.id)));
});

export const create = asyncHandler(async (req, res) => {
  const row = await service.create(req.user!.id, req.body);
  void recordAudit(req, { aksi: "CREATE", entitas: "edukasi", entitasId: row.id });
  sendCreated(res, row, "Artikel dibuat");
});

export const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = await service.update(id, req.body);
  void recordAudit(req, { aksi: "UPDATE", entitas: "edukasi", entitasId: id });
  sendSuccess(res, row, "Artikel diperbarui");
});

export const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await service.remove(id);
  void recordAudit(req, { aksi: "DELETE", entitas: "edukasi", entitasId: id });
  sendSuccess(res, null, "Artikel dihapus");
});
