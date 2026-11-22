import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES, JWT_SECRET } from "./config";
import { get, type Role } from "./db";

export interface AuthInfo {
  id: number;
  name: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthInfo;
    }
  }
}

export function signToken(user: { id: number; role: Role }): string {
  return jwt.sign({ role: user.role }, JWT_SECRET, {
    subject: String(user.id),
    expiresIn: JWT_EXPIRES as jwt.SignOptions["expiresIn"],
  });
}

/** Wajib login. Peran dibaca ulang dari database, bukan dari isi token. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    res.status(401).json({ message: "Silakan login terlebih dahulu." });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    const user = get<AuthInfo>("SELECT id, name, role FROM users WHERE id = ?", Number(payload.sub));
    if (!user) {
      res.status(401).json({ message: "Akun tidak ditemukan." });
      return;
    }
    req.auth = user;
    next();
  } catch {
    res.status(401).json({ message: "Sesi tidak valid atau sudah berakhir." });
  }
}

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      res.status(403).json({ message: "Kamu tidak punya akses ke fitur ini." });
      return;
    }
    next();
  };