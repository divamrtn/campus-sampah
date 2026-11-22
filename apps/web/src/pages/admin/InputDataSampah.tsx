import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toISODate, type Kategori } from "../../lib/sampahData";
import { LOKASI_LIST, PETUGAS_LIST, addDataSampah } from "../../lib/dataSampahStore";

const KATEGORI: Kategori[] = ["Organik", "Anorganik", "B3"];

const input =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-emerald-700";

export default function InputDataSampah() {
  const navigate = useNavigate();
  const [tanggal, setTanggal] = useState(toISODate(new Date()));
  const [lokasi, setLokasi] = useState(LOKASI_LIST[0]);
  const [petugas, setPetugas] = useState(PETUGAS_LIST[0]);
  const [kategori, setKategori] = useState<Kategori>("Organik");
  const [berat, setBerat] = useState("");
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const beratKg = parseFloat(berat);
    if (!Number.isFinite(beratKg) || beratKg <= 0) {
      setError("Berat harus lebih dari 0 kg.");
      return;
    }
    addDataSampah({
      tanggal,
      lokasi,
      petugas,
      kategori,
      beratKg: Math.round(beratKg * 10) / 10,
      catatan: catatan.trim() || undefined,
    });
    navigate("/admin/sampah", { replace: true });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-4 rounded-xl border border-stone-200 bg-white p-6"
    >
      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tanggal" className="mb-1 block text-sm text-stone-700">Tanggal</label>
          <input
            id="tanggal"
            type="date"
            value={tanggal}
            max={toISODate(new Date())}
            onChange={(e) => setTanggal(e.target.value)}
            required
            className={input}
          />
        </div>

        <div>
          <label htmlFor="berat" className="mb-1 block text-sm text-stone-700">Berat (kg)</label>
          <input
            id="berat"
            type="number"
            step="0.1"
            min="0.1"
            value={berat}
            onChange={(e) => {
              setBerat(e.target.value);
              setError("");
            }}
            required
            className={input}
          />
        </div>

        <div>
          <label htmlFor="lokasi" className="mb-1 block text-sm text-stone-700">Lokasi</label>
          <select id="lokasi" value={lokasi} onChange={(e) => setLokasi(e.target.value)} className={input}>
            {LOKASI_LIST.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="petugas" className="mb-1 block text-sm text-stone-700">Petugas</label>
          <select id="petugas" value={petugas} onChange={(e) => setPetugas(e.target.value)} className={input}>
            {PETUGAS_LIST.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="kategori" className="mb-1 block text-sm text-stone-700">Kategori sampah</label>
          <select
            id="kategori"
            value={kategori}
            onChange={(e) => setKategori(e.target.value as Kategori)}
            className={input}
          >
            {KATEGORI.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="catatan" className="mb-1 block text-sm text-stone-700">Catatan (opsional)</label>
        <textarea
          id="catatan"
          rows={3}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          className={input}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Simpan data
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/sampah")}
          className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
        >
          Batal
        </button>
      </div>
    </form>
  );
}