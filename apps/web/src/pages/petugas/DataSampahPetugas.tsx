import { useMemo, useState, type FormEvent } from "react";
import { useOutletContext } from "react-router-dom";
import { LOKASI_LIST, addDataSampah, getDataSampah } from "../../lib/dataSampahStore";
import {
  KATEGORI_LIST,
  STATUS_LIST,
  toISODate,
  type Kategori,
  type StatusData,
} from "../../lib/sampahData";
import { getUser } from "../../lib/session";
import { useFetch } from "../../lib/useFetch";

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
  "h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20";

const tgl = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function DataSampahPetugas() {
  const ctx = useOutletContext<{ refresh?: () => void } | null>();
  const { data: rows, loading, error, reload } = useFetch(getDataSampah);
  const namaPetugas = getUser()?.name ?? "";

  // Filter
  const [cari, setCari] = useState("");
  const [fStatus, setFStatus] = useState<StatusData | "">("");
  const [fKategori, setFKategori] = useState<Kategori | "">("");

  // Form tambah data
  const [showForm, setShowForm] = useState(false);
  const [tanggal, setTanggal] = useState(toISODate(new Date()));
  const [lokasi, setLokasi] = useState(LOKASI_LIST[0]);
  const [kategori, setKategori] = useState<Kategori>("Organik");
  const [berat, setBerat] = useState("");
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const data = rows ?? [];

  // Semua hook dipanggil sebelum return bersyarat di bawah
  const tampil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return data.filter(
      (d) =>
        (!fStatus || d.status === fStatus) &&
        (!fKategori || d.kategori === fKategori) &&
        (!q || [d.id, d.lokasi, d.petugas ?? ""].some((v) => v.toLowerCase().includes(q))),
    );
  }, [data, cari, fStatus, fKategori]);

  if (loading && !rows) {
    return <p className="text-sm text-stone-600">Memuat data...</p>;
  }
  if (error && !rows) {
    return (
      <div role="alert" className="rounded-lg bg-red-50 px-3 py-3 text-sm text-red-700">
        <p>{error}</p>
        <button type="button" onClick={() => void reload()} className="mt-2 font-medium underline">
          Coba lagi
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    const beratKg = Number(berat.replace(",", "."));
    if (!Number.isFinite(beratKg) || beratKg <= 0) {
      setFormError("Berat harus berupa angka lebih dari 0.");
      return;
    }

    setSaving(true);
    try {
      await addDataSampah({
        tanggal,
        lokasi,
        petugas: namaPetugas,
        kategori,
        beratKg,
        catatan: catatan.trim() || undefined,
      });
      setBerat("");
      setCatatan("");
      setShowForm(false);
      await reload();
      ctx?.refresh?.();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter dan tombol tambah */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari ID, lokasi, atau petugas"
          aria-label="Cari data sampah"
          className={`${field} max-w-xs`}
        />
        <select
          value={fStatus}
          onChange={(e) => setFStatus(e.target.value as StatusData | "")}
          aria-label="Filter status"
          className={`${field} w-auto`}
        >
          <option value="">Semua status</option>
          {STATUS_LIST.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={fKategori}
          onChange={(e) => setFKategori(e.target.value as Kategori | "")}
          aria-label="Filter kategori"
          className={`${field} w-auto`}
        >
          <option value="">Semua kategori</option>
          {KATEGORI_LIST.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="ml-auto rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          {showForm ? "Tutup form" : "Tambah data"}
        </button>
      </div>

      {/* Form tambah data */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div>
            <label htmlFor="tanggal" className="mb-1 block text-sm font-medium text-stone-700">
              Tanggal
            </label>
            <input
              id="tanggal"
              type="date"
              value={tanggal}
              max={toISODate(new Date())}
              onChange={(e) => setTanggal(e.target.value)}
              required
              className={field}
            />
          </div>

          <div>
            <label htmlFor="lokasi" className="mb-1 block text-sm font-medium text-stone-700">
              Lokasi
            </label>
            <select
              id="lokasi"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              className={field}
            >
              {LOKASI_LIST.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="kategori" className="mb-1 block text-sm font-medium text-stone-700">
              Kategori
            </label>
            <select
              id="kategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value as Kategori)}
              className={field}
            >
              {KATEGORI_LIST.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="berat" className="mb-1 block text-sm font-medium text-stone-700">
              Berat (kg)
            </label>
            <input
              id="berat"
              type="text"
              inputMode="decimal"
              value={berat}
              onChange={(e) => setBerat(e.target.value)}
              placeholder="Contoh: 12,5"
              required
              className={field}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="catatan" className="mb-1 block text-sm font-medium text-stone-700">
              Catatan (opsional)
            </label>
            <input
              id="catatan"
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              maxLength={300}
              className={field}
            />
          </div>

          <p className="text-xs text-stone-500 sm:col-span-2 lg:col-span-3">
            Dicatat atas nama {namaPetugas || "petugas"}. Data baru berstatus Menunggu sampai
            diverifikasi.
          </p>

          {formError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2 lg:col-span-3"
            >
              {formError}
            </p>
          )}

          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan data"}
            </button>
          </div>
        </form>
      )}

      {/* Tabel */}
      <section className="rounded-xl border border-stone-200 bg-white">
        {tampil.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-stone-500">
            {data.length === 0
              ? "Belum ada data sampah."
              : "Tidak ada data yang cocok dengan filter."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-stone-200 text-xs text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Lokasi</th>
                  <th className="px-4 py-3 font-medium">Petugas</th>
                  <th className="px-4 py-3 font-medium">Kategori</th>
                  <th className="px-4 py-3 font-medium">Berat</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {tampil.map((d) => (
                  <tr key={d.id} className="border-b border-stone-100 last:border-0">
                    <td className="px-4 py-3 font-semibold text-stone-900">
                      {d.id}
                      {d.catatan && (
                        <p className="mt-0.5 text-xs font-normal text-stone-500">
                          Catatan: {d.catatan}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{tgl(d.tanggal)}</td>
                    <td className="px-4 py-3">{d.lokasi}</td>
                    <td className="px-4 py-3 text-stone-600">{d.petugas || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`${badge} ${KATEGORI_STYLE[d.kategori]}`}>{d.kategori}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {d.beratKg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${badge} ${STATUS_STYLE[d.status]}`}>{d.status}</span>
                    </td>
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