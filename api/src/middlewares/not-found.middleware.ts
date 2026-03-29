import type { Request, Response } from "express";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({
    message: `Route ${_req.method} ${_req.url} not found`,
  });
}
