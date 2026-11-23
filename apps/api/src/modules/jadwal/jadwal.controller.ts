import { recordAudit } from "../audit/audit.service.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { sendCreated, sendSuccess } from "../../shared/utils/response.js";
import * as service from "./jadwal.service.js";

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.user!, req.query as any);
  sendSuccess(res, items, "Jadwal pengangkutan", 200, meta);
});

export const getById = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.getById(Number(req.params.id)));
});

export const create = asyncHandler(async (req, res) => {
  const row = await service.create(req.body);
  void recordAudit(req, { aksi: "CREATE", entitas: "jadwal_pengangkutan", entitasId: row.id });
  sendCreated(res, row, "Jadwal dibuat");
});

export const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = await service.update(req.user!, id, req.body);
  void recordAudit(req, { aksi: "UPDATE", entitas: "jadwal_pengangkutan", entitasId: id, detail: { fields: Object.keys(req.body) } });
  sendSuccess(res, row, "Jadwal diperbarui");
});

export const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await service.remove(id);
  void recordAudit(req, { aksi: "DELETE", entitas: "jadwal_pengangkutan", entitasId: id });
  sendSuccess(res, null, "Jadwal dihapus");
});
