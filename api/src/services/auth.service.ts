import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { prisma } from "../lib/prisma.js";
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

  // Handle referral system
  let referredById: number | undefined;
  if (parsedInput.usedReferralCode) {
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
