import type { NextFunction, Request, Response } from "express";
import {
  getUserProfileService,
  updateUserProfileService,
  uploadAvatarService,
  changePasswordService,
  getOrganizersService,
  getOrganizerByIdService,
} from "../services/user.service.js";

export async function getOrganizersController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const data = await getOrganizersService();
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getOrganizerByIdController(
  req: Request, res: Response, next: NextFunction,
) {
  try {
    const data = await getOrganizerByIdService(Number(req.params.id));
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

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
