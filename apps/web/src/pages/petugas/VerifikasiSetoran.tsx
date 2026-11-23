import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { Kategori, StatusData } from "../../lib/sampahData";
import { getDataSampah, updateStatusSampah } from "../../lib/dataSampahStore";
import { useFetch } from "../../lib/useFetch";

const KATEGORI_STYLE: Record<Kategori, string> = {
  Organik: "bg-emerald-100 text-emerald-800",
  Anorganik: "bg-sky-100 text-sky-800",
  B3: "bg-purple-100 text-purple-800",
};

const STATUS_STYLE: Record<StatusData, string> = {
  Menunggu: "bg-amber-100 text-amber-800",
  Terverifikasi: "bg-emerald-100 text-emerald-800",
  Ditolak: "bg-red-100 text-red-800",
};

const badge = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

const TABS: StatusData[] = ["Menunggu", "Terverifikasi", "Ditolak"];

const tgl = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function VerifikasiSetoran() {
  const ctx = useOutletContext<{ refresh?: () => void } | null>();
  const { data: rows, loading, error, reload } = useFetch(getDataSampah);
  const [tab, setTab] = useState<StatusData>("Menunggu");
  const [cari, setCari] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const data = rows ?? [];

  // Semua hook dipanggil sebelum return bersyarat di bawah
  const jumlah = useMemo(
    () => ({
      Menunggu: data.filter((d) => d.status === "Menunggu").length,
      Terverifikasi: data.filter((d) => d.status === "Terverifikasi").length,
      Ditolak: data.filter((d) => d.status === "Ditolak").length,
    }),
    [data],
  );

  const tampil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return data.filter(
      (d) =>
        d.status === tab &&
        (!q || [d.id, d.lokasi, d.petugas ?? ""].some((v) => v.toLowerCase().includes(q))),
    );
  }, [data, tab, cari]);

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

  const ubahStatus = async (id: string, baru: "Terverifikasi" | "Ditolak") => {
    setActionError("");
    setBusyId(id);
    try {
      await updateStatusSampah(id, baru);
      await reload();
      ctx?.refresh?.();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal memproses data.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-stone-100 p-1" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                tab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {t} ({jumlah[t]})
            </button>
          ))}
        </div>

        <input
          type="search"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Cari ID, lokasi, atau petugas"
          aria-label="Cari setoran"
          className="h-10 w-full max-w-xs rounded-lg border border-stone-300 bg-white px-3 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
        />
      </div>

      {tab === "Menunggu" && (
        <p className="text-sm text-stone-600">
          Poin mahasiswa dihitung otomatis saat setoran disetujui.
        </p>
      )}

      {actionError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionError}
        </p>
      )}

      <section className="rounded-xl border border-stone-200 bg-white">
        {tampil.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-stone-500">
            {tab === "Menunggu"
              ? "Tidak ada setoran yang menunggu."
              : `Tidak ada data berstatus ${tab.toLowerCase()}.`}
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
                  <th className="px-4 py-3 font-medium">Sumber</th>
                  <th className="px-4 py-3 text-right font-medium">
                    {tab === "Menunggu" ? "Aksi" : "Status"}
                  </th>
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
                    <td className="px-4 py-3">
                      <span className={`${badge} ${KATEGORI_STYLE[d.kategori]}`}>{d.kategori}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {d.beratKg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {(d as { dariMahasiswa?: boolean }).dariMahasiswa
                        ? "Mahasiswa"
                        : d.petugas || "Petugas"}
                    </td>
                    <td className="px-4 py-3">
                      {d.status === "Menunggu" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={busyId === d.id}
                            onClick={() => void ubahStatus(d.id, "Terverifikasi")}
                            className="rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
                          >
                            {busyId === d.id ? "Memproses..." : "Setujui"}
                          </button>
                          <button
                            type="button"
                            disabled={busyId === d.id}
                            onClick={() => void ubahStatus(d.id, "Ditolak")}
                            className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <span className={`${badge} ${STATUS_STYLE[d.status]}`}>{d.status}</span>
                        </div>
                      )}
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