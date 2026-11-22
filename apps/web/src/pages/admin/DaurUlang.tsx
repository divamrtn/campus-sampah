import { useState } from "react";
import { Search } from "lucide-react";

interface Material {
  id: string;
  material: string;
  mitra: string;
  diterimaKg: number;
  didaurKg: number;
}

/** SEMENTARA: data contoh. Ganti dengan data dari lib atau API. */
const DATA: Material[] = [
  { id: "DU-01", material: "Plastik PET", mitra: "CV Hijau Lestari", diterimaKg: 1200, didaurKg: 980 },
  { id: "DU-02", material: "Kertas dan kardus", mitra: "PT Daur Nusantara", diterimaKg: 2100, didaurKg: 1890 },
  { id: "DU-03", material: "Logam", mitra: "CV Logam Jaya", diterimaKg: 540, didaurKg: 510 },
  { id: "DU-04", material: "Kaca", mitra: "PT Daur Nusantara", diterimaKg: 380, didaurKg: 260 },
  { id: "DU-05", material: "Organik (kompos)", mitra: "Unit Kompos Kampus", diterimaKg: 3100, didaurKg: 2700 },
];

const control =
  "rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-emerald-700";
const fmt = (n: number) => n.toLocaleString("id-ID");

export default function DaurUlang() {
  const [cari, setCari] = useState("");
  const q = cari.trim().toLowerCase();
  const rows = DATA.filter(
    (d) => q === "" || d.material.toLowerCase().includes(q) || d.mitra.toLowerCase().includes(q),
  );

  const diterima = DATA.reduce((s, d) => s + d.diterimaKg, 0);
  const didaur = DATA.reduce((s, d) => s + d.didaurKg, 0);
  const stats = [
    { label: "Diterima", value: `${fmt(diterima)} kg` },
    { label: "Berhasil didaur ulang", value: `${fmt(didaur)} kg` },
    { label: "Tingkat daur ulang", value: `${Math.round((didaur / diterima) * 100)}%` },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-sm text-stone-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
          <input
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari material atau mitra"
            className={`${control} w-full pl-9`}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-stone-200 text-stone-600">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Material</th>
              <th className="px-4 py-3 font-medium">Mitra</th>
              <th className="px-4 py-3 text-right font-medium">Diterima</th>
              <th className="px-4 py-3 font-medium">Berhasil didaur ulang</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-stone-500">Tidak ada data yang cocok.</td>
              </tr>
            ) : (
              rows.map((d) => {
                const persen = Math.round((d.didaurKg / d.diterimaKg) * 100);
                return (
                  <tr key={d.id} className="border-b border-stone-100 last:border-0">
                    <td className="px-4 py-3 font-semibold text-stone-900">{d.id}</td>
                    <td className="px-4 py-3">{d.material}</td>
                    <td className="px-4 py-3">{d.mitra}</td>
                    <td className="px-4 py-3 text-right">{fmt(d.diterimaKg)} kg</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-stone-200">
                          <div className="h-full bg-emerald-600" style={{ width: `${persen}%` }} />
                        </div>
                        <span className="text-xs text-stone-600">{fmt(d.didaurKg)} kg ({persen}%)</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}