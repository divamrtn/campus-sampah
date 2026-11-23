import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";
import { idParam } from "../../shared/utils/validators.js";
import * as controller from "./laporan.controller.js";
import { createLaporanSchema, listLaporanQuery, tanggapiSchema } from "./laporan.validation.js";

const router = Router();
router.use(authenticate);

router.get("/", validate({ query: listLaporanQuery }), controller.list);
router.post("/", authorize(PERMISSIONS.laporan.create), validate({ body: createLaporanSchema }), controller.create);
router.get("/:id", validate({ params: idParam }), controller.getById);
router.patch(
  "/:id/tanggapi",
  authorize(PERMISSIONS.laporan.handle),
  validate({ params: idParam, body: tanggapiSchema }),
  controller.tanggapi,
);
router.delete("/:id", authorize(PERMISSIONS.laporan.create), validate({ params: idParam }), controller.removeOwn);

export default router;
