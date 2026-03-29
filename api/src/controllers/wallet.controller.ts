import type { NextFunction, Request, Response } from "express";
import {
  getWalletService,
  getWalletTransactionsService,
} from "../services/wallet.service.js";

export async function getWalletController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const wallet = await getWalletService(req.user!.id);
    res.status(200).json({ data: wallet });
  } catch (error) {
    next(error);
  }
}

export async function getWalletTransactionsController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const transactions = await getWalletTransactionsService(req.user!.id);
    res.status(200).json({ data: transactions });
  } catch (error) {
    next(error);
  }
}
