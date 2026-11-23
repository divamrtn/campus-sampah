import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";
import { idParam } from "../../shared/utils/validators.js";
import * as controller from "./penukaran.controller.js";
import { cancelSchema, createPenukaranSchema, listPenukaranQuery, updateStatusSchema } from "./penukaran.validation.js";

const router = Router();
router.use(authenticate);

router.get("/", validate({ query: listPenukaranQuery }), controller.list);
router.post("/", authorize(PERMISSIONS.penukaran.create), validate({ body: createPenukaranSchema }), controller.create);
router.get("/:id", validate({ params: idParam }), controller.getById);
router.patch(
  "/:id/status",
  authorize(PERMISSIONS.penukaran.process),
  validate({ params: idParam, body: updateStatusSchema }),
  controller.updateStatus,
);
router.patch(
  "/:id/batal",
  authorize(PERMISSIONS.penukaran.create),
  validate({ params: idParam, body: cancelSchema }),
  controller.cancelOwn,
);

export default router;
