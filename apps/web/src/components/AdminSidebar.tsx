"use client"; // diperlukan jika memakai Next.js App Router, aman diabaikan di Vite/CRA

import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Trash2,
  Recycle,
  Landmark,
  MapPin,
  Truck,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

/* ---------------------------------- Types --------------------------------- */

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  badge?: number;
  children?: NavChild[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  /** Path aktif. Jika diisi, sidebar mengikuti nilai ini (mis. dari usePathname). */
  activePath?: string;
  /** Dipanggil saat menu diklik. Cocok untuk router.push(href). */
  onNavigate?: (href: string) => void;
  onLogout?: () => void;
  user?: { name: string; role: string };
}

/* ------------------------------- Menu config ------------------------------ */

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Utama",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    ],
  },
  {
    title: "Pendataan",
    items: [
      {
        label: "Data sampah",
        icon: ClipboardList,
        children: [
          { label: "Semua data", href: "/admin/sampah" },
          { label: "Input data baru", href: "/admin/sampah/tambah" },
          { label: "Menunggu verifikasi", href: "/admin/sampah/verifikasi" },
        ],
      },
      {
        label: "Kategori sampah",
        icon: Trash2,
        children: [
          { label: "Organik", href: "/admin/kategori/organik" },
          { label: "Anorganik", href: "/admin/kategori/anorganik" },
          { label: "B3", href: "/admin/kategori/b3" },
        ],
      },
      { label: "Bank sampah", icon: Landmark, href: "/admin/bank-sampah" },
      { label: "Lokasi TPS", icon: MapPin, href: "/admin/tps" },
    ],
  },
  {
    title: "Operasional",
    items: [
      { label: "Pengangkutan", icon: Truck, href: "/admin/pengangkutan", badge: 3 },
      { label: "Jadwal", icon: CalendarDays, href: "/admin/jadwal" },
      { label: "Daur ulang", icon: Recycle, href: "/admin/daur-ulang" },
      { label: "Petugas", icon: Users, href: "/admin/petugas" },
    ],
  },
  {
    title: "Sistem",
    items: [
      { label: "Laporan", icon: BarChart3, href: "/admin/laporan" },
      { label: "Pengaturan", icon: Settings, href: "/admin/pengaturan" },
    ],
  },
];

/* -------------------------------- Component ------------------------------- */

const AdminSidebar = ({
  activePath,
  onNavigate,
  onLogout,
  user = { name: "Admin", role: "Administrator" },
}: AdminSidebarProps) => {
  const [internalPath, setInternalPath] = useState("/admin/dashboard");
  const currentPath = activePath ?? internalPath;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Submenu yang berisi halaman aktif dibuka secara otomatis
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_GROUPS.forEach((group) =>
      group.items.forEach((item) => {
        if (item.children?.some((c) => c.href === currentPath)) {
          initial[item.label] = true;
        }
      })
    );
    return initial;
  });

  const isChildActive = (item: NavItem) =>
    !!item.children?.some((c) => c.href === currentPath);

  const handleNavigate = (href: string) => {
    setInternalPath(href);
    onNavigate?.(href);
    setMobileOpen(false);
  };

  const toggleMenu = (label: string) => {
    // Saat sidebar diciutkan, buka dulu sidebar agar submenu terlihat
    if (collapsed) {
      setCollapsed(false);
      setOpenMenus((prev) => ({ ...prev, [label]: true }));
      return;
    }
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Di mobile sidebar selalu tampil penuh
  const compact = collapsed;

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950";

  return (
    <>
      {/* Tombol buka menu (mobile) */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Buka menu navigasi"
        className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950 text-white shadow-lg lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay (mobile) */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Navigasi admin"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-emerald-950 text-emerald-100/75 transition-all duration-200 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${
          compact ? "lg:w-[4.5rem]" : "lg:w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-emerald-900 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lime-300 text-emerald-950">
              <Recycle className="h-5 w-5" />
            </div>
            {!compact && (
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-semibold text-white">
                  Pendataan Sampah
                </p>
                <p className="truncate text-xs text-emerald-200/60">Panel admin</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu navigasi"
            className={`rounded-md p-1.5 text-emerald-200/70 hover:bg-emerald-900 hover:text-white lg:hidden ${focusRing}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              {!compact ? (
                <p className="mb-1.5 px-3 text-xs font-medium text-emerald-200/45">
                  {group.title}
                </p>
              ) : (
                <div className="mx-3 mb-2 hidden h-px bg-emerald-900 lg:block" />
              )}

              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = !!item.children;
                  const active = item.href
                    ? item.href === currentPath
                    : isChildActive(item);
                  const open = !!openMenus[item.label];

                  const rowClass = `group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${focusRing} ${
                    active
                      ? "bg-emerald-800/70 font-medium text-white"
                      : "hover:bg-emerald-900 hover:text-white"
                  } ${compact ? "lg:justify-center" : ""}`;

                  const content = (
                    <>
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-lime-300" />
                      )}
                      <Icon
                        className={`h-[18px] w-[18px] shrink-0 ${
                          active ? "text-lime-300" : ""
                        }`}
                      />
                      <span className={`flex-1 truncate text-left ${compact ? "lg:hidden" : ""}`}>
                        {item.label}
                      </span>

                      {item.badge !== undefined && (
                        <span
                          className={`rounded-full bg-amber-400 px-1.5 text-xs font-semibold text-emerald-950 ${
                            compact ? "lg:absolute lg:right-1.5 lg:top-1.5 lg:h-2 lg:w-2 lg:p-0 lg:text-[0px]" : ""
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {hasChildren && (
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            open ? "rotate-180" : ""
                          } ${compact ? "lg:hidden" : ""}`}
                        />
                      )}
                    </>
                  );

                  return (
                    <li key={item.label}>
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleMenu(item.label)}
                          aria-expanded={open}
                          title={compact ? item.label : undefined}
                          className={rowClass}
                        >
                          {content}
                        </button>
                      ) : (
                        <a
                          href={item.href}
                          onClick={() => handleNavigate(item.href!)}
                          aria-current={active ? "page" : undefined}
                          title={compact ? item.label : undefined}
                          className={rowClass}
                        >
                          {content}
                        </a>
                      )}

                      {/* Submenu */}
                      {hasChildren && open && !compact && (
                        <ul className="ml-[1.35rem] mt-0.5 space-y-0.5 border-l border-emerald-800 pl-3">
                          {item.children!.map((child) => {
                            const childActive = child.href === currentPath;
                            return (
                              <li key={child.href}>
                                <a
                                  href={child.href}
                                  onClick={() => handleNavigate(child.href)}
                                  aria-current={childActive ? "page" : undefined}
                                  className={`block rounded-md px-3 py-2 text-sm transition-colors ${focusRing} ${
                                    childActive
                                      ? "font-medium text-lime-300"
                                      : "hover:text-white"
                                  }`}
                                >
                                  {child.label}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer: profil, keluar, ciutkan */}
        <div className="shrink-0 border-t border-emerald-900 p-3">
          <div
            className={`flex items-center gap-3 rounded-lg p-2 ${
              compact ? "lg:justify-center" : ""
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-sm font-semibold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={`min-w-0 flex-1 leading-tight ${compact ? "lg:hidden" : ""}`}>
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-emerald-200/60">{user.role}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Keluar"
              title="Keluar"
              className={`rounded-md p-2 text-emerald-200/70 hover:bg-emerald-900 hover:text-white ${focusRing} ${
                compact ? "lg:hidden" : ""
              }`}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={compact ? "Perluas sidebar" : "Ciutkan sidebar"}
            className={`mt-2 hidden w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-emerald-200/70 hover:bg-emerald-900 hover:text-white lg:flex ${focusRing}`}
          >
            {compact ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4" />
                Ciutkan
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;