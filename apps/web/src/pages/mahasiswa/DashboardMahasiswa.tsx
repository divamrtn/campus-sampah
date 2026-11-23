import { Link } from "react-router-dom";
import { PackagePlus } from "lucide-react";
import type { Kategori, StatusData } from "../../lib/sampahData";
import { getSetoran, totalPoin } from "../../lib/setoranData";
import { getUser } from "../../lib/session";
import { useFetch } from "../../lib/useFetch";

const KATEGORI: Kategori[] = ["Organik", "Anorganik", "B3"];

const KATEGORI_STYLE: Record<Kategori, string> = {
  Organik: "bg-emerald-100 text-emerald-800",
  Anorganik: "bg-sky-100 text-sky-800",
  B3: "bg-purple-100 text-purple-800",
};

const KATEGORI_BAR: Record<Kategori, string> = {
  Organik: "bg-emerald-600",
  Anorganik: "bg-sky-600",
  B3: "bg-purple-600",
};

const STATUS_STYLE: Record<StatusData, string> = {
  Terverifikasi: "bg-emerald-100 text-emerald-800",
  Menunggu: "bg-amber-100 text-amber-800",
  Ditolak: "bg-red-100 text-red-800",
};

const badge = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

const tgl = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function DashboardMahasiswa() {
  const { data, loading, error, reload } = useFetch(getSetoran);
  const nama = getUser()?.name ?? "Mahasiswa";

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

  const list = data ?? [];
  const verified = list.filter((s) => s.status === "Terverifikasi");
  const totalBerat = verified.reduce((sum, s) => sum + s.beratKg, 0);
  const menunggu = list.filter((s) => s.status === "Menunggu").length;

  const perKategori = KATEGORI.map((k) => ({
    kategori: k,
    kg: verified.filter((s) => s.kategori === k).reduce((sum, s) => sum + s.beratKg, 0),
  }));
  const maxKg = Math.max(1, ...perKategori.map((p) => p.kg));

  const stats = [
    { label: "Total poin", value: totalPoin(list).toLocaleString("id-ID") },
    { label: "Total setoran", value: list.length.toString() },
    { label: "Berat terverifikasi", value: `${totalBerat.toFixed(1)} kg` },
    { label: "Menunggu verifikasi", value: menunggu.toString() },
  ];

  return (
    <div className="space-y-6">
      {/* Sapaan */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-emerald-900 p-6 text-white">
        <div>
          <p className="text-sm text-emerald-200">Selamat datang kembali</p>
          <h2 className="text-2xl font-semibold">{nama}</h2>
          <p className="mt-1 text-sm text-emerald-100">
            Setiap setoran yang diverifikasi petugas menambah poin kamu.
          </p>
        </div>
        <Link
          to="/mahasiswa/setor"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
        >
          <PackagePlus className="h-4 w-4" aria-hidden="true" />
          Setor sampah
        </Link>
      </div>

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
        {/* Berat per kategori */}
        <section className="rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="mb-4 font-semibold text-stone-900">Sampah per kategori</h3>
          <ul className="space-y-4">
            {perKategori.map((p) => (
              <li key={p.kategori}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-stone-800">{p.kategori}</span>
                  <span className="text-stone-600">{p.kg.toFixed(1)} kg</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className={`h-full ${KATEGORI_BAR[p.kategori]}`}
                    style={{ width: `${(p.kg / maxKg) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-stone-500">Hanya setoran yang sudah terverifikasi.</p>
        </section>

        {/* Setoran terakhir */}
        <section className="rounded-xl border border-stone-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
            <h3 className="font-semibold text-stone-900">Setoran terakhir</h3>
            <Link to="/mahasiswa/riwayat" className="text-sm text-emerald-700 hover:underline">
              Lihat semua
            </Link>
          </div>
          {list.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-stone-500">
              Belum ada setoran. Mulai dengan menekan tombol Setor sampah.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <tbody>
                  {list.slice(0, 5).map((s) => (
                    <tr key={s.id} className="border-b border-stone-100 last:border-0">
                      <td className="px-4 py-3 font-semibold text-stone-900">{s.id}</td>
                      <td className="px-4 py-3">{tgl(s.tanggal)}</td>
                      <td className="px-4 py-3">
                        <span className={`${badge} ${KATEGORI_STYLE[s.kategori]}`}>
                          {s.kategori}
                        </span>
                      </td>
                      <td className="px-4 py-3">{s.beratKg} kg</td>
                      <td className="px-4 py-3">
                        <span className={`${badge} ${STATUS_STYLE[s.status]}`}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-stone-700">+{s.poin} poin</td>
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