import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";
import { idParam } from "../../shared/utils/validators.js";
import * as controller from "./jadwal.controller.js";
import { createJadwalSchema, listJadwalQuery, updateJadwalSchema } from "./jadwal.validation.js";

const router = Router();
router.use(authenticate);

router.get("/", validate({ query: listJadwalQuery }), controller.list);
router.get("/:id", validate({ params: idParam }), controller.getById);
router.post("/", authorize(PERMISSIONS.jadwal.create), validate({ body: createJadwalSchema }), controller.create);
router.patch(
  "/:id",
  authorize(PERMISSIONS.jadwal.update),
  validate({ params: idParam, body: updateJadwalSchema }),
  controller.update,
);
router.delete("/:id", authorize(PERMISSIONS.jadwal.create), validate({ params: idParam }), controller.remove);

export default router;
