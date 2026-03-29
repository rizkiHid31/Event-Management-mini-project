import type { Request, Response, NextFunction } from "express";
import type z from "zod";

export function validate(schema: z.ZodType, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      (req as any)[source] = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
}
