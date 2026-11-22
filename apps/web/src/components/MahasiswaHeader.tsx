import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, ChevronRight, LogOut, Menu, PackagePlus, type LucideIcon } from "lucide-react";

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface NotifItem {
  id: number;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  icon: LucideIcon;
}

interface MahasiswaHeaderProps {
  title: string;
  breadcrumbs: Breadcrumb[];
  user: { name: string; role: string };
  notifications: NotifItem[];
  onMenu: () => void;
  onSetor: () => void;
  onLogout: () => void;
}

export default function MahasiswaHeader({
  title,
  breadcrumbs,
  user,
  notifications,
  onMenu,
  onSetor,
  onLogout,
}: MahasiswaHeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [read, setRead] = useState<number[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar atau menekan Esc
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
        setUserOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const unread = notifications.filter((n) => n.unread && !read.includes(n.id)).length;

  return (
    <header className="flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-3 lg:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Buka menu"
        className="rounded-md border border-stone-300 p-2 text-stone-700 hover:bg-stone-100 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-stone-500">
          {breadcrumbs.map((b, i) => (
            <span key={`${b.label}-${i}`} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
              {b.label}
            </span>
          ))}
        </nav>
        <h1 className="truncate text-xl font-semibold text-stone-900">{title}</h1>
      </div>

      <button
        type="button"
        onClick={onSetor}
        className="hidden items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 sm:inline-flex"
      >
        <PackagePlus className="h-4 w-4" aria-hidden="true" />
        Setor sampah
      </button>

      <div ref={wrapRef} className="flex items-center gap-2">
        {/* Notifikasi */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v);
              setUserOpen(false);
            }}
            aria-label="Notifikasi"
            aria-expanded={notifOpen}
            className="relative rounded-lg p-2.5 text-stone-700 hover:bg-stone-100"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-stone-900">
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-stone-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
                <p className="font-semibold text-stone-900">Notifikasi</p>
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={() => setRead(notifications.map((n) => n.id))}
                    className="text-xs text-emerald-700 hover:underline"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  const isUnread = n.unread && !read.includes(n.id);
                  return (
                    <li
                      key={n.id}
                      className={`flex gap-3 border-b border-stone-100 px-4 py-3 last:border-0 ${
                        isUnread ? "bg-emerald-50" : ""
                      }`}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-900">{n.title}</p>
                        <p className="text-xs text-stone-600">{n.description}</p>
                        <p className="mt-1 text-[11px] text-stone-400">{n.time}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Menu pengguna */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setUserOpen((v) => !v);
              setNotifOpen(false);
            }}
            aria-expanded={userOpen}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-stone-100"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900 font-semibold text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-stone-900">
                {user.name}
              </span>
              <span className="block text-xs text-stone-500">{user.role}</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-stone-500 sm:block" aria-hidden="true" />
          </button>

          {userOpen && (
            <div className="absolute right-0 z-30 mt-2 w-48 rounded-xl border border-stone-200 bg-white p-1 shadow-lg">
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}