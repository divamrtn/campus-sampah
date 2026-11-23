import jwt, { type SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../../config/env.js";

export interface TokenPayload {
  uid: number;
  role: Role;
}

export const signToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] });

export const verifyToken = (token: string) => jwt.verify(token, env.JWT_SECRET) as TokenPayload;
