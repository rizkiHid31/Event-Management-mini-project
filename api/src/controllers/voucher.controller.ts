import type { Request, Response, NextFunction } from "express";
import {
  createVoucherService,
  getVouchersByEventService,
  deleteVoucherService,
  validateVoucherService,
} from "../services/voucher.service.js";

export async function createVoucherController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const voucher = await createVoucherService(req.user!.id, req.body);
    res.status(201).json({ message: "Voucher created", data: voucher });
  } catch (error) {
    next(error);
  }
}

export async function getVouchersByEventController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const vouchers = await getVouchersByEventService(
      Number(req.params.eventId),
      req.user!.id,
    );
    res.status(200).json({ data: vouchers });
  } catch (error) {
    next(error);
  }
}

export async function deleteVoucherController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await deleteVoucherService(Number(req.params.voucherId), req.user!.id);
    res.status(200).json({ message: "Voucher deleted" });
  } catch (error) {
    next(error);
  }
}

export async function validateVoucherController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const voucher = await validateVoucherService(req.body);
    res.status(200).json({ message: "Voucher is valid", data: voucher });
  } catch (error) {
    next(error);
  }
}
