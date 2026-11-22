import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Search, SearchX, X } from "lucide-react";
import {
  KATEGORI_LIST,
  SAMPAH_DATA,
  STATUS_LIST,
  formatBerat,
  formatTanggal,
  type Kategori,
  type StatusData,
} from "../lib/sampahData";
import { KategoriBadge, StatusBadge } from "../components/SampahBadge";

const PAGE_SIZE = 8;

const selectClass =
  "h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-800 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20";

const DataSampah = () => {
  const [query, setQuery] = useState("");
  const [kategori, setKategori] = useState<Kategori | "">("");
  const [status, setStatus] = useState<StatusData | "">("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SAMPAH_DATA.filter((r) => {
      if (kategori && r.kategori !== kategori) return false;
      if (status && r.status !== status) return false;
      if (q && !`${r.id} ${r.lokasi} ${r.petugas}`.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id.localeCompare(a.id));
  }, [query, kategori, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const hasFilter = !!(query || kategori || status);

  const resetFilters = () => {
    setQuery("");
    setKategori("");
    setStatus("");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Cari ID, lokasi, atau petugas"
              aria-label="Cari data sampah"
              className="h-10 w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 text-sm placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
          </div>

          <select
            value={kategori}
            onChange={(e) => {
              setKategori(e.target.value as Kategori | "");
              setPage(1);
            }}
            aria-label="Filter kategori"
            className={selectClass}
          >
            <option value="">Semua kategori</option>
            {KATEGORI_LIST.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusData | "");
              setPage(1);
            }}
            aria-label="Filter status"
            className={selectClass}
          >
            <option value="">Semua status</option>
            {STATUS_LIST.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {hasFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm text-stone-600 hover:bg-stone-100"
            >
              <X className="h-4 w-4" /> Reset
            </button>
          )}
        </div>

        <Link
          to="/admin/sampah/tambah"
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 text-sm font-medium text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" /> Input data
        </Link>
      </div>

      {/* Tabel */}
      <div className="rounded-xl border border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
              <tr>
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Tanggal</th>
                <th className="px-5 py-3 font-medium">Lokasi</th>
                <th className="px-5 py-3 font-medium">Petugas</th>
                <th className="px-5 py-3 font-medium">Kategori</th>
                <th className="px-5 py-3 text-right font-medium">Berat</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3 font-medium text-stone-900">{r.id}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-stone-600">{formatTanggal(r.tanggal)}</td>
                  <td className="px-5 py-3 text-stone-700">{r.lokasi}</td>
                  <td className="px-5 py-3 text-stone-700">{r.petugas}</td>
                  <td className="px-5 py-3"><KategoriBadge value={r.kategori} /></td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-stone-900">{formatBerat(r.beratKg)}</td>
                  <td className="px-5 py-3"><StatusBadge value={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
            <SearchX className="h-8 w-8 text-stone-400" />
            <p className="font-medium text-stone-900">Data tidak ditemukan</p>
            <p className="text-sm text-stone-500">Coba ubah kata kunci atau filter yang dipakai.</p>
            {hasFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-1 text-sm font-medium text-emerald-800 hover:underline"
              >
                Reset filter
              </button>
            )}
          </div>
        )}

        {/* Paginasi */}
        {filtered.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-stone-200 px-5 py-3 text-sm text-stone-600 sm:flex-row">
            <p>
              Menampilkan {start + 1}-{Math.min(start + PAGE_SIZE, filtered.length)} dari{" "}
              {filtered.length} data
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Halaman sebelumnya"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Halaman berikutnya"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataSampah;