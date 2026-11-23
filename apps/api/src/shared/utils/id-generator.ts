import { appConfig } from "../../config/app.config.js";
import type { Db } from "../../config/database.js";

const LOCK_SAMPAH = 710001;
const LOCK_PENUKARAN = 710002;
const { sampahPrefix, penukaranPrefix, startNumber } = appConfig.ids;

/**
 * Harus dipanggil di dalam prisma.$transaction. Advisory lock mencegah
 * dua request membuat nomor yang sama pada saat bersamaan.
 */
export async function nextSampahId(tx: Db): Promise<string> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${LOCK_SAMPAH})`;
  const rows = await tx.$queryRaw<{ max: number | null }[]>`
    SELECT MAX(CAST(SUBSTRING(id FROM 5) AS INTEGER)) AS max
    FROM sampah WHERE id ~ '^SMP-[0-9]+$'`;
  return `${sampahPrefix}-${(rows[0]?.max ?? startNumber) + 1}`;
}

export async function nextPenukaranKode(tx: Db): Promise<string> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${LOCK_PENUKARAN})`;
  const rows = await tx.$queryRaw<{ max: number | null }[]>`
    SELECT MAX(CAST(SUBSTRING(kode FROM 5) AS INTEGER)) AS max
    FROM penukaran_reward WHERE kode ~ '^TKR-[0-9]+$'`;
  return `${penukaranPrefix}-${(rows[0]?.max ?? startNumber) + 1}`;
}
