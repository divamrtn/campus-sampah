export type Role = "admin" | "petugas" | "mahasiswa";

export interface AuthUser {
  name: string;
  email: string;
  role: Role;
}

/** Label peran yang ditampilkan di sidebar dan header. */
export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  petugas: "Petugas",
  mahasiswa: "Mahasiswa",
};

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Simpan token dan data user. Jika remember true, bertahan setelah browser ditutup. */
export function setAuth(token: string, user: AuthUser, remember: boolean): void {
  clearAuth();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  return read(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  const raw = read(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** Hapus semua data login (dipakai saat logout). */
export function clearAuth(): void {
  try {
    for (const key of [TOKEN_KEY, USER_KEY]) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  } catch {
    /* penyimpanan tidak tersedia, abaikan */
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/* Alias agar kode lama yang memanggil clearToken() tetap berjalan */
export const clearToken = clearAuth;