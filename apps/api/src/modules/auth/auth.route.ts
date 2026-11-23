import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./auth.controller.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.validation.js";

const router = Router();

router.post("/register", validate({ body: registerSchema }), controller.register);
router.post("/login", validate({ body: loginSchema }), controller.login);
router.post("/forgot-password", validate({ body: forgotPasswordSchema }), controller.forgotPassword);
router.post("/reset-password", validate({ body: resetPasswordSchema }), controller.resetPassword);

router.get("/me", authenticate, controller.me);
router.patch("/change-password", authenticate, validate({ body: changePasswordSchema }), controller.changePassword);

export default router;
