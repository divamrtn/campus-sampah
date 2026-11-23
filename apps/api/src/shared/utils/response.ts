import type { Response } from "express";
import type { PaginationMeta } from "./pagination.js";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Berhasil",
  status = 200,
  meta?: PaginationMeta,
) {
  return res.status(status).json({ success: true, message, data, ...(meta ? { meta } : {}) });
}

export const sendCreated = <T>(res: Response, data: T, message = "Data berhasil dibuat") =>
  sendSuccess(res, data, message, 201);
