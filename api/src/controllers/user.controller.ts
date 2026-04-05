import type { NextFunction, Request, Response } from "express";
import {
  getUserProfileService,
  updateUserProfileService,
  uploadAvatarService,
  changePasswordService,
} from "../services/user.service.js";

export async function getUserProfileController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const user = await getUserProfileService(req.user!.id);
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateUserProfileController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const user = await updateUserProfileService(req.user!.id, req.body);
    res.status(200).json({ message: "Profile updated", data: user });
  } catch (error) {
    next(error);
  }
}

export async function changePasswordController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const { currentPassword, newPassword } = req.body;
    await changePasswordService(req.user!.id, currentPassword, newPassword);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
}

export async function uploadAvatarController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    if (!req.file) throw new Error("No file uploaded");
    const user = await uploadAvatarService(req.user!.id, req.file);
    res.status(200).json({ message: "Avatar updated", data: user });
  } catch (error) {
    next(error);
  }
}
