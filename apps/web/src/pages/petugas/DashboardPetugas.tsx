import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import type { Kategori, StatusData } from "../../lib/sampahData";
import { getDataSampah, updateStatusSampah } from "../../lib/dataSampahStore";
import { getUser } from "../../lib/session";
import { useFetch } from "../../lib/useFetch";

const KATEGORI: Kategori[] = ["Organik", "Anorganik", "B3"];

const KATEGORI_STYLE: Record<Kategori, string> = {
  Organik: "bg-emerald-100 text-emerald-800",
  Anorganik: "bg-sky-100 text-sky-800",
  B3: "bg-purple-100 text-purple-800",
};

const badge = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

const tgl = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function DashboardPetugas() {
  const { refresh } = useOutletContext<{ refresh: () => void }>();
  const { data: rows, loading, error, reload } = useFetch(getDataSampah);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const nama = getUser()?.name ?? "Petugas";

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

  const data = rows ?? [];
  const menunggu = data.filter((d) => d.status === "Menunggu");
  const hitung = (s: StatusData) => data.filter((d) => d.status === s).length;
  const beratVerified = data
    .filter((d) => d.status === "Terverifikasi")
    .reduce((sum, d) => sum + d.beratKg, 0);

  const ubahStatus = async (id: string, baru: "Terverifikasi" | "Ditolak") => {
    setActionError("");
    setBusyId(id);
    try {
      await updateStatusSampah(id, baru);
      await reload();
      refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal memproses data.");
    } finally {
      setBusyId(null);
    }
  };

  const stats = [
    { label: "Menunggu verifikasi", value: menunggu.length.toString() },
    { label: "Terverifikasi", value: hitung("Terverifikasi").toString() },
    { label: "Ditolak", value: hitung("Ditolak").toString() },
    {
      label: "Berat terverifikasi",
      value: `${beratVerified.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sapaan */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-emerald-900 p-6 text-white">
        <div>
          <p className="text-sm text-emerald-200">Selamat bertugas</p>
          <h2 className="text-2xl font-semibold">{nama}</h2>
          <p className="mt-1 text-sm text-emerald-100">
            {menunggu.length > 0
              ? `Ada ${menunggu.length} setoran yang menunggu verifikasi kamu.`
              : "Semua setoran sudah diverifikasi."}
          </p>
        </div>
        <Link
          to="/petugas/verifikasi"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Mulai verifikasi
        </Link>
      </div>

      {actionError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {/* Statistik */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Antrean per kategori */}
        <section className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="mb-4 font-semibold text-stone-900">Antrean per kategori</h3>
          <ul className="space-y-3">
            {KATEGORI.map((k) => {
              const jumlah = menunggu.filter((d) => d.kategori === k).length;
              return (
                <li key={k} className="flex items-center justify-between text-sm">
                  <span className={`${badge} ${KATEGORI_STYLE[k]}`}>{k}</span>
                  <span className="font-medium text-stone-800">{jumlah} setoran</span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Antrean verifikasi */}
        <section className="rounded-xl border border-stone-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
            <h3 className="font-semibold text-stone-900">Antrean verifikasi</h3>
            <Link to="/petugas/verifikasi" className="text-sm text-emerald-700 hover:underline">
              Lihat semua
            </Link>
          </div>
          {menunggu.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-stone-500">
              Tidak ada setoran yang menunggu.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <tbody>
                  {menunggu.slice(0, 5).map((d) => (
                    <tr key={d.id} className="border-b border-stone-100 last:border-0">
                      <td className="px-4 py-3 font-semibold text-stone-900">{d.id}</td>
                      <td className="px-4 py-3">{tgl(d.tanggal)}</td>
                      <td className="px-4 py-3">{d.lokasi}</td>
                      <td className="px-4 py-3">
                        <span className={`${badge} ${KATEGORI_STYLE[d.kategori]}`}>
                          {d.kategori}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {d.beratKg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} kg
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={busyId === d.id}
                            onClick={() => void ubahStatus(d.id, "Terverifikasi")}
                            className="rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
                          >
                            Setujui
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}