import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import type { Kategori, StatusData } from "../../lib/sampahData";
import { getSetoran, totalPoin } from "../../lib/setoranData";

const KATEGORI_STYLE: Record<Kategori, string> = {
  Organik: "bg-emerald-100 text-emerald-800",
  Anorganik: "bg-sky-100 text-sky-800",
  B3: "bg-purple-100 text-purple-800",
};

const STATUS_STYLE: Record<StatusData, string> = {
  Terverifikasi: "bg-emerald-100 text-emerald-800",
  Menunggu: "bg-amber-100 text-amber-800",
  Ditolak: "bg-red-100 text-red-800",
};

const STATUS_LIST: StatusData[] = ["Terverifikasi", "Menunggu", "Ditolak"];

const badge = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
const control =
  "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-emerald-700";

const tgl = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function RiwayatSetoran() {
  const [params] = useSearchParams();
  const list = useMemo(() => getSetoran(), []);

  // Pencarian dari kolom cari di header (?q=...) menjadi nilai awal di sini
  const [cari, setCari] = useState(params.get("q") ?? "");
  const [status, setStatus] = useState<StatusData | "Semua">("Semua");

  const q = cari.trim().toLowerCase();
  const rows = list.filter(
    (s) =>
      (status === "Semua" || s.status === status) &&
      (q === "" ||
        s.id.toLowerCase().includes(q) ||
        s.lokasi.toLowerCase().includes(q) ||
        s.kategori.toLowerCase().includes(q)),
  );

  const ringkasan = [
    { label: "Total poin", value: totalPoin(list).toLocaleString("id-ID") },
    { label: "Terverifikasi", value: list.filter((s) => s.status === "Terverifikasi").length },
    { label: "Menunggu", value: list.filter((s) => s.status === "Menunggu").length },
    { label: "Ditolak", value: list.filter((s) => s.status === "Ditolak").length },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {ringkasan.map((r) => (
          <div key={r.label} className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-500">{r.label}</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">{r.value}</p>
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
            placeholder="Cari ID, lokasi, atau kategori"
            className={`${control} w-full pl-9`}
          />
        </div>
        <select
          aria-label="Filter status"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusData | "Semua")}
          className={control}
        >
          <option value="Semua">Semua status</option>
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-stone-200 text-stone-600">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Lokasi</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 text-right font-medium">Berat</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Poin</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-stone-500">
                  Tidak ada setoran yang cocok.
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-stone-900">{s.id}</td>
                  <td className="px-4 py-3">{tgl(s.tanggal)}</td>
                  <td className="px-4 py-3">{s.lokasi}</td>
                  <td className="px-4 py-3">
                    <span className={`${badge} ${KATEGORI_STYLE[s.kategori]}`}>{s.kategori}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{s.beratKg} kg</td>
                  <td className="px-4 py-3">
                    <span className={`${badge} ${STATUS_STYLE[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {s.poin > 0 ? `+${s.poin}` : "0"}
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