import type { Request, Response, NextFunction } from "express";
import { ZodError, z } from "zod";
import { AppError } from "../utils/app-error.js";
import { logger } from "../utils/logger.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const message =
    err instanceof Error ? err.message : "Unknown error occurred";
  logger.error(message);
  if (err instanceof Error && err.stack) console.error(err.stack);

  if (err instanceof AppError) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Unknown error" });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ message: "Validation error", errors: z.flattenError(err) });
  }

  return res.status(500).json({
    message: process.env.NODE_ENV === "production" ? "Internal server error" : (err instanceof Error ? err.message : "Internal server error"),
  });
}
