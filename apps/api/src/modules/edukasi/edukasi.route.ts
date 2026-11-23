import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";
import { idParam } from "../../shared/utils/validators.js";
import * as controller from "./edukasi.controller.js";
import { createEdukasiSchema, listEdukasiQuery, slugParam, updateEdukasiSchema } from "./edukasi.validation.js";

const router = Router();

// Publik: hanya artikel yang sudah dipublikasikan
router.get("/", validate({ query: listEdukasiQuery }), controller.listPublic);
router.get("/slug/:slug", validate({ params: slugParam }), controller.getBySlug);

// Admin/petugas
const manage = [authenticate, authorize(PERMISSIONS.edukasi.manage)];
router.get("/admin/semua", ...manage, validate({ query: listEdukasiQuery }), controller.listAll);
router.get("/admin/:id", ...manage, validate({ params: idParam }), controller.getById);
router.post("/", ...manage, validate({ body: createEdukasiSchema }), controller.create);
router.patch("/:id", ...manage, validate({ params: idParam, body: updateEdukasiSchema }), controller.update);
router.delete("/:id", ...manage, validate({ params: idParam }), controller.remove);

export default router;
