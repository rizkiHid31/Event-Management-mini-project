import z from "zod";

const RoleEnum = z.enum(["CUSTOMER", "ORGANIZER"]);

export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase character")
    .regex(/[A-Z]/, "Password must contain at least 1 UPPERCASE character")
    .regex(/[0-9]/, "Password must contain at least 1 number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 symbol"),
  role: RoleEnum.optional().default("CUSTOMER"),
  referralCode: z
    .string()
    .min(4, "Referral code must be at least 4 characters")
    .optional(),
  usedReferralCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password must be filled"),
});
