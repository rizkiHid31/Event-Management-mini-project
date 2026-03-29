import express from "express";
import {
  createVoucherController,
  getVouchersByEventController,
  deleteVoucherController,
  validateVoucherController,
} from "../controllers/voucher.controller.js";
import { verifyToken, roleGuard } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createVoucherSchema,
  validateVoucherSchema,
} from "../validations/voucher.validation.js";

const router = express.Router();

// Public: validate a voucher code (used during checkout)
router.post(
  "/validate",
  validate(validateVoucherSchema),
  validateVoucherController,
);

// Organizer-only: manage vouchers
router.use(verifyToken, roleGuard("ORGANIZER"));

router.post("/", validate(createVoucherSchema), createVoucherController);
router.get("/event/:eventId", getVouchersByEventController);
router.delete("/:voucherId", deleteVoucherController);

export default router;
