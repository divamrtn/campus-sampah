import { useState } from "react";
import { Plus, Search } from "lucide-react";

type StatusPetugas = "Aktif" | "Cuti";

interface PetugasRow {
  id: string;
  nama: string;
  telepon: string;
  area: string;
  tugasBulanIni: number;
  status: StatusPetugas;
}

/** SEMENTARA: data contoh. Ganti dengan data dari lib atau API. */
const DATA: PetugasRow[] = [
  { id: "PTG-01", nama: "Agus Prasetyo", telepon: "0812-0000-0001", area: "TPS Kenanga", tugasBulanIni: 24, status: "Aktif" },
  { id: "PTG-02", nama: "Budi Santoso", telepon: "0812-0000-0002", area: "TPS Mawar", tugasBulanIni: 21, status: "Aktif" },
  { id: "PTG-03", nama: "Siti Aminah", telepon: "0812-0000-0003", area: "Bank Sampah Melati", tugasBulanIni: 19, status: "Aktif" },
  { id: "PTG-04", nama: "Dewi Lestari", telepon: "0812-0000-0004", area: "Bank Sampah Melati", tugasBulanIni: 8, status: "Cuti" },
];

const STATUS_STYLE: Record<StatusPetugas, string> = {
  Aktif: "bg-emerald-100 text-emerald-800",
  Cuti: "bg-stone-200 text-stone-700",
};

const badge = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
const control =
  "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-emerald-700";

export default function Petugas() {
  const [cari, setCari] = useState("");
  const [status, setStatus] = useState<StatusPetugas | "Semua">("Semua");

  const q = cari.trim().toLowerCase();
  const rows = DATA.filter(
    (p) =>
      (status === "Semua" || p.status === status) &&
      (q === "" || p.nama.toLowerCase().includes(q) || p.area.toLowerCase().includes(q)),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <input
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama atau area tugas"
            className={`${control} w-full pl-9`}
          />
        </div>
        <select
          aria-label="Filter status"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusPetugas | "Semua")}
          className={control}
        >
          <option value="Semua">Semua status</option>
          <option value="Aktif">Aktif</option>
          <option value="Cuti">Cuti</option>
        </select>
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah petugas
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b border-stone-200 text-stone-600">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Telepon</th>
              <th className="px-4 py-3 font-medium">Area tugas</th>
              <th className="px-4 py-3 text-right font-medium">Tugas bulan ini</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-stone-500">Tidak ada petugas yang cocok.</td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-stone-900">{p.id}</td>
                  <td className="px-4 py-3">{p.nama}</td>
                  <td className="px-4 py-3">{p.telepon}</td>
                  <td className="px-4 py-3">{p.area}</td>
                  <td className="px-4 py-3 text-right">{p.tugasBulanIni}</td>
                  <td className="px-4 py-3">
                    <span className={`${badge} ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}