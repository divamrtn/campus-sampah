import app from "./app.js";
import { prisma } from "./config/database.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`API Bank Sampah berjalan di http://localhost:${env.PORT}/api (${env.NODE_ENV})`);
});

async function shutdown(signal: string) {
  console.log(`${signal} diterima, menutup server...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
