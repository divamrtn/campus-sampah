import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toISODate, type Kategori } from "../../lib/sampahData";
import { LOKASI_SETOR, POIN_PER_KG, addSetoran, hitungPoin } from "../../lib/setoranData";

const KATEGORI: Array<{ nama: Kategori; contoh: string }> = [
  { nama: "Organik", contoh: "Sisa makanan, daun, kulit buah" },
  { nama: "Anorganik", contoh: "Plastik, kertas, kaleng, kaca" },
  { nama: "B3", contoh: "Baterai, lampu, elektronik kecil" },
];

const input =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-emerald-700";

export default function SetorSampah() {
  const navigate = useNavigate();
  const [tanggal, setTanggal] = useState(toISODate(new Date()));
  const [lokasi, setLokasi] = useState(LOKASI_SETOR[0]);
  const [kategori, setKategori] = useState<Kategori>("Anorganik");
  const [berat, setBerat] = useState("");
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");

  const beratKg = parseFloat(berat);
  const beratValid = Number.isFinite(beratKg) && beratKg > 0;
  const estimasi = beratValid ? hitungPoin(kategori, beratKg) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beratValid) {
      setError("Berat harus lebih dari 0 kg.");
      return;
    }
    addSetoran({
      tanggal,
      lokasi,
      kategori,
      beratKg: Math.round(beratKg * 10) / 10,
      catatan: catatan.trim() || undefined,
    });
    navigate("/mahasiswa/riwayat", { replace: true });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-stone-200 bg-white p-6 lg:col-span-2"
      >
        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-stone-800">Kategori sampah</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {KATEGORI.map((k) => {
              const aktif = kategori === k.nama;
              return (
                <label
                  key={k.nama}
                  className={`cursor-pointer rounded-lg border p-3 text-sm transition ${
                    aktif
                      ? "border-emerald-700 bg-emerald-50"
                      : "border-stone-300 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="kategori"
                    value={k.nama}
                    checked={aktif}
                    onChange={() => setKategori(k.nama)}
                    className="sr-only"
                  />
                  <span className="block font-semibold text-stone-900">{k.nama}</span>
                  <span className="mt-0.5 block text-xs text-stone-600">{k.contoh}</span>
                  <span className="mt-2 block text-xs font-medium text-emerald-800">
                    {POIN_PER_KG[k.nama]} poin/kg
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tanggal" className="mb-1 block text-sm text-stone-700">
              Tanggal
            </label>
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
            <label htmlFor="berat" className="mb-1 block text-sm text-stone-700">
              Berat (kg)
            </label>
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
        </div>

        <div>
          <label htmlFor="lokasi" className="mb-1 block text-sm text-stone-700">
            Lokasi setor
          </label>
          <select
            id="lokasi"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            className={input}
          >
            {LOKASI_SETOR.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="catatan" className="mb-1 block text-sm text-stone-700">
            Catatan (opsional)
          </label>
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
            Kirim setoran
          </button>
          <button
            type="button"
            onClick={() => navigate("/mahasiswa/dashboard")}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Batal
          </button>
        </div>
      </form>

      {/* Panel samping */}
      <aside className="space-y-4">
        <div className="rounded-xl bg-emerald-900 p-5 text-white">
          <p className="text-sm text-emerald-200">Estimasi poin</p>
          <p className="mt-1 text-3xl font-semibold">{estimasi}</p>
          <p className="mt-2 text-xs text-emerald-100">
            Poin masuk setelah setoran diverifikasi petugas.
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h3 className="mb-2 font-semibold text-stone-900">Sebelum menyetor</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-stone-600">
            <li>Pisahkan sampah menurut kategori.</li>
            <li>Bersihkan wadah plastik dan kaleng.</li>
            <li>Timbang dulu agar beratnya akurat.</li>
            <li>Sampah B3 jangan dicampur dengan yang lain.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}