import { useState } from "react";
import { Search } from "lucide-react";

type StatusAngkut = "Dijadwalkan" | "Dalam perjalanan" | "Selesai";

interface Angkut {
  id: string;
  tanggal: string; // YYYY-MM-DD
  asal: string;
  tujuan: string;
  petugas: string;
  armada: string;
  muatanKg: number;
  status: StatusAngkut;
}

/** SEMENTARA: data contoh. Ganti dengan data dari lib atau API. */
const DATA: Angkut[] = [
  { id: "ANG-204", tanggal: "2026-11-12", asal: "TPS Kenanga", tujuan: "TPA Regional", petugas: "Agus Prasetyo", armada: "Truk 01", muatanKg: 820, status: "Dalam perjalanan" },
  { id: "ANG-205", tanggal: "2026-11-12", asal: "TPS Mawar", tujuan: "TPA Regional", petugas: "Budi Santoso", armada: "Truk 02", muatanKg: 640, status: "Dijadwalkan" },
  { id: "ANG-206", tanggal: "2026-11-13", asal: "Bank Sampah Melati", tujuan: "Pusat Daur Ulang", petugas: "Siti Aminah", armada: "Pickup 01", muatanKg: 310, status: "Dijadwalkan" },
  { id: "ANG-203", tanggal: "2026-11-11", asal: "TPS Kenanga", tujuan: "TPA Regional", petugas: "Agus Prasetyo", armada: "Truk 01", muatanKg: 905, status: "Selesai" },
  { id: "ANG-202", tanggal: "2026-11-10", asal: "TPS Mawar", tujuan: "TPA Regional", petugas: "Budi Santoso", armada: "Truk 02", muatanKg: 770, status: "Selesai" },
  { id: "ANG-201", tanggal: "2026-11-09", asal: "Bank Sampah Melati", tujuan: "Pusat Daur Ulang", petugas: "Dewi Lestari", armada: "Pickup 01", muatanKg: 280, status: "Selesai" },
];

const STATUS_LIST: StatusAngkut[] = ["Dijadwalkan", "Dalam perjalanan", "Selesai"];

const STATUS_STYLE: Record<StatusAngkut, string> = {
  Dijadwalkan: "bg-amber-100 text-amber-800",
  "Dalam perjalanan": "bg-sky-100 text-sky-800",
  Selesai: "bg-emerald-100 text-emerald-800",
};

const badge = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
const control =
  "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-emerald-700";

const tgl = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export default function Pengangkutan() {
  const [cari, setCari] = useState("");
  const [status, setStatus] = useState<StatusAngkut | "Semua">("Semua");

  const q = cari.trim().toLowerCase();
  const rows = DATA.filter(
    (d) =>
      (status === "Semua" || d.status === status) &&
      (q === "" ||
        d.id.toLowerCase().includes(q) ||
        d.asal.toLowerCase().includes(q) ||
        d.petugas.toLowerCase().includes(q)),
  );

  const stats = [
    { label: "Total pengangkutan", value: DATA.length.toString() },
    { label: "Belum selesai", value: DATA.filter((d) => d.status !== "Selesai").length.toString() },
    {
      label: "Total muatan",
      value: `${DATA.reduce((s, d) => s + d.muatanKg, 0).toLocaleString("id-ID")} kg`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <input
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari ID, asal, atau petugas"
            className={`${control} w-full pl-9`}
          />
        </div>
        <select
          aria-label="Filter status"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusAngkut | "Semua")}
          className={control}
        >
          <option value="Semua">Semua status</option>
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-stone-200 text-stone-600">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Rute</th>
              <th className="px-4 py-3 font-medium">Petugas</th>
              <th className="px-4 py-3 font-medium">Armada</th>
              <th className="px-4 py-3 text-right font-medium">Muatan</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-stone-500">Tidak ada data yang cocok.</td>
              </tr>
            ) : (
              rows.map((d) => (
                <tr key={d.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-stone-900">{d.id}</td>
                  <td className="px-4 py-3">{tgl(d.tanggal)}</td>
                  <td className="px-4 py-3">{d.asal} → {d.tujuan}</td>
                  <td className="px-4 py-3">{d.petugas}</td>
                  <td className="px-4 py-3">{d.armada}</td>
                  <td className="px-4 py-3 text-right">{d.muatanKg.toLocaleString("id-ID")} kg</td>
                  <td className="px-4 py-3">
                    <span className={`${badge} ${STATUS_STYLE[d.status]}`}>{d.status}</span>
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