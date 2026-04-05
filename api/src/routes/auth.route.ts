import express from "express";
import {
  loginController,
  registerController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/auth.controller.js";
import { rateLimit } from "../middlewares/rate-limit.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";

const router = express.Router();

// Stricter rate limit on auth: 20 requests per minute per IP
const authLimiter = rateLimit(60 * 1000, 20);

router.post("/register", authLimiter, validate(registerSchema), registerController);
router.post("/login", authLimiter, validate(loginSchema), loginController);
router.post("/forgot-password", authLimiter, forgotPasswordController);
router.post("/reset-password", authLimiter, resetPasswordController);

export default router;
