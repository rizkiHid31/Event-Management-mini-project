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
