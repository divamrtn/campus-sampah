import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorize } from "../../../middlewares/role.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../../shared/constants/permissions.js";
import { idParam } from "../../../shared/utils/validators.js";
import * as controller from "./jenis-sampah.controller.js";
import { createJenisSchema, listJenisQuery, updateJenisSchema } from "./jenis-sampah.validation.js";

const router = Router();
router.use(authenticate);

const write = authorize(PERMISSIONS.master.write);
router.get("/", validate({ query: listJenisQuery }), controller.list);
router.get("/:id", validate({ params: idParam }), controller.getById);
router.post("/", write, validate({ body: createJenisSchema }), controller.create);
router.patch("/:id", write, validate({ params: idParam, body: updateJenisSchema }), controller.update);
router.delete("/:id", write, validate({ params: idParam }), controller.remove);

export default router;
