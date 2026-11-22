import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import type { Kategori, StatusData } from "../../lib/sampahData";
import { getDataSampah, updateStatusSampah } from "../../lib/dataSampahStore";

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

function formatTanggal(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBerat(kg: number): string {
  return `${kg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`;
}

interface DataSampahProps {
  /** Filter awal dari route, misalnya /admin/kategori/organik. */
  kategori?: Kategori;
  status?: StatusData;
}

export default function DataSampah({ kategori: kategoriAwal, status: statusAwal }: DataSampahProps) {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [data, setData] = useState(() => getDataSampah());
  const [cari, setCari] = useState(params.get("q") ?? "");
  const [kategori, setKategori] = useState<Kategori | "Semua">(kategoriAwal ?? "Semua");
  const [status, setStatus] = useState<StatusData | "Semua">(statusAwal ?? "Semua");

  const q = cari.trim().toLowerCase();

  const rows = data.filter(
    (r) =>
      (kategori === "Semua" || r.kategori === kategori) &&
      (status === "Semua" || r.status === status) &&
      (q === "" ||
        r.id.toLowerCase().includes(q) ||
        r.lokasi.toLowerCase().includes(q) ||
        r.petugas.toLowerCase().includes(q)),
  );

  const ubahStatus = (id: string, baru: StatusData) => {
    updateStatusSampah(id, baru);
    setData(getDataSampah());
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
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
            <option key={k} value={k}>{k}</option>
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
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => navigate("/admin/sampah/tambah")}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Input data
        </button>
      </div>

      {/* Tabel. overflow-x-auto agar tabel lebar tidak mendorong layout */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-stone-200 text-stone-600">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Lokasi</th>
              <th className="px-4 py-3 font-medium">Petugas</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 text-right font-medium">Berat</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-stone-500">
                  Tidak ada data yang cocok.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-stone-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-stone-900">{r.id}</td>
                  <td className="px-4 py-3">{formatTanggal(r.tanggal)}</td>
                  <td className="px-4 py-3">{r.lokasi}</td>
                  <td className="px-4 py-3">{r.petugas}</td>
                  <td className="px-4 py-3">
                    <span className={`${badge} ${KATEGORI_STYLE[r.kategori]}`}>{r.kategori}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{formatBerat(r.beratKg)}</td>
                  <td className="px-4 py-3">
                    <span className={`${badge} ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "Menunggu" && (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => ubahStatus(r.id, "Terverifikasi")}
                          className="rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-800"
                        >
                          Setujui
                        </button>
                        <button
                          type="button"
                          onClick={() => ubahStatus(r.id, "Ditolak")}
                          className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
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