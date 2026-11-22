import { Trash2, Leaf, Recycle, AlertTriangle } from "lucide-react";

const stats = [
  { label: "Total sampah hari ini", value: "1.240 kg", icon: Trash2 },
  { label: "Organik", value: "720 kg", icon: Leaf },
  { label: "Anorganik", value: "490 kg", icon: Recycle },
  { label: "B3", value: "30 kg", icon: AlertTriangle },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-stone-900">{value}</p>
            <p className="text-sm text-stone-600">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="font-semibold text-stone-900">Setoran terbaru</h2>
        {/* tabel atau daftar data di sini */}
      </div>
    </div>
  );
};

export default Dashboard;