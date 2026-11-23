import { asyncHandler } from "../../shared/utils/async-handler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import * as service from "./dashboard.service.js";

export const staff = asyncHandler(async (_req, res) => {
  sendSuccess(res, await service.staffSummary(), "Ringkasan dashboard");
});

export const mahasiswa = asyncHandler(async (req, res) => {
  sendSuccess(res, await service.mahasiswaSummary(req.user!.id), "Ringkasan dashboard mahasiswa");
});
