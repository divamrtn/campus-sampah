import { useState } from "react";
import { Search } from "lucide-react";
import type { Kategori, StatusData } from "../../lib/sampahData";
import { getDataSampah } from "../../lib/dataSampahStore";

const KATEGORI_LIST: Kategori[] = ["Organik", "Anorganik", "B3"];
const STATUS_LIST: StatusData[] = ["Terverifikasi", "Menunggu", "Ditolak"];

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

const badge = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
const control =
  "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-emerald-700";

const tgl = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function DataSampahPetugas() {
  const [data] = useState(() => getDataSampah());
  const [cari, setCari] = useState("");
  const [kategori, setKategori] = useState<Kategori | "Semua">("Semua");
  const [status, setStatus] = useState<StatusData | "Semua">("Semua");

  const q = cari.trim().toLowerCase();
  const rows = data.filter(
    (d) =>
      (kategori === "Semua" || d.kategori === kategori) &&
      (status === "Semua" || d.status === status) &&
      (q === "" ||
        d.id.toLowerCase().includes(q) ||
        d.lokasi.toLowerCase().includes(q) ||
        d.petugas.toLowerCase().includes(q)),
  );

  return (
    <div className="space-y-4">
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
            placeholder="Cari ID, lokasi, atau petugas"
            className={`${control} w-full pl-9`}
          />
        </div>
        <select
          aria-label="Filter kategori"
          value={kategori}
          onChange={(e) => setKategori(e.target.value as Kategori | "Semua")}
          className={control}
        >
          <option value="Semua">Semua kategori</option>
          {KATEGORI_LIST.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
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
              <th className="px-4 py-3 font-medium">Petugas</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 text-right font-medium">Berat</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-stone-500">
                  Tidak ada data yang cocok.
                </td>
              </tr>
            ) : (
              rows.map((d) => (
                <tr key={d.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-stone-900">{d.id}</td>
                  <td className="px-4 py-3">{tgl(d.tanggal)}</td>
                  <td className="px-4 py-3">{d.lokasi}</td>
                  <td className="px-4 py-3">{d.petugas}</td>
                  <td className="px-4 py-3">
                    <span className={`${badge} ${KATEGORI_STYLE[d.kategori]}`}>{d.kategori}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {d.beratKg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg
                  </td>
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