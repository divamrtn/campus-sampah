import type { CorsOptions } from "cors";
import { env } from "./env.js";

const origins = env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    // izinkan request tanpa origin (curl, server-to-server, Postman)
    if (!origin || origins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} tidak diizinkan oleh CORS`));
  },
  credentials: true,
};
