import { asyncHandler } from "../../shared/utils/async-handler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import * as service from "./audit.service.js";

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query as any);
  sendSuccess(res, items, "Log aktivitas", 200, meta);
});
