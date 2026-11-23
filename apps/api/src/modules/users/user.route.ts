import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";
import { idParam } from "../../shared/utils/validators.js";
import * as controller from "./user.controller.js";
import { createUserSchema, listUserQuery, updateMeSchema, updateUserSchema } from "./user.validation.js";

const router = Router();
router.use(authenticate);

// Profil sendiri (semua role) - harus sebelum "/:id"
router.get("/me", controller.getMe);
router.patch("/me", validate({ body: updateMeSchema }), controller.updateMe);

// Manajemen user (admin)
const admin = authorize(PERMISSIONS.users.manage);
router.get("/", admin, validate({ query: listUserQuery }), controller.list);
router.post("/", admin, validate({ body: createUserSchema }), controller.create);
router.get("/:id", admin, validate({ params: idParam }), controller.getById);
router.patch("/:id", admin, validate({ params: idParam, body: updateUserSchema }), controller.update);
router.delete("/:id", admin, validate({ params: idParam }), controller.remove);

export default router;
