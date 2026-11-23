import { recordAudit } from "../../audit/audit.service.js";
import { asyncHandler } from "../../../shared/utils/async-handler.js";
import { sendSuccess } from "../../../shared/utils/response.js";
import * as service from "./pengaturan-poin.service.js";

export const list = asyncHandler(async (_req, res) => {
  sendSuccess(res, await service.list(), "Pengaturan poin per kategori");
});

export const upsert = asyncHandler(async (req, res) => {
  const kategori = req.params.kategori as any;
  const data = await service.upsert(kategori, req.body);
  void recordAudit(req, { aksi: "UPDATE", entitas: "pengaturan_poin", entitasId: kategori, detail: req.body });
  sendSuccess(res, data, "Pengaturan poin disimpan");
});
