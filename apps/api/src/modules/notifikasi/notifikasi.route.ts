import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { paginationSchema } from "../../shared/utils/pagination.js";
import { idParam, optionalBool } from "../../shared/utils/validators.js";
import * as controller from "./notifikasi.controller.js";

const router = Router();
router.use(authenticate);

router.get("/", validate({ query: paginationSchema.extend({ isRead: optionalBool }) }), controller.list);
router.get("/unread-count", controller.unreadCount);
router.patch("/read-all", controller.markAllRead);
router.patch("/:id/read", validate({ params: idParam }), controller.markRead);
router.delete("/:id", validate({ params: idParam }), controller.remove);

export default router;
