import { isStaff } from "../../shared/constants/roles.js";
import { recordAudit } from "../audit/audit.service.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { sendCreated, sendSuccess } from "../../shared/utils/response.js";
import * as service from "./reward.service.js";

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query as any, !isStaff(req.user!.role));
  sendSuccess(res, items, "Daftar reward", 200, meta);
});

export const getById = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.getById(Number(req.params.id), !isStaff(req.user!.role)));
});

export const create = asyncHandler(async (req, res) => {
  const row = await service.create(req.body);
  void recordAudit(req, { aksi: "CREATE", entitas: "reward", entitasId: row.id });
  sendCreated(res, row, "Reward dibuat");
});

export const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const row = await service.update(id, req.body);
  void recordAudit(req, { aksi: "UPDATE", entitas: "reward", entitasId: id });
  sendSuccess(res, row, "Reward diperbarui");
});

export const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await service.remove(id);
  void recordAudit(req, { aksi: "DELETE", entitas: "reward", entitasId: id });
  sendSuccess(res, null, "Reward dihapus");
});
