import { recordAudit } from "../audit/audit.service.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { sendCreated, sendSuccess } from "../../shared/utils/response.js";
import * as service from "./laporan.service.js";

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.user!, req.query as any);
  sendSuccess(res, items, "Daftar laporan", 200, meta);
});

export const getById = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.getById(req.user!, Number(req.params.id)));
});

export const create = asyncHandler(async (req, res) => {
  const row = await service.create(req.user!, req.body);
  void recordAudit(req, { aksi: "CREATE", entitas: "laporan_sampah", entitasId: row.id });
  sendCreated(res, row, "Laporan terkirim");
});

export const tanggapi = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = await service.tanggapi(req.user!, id, req.body);
  void recordAudit(req, { aksi: "UPDATE_STATUS", entitas: "laporan_sampah", entitasId: id, detail: { status: row.status } });
  sendSuccess(res, row, "Laporan ditanggapi");
});

export const removeOwn = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await service.removeOwn(req.user!, id);
  void recordAudit(req, { aksi: "DELETE", entitas: "laporan_sampah", entitasId: id });
  sendSuccess(res, null, "Laporan dihapus");
});
