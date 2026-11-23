import { recordAudit } from "../audit/audit.service.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { sendCreated, sendSuccess } from "../../shared/utils/response.js";
import * as service from "./poin.service.js";

export const listMine = asyncHandler(async (req, res) => {
  const { items, meta, saldo } = await service.listMine(req.user!.id, req.query as any);
  res.json({ success: true, message: "Riwayat poin", data: items, meta, saldo });
});

export const listAll = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query as any);
  sendSuccess(res, items, "Riwayat transaksi poin", 200, meta);
});

export const leaderboard = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.leaderboard((req.query as any).limit), "Papan peringkat poin");
});

export const adjust = asyncHandler(async (req, res) => {
  const trx = await service.adjust(req.user!, req.body);
  void recordAudit(req, { aksi: "PENYESUAIAN_POIN", entitas: "transaksi_poin", entitasId: trx.id, detail: req.body });
  sendCreated(res, trx, "Poin berhasil disesuaikan");
});
