import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";
import * as controller from "./poin.controller.js";
import { leaderboardQuery, listPoinQuery, penyesuaianSchema } from "./poin.validation.js";

const router = Router();
router.use(authenticate);

router.get("/saya", authorize(PERMISSIONS.poin.readOwn), validate({ query: listPoinQuery }), controller.listMine);
router.get("/leaderboard", authorize(PERMISSIONS.poin.leaderboard), validate({ query: leaderboardQuery }), controller.leaderboard);
router.get("/", authorize(PERMISSIONS.poin.readAll), validate({ query: listPoinQuery }), controller.listAll);
router.post("/penyesuaian", authorize(PERMISSIONS.poin.adjust), validate({ body: penyesuaianSchema }), controller.adjust);

export default router;
