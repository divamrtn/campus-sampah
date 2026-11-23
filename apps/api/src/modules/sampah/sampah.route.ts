import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";
import { stringIdParam } from "../../shared/utils/validators.js";
import * as controller from "./sampah.controller.js";
import { createSampahSchema, listSampahQuery, updateSampahSchema, verifikasiSchema } from "./sampah.validation.js";

const router = Router();
router.use(authenticate);

router.get("/", validate({ query: listSampahQuery }), controller.list);
router.post("/", authorize(PERMISSIONS.sampah.create), validate({ body: createSampahSchema }), controller.create);
router.get("/:id", validate({ params: stringIdParam }), controller.getById);
router.patch("/:id", validate({ params: stringIdParam, body: updateSampahSchema }), controller.update);
router.delete("/:id", validate({ params: stringIdParam }), controller.remove);
router.patch(
  "/:id/verifikasi",
  authorize(PERMISSIONS.sampah.verify),
  validate({ params: stringIdParam, body: verifikasiSchema }),
  controller.verifikasi,
);

export default router;
