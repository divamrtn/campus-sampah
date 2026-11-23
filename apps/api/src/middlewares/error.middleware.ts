import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { isProd } from "../config/env.js";
import { AppError } from "../shared/errors/app-error.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message, code: err.code, errors: err.errors });
  }

  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Validasi gagal",
      code: "VALIDATION_ERROR",
      errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const target = (err.meta?.target as string[] | string | undefined) ?? "";
        const field = Array.isArray(target) ? target.join(", ") : target;
        return res.status(409).json({
          success: false,
          message: `Data dengan ${field || "nilai tersebut"} sudah digunakan`,
          code: "DUPLICATE",
        });
      }
      case "P2025":
        return res.status(404).json({ success: false, message: "Data tidak ditemukan", code: "NOT_FOUND" });
      case "P2003":
      case "P2014":
        return res.status(409).json({
          success: false,
          message: "Data masih berelasi dengan data lain sehingga tidak dapat diproses",
          code: "RELATION_CONFLICT",
        });
    }
  }

  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "JSON tidak valid", code: "BAD_JSON" });
  }

  if (err?.message?.includes("CORS")) {
    return res.status(403).json({ success: false, message: err.message, code: "CORS" });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
    code: "INTERNAL_ERROR",
    ...(isProd ? {} : { detail: String(err?.message ?? err) }),
  });
};
