import type { NextFunction, Request, Response } from "express";
import { registerService, loginService } from "../services/auth.service.js";

export async function registerController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const userData = await registerService(req.body);
    res.status(201).json({ message: "User created successfully!", data: userData });
  } catch (error) {
    next(error);
  }
}

export async function loginController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const { accessToken, user } = await loginService(req.body);
    res.status(200).json({ message: "Login successful!", accessToken, user });
  } catch (error) {
    next(error);
  }
}
