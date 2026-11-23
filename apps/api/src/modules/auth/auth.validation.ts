import { z } from "zod";
import { emailField, mahasiswaProfile, passwordField, usernameField } from "../users/user.validation.js";

export const registerSchema = z.object({
  username: usernameField,
  email: emailField,
  name: z.string().trim().min(2).max(100),
  password: passwordField,
  phone: z.string().trim().min(5).max(20).optional(),
  ...mahasiswaProfile,
});

export const loginSchema = z.object({
  identifier: z.string().trim().toLowerCase().min(1, "Username atau email wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const changePasswordSchema = z
  .object({ oldPassword: z.string().min(1), newPassword: passwordField })
  .refine((d) => d.oldPassword !== d.newPassword, {
    message: "Password baru tidak boleh sama dengan password lama",
    path: ["newPassword"],
  });

export const forgotPasswordSchema = z.object({ email: emailField });

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: passwordField,
});
