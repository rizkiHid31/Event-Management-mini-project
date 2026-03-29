import z from "zod";

export const createVoucherSchema = z.object({
  eventId: z.coerce.number().int().positive("Event ID is required"),
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must be at most 20 characters")
    .regex(/^[A-Z0-9_-]+$/, "Code must be uppercase letters, numbers, _ or -"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  discountValue: z.coerce
    .number()
    .positive("Discount value must be positive"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  maxUses: z.coerce.number().int().min(1).default(1),
});

export const validateVoucherSchema = z.object({
  code: z.string().min(1, "Voucher code is required"),
  eventId: z.coerce.number().int().positive("Event ID is required"),
});
