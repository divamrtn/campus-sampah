import { useMemo, useState } from "react";
import type { Kategori, StatusData } from "../../lib/sampahData";
import { getSetoran, totalPoin } from "../../lib/setoranData";
import { useFetch } from "../../lib/useFetch";

const KATEGORI: Kategori[] = ["Organik", "Anorganik", "B3"];
const STATUS: StatusData[] = ["Menunggu", "Terverifikasi", "Ditolak"];

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

const field =
  "h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20";

const tgl = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function RiwayatSetoran() {
  const { data, loading, error, reload } = useFetch(getSetoran);
  const [cari, setCari] = useState("");
  const [fStatus, setFStatus] = useState<StatusData | "">("");
  const [fKategori, setFKategori] = useState<Kategori | "">("");

  const list = data ?? [];

  // Semua hook dipanggil sebelum return bersyarat di bawah
  const tampil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return list.filter(
      (s) =>
        (!fStatus || s.status === fStatus) &&
        (!fKategori || s.kategori === fKategori) &&
        (!q || s.id.toLowerCase().includes(q) || s.lokasi.toLowerCase().includes(q)),
    );
  }, [list, cari, fStatus, fKategori]);

  if (loading && !data) {
    return <p className="text-sm text-stone-600">Memuat data...</p>;
  }
  if (error && !data) {
    return (
      <div role="alert" className="rounded-lg bg-red-50 px-3 py-3 text-sm text-red-700">
        <p>{error}</p>
        <button type="button" onClick={() => void reload()} className="mt-2 font-medium underline">
          Coba lagi
        </button>
      </div>
    );
  }

  const totalBerat = tampil.reduce((sum, s) => sum + s.beratKg, 0);

  return (
    <div className="space-y-4">
      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">Total poin</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">
            {totalPoin(list).toLocaleString("id-ID")}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">Setoran ditampilkan</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">{tampil.length}</p>
        </div>
        <div className="col-span-2 rounded-xl border border-stone-200 bg-white p-4 lg:col-span-1">
          <p className="text-sm text-stone-500">Total berat ditampilkan</p>
          <p className="mt-1 text-2xl font-semibold text-stone-900">{totalBerat.toFixed(1)} kg</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari ID atau lokasi"
          aria-label="Cari setoran"
          className={`${field} w-full max-w-xs`}
        />
        <select
          value={fStatus}
          onChange={(e) => setFStatus(e.target.value as StatusData | "")}
          aria-label="Filter status"
          className={field}
        >
          <option value="">Semua status</option>
          {STATUS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={fKategori}
          onChange={(e) => setFKategori(e.target.value as Kategori | "")}
          aria-label="Filter kategori"
          className={field}
        >
          <option value="">Semua kategori</option>
          {KATEGORI.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </div>

      {/* Tabel */}
      <section className="rounded-xl border border-stone-200 bg-white">
        {tampil.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-stone-500">
            {list.length === 0
              ? "Belum ada setoran."
              : "Tidak ada setoran yang cocok dengan filter."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-stone-200 text-xs text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Lokasi</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Berat</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Poin</th>
                </tr>
              </thead>
              <tbody>
                {tampil.map((s) => (
                  <tr key={s.id} className="border-b border-stone-100 last:border-0">
                    <td className="px-4 py-3 font-semibold text-stone-900">
                      {s.id}
                      {s.catatan && (
                        <p className="mt-0.5 text-xs font-normal text-stone-500">
                          Catatan: {s.catatan}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{tgl(s.tanggal)}</td>
                    <td className="px-4 py-3">{s.lokasi}</td>
                    <td className="px-4 py-3">
                      <span className={`${badge} ${KATEGORI_STYLE[s.kategori]}`}>
                        {s.kategori}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{s.beratKg} kg</td>
                    <td className="px-4 py-3">
                      <span className={`${badge} ${STATUS_STYLE[s.status]}`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-stone-700">+{s.poin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}