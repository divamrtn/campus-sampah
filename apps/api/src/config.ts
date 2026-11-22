import path from "node:path";

try {
  process.loadEnvFile(path.resolve(process.cwd(), ".env"));
} catch {
  // .env tidak ada: pakai environment sistem
}

export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const IS_PROD = NODE_ENV === "production";
export const PORT = Number(process.env.PORT ?? 4000);

export const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (JWT_SECRET.length < 32 || JWT_SECRET.startsWith("ganti-dengan")) {
  throw new Error(
    "JWT_SECRET lemah atau belum diganti. Buat dengan: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
  );
}

export const JWT_EXPIRES = process.env.JWT_EXPIRES ?? "7d";
export const DB_PATH = process.env.DB_PATH ?? "campus_sampah.db";

// Boleh lebih dari satu alamat, pisahkan dengan koma
export const CORS_ORIGINS = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);