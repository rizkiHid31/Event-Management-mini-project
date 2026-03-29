import type { NextFunction, Request, Response } from "express";
import {
  createReviewService,
  getEventReviewsService,
} from "../services/review.service.js";

export async function createReviewController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const review = await createReviewService(req.user!.id, req.body);
    res.status(201).json({ message: "Review created", data: review });
  } catch (error) {
    next(error);
  }
}

export async function getEventReviewsController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const reviews = await getEventReviewsService(Number(req.params.eventId));
    res.status(200).json({ data: reviews });
  } catch (error) {
    next(error);
  }
}
