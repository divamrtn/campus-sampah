-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'petugas', 'mahasiswa');

-- CreateEnum
CREATE TYPE "StatusUser" AS ENUM ('Aktif', 'Nonaktif');

-- CreateEnum
CREATE TYPE "Kategori" AS ENUM ('Organik', 'Anorganik', 'B3');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Menunggu', 'Terverifikasi', 'Ditolak');

-- CreateEnum
CREATE TYPE "TipeTransaksiPoin" AS ENUM ('Setoran', 'Penukaran', 'Penyesuaian');

-- CreateEnum
CREATE TYPE "StatusPenukaran" AS ENUM ('Diproses', 'Selesai', 'Dibatalkan');

-- CreateEnum
CREATE TYPE "StatusLaporan" AS ENUM ('Baru', 'Diproses', 'Selesai', 'Ditolak');

-- CreateEnum
CREATE TYPE "StatusJadwal" AS ENUM ('Terjadwal', 'Berjalan', 'Selesai', 'Dibatalkan');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "StatusUser" NOT NULL DEFAULT 'Aktif',
    "phone" TEXT,
    "foto_url" TEXT,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nim" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "fakultas" TEXT NOT NULL,
    "angkatan" INTEGER NOT NULL,
    "total_poin" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "petugas" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nip" TEXT NOT NULL,
    "jabatan" TEXT,
    "tps_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "petugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengaturan_poin" (
    "id" SERIAL NOT NULL,
    "kategori" "Kategori" NOT NULL,
    "poin_per_kg" INTEGER NOT NULL DEFAULT 0,
    "harga_per_kg" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengaturan_poin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jenis_sampah" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" "Kategori" NOT NULL,
    "deskripsi" TEXT,
    "gambar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jenis_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "titik_pengumpulan" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "deskripsi" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "kapasitas_kg" DECIMAL(10,2),
    "jam_buka" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "titik_pengumpulan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sampah" (
    "id" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "lokasi" TEXT NOT NULL,
    "petugas" TEXT,
    "kategori" "Kategori" NOT NULL,
    "berat_kg" DOUBLE PRECISION NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'Menunggu',
    "poin" INTEGER NOT NULL DEFAULT 0,
    "catatan" TEXT,
    "alasan_tolak" TEXT,
    "foto_url" TEXT,
    "jenis_id" INTEGER,
    "tps_id" INTEGER,
    "user_id" INTEGER,
    "created_by" INTEGER,
    "verified_by" INTEGER,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksi_poin" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tipe" "TipeTransaksiPoin" NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "saldo_setelah" INTEGER NOT NULL,
    "keterangan" TEXT,
    "sampah_id" TEXT,
    "penukaran_id" INTEGER,
    "dibuat_oleh" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaksi_poin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "poin_dibutuhkan" INTEGER NOT NULL,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "gambar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penukaran_reward" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "reward_id" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "total_poin" INTEGER NOT NULL,
    "status" "StatusPenukaran" NOT NULL DEFAULT 'Diproses',
    "catatan" TEXT,
    "diproses_oleh" INTEGER,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penukaran_reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jadwal_pengangkutan" (
    "id" SERIAL NOT NULL,
    "tps_id" INTEGER NOT NULL,
    "petugas_id" INTEGER,
    "tanggal" DATE NOT NULL,
    "jam_mulai" TEXT NOT NULL,
    "jam_selesai" TEXT,
    "status" "StatusJadwal" NOT NULL DEFAULT 'Terjadwal',
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jadwal_pengangkutan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laporan_sampah" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "foto_url" TEXT,
    "status" "StatusLaporan" NOT NULL DEFAULT 'Baru',
    "tanggapan" TEXT,
    "ditangani_oleh" INTEGER,
    "ditangani_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laporan_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edukasi" (
    "id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ringkasan" TEXT,
    "konten" TEXT NOT NULL,
    "gambar_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "edukasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_aktivitas" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "aksi" TEXT NOT NULL,
    "entitas" TEXT NOT NULL,
    "entitas_id" TEXT,
    "detail" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_aktivitas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_user_id_key" ON "mahasiswa"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_nim_key" ON "mahasiswa"("nim");

-- CreateIndex
CREATE INDEX "mahasiswa_prodi_idx" ON "mahasiswa"("prodi");

-- CreateIndex
CREATE INDEX "mahasiswa_angkatan_idx" ON "mahasiswa"("angkatan");

-- CreateIndex
CREATE UNIQUE INDEX "petugas_user_id_key" ON "petugas"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "petugas_nip_key" ON "petugas"("nip");

-- CreateIndex
CREATE INDEX "petugas_tps_id_idx" ON "petugas"("tps_id");

-- CreateIndex
CREATE UNIQUE INDEX "pengaturan_poin_kategori_key" ON "pengaturan_poin"("kategori");

-- CreateIndex
CREATE UNIQUE INDEX "jenis_sampah_kode_key" ON "jenis_sampah"("kode");

-- CreateIndex
CREATE INDEX "jenis_sampah_kategori_idx" ON "jenis_sampah"("kategori");

-- CreateIndex
CREATE INDEX "jenis_sampah_is_active_idx" ON "jenis_sampah"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "titik_pengumpulan_kode_key" ON "titik_pengumpulan"("kode");

-- CreateIndex
CREATE INDEX "titik_pengumpulan_is_active_idx" ON "titik_pengumpulan"("is_active");

-- CreateIndex
CREATE INDEX "idx_sampah_status" ON "sampah"("status");

-- CreateIndex
CREATE INDEX "idx_sampah_user" ON "sampah"("user_id");

-- CreateIndex
CREATE INDEX "sampah_kategori_idx" ON "sampah"("kategori");

-- CreateIndex
CREATE INDEX "sampah_tanggal_idx" ON "sampah"("tanggal");

-- CreateIndex
CREATE INDEX "sampah_tps_id_idx" ON "sampah"("tps_id");

-- CreateIndex
CREATE INDEX "transaksi_poin_user_id_idx" ON "transaksi_poin"("user_id");

-- CreateIndex
CREATE INDEX "transaksi_poin_tipe_idx" ON "transaksi_poin"("tipe");

-- CreateIndex
CREATE INDEX "transaksi_poin_sampah_id_idx" ON "transaksi_poin"("sampah_id");

-- CreateIndex
CREATE INDEX "transaksi_poin_penukaran_id_idx" ON "transaksi_poin"("penukaran_id");

-- CreateIndex
CREATE INDEX "transaksi_poin_created_at_idx" ON "transaksi_poin"("created_at");

-- CreateIndex
CREATE INDEX "reward_is_active_idx" ON "reward"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "penukaran_reward_kode_key" ON "penukaran_reward"("kode");

-- CreateIndex
CREATE INDEX "penukaran_reward_user_id_idx" ON "penukaran_reward"("user_id");

-- CreateIndex
CREATE INDEX "penukaran_reward_reward_id_idx" ON "penukaran_reward"("reward_id");

-- CreateIndex
CREATE INDEX "penukaran_reward_status_idx" ON "penukaran_reward"("status");

-- CreateIndex
CREATE INDEX "jadwal_pengangkutan_tps_id_idx" ON "jadwal_pengangkutan"("tps_id");

-- CreateIndex
CREATE INDEX "jadwal_pengangkutan_petugas_id_idx" ON "jadwal_pengangkutan"("petugas_id");

-- CreateIndex
CREATE INDEX "jadwal_pengangkutan_tanggal_idx" ON "jadwal_pengangkutan"("tanggal");

-- CreateIndex
CREATE INDEX "jadwal_pengangkutan_status_idx" ON "jadwal_pengangkutan"("status");

-- CreateIndex
CREATE INDEX "laporan_sampah_user_id_idx" ON "laporan_sampah"("user_id");

-- CreateIndex
CREATE INDEX "laporan_sampah_status_idx" ON "laporan_sampah"("status");

-- CreateIndex
CREATE INDEX "laporan_sampah_created_at_idx" ON "laporan_sampah"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "edukasi_slug_key" ON "edukasi"("slug");

-- CreateIndex
CREATE INDEX "edukasi_author_id_idx" ON "edukasi"("author_id");

-- CreateIndex
CREATE INDEX "edukasi_is_published_idx" ON "edukasi"("is_published");

-- CreateIndex
CREATE INDEX "notifikasi_user_id_is_read_idx" ON "notifikasi"("user_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "log_aktivitas_user_id_idx" ON "log_aktivitas"("user_id");

-- CreateIndex
CREATE INDEX "log_aktivitas_entitas_entitas_id_idx" ON "log_aktivitas"("entitas", "entitas_id");

-- CreateIndex
CREATE INDEX "log_aktivitas_created_at_idx" ON "log_aktivitas"("created_at");

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petugas" ADD CONSTRAINT "petugas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petugas" ADD CONSTRAINT "petugas_tps_id_fkey" FOREIGN KEY ("tps_id") REFERENCES "titik_pengumpulan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sampah" ADD CONSTRAINT "sampah_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sampah" ADD CONSTRAINT "sampah_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sampah" ADD CONSTRAINT "sampah_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sampah" ADD CONSTRAINT "sampah_jenis_id_fkey" FOREIGN KEY ("jenis_id") REFERENCES "jenis_sampah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sampah" ADD CONSTRAINT "sampah_tps_id_fkey" FOREIGN KEY ("tps_id") REFERENCES "titik_pengumpulan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_poin" ADD CONSTRAINT "transaksi_poin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_poin" ADD CONSTRAINT "transaksi_poin_dibuat_oleh_fkey" FOREIGN KEY ("dibuat_oleh") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_poin" ADD CONSTRAINT "transaksi_poin_sampah_id_fkey" FOREIGN KEY ("sampah_id") REFERENCES "sampah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_poin" ADD CONSTRAINT "transaksi_poin_penukaran_id_fkey" FOREIGN KEY ("penukaran_id") REFERENCES "penukaran_reward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penukaran_reward" ADD CONSTRAINT "penukaran_reward_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penukaran_reward" ADD CONSTRAINT "penukaran_reward_diproses_oleh_fkey" FOREIGN KEY ("diproses_oleh") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penukaran_reward" ADD CONSTRAINT "penukaran_reward_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal_pengangkutan" ADD CONSTRAINT "jadwal_pengangkutan_tps_id_fkey" FOREIGN KEY ("tps_id") REFERENCES "titik_pengumpulan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal_pengangkutan" ADD CONSTRAINT "jadwal_pengangkutan_petugas_id_fkey" FOREIGN KEY ("petugas_id") REFERENCES "petugas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan_sampah" ADD CONSTRAINT "laporan_sampah_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan_sampah" ADD CONSTRAINT "laporan_sampah_ditangani_oleh_fkey" FOREIGN KEY ("ditangani_oleh") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edukasi" ADD CONSTRAINT "edukasi_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_aktivitas" ADD CONSTRAINT "log_aktivitas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
