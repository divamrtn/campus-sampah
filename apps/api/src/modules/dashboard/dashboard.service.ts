import { prisma } from "../../config/database.js";

const toMap = <K extends string>(rows: { key: K; n: number }[]) =>
  Object.fromEntries(rows.map((r) => [r.key, r.n])) as Record<K, number>;

/** Ringkasan untuk admin & petugas. */
export async function staffSummary() {
  const today = new Date(new Date().toISOString().slice(0, 10)); // 00:00 UTC, cocok dengan kolom DATE

  const [users, statusSampah, perKategori, penukaran, laporan, jadwalHariIni, totalPoinBeredar, tren] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.sampahRow.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.sampahRow.groupBy({
      by: ["kategori"],
      where: { status: "Terverifikasi" },
      _sum: { beratKg: true },
      _count: { _all: true },
    }),
    prisma.penukaranReward.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.laporanSampah.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.jadwalPengangkutan.count({ where: { tanggal: today, status: { in: ["Terjadwal", "Berjalan"] } } }),
    prisma.mahasiswa.aggregate({ _sum: { totalPoin: true } }),
    prisma.$queryRaw<{ bulan: string; total: number }[]>`
      SELECT to_char(date_trunc('month', tanggal), 'YYYY-MM') AS bulan,
             COALESCE(SUM(berat_kg), 0)::float8 AS total
      FROM sampah
      WHERE status = 'Terverifikasi'
        AND tanggal >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
      GROUP BY 1 ORDER BY 1`,
  ]);

  return {
    pengguna: toMap(users.map((r) => ({ key: r.role, n: r._count._all }))),
    sampah: {
      perStatus: toMap(statusSampah.map((r) => ({ key: r.status, n: r._count._all }))),
      terverifikasiPerKategori: perKategori.map((r) => ({
        kategori: r.kategori,
        jumlahSetoran: r._count._all,
        totalBeratKg: r._sum.beratKg ?? 0,
      })),
      totalBeratTerverifikasiKg: perKategori.reduce((s, r) => s + (r._sum.beratKg ?? 0), 0),
      trenBulanan: tren,
    },
    penukaran: toMap(penukaran.map((r) => ({ key: r.status, n: r._count._all }))),
    laporan: toMap(laporan.map((r) => ({ key: r.status, n: r._count._all }))),
    jadwalHariIni,
    totalPoinBeredar: totalPoinBeredar._sum.totalPoin ?? 0,
  };
}

/** Ringkasan pribadi untuk mahasiswa. */
export async function mahasiswaSummary(userId: number) {
  const [mhs, perStatus, berat, penukaran, laporan, riwayat, unread] = await Promise.all([
    prisma.mahasiswa.findUnique({ where: { userId }, select: { totalPoin: true, nim: true, prodi: true } }),
    prisma.sampahRow.groupBy({ by: ["status"], where: { userId }, _count: { _all: true } }),
    prisma.sampahRow.groupBy({
      by: ["kategori"],
      where: { userId, status: "Terverifikasi" },
      _sum: { beratKg: true },
    }),
    prisma.penukaranReward.groupBy({ by: ["status"], where: { userId }, _count: { _all: true } }),
    prisma.laporanSampah.groupBy({ by: ["status"], where: { userId }, _count: { _all: true } }),
    prisma.transaksiPoin.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.notifikasi.count({ where: { userId, isRead: false } }),
  ]);

  return {
    profil: mhs,
    saldoPoin: mhs?.totalPoin ?? 0,
    setoranPerStatus: toMap(perStatus.map((r) => ({ key: r.status, n: r._count._all }))),
    beratTerverifikasiPerKategori: berat.map((r) => ({ kategori: r.kategori, totalBeratKg: r._sum.beratKg ?? 0 })),
    totalBeratTerverifikasiKg: berat.reduce((s, r) => s + (r._sum.beratKg ?? 0), 0),
    penukaranPerStatus: toMap(penukaran.map((r) => ({ key: r.status, n: r._count._all }))),
    laporanPerStatus: toMap(laporan.map((r) => ({ key: r.status, n: r._count._all }))),
    riwayatPoinTerbaru: riwayat,
    notifikasiBelumDibaca: unread,
  };
}
