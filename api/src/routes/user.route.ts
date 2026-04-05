import express from "express";
import {
  getUserProfileController,
  updateUserProfileController,
  uploadAvatarController,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(verifyToken);
router.get("/profile", getUserProfileController);
router.put("/profile", updateUserProfileController);
router.post("/profile/avatar", upload.single("avatar"), uploadAvatarController);

export default router;
