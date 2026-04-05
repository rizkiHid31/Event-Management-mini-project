import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";
import { AppError } from "../utils/app-error.js";
import { sendEmail } from "../utils/email.js";

function generateReferralCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase();
  const suffix = String(Date.now()).slice(-6);
  return `${prefix}${suffix}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function registerService(userInput: Record<string, unknown>) {
  const parsedInput = registerSchema.parse(userInput);

  const existingUser = await prisma.user.findUnique({
    where: { email: parsedInput.email },
  });

  if (existingUser) {
    throw new AppError("Email already been used", 400);
  }

  const referralCode = generateReferralCode(parsedInput.name);

  // Handle referral system — only for CUSTOMER role
  let referredById: number | undefined;
  if (parsedInput.role === "CUSTOMER" && parsedInput.usedReferralCode) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: parsedInput.usedReferralCode },
    });
    if (referrer) {
      referredById = referrer.id;
      // Credit referrer wallet
      await prisma.wallet.upsert({
        where: { userId: referrer.id },
        update: { balance: { increment: 10000 } }, // Rp 10,000 bonus
        create: { userId: referrer.id, balance: 10000 },
      });
    }
  }

  const userData = await prisma.user.create({
    data: {
      email: parsedInput.email,
      name: parsedInput.name,
      password: await bcrypt.hash(parsedInput.password, 10),
      role: parsedInput.role,
      referralCode,
      ...(referredById && { referredById }),
    },
  });

  // Create wallet for user
  await prisma.wallet.create({
    data: { userId: userData.id, balance: referredById ? 10000 : 0 },
  });

  // Send welcome email (non-blocking)
  sendEmail({
    from: "noreply@rizkihidayat.my.id",
    to: parsedInput.email,
    subject: "Welcome!",
    emailData: {
      name: parsedInput.name,
      referralCode,
    },
  }).catch((err) => console.error("Email send failed:", err));

  // Don't return password
  const { password: _, ...safeUser } = userData;
  return safeUser;
}

export async function forgotPasswordService(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // Silent — don't reveal whether email exists

  const token = crypto.randomBytes(32).toString("hex");
  await redis.set(`pwd_reset:${token}`, String(user.id), "EX", 3600);

  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/reset-password?token=${token}`;

  sendEmail({
    from: "noreply@rizkihidayat.my.id",
    to: email,
    subject: "Reset your Master Event password",
    template: "password-reset",
    emailData: { name: user.name, resetLink },
  }).catch(() => {});
}

export async function resetPasswordService(token: string, newPassword: string) {
  const userId = await redis.get(`pwd_reset:${token}`);
  if (!userId) throw new AppError("Invalid or expired reset link", 400);

  const hashed = await bcrypt.hash(newPassword, 10);
  await (prisma.user as any).update({
    where: { id: Number(userId) },
    data: { password: hashed },
  });
  await redis.del(`pwd_reset:${token}`);
}

export async function loginService(userInput: {
  email: string;
  password: string;
}) {
  const parsedInput = loginSchema.parse(userInput);

  const existingUser = await prisma.user.findUnique({
    where: { email: parsedInput.email },
  });

  if (!existingUser) {
    throw new AppError("User not found. Please register first!", 404);
  }

  const isValidPassword = await bcrypt.compare(
    parsedInput.password,
    existingUser.password,
  );

  if (!isValidPassword) {
    throw new AppError("Invalid password. Please try again!", 400);
  }

  const payload = {
    id: existingUser.id,
    email: existingUser.email,
    name: existingUser.name,
    role: existingUser.role,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "24h",
  });

  // BUG FIX: Don't return password hash to client
  const { password: _, ...safeUser } = existingUser;
  return { accessToken, user: safeUser };
}
