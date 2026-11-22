import bcrypt from "bcryptjs";
import { ROLES, get, run, type Role } from "./db";

const [role, username, email, name, password] = process.argv.slice(2);

if (!role || !username || !email || !name || !password) {
  console.error('Pemakaian: pnpm create-user <admin|petugas> <username> <email> "<Nama>" "<password>"');
  process.exit(1);
}
if (!ROLES.includes(role as Role) || role === "mahasiswa") {
  console.error("Peran harus admin atau petugas. Mahasiswa mendaftar sendiri lewat halaman Register.");
  process.exit(1);
}
if (password.length < 10) {
  console.error("Password minimal 10 karakter.");
  process.exit(1);
}
if (get("SELECT id FROM users WHERE username = ? OR email = ?", username, email)) {
  console.error("Username atau email sudah dipakai.");
  process.exit(1);
}

run(
  "INSERT INTO users (username, email, name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
  username,
  email,
  name,
  bcrypt.hashSync(password, 12),
  role,
);
console.log(`Akun ${role} "${username}" berhasil dibuat.`);