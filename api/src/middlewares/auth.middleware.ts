import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import type { CustomJwtPayload } from "../types/express.js";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Unauthenticated: No token provided" });
    }

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({ message: "Unauthenticated: Invalid token format" });
    }

    const payload = jwt.verify(
      accessToken,
      process.env.JWT_SECRET!,
    ) as CustomJwtPayload;

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthenticated: Token expired or invalid" });
  }
}

export function roleGuard(role: "ORGANIZER" | "CUSTOMER") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (req.user.role === role) {
      return next();
    }

    return res.status(403).json({ message: "Forbidden: Insufficient role" });
  };
}
