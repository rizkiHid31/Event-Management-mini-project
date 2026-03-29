import express from "express";
import {
  createEventController,
  getEventsController,
  getEventBySlugController,
  getEventByIdController,
  updateEventController,
  deleteEventController,
  getOrganizerEventsController,
  getOrganizerStatsController,
} from "../controllers/event.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
import { roleGuard, verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public
router.get("/", getEventsController);
router.get("/detail/:slug", getEventBySlugController);
router.get("/id/:id", getEventByIdController);

// Organizer only
router.use(verifyToken);
router.get("/organizer/my-events", roleGuard("ORGANIZER"), getOrganizerEventsController);
router.get("/organizer/stats", roleGuard("ORGANIZER"), getOrganizerStatsController);
router.post("/", roleGuard("ORGANIZER"), upload.single("image"), createEventController);
router.put("/:id", roleGuard("ORGANIZER"), upload.single("image"), updateEventController);
router.delete("/:id", roleGuard("ORGANIZER"), deleteEventController);

export default router;
