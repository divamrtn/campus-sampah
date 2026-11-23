import { recordAudit } from "../audit/audit.service.js";
import { asyncHandler } from "../../shared/utils/async-handler.js";
import { sendCreated, sendSuccess } from "../../shared/utils/response.js";
import { getById } from "../users/user.service.js";
import * as service from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const result = await service.register(req.body);
  void recordAudit(req, { aksi: "REGISTER", entitas: "users", entitasId: result.user.id, userId: result.user.id });
  sendCreated(res, result, "Registrasi berhasil");
});

export const login = asyncHandler(async (req, res) => {
  const { userId, ...result } = await service.login(req.body);
  void recordAudit(req, { aksi: "LOGIN", entitas: "users", entitasId: userId, userId });
  sendSuccess(res, result, "Login berhasil");
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, await getById(req.user!.id));
});

export const changePassword = asyncHandler(async (req, res) => {
  await service.changePassword(req.user!.id, req.body.oldPassword, req.body.newPassword);
  void recordAudit(req, { aksi: "UPDATE", entitas: "users", entitasId: req.user!.id, detail: { passwordChanged: true } });
  sendSuccess(res, null, "Password berhasil diubah");
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = await service.forgotPassword(req.body.email);
  sendSuccess(
    res,
    resetToken ? { resetToken } : null,
    "Jika email terdaftar, instruksi reset password akan dikirim",
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const userId = await service.resetPassword(req.body.token, req.body.newPassword);
  void recordAudit(req, { aksi: "RESET_PASSWORD", entitas: "users", entitasId: userId, userId });
  sendSuccess(res, null, "Password berhasil direset");
});
