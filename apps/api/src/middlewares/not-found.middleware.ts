import type { RequestHandler } from "express";
import { notFound } from "../shared/errors/app-error.js";

export const notFoundHandler: RequestHandler = (req, _res, next) =>
  next(notFound(`Route ${req.method} ${req.originalUrl} tidak ditemukan`));
