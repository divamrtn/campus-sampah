import { useState } from "react";
import { Plus, Search } from "lucide-react";

type StatusBank = "Aktif" | "Penuh" | "Nonaktif";

interface Bank {
  id: string;
  nama: string;
  lokasi: string;
  pengelola: string;
  kapasitasKg: number;
  terisiKg: number;
  status: StatusBank;
}

/** SEMENTARA: data contoh. Ganti dengan data dari lib atau API. */
const BANKS: Bank[] = [
  { id: "BS-01", nama: "Bank Sampah Melati", lokasi: "Area Asrama", pengelola: "Siti Aminah", kapasitasKg: 1000, terisiKg: 640, status: "Aktif" },
  { id: "BS-02", nama: "Bank Sampah Anggrek", lokasi: "Dekat Gedung A", pengelola: "Dewi Lestari", kapasitasKg: 800, terisiKg: 800, status: "Penuh" },
  { id: "BS-03", nama: "Bank Sampah Dahlia", lokasi: "Area Kantin", pengelola: "Budi Santoso", kapasitasKg: 600, terisiKg: 120, status: "Aktif" },
  { id: "BS-04", nama: "Bank Sampah Teratai", lokasi: "Belakang Perpustakaan", pengelola: "Agus Prasetyo", kapasitasKg: 500, terisiKg: 0, status: "Nonaktif" },
];

const STATUS_LIST: StatusBank[] = ["Aktif", "Penuh", "Nonaktif"];

const STATUS_STYLE: Record<StatusBank, string> = {
  Aktif: "bg-emerald-100 text-emerald-800",
  Penuh: "bg-amber-100 text-amber-800",
  Nonaktif: "bg-stone-200 text-stone-700",
};

const badge = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
const control =
  "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-emerald-700";

const fmt = (n: number) => n.toLocaleString("id-ID");

export default function BankSampah() {
  const [cari, setCari] = useState("");
  const [status, setStatus] = useState<StatusBank | "Semua">("Semua");

  const q = cari.trim().toLowerCase();
  const rows = BANKS.filter(
    (b) =>
      (status === "Semua" || b.status === status) &&
      (q === "" ||
        b.nama.toLowerCase().includes(q) ||
        b.lokasi.toLowerCase().includes(q) ||
        b.pengelola.toLowerCase().includes(q)),
  );

  const totalKapasitas = BANKS.reduce((s, b) => s + b.kapasitasKg, 0);
  const totalTerisi = BANKS.reduce((s, b) => s + b.terisiKg, 0);
  const stats = [
    { label: "Total unit", value: BANKS.length.toString() },
    { label: "Unit aktif", value: BANKS.filter((b) => b.status === "Aktif").length.toString() },
    { label: "Terisi", value: `${fmt(totalTerisi)} kg` },
    { label: "Kapasitas total", value: `${fmt(totalKapasitas)} kg` },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama, lokasi, atau pengelola"
            className={`${control} w-full pl-9`}
          />
        </div>

        <select
          aria-label="Filter status"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusBank | "Semua")}
          className={control}
        >
          <option value="Semua">Semua status</option>
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah bank sampah
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-stone-200 text-stone-600">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Lokasi</th>
              <th className="px-4 py-3 font-medium">Pengelola</th>
              <th className="px-4 py-3 font-medium">Kapasitas</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-stone-500">
                  Tidak ada bank sampah yang cocok.
                </td>
              </tr>
            ) : (
              rows.map((b) => {
                const persen = Math.min(100, Math.round((b.terisiKg / b.kapasitasKg) * 100));
                return (
                  <tr key={b.id} className="border-b border-stone-100 last:border-0">
                    <td className="px-4 py-3 font-semibold text-stone-900">{b.id}</td>
                    <td className="px-4 py-3">{b.nama}</td>
                    <td className="px-4 py-3">{b.lokasi}</td>
                    <td className="px-4 py-3">{b.pengelola}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-stone-200">
                          <div
                            className={`h-full ${persen >= 100 ? "bg-amber-500" : "bg-emerald-600"}`}
                            style={{ width: `${persen}%` }}
                          />
                        </div>
                        <span className="text-xs text-stone-600">
                          {fmt(b.terisiKg)}/{fmt(b.kapasitasKg)} kg
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${badge} ${STATUS_STYLE[b.status]}`}>{b.status}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}