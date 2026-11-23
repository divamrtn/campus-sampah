import type { RequestHandler } from "express";
import type { Role } from "@prisma/client";
import { forbidden, unauthorized } from "../shared/errors/app-error.js";

export const authorize =
  (...roles: (Role | readonly Role[])[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    const allowed = roles.flat() as Role[];
    if (!allowed.includes(req.user.role)) return next(forbidden("Role Anda tidak punya akses ke fitur ini"));
    next();
  };
