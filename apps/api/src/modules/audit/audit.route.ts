import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";
import { paginationSchema } from "../../shared/utils/pagination.js";
import { intId } from "../../shared/utils/validators.js";
import * as controller from "./audit.controller.js";

const router = Router();

const querySchema = paginationSchema.extend({
  userId: intId.optional(),
  aksi: z.string().optional(),
  entitas: z.string().optional(),
  dari: z.coerce.date().optional(),
  sampai: z.coerce.date().optional(),
});

router.get("/", authenticate, authorize(PERMISSIONS.audit.read), validate({ query: querySchema }), controller.list);

export default router;
