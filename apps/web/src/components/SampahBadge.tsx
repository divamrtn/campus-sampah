import type { Kategori, StatusData } from "../lib/sampahData";

const KATEGORI_STYLE: Record<Kategori, string> = {
  Organik: "bg-emerald-100 text-emerald-800",
  Anorganik: "bg-sky-100 text-sky-800",
  B3: "bg-purple-100 text-purple-800",
};

const STATUS_STYLE: Record<StatusData, string> = {
  Terverifikasi: "bg-emerald-100 text-emerald-800",
  Menunggu: "bg-amber-100 text-amber-800",
  Ditolak: "bg-red-100 text-red-800",
};

const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

export const KategoriBadge = ({ value }: { value: Kategori }) => (
  <span className={`${base} ${KATEGORI_STYLE[value]}`}>{value}</span>
);

export const StatusBadge = ({ value }: { value: StatusData }) => (
  <span className={`${base} ${STATUS_STYLE[value]}`}>{value}</span>
);