interface Lokasi {
  nama: string;
  jenis: "TPS" | "Bank Sampah";
  alamat: string;
}

/** SEMENTARA: data contoh. Ganti dengan data asli dari lib atau API. */
const LOKASI: Lokasi[] = [
  { nama: "TPS Kenanga", jenis: "TPS", alamat: "Dekat Gedung A" },
  { nama: "TPS Mawar", jenis: "TPS", alamat: "Dekat Kantin" },
  { nama: "Bank Sampah Melati", jenis: "Bank Sampah", alamat: "Area Asrama" },
];

export default function LokasiTps() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {LOKASI.map((l) => (
        <div key={l.nama} className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-medium text-emerald-700">{l.jenis}</p>
          <h3 className="mt-1 font-semibold text-stone-900">{l.nama}</h3>
          <p className="mt-1 text-sm text-stone-600">{l.alamat}</p>
        </div>
      ))}
    </div>
  );
}