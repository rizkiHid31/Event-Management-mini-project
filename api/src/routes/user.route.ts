import express from "express";
import {
  getUserProfileController,
  updateUserProfileController,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);
router.get("/profile", getUserProfileController);
router.put("/profile", updateUserProfileController);

export default router;
