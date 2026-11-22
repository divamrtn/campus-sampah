import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { get, run } from "../db";
import type { Role } from "../db";
import { requireAuth, signToken } from "../auth";

const router = Router();

interface UserRow {
  id: number;
  username: string;
  email: string;
  name: string;
  password_hash: string;
  role: Role;
}

const loginSchema = z.object({
  username: z.string().min(1, "Email atau username wajib diisi."),
  password: z.string().min(1, "Password wajib diisi."),
});

const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter.").max(80),
  email: z.string().email("Format email tidak valid.").max(120),
  phone: z
    .string()
    .regex(/^(\+62|62|0)8[1-9]\d{6,10}$/, "Nomor HP tidak valid.")
    .optional(),
  password: z.string().min(8, "Kata sandi minimal 8 karakter.").max(100),
});

router.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0].message });
    return;
  }
  const { username, password } = parsed.data;
  const user = get<UserRow>(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    username,
    username,
  );
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ message: "Username atau password salah." });
    return;
  }
  res.json({
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// Pendaftaran publik: selalu menjadi mahasiswa. Username otomatis dari email.
router.post("/register", (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0].message });
    return;
  }
  const { name, email, phone, password } = parsed.data;
  const exists = get("SELECT id FROM users WHERE username = ? OR email = ?", email, email);
  if (exists) {
    res.status(409).json({ message: "Email sudah terdaftar." });
    return;
  }
  const result = run(
    "INSERT INTO users (username, email, name, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, 'mahasiswa')",
    email,
    email,
    name,
    phone ?? null,
    bcrypt.hashSync(password, 12),
  );
  const id = Number(result.lastInsertRowid);
  res.status(201).json({
    token: signToken({ id, role: "mahasiswa" }),
    user: { id, name, email, role: "mahasiswa" },
  });
});

router.get("/me", requireAuth, (req, res) => {
  const user = get<{ id: number; name: string; email: string; role: Role }>(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    req.auth!.id,
  );
  res.json({ user });
});

export default router;