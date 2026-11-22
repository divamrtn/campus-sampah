import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import Header from "../components/Header";
import {
  ROLE_LABELS,
  clearAuth,
  getUser,
  homePathForRole,
  isAuthenticated,
  onAuthChange,
} from "../lib/session";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AdminLayoutProps {
  user?: { name: string; role: string };
  onLogout?: () => void;
}

/** Judul dan breadcrumb per route. Tambahkan sesuai route project kamu. */
const PAGES: Record<string, { title: string; breadcrumbs: Breadcrumb[] }> = {
  "/admin/dashboard": {
    title: "Dashboard",
    breadcrumbs: [{ label: "Admin" }, { label: "Dashboard" }],
  },
  "/admin/sampah": {
    title: "Data sampah",
    breadcrumbs: [{ label: "Admin" }, { label: "Pendataan" }, { label: "Data sampah" }],
  },
  "/admin/sampah/tambah": {
    title: "Input data baru",
    breadcrumbs: [
      { label: "Admin" },
      { label: "Pendataan" },
      { label: "Data sampah", href: "/admin/sampah" },
      { label: "Input data baru" },
    ],
  },
  "/admin/sampah/verifikasi": {
    title: "Menunggu verifikasi",
    breadcrumbs: [
      { label: "Admin" },
      { label: "Pendataan" },
      { label: "Data sampah", href: "/admin/sampah" },
      { label: "Menunggu verifikasi" },
    ],
  },
  "/admin/kategori/organik": {
    title: "Kategori Organik",
    breadcrumbs: [{ label: "Admin" }, { label: "Kategori sampah" }, { label: "Organik" }],
  },
  "/admin/kategori/anorganik": {
    title: "Kategori Anorganik",
    breadcrumbs: [{ label: "Admin" }, { label: "Kategori sampah" }, { label: "Anorganik" }],
  },
  "/admin/kategori/b3": {
    title: "Kategori B3",
    breadcrumbs: [{ label: "Admin" }, { label: "Kategori sampah" }, { label: "B3" }],
  },
  "/admin/bank-sampah": {
    title: "Bank sampah",
    breadcrumbs: [{ label: "Admin" }, { label: "Pendataan" }, { label: "Bank sampah" }],
  },
  "/admin/tps": {
    title: "Lokasi TPS",
    breadcrumbs: [{ label: "Admin" }, { label: "Pendataan" }, { label: "Lokasi TPS" }],
  },
  "/admin/pengangkutan": {
    title: "Pengangkutan",
    breadcrumbs: [{ label: "Admin" }, { label: "Operasional" }, { label: "Pengangkutan" }],
  },
  "/admin/jadwal": {
    title: "Jadwal",
    breadcrumbs: [{ label: "Admin" }, { label: "Operasional" }, { label: "Jadwal" }],
  },
  "/admin/daur-ulang": {
    title: "Daur ulang",
    breadcrumbs: [{ label: "Admin" }, { label: "Operasional" }, { label: "Daur ulang" }],
  },
  "/admin/petugas": {
    title: "Petugas",
    breadcrumbs: [{ label: "Admin" }, { label: "Operasional" }, { label: "Petugas" }],
  },
  "/admin/laporan": {
    title: "Laporan",
    breadcrumbs: [{ label: "Admin" }, { label: "Sistem" }, { label: "Laporan" }],
  },
  "/admin/pengaturan": {
    title: "Pengaturan",
    breadcrumbs: [{ label: "Admin" }, { label: "Sistem" }, { label: "Pengaturan" }],
  },
};

const AdminLayout = ({ user: userProp, onLogout: onLogoutProp }: AdminLayoutProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const stored = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };
  const onLogout = onLogoutProp ?? handleLogout;

  // Kalau logout di tab lain, tab ini ikut keluar.
  // Hook harus dipanggil sebelum return bersyarat di bawah.
  useEffect(() => {
    return onAuthChange(() => {
      if (!isAuthenticated()) navigate("/login", { replace: true });
    });
  }, [navigate]);

  // Penjaga akses: harus login, dan hanya admin yang boleh di sini.
  // Petugas dan mahasiswa dialihkan ke area miliknya.
  if (!isAuthenticated() || !stored) {
    return <Navigate to="/login" replace />;
  }
  if (stored.role !== "admin") {
    return <Navigate to={homePathForRole(stored.role)} replace />;
  }

  // Pakai data dari props kalau ada, kalau tidak ambil dari penyimpanan login
  const user = userProp ?? { name: stored.name, role: ROLE_LABELS[stored.role] };

  const page = PAGES[pathname] ?? {
    title: "Admin",
    breadcrumbs: [{ label: "Admin" }],
  };

  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900">
      <AdminSidebar
        activePath={pathname}
        onNavigate={(href) => navigate(href)}
        onLogout={onLogout}
        user={user}
      />

      {/* min-w-0 mencegah tabel lebar mendorong layout keluar layar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={page.title}
          breadcrumbs={page.breadcrumbs}
          user={user}
          onAddData={() => navigate("/admin/sampah/tambah")}
          onSearch={(q) => navigate(`/admin/sampah?q=${encodeURIComponent(q)}`)}
          onSettings={() => navigate("/admin/pengaturan")}
          onLogout={onLogout}
        />

        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;