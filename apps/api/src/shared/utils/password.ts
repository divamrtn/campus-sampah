import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { env } from "../../config/env.js";

export const hashPassword = (plain: string) => bcrypt.hash(plain, env.BCRYPT_ROUNDS);
export const comparePassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

export const generateToken = () => randomBytes(32).toString("hex");
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
