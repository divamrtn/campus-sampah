import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import PetugasSidebar from "../../components/PetugasSidebar";
import PetugasHeader, { type Breadcrumb } from "../../components/PetugasHeader";
import {
  ROLE_LABELS,
  clearAuth,
  getUser,
  homePathForRole,
  isAuthenticated,
  onAuthChange,
} from "../../lib/session";
import { getDataSampah } from "../../lib/dataSampahStore";
import { useFetch } from "../../lib/useFetch";

/** Judul dan breadcrumb per route. Tambahkan saat membuat halaman baru. */
const PAGES: Record<string, { title: string; breadcrumbs: Breadcrumb[] }> = {
  "/petugas/dashboard": {
    title: "Dashboard",
    breadcrumbs: [{ label: "Petugas" }, { label: "Dashboard" }],
  },
  "/petugas/verifikasi": {
    title: "Verifikasi setoran",
    breadcrumbs: [{ label: "Petugas" }, { label: "Tugas" }, { label: "Verifikasi setoran" }],
  },
  "/petugas/data": {
    title: "Data sampah",
    breadcrumbs: [{ label: "Petugas" }, { label: "Tugas" }, { label: "Data sampah" }],
  },
};

const PetugasLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const stored = getUser();
  const isPetugas = isAuthenticated() && stored?.role === "petugas";

  // Data untuk lencana "Menunggu". Hook harus dipanggil sebelum return bersyarat.
  // Hanya dimuat kalau yang login memang petugas, supaya tidak memicu 403.
  const { data, reload } = useFetch(async () => (isPetugas ? await getDataSampah() : []));
  const menunggu = (data ?? []).filter((d) => d.status === "Menunggu").length;

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  // Kalau logout di tab lain, tab ini ikut keluar.
  useEffect(() => {
    return onAuthChange(() => {
      if (!isAuthenticated()) navigate("/login", { replace: true });
    });
  }, [navigate]);

  // Tutup menu mobile saat pindah halaman
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Penjaga akses: harus login dan berperan petugas
  if (!isAuthenticated() || !stored) {
    return <Navigate to="/login" replace />;
  }
  if (stored.role !== "petugas") {
    return <Navigate to={homePathForRole(stored.role)} replace />;
  }

  const user = { name: stored.name, role: ROLE_LABELS[stored.role] };

  const page = PAGES[pathname] ?? {
    title: "Petugas",
    breadcrumbs: [{ label: "Petugas" }],
  };

  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900">
      <PetugasSidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activePath={pathname}
        onNavigate={(href) => navigate(href)}
        onLogout={handleLogout}
        user={user}
        menunggu={menunggu}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <PetugasHeader
          title={page.title}
          breadcrumbs={page.breadcrumbs}
          user={user}
          menunggu={menunggu}
          onMenu={() => setMenuOpen(true)}
          onBell={() => navigate("/petugas/verifikasi")}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet context={{ refresh: () => void reload() }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PetugasLayout;