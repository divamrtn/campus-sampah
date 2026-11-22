import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Recycle,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
}

interface PetugasSidebarProps {
  /** Status menu mobile. Di layar besar sidebar selalu tampil. */
  open: boolean;
  onClose: () => void;
  activePath: string;
  onNavigate: (href: string) => void;
  onLogout: () => void;
  user: { name: string; role: string };
  /** Jumlah setoran yang menunggu verifikasi (lencana di menu). */
  menunggu: number;
}

export default function PetugasSidebar({
  open,
  onClose,
  activePath,
  onNavigate,
  onLogout,
  user,
  menunggu,
}: PetugasSidebarProps) {
  const groups: Array<{ title: string; items: NavItem[] }> = [
    {
      title: "Utama",
      items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/petugas/dashboard" }],
    },
    {
      title: "Tugas",
      items: [
        {
          label: "Verifikasi setoran",
          icon: ShieldCheck,
          href: "/petugas/verifikasi",
          badge: menunggu,
        },
        { label: "Data sampah", icon: ClipboardList, href: "/petugas/data" },
      ],
    },
  ];

  const content = (
    <div className="flex h-full flex-col bg-emerald-950 text-emerald-50">
      {/* Merek */}
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-emerald-950">
          <Recycle className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-white">Pendataan Sampah</p>
          <p className="text-xs text-emerald-300">Portal petugas</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup menu"
          className="rounded-md p-1 text-emerald-300 hover:bg-emerald-900 lg:hidden"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.title} className="mt-4">
            <p className="px-3 pb-2 text-xs font-medium text-emerald-400">{group.title}</p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activePath === item.href;
                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate(item.href);
                        onClose();
                      }}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                        active
                          ? "bg-emerald-900 text-white"
                          : "text-emerald-100 hover:bg-emerald-900/60"
                      }`}
                    >
                      {active && (
                        <span className="absolute inset-y-2 left-0 w-1 rounded-r bg-lime-400" />
                      )}
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-xs font-bold text-stone-900">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Pengguna */}
      <div className="flex items-center gap-3 border-t border-emerald-900 px-4 py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-800 font-semibold text-white">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="truncate text-xs text-emerald-300">{user.role}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Keluar"
          className="rounded-md p-2 text-emerald-200 hover:bg-emerald-900"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-0 h-screen">{content}</div>
      </aside>

      {/* Mobile */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-64 shadow-xl">{content}</aside>
        </div>
      )}
    </>
  );
}