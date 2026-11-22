import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Recycle } from "lucide-react";
import { post } from "../../lib/api";
import {
  getUser,
  homePathForRole,
  isAuthenticated,
  setAuth,
  type AuthUser,
} from "../../lib/session";

const input =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-emerald-700";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Kalau sudah login, langsung arahkan ke halaman sesuai peran
  const current = getUser();
  if (isAuthenticated() && current) {
    return <Navigate to={homePathForRole(current.role)} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await post<{ token: string; user: AuthUser }>("/auth/login", {
        username: identifier.trim(),
        password,
      });
      setAuth(data.token, data.user, remember);
      navigate(homePathForRole(data.user.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Panel merek (disembunyikan di layar kecil) */}
      <aside className="hidden flex-1 flex-col justify-between bg-emerald-950 p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400 text-emerald-950">
            <Recycle className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold">Pendataan Sampah</p>
            <p className="text-sm text-emerald-300">Campus Sampah</p>
          </div>
        </div>

        <div>
          <h2 className="max-w-md text-3xl font-semibold leading-tight">
            Kelola dan setor sampah kampus dengan lebih mudah.
          </h2>
          <p className="mt-3 max-w-md text-sm text-emerald-200">
            Pantau data sampah, verifikasi setoran, dan kumpulkan poin dari satu tempat.
          </p>
        </div>

        <p className="text-xs text-emerald-400">Kampus bersih, lingkungan sehat.</p>
      </aside>

      {/* Form */}
      <main className="flex flex-1 items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          <div className="flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 text-emerald-950">
              <Recycle className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="font-semibold text-stone-900">Pendataan Sampah</p>
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-stone-900">Masuk</h1>
            <p className="mt-1 text-sm text-stone-600">Masuk untuk melanjutkan ke akunmu.</p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="identifier" className="mb-1 block text-sm font-medium text-stone-700">
              Email atau username
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              className={input}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={`${input} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-800"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Ingat saya
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>

          <p className="text-center text-sm text-stone-600">
            Belum punya akun?{" "}
            <Link to="/register" className="font-medium text-emerald-800 hover:underline">
              Daftar
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}