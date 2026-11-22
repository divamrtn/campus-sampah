import cors from "cors";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import type { NextFunction, Request, Response } from "express";
import { CORS_ORIGINS, IS_PROD, PORT } from "./config";
import "./db";
import authRoutes from "./routes/auth";
import sampahRoutes from "./routes/sampah";
import setoranRoutes from "./routes/setoran";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: CORS_ORIGINS }));
app.use(express.json({ limit: "100kb" }));

const limiterUmum = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Terlalu banyak permintaan. Coba lagi sebentar." },
});

const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." },
});

app.use("/api", limiterUmum);
app.use("/api/auth/login", limiterLogin);
app.use("/api/auth/register", limiterLogin);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/sampah", sampahRoutes);
app.use("/api/setoran", setoranRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan." });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    message: IS_PROD ? "Terjadi kesalahan di server." : String(err),
  });
});

app.listen(PORT, () => {
  console.log(`API berjalan di http://localhost:${PORT}`);
});