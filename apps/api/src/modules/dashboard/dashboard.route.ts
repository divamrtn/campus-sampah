import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";
import * as controller from "./dashboard.controller.js";

const router = Router();
router.use(authenticate);

router.get("/", authorize(PERMISSIONS.dashboard.staff), controller.staff);
router.get("/saya", authorize(PERMISSIONS.dashboard.mahasiswa), controller.mahasiswa);

export default router;
