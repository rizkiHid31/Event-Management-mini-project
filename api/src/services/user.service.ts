import fs from "fs/promises";
import bcrypt from "bcryptjs";
import { cloudinary } from "../lib/cloudinery.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";

export async function getOrganizersService() {
  const now = new Date();

  const organizers = await (prisma.user as any).findMany({
    where: {
      role: "ORGANIZER",
      deletedAt: null,
      Events: {
        some: {
          startDate: { gte: now },
          deletedAt: null,
        },
      },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      Events: {
        where: { deletedAt: null },
        select: {
          id: true,
          title: true,
          slug: true,
          image: true,
          category: true,
          startDate: true,
          location: true,
          isFree: true,
          price: true,
          Reviews: { select: { rating: true } },
        },
        orderBy: { startDate: "asc" },
      },
    },
  });

  return organizers.map((org: any) => {
    const upcomingEvents = org.Events.filter(
      (e: any) => new Date(e.startDate) >= now,
    ).map(({ Reviews, ...e }: any) => e);

    const allReviews = org.Events.flatMap((e: any) => e.Reviews);
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          allReviews.length
        : 0;

    return {
      id: org.id,
      name: org.name,
      avatar: org.avatar,
      avgRating: Math.round(avgRating * 10) / 10,
      totalEvents: org.Events.length,
      upcomingEvents,
    };
  });
}

export async function getOrganizerByIdService(organizerId: number) {
  const now = new Date();

  const org = await (prisma.user as any).findFirst({
    where: { id: organizerId, role: "ORGANIZER", deletedAt: null },
    select: {
      id: true,
      name: true,
      avatar: true,
      bio: true,
      createdAt: true,
      Events: {
        where: { deletedAt: null },
        select: {
          id: true,
          title: true,
          slug: true,
          image: true,
          category: true,
          startDate: true,
          endDate: true,
          location: true,
          isFree: true,
          price: true,
          capacity: true,
          Reviews: { select: { rating: true } },
          _count: { select: { Orders: true, Reviews: true } },
        },
        orderBy: { startDate: "asc" },
      },
    },
  });

  if (!org) throw new AppError("Organizer not found", 404);

  const allReviews = org.Events.flatMap((e: any) => e.Reviews);
  const avgRating =
    allReviews.length > 0
      ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length
      : 0;

  const upcomingEvents = org.Events.filter((e: any) => new Date(e.startDate) >= now);
  const pastEvents = org.Events.filter((e: any) => new Date(e.startDate) < now);

  const mapEvent = ({ Reviews, ...e }: any) => ({
    ...e,
    avgRating:
      e.Reviews?.length > 0
        ? Math.round((e.Reviews.reduce((s: number, r: any) => s + r.rating, 0) / e.Reviews.length) * 10) / 10
        : 0,
  });

  return {
    id: org.id,
    name: org.name,
    avatar: org.avatar,
    bio: org.bio,
    createdAt: org.createdAt,
    avgRating: Math.round(avgRating * 10) / 10,
    totalEvents: org.Events.length,
    totalReviews: allReviews.length,
    upcomingEvents: upcomingEvents.map(mapEvent),
    pastEvents: pastEvents.map(mapEvent),
  };
}

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

export async function changePasswordService(
  userId: number,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new AppError("Current password is incorrect", 400);

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
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
