import express from "express";
import {
  createOrderController,
  uploadPaymentProofController,
  cancelOrderController,
  confirmOrderController,
  rejectOrderController,
  getCustomerOrdersController,
  getOrganizerOrdersController,
} from "../controllers/order.controller.js";
import { verifyToken, roleGuard } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { createOrderSchema } from "../validations/order.validation.js";

const router = express.Router();

router.use(verifyToken);

// Customer routes
router.get("/my", roleGuard("CUSTOMER"), getCustomerOrdersController);
router.post("/", roleGuard("CUSTOMER"), validate(createOrderSchema), createOrderController);
router.post("/:orderId/payment-proof", roleGuard("CUSTOMER"), upload.single("paymentProof"), uploadPaymentProofController);
router.put("/:orderId/cancel", roleGuard("CUSTOMER"), cancelOrderController);

// Organizer routes
router.get("/organizer", roleGuard("ORGANIZER"), getOrganizerOrdersController);
router.put("/:orderId/confirm", roleGuard("ORGANIZER"), confirmOrderController);
router.put("/:orderId/reject", roleGuard("ORGANIZER"), rejectOrderController);

export default router;
