import { useState } from "react";

const input =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-emerald-700";

export default function Pengaturan() {
  const [nama, setNama] = useState("Pendataan Sampah");
  const [email, setEmail] = useState("admin@campus.ac.id");
  const [poin, setPoin] = useState({ organik: 5, anorganik: 10, b3: 15 });
  const [notifVerifikasi, setNotifVerifikasi] = useState(true);
  const [notifAngkut, setNotifAngkut] = useState(true);
  const [tersimpan, setTersimpan] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: kirim ke API saat backend siap
    setTersimpan(true);
    window.setTimeout(() => setTersimpan(false), 2500);
  };

  const setPoinField = (key: keyof typeof poin, value: string) =>
    setPoin((p) => ({ ...p, [key]: Math.max(0, Number(value) || 0) }));

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-semibold text-stone-900">Profil sistem</h2>
        <div>
          <label htmlFor="nama" className="mb-1 block text-sm text-stone-700">Nama aplikasi</label>
          <input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-stone-700">Email admin</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-semibold text-stone-900">Poin per kilogram</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              ["organik", "Organik"],
              ["anorganik", "Anorganik"],
              ["b3", "B3"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label htmlFor={`poin-${key}`} className="mb-1 block text-sm text-stone-700">{label}</label>
              <input
                id={`poin-${key}`}
                type="number"
                min={0}
                value={poin[key]}
                onChange={(e) => setPoinField(key, e.target.value)}
                className={input}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-semibold text-stone-900">Notifikasi</h2>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={notifVerifikasi} onChange={(e) => setNotifVerifikasi(e.target.checked)} />
          Beri tahu saat ada setoran menunggu verifikasi
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={notifAngkut} onChange={(e) => setNotifAngkut(e.target.checked)} />
          Beri tahu saat jadwal pengangkutan berubah
        </label>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Simpan pengaturan
        </button>
        {tersimpan && (
          <p role="status" className="text-sm text-emerald-700">Pengaturan disimpan.</p>
        )}
      </div>
    </form>
  );
}