import { recordAudit } from "../audit/audit.service.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { sendCreated, sendSuccess } from "../../shared/utils/response.js";
import * as service from "./penukaran.service.js";

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.user!, req.query as any);
  sendSuccess(res, items, "Daftar penukaran reward", 200, meta);
});

export const getById = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.getById(req.user!, Number(req.params.id)));
});

export const create = asyncHandler(async (req, res) => {
  const row = await service.create(req.user!, req.body);
  void recordAudit(req, { aksi: "CREATE", entitas: "penukaran_reward", entitasId: row.id, detail: { kode: row.kode, totalPoin: row.totalPoin } });
  sendCreated(res, row, "Penukaran berhasil dibuat");
});

export const updateStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = await service.updateStatus(req.user!, id, req.body.status, req.body.catatan);
  void recordAudit(req, { aksi: "UPDATE_STATUS", entitas: "penukaran_reward", entitasId: id, detail: { status: row.status } });
  sendSuccess(res, row, `Penukaran ${row.status.toLowerCase()}`);
});

export const cancelOwn = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = await service.cancelOwn(req.user!, id, req.body?.catatan);
  void recordAudit(req, { aksi: "UPDATE_STATUS", entitas: "penukaran_reward", entitasId: id, detail: { status: row.status, oleh: "pemilik" } });
  sendSuccess(res, row, "Penukaran dibatalkan, poin dikembalikan");
});
