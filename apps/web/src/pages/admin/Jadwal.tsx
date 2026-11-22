interface Kegiatan {
  hari: string;
  waktu: string;
  kegiatan: string;
  lokasi: string;
  petugas: string;
}

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

/** SEMENTARA: data contoh. Ganti dengan data dari lib atau API. */
const JADWAL: Kegiatan[] = [
  { hari: "Senin", waktu: "07.00", kegiatan: "Pengangkutan rutin", lokasi: "TPS Kenanga", petugas: "Agus Prasetyo" },
  { hari: "Senin", waktu: "13.00", kegiatan: "Penerimaan setoran", lokasi: "Bank Sampah Melati", petugas: "Siti Aminah" },
  { hari: "Selasa", waktu: "07.00", kegiatan: "Pengangkutan rutin", lokasi: "TPS Mawar", petugas: "Budi Santoso" },
  { hari: "Rabu", waktu: "08.00", kegiatan: "Pemilahan sampah B3", lokasi: "TPS Mawar", petugas: "Budi Santoso" },
  { hari: "Rabu", waktu: "13.00", kegiatan: "Penerimaan setoran", lokasi: "Bank Sampah Melati", petugas: "Dewi Lestari" },
  { hari: "Kamis", waktu: "07.00", kegiatan: "Pengangkutan rutin", lokasi: "TPS Kenanga", petugas: "Agus Prasetyo" },
  { hari: "Jumat", waktu: "09.00", kegiatan: "Pengiriman ke pusat daur ulang", lokasi: "Bank Sampah Melati", petugas: "Siti Aminah" },
  { hari: "Sabtu", waktu: "07.00", kegiatan: "Kerja bakti kampus", lokasi: "Seluruh area", petugas: "Semua petugas" },
];

export default function Jadwal() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {HARI.map((hari) => {
        const items = JADWAL.filter((j) => j.hari === hari);
        return (
          <section key={hari} className="rounded-xl border border-stone-200 bg-white p-4">
            <h3 className="mb-3 font-semibold text-stone-900">{hari}</h3>
            {items.length === 0 ? (
              <p className="text-sm text-stone-500">Tidak ada kegiatan.</p>
            ) : (
              <ul className="space-y-3">
                {items.map((j) => (
                  <li key={`${j.hari}-${j.waktu}-${j.lokasi}`} className="flex gap-3">
                    <span className="w-12 shrink-0 text-sm font-medium text-emerald-800">{j.waktu}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900">{j.kegiatan}</p>
                      <p className="text-xs text-stone-600">{j.lokasi} · {j.petugas}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}