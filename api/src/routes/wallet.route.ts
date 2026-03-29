import express from "express";
import {
  getWalletController,
  getWalletTransactionsController,
} from "../controllers/wallet.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);
router.get("/", getWalletController);
router.get("/transactions", getWalletTransactionsController);

export default router;
