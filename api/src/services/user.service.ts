import fs from "fs/promises";
import { cloudinary } from "../lib/cloudinery.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";

export async function getUserProfileService(userId: number) {
  const userModel = prisma.user as any;

  const user = await userModel.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      referralCode: true,
      avatar: true,
      phone: true,
      bio: true,
      createdAt: true,
      Wallet: { select: { balance: true, points: true } },
      _count: {
        select: {
          Events: true,
          Orders: true,
          Reviews: true,
          Referrals: true,
        },
      },
    },
  });

  if (!user) throw new AppError("User not found", 404);

  console.log("[getUserProfile] userId:", userId, "Wallet:", user.Wallet);

  return user;
}

export async function updateUserProfileService(
  userId: number,
  data: { name?: string; phone?: string; bio?: string },
) {
  return (prisma.user as any).update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      referralCode: true,
      avatar: true,
      phone: true,
      bio: true,
    },
  });
}

export async function uploadAvatarService(
  userId: number,
  file: Express.Multer.File,
) {
  let avatarUrl: string;
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "avatars",
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    });
    avatarUrl = result.secure_url;
  } finally {
    await fs.unlink(file.path).catch(() => {});
  }

  return (prisma.user as any).update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      referralCode: true,
      avatar: true,
      phone: true,
      bio: true,
    },
  });
}
