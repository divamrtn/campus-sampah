import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET wajib diisi (minimal 32 karakter)"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  CORS_ORIGINS: z.string().default("http://localhost:5173"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),
  RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(30),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Konfigurasi environment tidak valid:");
  for (const issue of parsed.error.issues) {
    console.error(` - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
