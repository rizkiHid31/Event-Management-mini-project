import "dotenv/config";

import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import path from "node:path";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import eventRoutes from "./routes/event.route.js";
import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.route.js";
import voucherRoutes from "./routes/voucher.route.js";

import { notFound } from "./middlewares/not-found.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { rateLimit } from "./middlewares/rate-limit.middleware.js";
import { logger } from "./utils/logger.js";

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 3000;

// Global middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://event-management-mini-project-mto2.vercel.app",
      "https://event-master-mini-project-mto2.vercel.app",
      ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()) : []),
    ],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use("/public", express.static(path.join(process.cwd(), "public")));

// Global rate limit: 200 requests per minute per IP
app.use(rateLimit(60 * 1000, 200));

/*-----CHECK API HEALTH-------*/
app.get("/api/health", (_req: Request, res: Response) => {
  res
    .status(200)
    .json({ message: "API is running!", uptime: process.uptime() });
});

/*-----ROUTES-------*/
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/vouchers", voucherRoutes);

/*-----ERROR HANDLING-------*/
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app;
