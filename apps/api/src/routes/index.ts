import { Router } from "express";
import auditRoutes from "../modules/audit/audit.route.js";
import authRoutes from "../modules/auth/auth.route.js";
import dashboardRoutes from "../modules/dashboard/dashboard.route.js";
import edukasiRoutes from "../modules/edukasi/edukasi.route.js";
import jadwalRoutes from "../modules/jadwal/jadwal.route.js";
import laporanRoutes from "../modules/laporan/laporan.route.js";
import jenisSampahRoutes from "../modules/master/jenis-sampah/jenis-sampah.route.js";
import pengaturanPoinRoutes from "../modules/master/pengaturan-poin/pengaturan-poin.route.js";
import titikPengumpulanRoutes from "../modules/master/titik-pengumpulan/titik-pengumpulan.route.js";
import notifikasiRoutes from "../modules/notifikasi/notifikasi.route.js";
import penukaranRoutes from "../modules/penukaran/penukaran.route.js";
import poinRoutes from "../modules/poin/poin.route.js";
import rewardRoutes from "../modules/reward/reward.route.js";
import sampahRoutes from "../modules/sampah/sampah.route.js";
import userRoutes from "../modules/users/user.route.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "OK", data: { uptime: process.uptime() } });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// master data
router.use("/pengaturan-poin", pengaturanPoinRoutes);
router.use("/jenis-sampah", jenisSampahRoutes);
router.use("/titik-pengumpulan", titikPengumpulanRoutes);

// inti bank sampah
router.use("/sampah", sampahRoutes);
router.use("/poin", poinRoutes);
router.use("/reward", rewardRoutes);
router.use("/penukaran", penukaranRoutes);

// operasional & konten
router.use("/jadwal", jadwalRoutes);
router.use("/laporan", laporanRoutes);
router.use("/edukasi", edukasiRoutes);
router.use("/notifikasi", notifikasiRoutes);

router.use("/audit", auditRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
