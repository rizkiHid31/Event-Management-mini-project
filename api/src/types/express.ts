import type { JwtPayload } from "jsonwebtoken";

export type UserRole = "CUSTOMER" | "ORGANIZER";

export interface CustomJwtPayload extends JwtPayload {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}
