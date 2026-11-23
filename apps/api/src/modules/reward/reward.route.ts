import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";
import { idParam } from "../../shared/utils/validators.js";
import * as controller from "./reward.controller.js";
import { createRewardSchema, listRewardQuery, updateRewardSchema } from "./reward.validation.js";

const router = Router();
router.use(authenticate);

const write = authorize(PERMISSIONS.reward.write);
router.get("/", validate({ query: listRewardQuery }), controller.list);
router.get("/:id", validate({ params: idParam }), controller.getById);
router.post("/", write, validate({ body: createRewardSchema }), controller.create);
router.patch("/:id", write, validate({ params: idParam, body: updateRewardSchema }), controller.update);
router.delete("/:id", write, validate({ params: idParam }), controller.remove);

export default router;
