import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CircleCheck, TriangleAlert } from "lucide-react";
import MahasiswaSidebar from "../../components/MahasiswaSidebar";
import MahasiswaHeader, {
  type Breadcrumb,
  type NotifItem,
} from "../../components/MahasiswaHeader";
import {
  ROLE_LABELS,
  clearAuth,
  getUser,
  homePathForRole,
  isAuthenticated,
  onAuthChange,
} from "../../lib/session";
import { clearSetoran } from "../../lib/setoranData";

/** Judul dan breadcrumb per route. Tambahkan saat membuat halaman baru. */
const PAGES: Record<string, { title: string; breadcrumbs: Breadcrumb[] }> = {
  "/mahasiswa/dashboard": {
    title: "Dashboard",
    breadcrumbs: [{ label: "Mahasiswa" }, { label: "Dashboard" }],
  },
  "/mahasiswa/setor": {
    title: "Setor sampah",
    breadcrumbs: [{ label: "Mahasiswa" }, { label: "Setoran" }, { label: "Setor sampah" }],
  },
  "/mahasiswa/riwayat": {
    title: "Riwayat setoran",
    breadcrumbs: [{ label: "Mahasiswa" }, { label: "Setoran" }, { label: "Riwayat setoran" }],
  },
};

const NOTIFICATIONS: NotifItem[] = [
  {
    id: 1,
    title: "Poin masuk setelah verifikasi",
    description: "Setoran yang disetujui petugas akan menambah poin kamu.",
    time: "Info",
    unread: true,
    icon: CircleCheck,
  },
  {
    id: 2,
    title: "Pilah sampah sebelum disetor",
    description: "Pisahkan organik, anorganik, dan B3 agar setoran cepat diverifikasi.",
    time: "Tips",
    unread: false,
    icon: TriangleAlert,
  },
];

const MahasiswaLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const stored = getUser();

  const handleLogout = () => {
    clearSetoran();
    clearAuth();
    navigate("/login", { replace: true });
  };

  // Kalau logout di tab lain, tab ini ikut keluar.
  // Hook harus dipanggil sebelum return bersyarat di bawah.
  useEffect(() => {
    return onAuthChange(() => {
      if (!isAuthenticated()) navigate("/login", { replace: true });
    });
  }, [navigate]);

  // Tutup menu mobile saat pindah halaman
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Penjaga akses: harus login dan berperan mahasiswa
  if (!isAuthenticated() || !stored) {
    return <Navigate to="/login" replace />;
  }
  if (stored.role !== "mahasiswa") {
    return <Navigate to={homePathForRole(stored.role)} replace />;
  }

  const user = { name: stored.name, role: ROLE_LABELS[stored.role] };

  const page = PAGES[pathname] ?? {
    title: "Mahasiswa",
    breadcrumbs: [{ label: "Mahasiswa" }],
  };

  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900">
      <MahasiswaSidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activePath={pathname}
        onNavigate={(href) => navigate(href)}
        onLogout={handleLogout}
        user={user}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <MahasiswaHeader
          title={page.title}
          breadcrumbs={page.breadcrumbs}
          user={user}
          notifications={NOTIFICATIONS}
          onMenu={() => setMenuOpen(true)}
          onSetor={() => navigate("/mahasiswa/setor")}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MahasiswaLayout;