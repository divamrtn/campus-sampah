"use client"; // diperlukan jika memakai Next.js App Router, aman diabaikan di Vite/CRA

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  LogOut,
  Plus,
  Search,
  Settings,
  Truck,
  TriangleAlert,
  UserRound,
  type LucideIcon,
} from "lucide-react";

/* ---------------------------------- Types --------------------------------- */

interface Breadcrumb {
  label: string;
  href?: string;
}

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  icon: LucideIcon;
}

interface HeaderProps {
  title?: string;
  breadcrumbs?: Breadcrumb[];
  user?: { name: string; role: string };
  notifications?: NotificationItem[];
  onSearch?: (query: string) => void;
  onAddData?: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

/* ------------------------------ Sample content ----------------------------- */

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: "3 data menunggu verifikasi",
    description: "Setoran dari Bank Sampah Melati belum diperiksa.",
    time: "10 menit lalu",
    unread: true,
    icon: ClipboardList,
  },
  {
    id: 2,
    title: "Pengangkutan TPS Cempaka terlambat",
    description: "Armada B 9021 TX belum tiba sesuai jadwal.",
    time: "1 jam lalu",
    unread: true,
    icon: Truck,
  },
  {
    id: 3,
    title: "Kapasitas TPS Kenanga hampir penuh",
    description: "Terisi 92%. Jadwalkan pengangkutan tambahan.",
    time: "Kemarin",
    unread: false,
    icon: TriangleAlert,
  },
];

/* --------------------------------- Helpers -------------------------------- */

/** Menutup dropdown saat klik di luar area atau menekan Escape. */
function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void
) {
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, ref]);
}

/* -------------------------------- Component ------------------------------- */

const Header = ({
  title = "Dashboard",
  breadcrumbs = [{ label: "Admin" }, { label: "Dashboard" }],
  user = { name: "Admin", role: "Administrator" },
  notifications = DEFAULT_NOTIFICATIONS,
  onSearch,
  onAddData,
  onProfile,
  onSettings,
  onLogout,
}: HeaderProps) => {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(notifications);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useDismiss(notifRef, notifOpen, () => setNotifOpen(false));
  useDismiss(profileRef, profileOpen, () => setProfileOpen(false));

  const unreadCount = items.filter((n) => n.unread).length;

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-stone-200 bg-white pl-16 pr-4 lg:px-6">
      {/* Kiri: judul dan breadcrumb
          pl-16 di mobile memberi ruang untuk tombol hamburger sidebar */}
      <div className="min-w-0">
        <nav aria-label="Breadcrumb" className="hidden sm:block">
          <ol className="flex items-center gap-1 text-xs text-stone-500">
            {breadcrumbs.map((crumb, i) => {
              const last = i === breadcrumbs.length - 1;
              return (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                  {crumb.href && !last ? (
                    <a href={crumb.href} className="hover:text-emerald-800">
                      {crumb.label}
                    </a>
                  ) : (
                    <span aria-current={last ? "page" : undefined}>{crumb.label}</span>
                  )}
                  {!last && <ChevronRight className="h-3 w-3" />}
                </li>
              );
            })}
          </ol>
        </nav>
        <h1 className="truncate text-lg font-semibold leading-tight text-stone-900">
          {title}
        </h1>
      </div>

      {/* Kanan: pencarian, aksi cepat, notifikasi, profil */}
      <div className="flex items-center gap-2 sm:gap-3">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch?.(query.trim());
          }}
          className="relative hidden md:block"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari data sampah, TPS, petugas"
            aria-label="Cari"
            className="h-10 w-64 rounded-lg border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 lg:w-80"
          />
        </form>

        <button
          type="button"
          onClick={onAddData}
          className={`flex h-10 items-center gap-2 rounded-lg bg-emerald-900 px-3 text-sm font-medium text-white transition-colors hover:bg-emerald-800 sm:px-4 ${focusRing}`}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Input data</span>
          <span className="sr-only sm:hidden">Input data</span>
        </button>

        {/* Notifikasi */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((o) => !o);
              setProfileOpen(false);
            }}
            aria-label={`Notifikasi, ${unreadCount} belum dibaca`}
            aria-haspopup="true"
            aria-expanded={notifOpen}
            className={`relative flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 transition-colors hover:bg-stone-100 ${focusRing}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-semibold text-emerald-950">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                <p className="text-sm font-semibold text-stone-900">Notifikasi</p>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs font-medium text-emerald-800 hover:underline"
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-stone-500">
                  Belum ada notifikasi.
                </p>
              ) : (
                <ul className="max-h-80 divide-y divide-stone-100 overflow-y-auto">
                  {items.map((n) => {
                    const Icon = n.icon;
                    return (
                      <li
                        key={n.id}
                        className={`flex gap-3 px-4 py-3 ${n.unread ? "bg-emerald-50/60" : ""}`}
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-900">{n.title}</p>
                          <p className="text-sm text-stone-600">{n.description}</p>
                          <p className="mt-0.5 text-xs text-stone-400">{n.time}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Profil */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
            }}
            aria-haspopup="true"
            aria-expanded={profileOpen}
            className={`flex h-10 items-center gap-2 rounded-lg pl-1 pr-2 transition-colors hover:bg-stone-100 ${focusRing}`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900 text-sm font-semibold text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="hidden text-left leading-tight lg:block">
              <span className="block text-sm font-medium text-stone-900">{user.name}</span>
              <span className="block text-xs text-stone-500">{user.role}</span>
            </span>
            <ChevronDown
              className={`hidden h-4 w-4 text-stone-400 transition-transform sm:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
              <div className="border-b border-stone-100 px-4 py-3">
                <p className="truncate text-sm font-medium text-stone-900">{user.name}</p>
                <p className="truncate text-xs text-stone-500">{user.role}</p>
              </div>
              <ul className="p-1.5 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onProfile?.();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-stone-700 hover:bg-stone-100"
                  >
                    <UserRound className="h-4 w-4 text-stone-500" />
                    Profil saya
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onSettings?.();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-stone-700 hover:bg-stone-100"
                  >
                    <Settings className="h-4 w-4 text-stone-500" />
                    Pengaturan
                  </button>
                </li>
              </ul>
              <div className="border-t border-stone-100 p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout?.();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;