import { recordAudit } from "../audit/audit.service.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { sendCreated, sendSuccess } from "../../shared/utils/response.js";
import * as service from "./user.service.js";

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query as any);
  sendSuccess(res, items, "Daftar user", 200, meta);
});

export const getById = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.getById(Number(req.params.id)));
});

export const create = asyncHandler(async (req, res) => {
  const user = await service.create(req.body);
  void recordAudit(req, { aksi: "CREATE", entitas: "users", entitasId: user.id, detail: { role: user.role } });
  sendCreated(res, user, "User berhasil dibuat");
});

export const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const user = await service.update(id, req.body, req.user!.id);
  void recordAudit(req, { aksi: "UPDATE", entitas: "users", entitasId: id, detail: { fields: Object.keys(req.body).filter((k) => k !== "password") } });
  sendSuccess(res, user, "User berhasil diperbarui");
});

export const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await service.remove(id, req.user!.id);
  void recordAudit(req, { aksi: "DELETE", entitas: "users", entitasId: id });
  sendSuccess(res, null, "User berhasil dihapus");
});

export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.getById(req.user!.id));
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await service.updateMe(req.user!.id, req.body);
  void recordAudit(req, { aksi: "UPDATE", entitas: "users", entitasId: user.id, detail: { self: true } });
  sendSuccess(res, user, "Profil berhasil diperbarui");
});
