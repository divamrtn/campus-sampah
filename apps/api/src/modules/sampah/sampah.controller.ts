import { recordAudit } from "../audit/audit.service.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { sendCreated, sendSuccess } from "../../shared/utils/response.js";
import * as service from "./sampah.service.js";

export const list = asyncHandler(async (req, res) => {
  const { items, meta, summary } = await service.list(req.user!, req.query as any);
  res.json({ success: true, message: "Daftar sampah", data: items, meta, summary });
});

export const getById = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.getById(req.user!, String(req.params.id)));
});

export const create = asyncHandler(async (req, res) => {
  const row = await service.create(req.user!, req.body);
  void recordAudit(req, { aksi: "CREATE", entitas: "sampah", entitasId: row.id, detail: { status: row.status } });
  sendCreated(res, row, "Data sampah berhasil dibuat");
});

export const update = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const row = await service.update(req.user!, id, req.body);
  void recordAudit(req, { aksi: "UPDATE", entitas: "sampah", entitasId: id });
  sendSuccess(res, row, "Data sampah diperbarui");
});

export const remove = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  await service.remove(req.user!, id);
  void recordAudit(req, { aksi: "DELETE", entitas: "sampah", entitasId: id });
  sendSuccess(res, null, "Data sampah dihapus");
});

export const verifikasi = asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  const row = await service.verifikasi(req.user!, id, req.body);
  void recordAudit(req, { aksi: "VERIFIKASI", entitas: "sampah", entitasId: id, detail: { status: row.status, poin: row.poin } });
  sendSuccess(res, row, `Data sampah ${row.status.toLowerCase()}`);
});
