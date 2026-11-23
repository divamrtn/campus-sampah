import { asyncHandler } from "../../shared/utils/async-handler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import * as service from "./notifikasi.service.js";

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.user!.id, req.query as any);
  sendSuccess(res, items, "Daftar notifikasi", 200, meta);
});

export const unreadCount = asyncHandler(async (req, res) => {
  sendSuccess(res, { count: await service.unreadCount(req.user!.id) });
});

export const markRead = asyncHandler(async (req, res) => {
  await service.markRead(req.user!.id, Number(req.params.id));
  sendSuccess(res, null, "Notifikasi ditandai dibaca");
});

export const markAllRead = asyncHandler(async (req, res) => {
  const r = await service.markAllRead(req.user!.id);
  sendSuccess(res, { updated: r.count }, "Semua notifikasi ditandai dibaca");
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.user!.id, Number(req.params.id));
  sendSuccess(res, null, "Notifikasi dihapus");
});
