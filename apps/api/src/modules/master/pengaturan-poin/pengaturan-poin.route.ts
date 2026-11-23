import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/role.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../../shared/constants/permissions.js";
import * as controller from "./pengaturan-poin.controller.js";
import { kategoriParam, upsertPengaturanSchema } from "./pengaturan-poin.validation.js";

const router = Router();
router.use(authenticate);

router.get("/", authorize(PERMISSIONS.master.read), controller.list);
router.put(
  "/:kategori",
  authorize(PERMISSIONS.master.write),
  validate({ params: kategoriParam, body: upsertPengaturanSchema }),
  controller.upsert,
);

export default router;
