import z from "zod";

export const createOrderSchema = z.object({
  eventId: z.coerce.number().int().positive("Event ID is required"),
  quantity: z.coerce.number().int().min(1).default(1),
  voucherCode: z.string().optional(),
  pointsUsed: z.coerce.number().int().min(0).default(0),
  paymentMethod: z.enum(["TRANSFER", "WALLET", "POINTS"]).default("TRANSFER"),
});
