import { useState } from "react";
import { Download } from "lucide-react";

type Periode = "7 hari" | "30 hari" | "Tahun ini";

/** SEMENTARA: data contoh per periode (kg). Ganti dengan data dari lib atau API. */
const DATA: Record<Periode, { Organik: number; Anorganik: number; B3: number; setoran: number }> = {
  "7 hari": { Organik: 420, Anorganik: 610, B3: 35, setoran: 42 },
  "30 hari": { Organik: 1850, Anorganik: 2640, B3: 160, setoran: 188 },
  "Tahun ini": { Organik: 19800, Anorganik: 27400, B3: 1750, setoran: 2010 },
};

const WARNA = { Organik: "bg-emerald-600", Anorganik: "bg-sky-600", B3: "bg-purple-600" } as const;
const KATEGORI = ["Organik", "Anorganik", "B3"] as const;

const control =
  "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-emerald-700";
const fmt = (n: number) => n.toLocaleString("id-ID");

function unduhCsv(baris: string[][], nama: string) {
  const csv = baris.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nama;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Laporan() {
  const [periode, setPeriode] = useState<Periode>("30 hari");
  const d = DATA[periode];
  const total = d.Organik + d.Anorganik + d.B3;

  const handleUnduh = () => {
    unduhCsv(
      [
        ["Kategori", "Berat (kg)", "Persentase"],
        ...KATEGORI.map((k) => [k, String(d[k]), `${Math.round((d[k] / total) * 100)}%`]),
        ["Total", String(total), "100%"],
      ],
      `laporan-sampah-${periode.replace(/\s/g, "-")}.csv`,
    );
  };

  const stats = [
    { label: "Total sampah", value: `${fmt(total)} kg` },
    { label: "Jumlah setoran", value: fmt(d.setoran) },
    { label: "Rata-rata per setoran", value: `${(total / d.setoran).toFixed(1)} kg` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <label htmlFor="periode" className="text-sm text-stone-600">Periode</label>
        <select
          id="periode"
          value={periode}
          onChange={(e) => setPeriode(e.target.value as Periode)}
          className={control}
        >
          <option value="7 hari">7 hari terakhir</option>
          <option value="30 hari">30 hari terakhir</option>
          <option value="Tahun ini">Tahun ini</option>
        </select>
        <button
          type="button"
          onClick={handleUnduh}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Unduh CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="mb-4 font-semibold text-stone-900">Sampah per kategori</h2>
        <ul className="space-y-4">
          {KATEGORI.map((k) => {
            const persen = Math.round((d[k] / total) * 100);
            return (
              <li key={k}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-stone-800">{k}</span>
                  <span className="text-stone-600">{fmt(d[k])} kg ({persen}%)</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-stone-200">
                  <div className={`h-full ${WARNA[k]}`} style={{ width: `${persen}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}