import type { Request, Response, NextFunction } from "express";
import {
  createOrderService,
  uploadPaymentProofService,
  cancelOrderService,
  confirmOrderService,
  rejectOrderService,
  getCustomerOrdersService,
  getOrganizerOrdersService,
} from "../services/order.service.js";

export async function createOrderController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const order = await createOrderService(req.user!.id, req.body);
    res.status(201).json({ message: "Order created", data: order });
  } catch (error) {
    next(error);
  }
}

export async function uploadPaymentProofController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    if (!req.file) throw new Error("Payment proof image is required");
    const order = await uploadPaymentProofService(
      Number(req.params.orderId),
      req.user!.id,
      req.file,
    );
    res.status(200).json({ message: "Payment proof uploaded", data: order });
  } catch (error) {
    next(error);
  }
}

export async function cancelOrderController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const order = await cancelOrderService(Number(req.params.orderId), req.user!.id);
    res.status(200).json({ message: "Order cancelled", data: order });
  } catch (error) {
    next(error);
  }
}

export async function confirmOrderController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const order = await confirmOrderService(Number(req.params.orderId), req.user!.id);
    res.status(200).json({ message: "Order confirmed", data: order });
  } catch (error) {
    next(error);
  }
}

export async function rejectOrderController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const order = await rejectOrderService(Number(req.params.orderId), req.user!.id);
    res.status(200).json({ message: "Order rejected", data: order });
  } catch (error) {
    next(error);
  }
}

export async function getOrganizerOrdersController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const orders = await getOrganizerOrdersService(
      req.user!.id,
      req.query.status as string | undefined,
    );
    res.status(200).json({ data: orders });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerOrdersController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const orders = await getCustomerOrdersService(req.user!.id);
    res.status(200).json({ data: orders });
  } catch (error) {
    next(error);
  }
}
