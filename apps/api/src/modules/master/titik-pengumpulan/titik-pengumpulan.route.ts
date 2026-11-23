import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/role.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../../shared/constants/permissions.js";
import { idParam } from "../../../shared/utils/validators.js";
import * as controller from "./titik-pengumpulan.controller.js";
import { createTpsSchema, listTpsQuery, updateTpsSchema } from "./titik-pengumpulan.validation.js";

const router = Router();
router.use(authenticate);

const write = authorize(PERMISSIONS.master.write);
router.get("/", validate({ query: listTpsQuery }), controller.list);
router.get("/:id", validate({ params: idParam }), controller.getById);
router.post("/", write, validate({ body: createTpsSchema }), controller.create);
router.patch("/:id", write, validate({ params: idParam, body: updateTpsSchema }), controller.update);
router.delete("/:id", write, validate({ params: idParam }), controller.remove);

export default router;
