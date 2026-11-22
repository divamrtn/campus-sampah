import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  Loader2,
  Recycle,
  ShieldCheck,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { post } from "../../lib/api";

/* -------------------------------- Pendaftaran ------------------------------- */

interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

async function registerUser(payload: RegisterPayload): Promise<void> {
  await post("/auth/register", payload);
}

/* --------------------------------- Helpers -------------------------------- */

type FieldErrors = Partial<
  Record<"name" | "email" | "phone" | "password" | "confirm" | "terms", string>
>;

const STRENGTH_LEVELS = [
  { label: "Terlalu pendek", bar: "bg-red-500", text: "text-red-700" },
  { label: "Lemah", bar: "bg-red-500", text: "text-red-700" },
  { label: "Cukup", bar: "bg-amber-500", text: "text-amber-700" },
  { label: "Baik", bar: "bg-lime-500", text: "text-lime-700" },
  { label: "Kuat", bar: "bg-emerald-600", text: "text-emerald-700" },
];

/** Skor 0-4: panjang minimal 8, huruf besar dan kecil, angka, simbol. */
function getStrength(password: string): number {
  if (password.length < 8) return 0;
  let score = 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const inputClass = (hasError?: string) =>
  `h-11 w-full rounded-lg border bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
      : "border-stone-300 focus:border-emerald-700 focus:ring-emerald-700/20"
  }`;

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

const Field = ({ id, label, error, hint, children }: FieldProps) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-stone-800">
      {label}
    </label>
    {children}
    {error ? (
      <p id={`${id}-error`} className="mt-1.5 text-xs text-red-700">
        {error}
      </p>
    ) : (
      hint && <p className="mt-1.5 text-xs text-stone-500">{hint}</p>
    )}
  </div>
);

const BENEFITS = [
  { icon: UserPlus, text: "Daftar dengan data diri dan kontak aktif" },
  { icon: ShieldCheck, text: "Data setoran tersimpan dan terverifikasi petugas" },
  { icon: UserCheck, text: "Kumpulkan poin dari setiap setoran" },
];

/* -------------------------------- Component ------------------------------- */

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const strength = useMemo(() => getStrength(password), [password]);
  const level = STRENGTH_LEVELS[strength];

  const validate = () => {
    const errors: FieldErrors = {};

    if (!name.trim()) errors.name = "Nama lengkap wajib diisi.";
    else if (name.trim().length < 3) errors.name = "Nama minimal 3 karakter.";

    if (!email.trim()) errors.email = "Email wajib diisi.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Format email tidak valid.";

    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (!cleanPhone) errors.phone = "Nomor HP wajib diisi.";
    else if (!/^(\+62|62|0)8[1-9]\d{6,10}$/.test(cleanPhone))
      errors.phone = "Gunakan nomor HP Indonesia, misalnya 0812 3456 7890.";

    if (!password) errors.password = "Kata sandi wajib diisi.";
    else if (password.length < 8) errors.password = "Kata sandi minimal 8 karakter.";

    if (!confirm) errors.confirm = "Ulangi kata sandi Anda.";
    else if (confirm !== password) errors.confirm = "Kata sandi tidak sama.";

    if (!terms) errors.terms = "Anda harus menyetujui syarat penggunaan.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await registerUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/[\s-]/g, ""),
        password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pendaftaran gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Panel kiri (desktop) */}
      <aside className="hidden w-[44%] max-w-xl flex-col justify-between bg-emerald-950 p-10 text-emerald-100/80 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime-300 text-emerald-950">
            <Recycle className="h-5 w-5" />
          </div>
          <p className="text-base font-semibold text-white">Pendataan Sampah</p>
        </div>

        <div>
          <h2 className="text-3xl font-semibold leading-snug text-white">
            Bergabung untuk membantu mendata dan mengelola sampah.
          </h2>
          <ul className="mt-8 space-y-4">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-900 text-lime-300">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-emerald-200/50">
          © {new Date().getFullYear()} Pendataan Sampah
        </p>
      </aside>

      {/* Form */}
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          {/* Brand (mobile) */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950 text-lime-300">
              <Recycle className="h-5 w-5" />
            </div>
            <p className="text-base font-semibold text-stone-900">Pendataan Sampah</p>
          </div>

          {success ? (
            <div role="status">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <CircleCheck className="h-6 w-6" />
              </div>
              <h1 className="mt-5 text-2xl font-semibold text-stone-900">Akun berhasil dibuat</h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Akun untuk <span className="font-medium text-stone-900">{email}</span> sudah
                aktif. Silakan masuk dengan email dan kata sandi Anda.
              </p>
              <Link
                to="/login"
                className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-emerald-900 text-sm font-medium text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                Kembali ke halaman masuk
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-stone-900">Buat akun baru</h1>
              <p className="mt-1.5 text-sm text-stone-600">
                Isi data berikut. Akun langsung aktif setelah pendaftaran.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800"
                >
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                <Field id="name" label="Nama lengkap" error={fieldErrors.name}>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama sesuai identitas"
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? "name-error" : undefined}
                    className={inputClass(fieldErrors.name)}
                  />
                </Field>

                <Field id="email" label="Email" error={fieldErrors.email}>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@kampus.ac.id"
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? "email-error" : undefined}
                    className={inputClass(fieldErrors.email)}
                  />
                </Field>

                <Field id="phone" label="Nomor HP" error={fieldErrors.phone}>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812 3456 7890"
                    aria-invalid={!!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                    className={inputClass(fieldErrors.phone)}
                  />
                </Field>

                <Field id="password" label="Kata sandi" error={fieldErrors.password}>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? "password-error" : undefined}
                      className={`${inputClass(fieldErrors.password)} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {password && (
                    <div className="mt-2" aria-live="polite">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <span
                            key={i}
                            className={`h-1.5 flex-1 rounded-full ${
                              i <= strength ? level.bar : "bg-stone-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`mt-1 text-xs ${level.text}`}>Kekuatan: {level.label}</p>
                    </div>
                  )}
                </Field>

                <Field id="confirm" label="Ulangi kata sandi" error={fieldErrors.confirm}>
                  <div className="relative">
                    <input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Ketik ulang kata sandi"
                      aria-invalid={!!fieldErrors.confirm}
                      aria-describedby={fieldErrors.confirm ? "confirm-error" : undefined}
                      className={`${inputClass(fieldErrors.confirm)} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((s) => !s)}
                      aria-label={showConfirm ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <div>
                  <label className="flex cursor-pointer items-start gap-2 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      checked={terms}
                      onChange={(e) => setTerms(e.target.checked)}
                      aria-invalid={!!fieldErrors.terms}
                      aria-describedby={fieldErrors.terms ? "terms-error" : undefined}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 text-emerald-800 focus:ring-emerald-700"
                    />
                    <span>
                      Saya menyetujui{" "}
                      <a href="/syarat" className="font-medium text-emerald-800 hover:underline">
                        syarat penggunaan
                      </a>{" "}
                      dan{" "}
                      <a href="/privasi" className="font-medium text-emerald-800 hover:underline">
                        kebijakan privasi
                      </a>
                      .
                    </span>
                  </label>
                  {fieldErrors.terms && (
                    <p id="terms-error" className="mt-1.5 text-xs text-red-700">
                      {fieldErrors.terms}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-900 text-sm font-medium text-white transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Memproses" : "Daftar"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-stone-600">
                Sudah punya akun?{" "}
                <Link to="/login" className="font-medium text-emerald-800 hover:underline">
                  Masuk
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Register;