import express from "express";
import {
  createReviewController,
  getEventReviewsController,
} from "../controllers/review.controller.js";
import { verifyToken, roleGuard } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createReviewSchema } from "../validations/review.validation.js";

const router = express.Router();

router.get("/event/:eventId", getEventReviewsController);
router.post("/", verifyToken, roleGuard("CUSTOMER"), validate(createReviewSchema), createReviewController);

export default router;
