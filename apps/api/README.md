# API Bank Sampah Kampus

Express + TypeScript (ESM, `"type": "module"`) + Prisma (PostgreSQL). Import relatif memakai ekstensi `.js` (aturan NodeNext). Role: `admin`, `petugas`, `mahasiswa`.

## Menjalankan

1. Salin schema Anda ke `prisma/schema.prisma` (tanpa perubahan).
2. Seed dijalankan dari `packages/database` (bukan dari folder api). `cp .env.example .env`, lalu isi `DATABASE_URL`, `JWT_SECRET` (min. 32 karakter).
3. Jalankan:

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate     # buat tabel
pnpm dev
pnpm test
```

Semua response berbentuk `{ success, message, data, meta? }`. Auth: `Authorization: Bearer <token>`.

## Endpoint (prefix `/api`)

| Modul | Endpoint | Akses |
|---|---|---|
| auth | `POST /auth/register` (jadi mahasiswa), `POST /auth/login` (username/email), `GET /auth/me`, `PATCH /auth/change-password`, `POST /auth/forgot-password`, `POST /auth/reset-password` | publik / login |
| users | `GET/PATCH /users/me`; `GET/POST /users`, `GET/PATCH/DELETE /users/:id` | semua / admin |
| pengaturan-poin | `GET /pengaturan-poin`, `PUT /pengaturan-poin/:kategori` | semua / admin |
| jenis-sampah | CRUD `/jenis-sampah` | baca semua, tulis admin |
| titik-pengumpulan | CRUD `/titik-pengumpulan` | baca semua, tulis admin |
| sampah | `GET/POST /sampah`, `GET/PATCH/DELETE /sampah/:id`, `PATCH /sampah/:id/verifikasi` | mahasiswa: miliknya; staf: semua; verifikasi: admin/petugas |
| poin | `GET /poin/saya`, `GET /poin/leaderboard`, `GET /poin`, `POST /poin/penyesuaian` | mahasiswa / semua / staf / admin |
| reward | CRUD `/reward` | baca semua, tulis admin |
| penukaran | `GET/POST /penukaran`, `GET /penukaran/:id`, `PATCH /penukaran/:id/status`, `PATCH /penukaran/:id/batal` | POST & batal: mahasiswa; status: staf |
| jadwal | `GET /jadwal` (`?mine=true`), `GET /jadwal/:id`, `POST`, `PATCH /:id`, `DELETE /:id` | baca semua, buat/hapus admin, ubah staf (petugas hanya status & catatan miliknya) |
| laporan | `GET/POST /laporan`, `GET /laporan/:id`, `PATCH /laporan/:id/tanggapi`, `DELETE /laporan/:id` | mahasiswa: miliknya; tanggapi: staf |
| edukasi | publik: `GET /edukasi`, `GET /edukasi/slug/:slug`; staf: `GET /edukasi/admin/semua`, `POST`, `PATCH /:id`, `DELETE /:id` | |
| notifikasi | `GET /notifikasi`, `GET /notifikasi/unread-count`, `PATCH /notifikasi/read-all`, `PATCH /notifikasi/:id/read`, `DELETE /notifikasi/:id` | login |
| audit | `GET /audit` | admin |
| dashboard | `GET /dashboard` (staf), `GET /dashboard/saya` (mahasiswa) | |

## Alur bisnis

- **Setoran**: mahasiswa `POST /sampah` -> status `Menunggu`, ID `SMP-1001`, `SMP-1002`, ... (advisory lock, aman dari duplikat).
  Admin/petugas bisa input atas nama mahasiswa (`userId`) dan `langsungVerifikasi: true`.
- **Verifikasi** (`PATCH /sampah/:id/verifikasi`): `Terverifikasi` menghitung `floor(beratKg x poinPerKg)` dari `pengaturan_poin`,
  menambah `mahasiswa.total_poin`, dan mencatat ledger `transaksi_poin` (`Setoran`). `Ditolak` wajib `alasanTolak`. Berat boleh dikoreksi petugas.
- **Penukaran**: stok & poin dikurangi atomik dalam satu transaksi, kode `TKR-1001`, ledger `Penukaran` bernilai negatif.
  Dibatalkan (staf atau pemilik) -> stok dan poin dikembalikan, ledger positif.
- **Penyesuaian poin** oleh admin: saldo tidak boleh negatif.
- Data sampah tanpa `userId` (input petugas) tidak menghasilkan poin.
- Setiap aksi penting dicatat ke `log_aktivitas`; status setoran/penukaran/laporan memicu `notifikasi` ke mahasiswa.

## Catatan

- `forgot-password` belum mengirim email; token hanya dikembalikan di response saat `NODE_ENV != production`. Sambungkan pengirim email di `auth.service.ts`.
- Foto memakai kolom URL (`fotoUrl`); belum ada endpoint upload file.
- Test bawaan tidak butuh database (cek routing, guard auth, validasi).
