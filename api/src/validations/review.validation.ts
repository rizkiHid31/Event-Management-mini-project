import z from "zod";

export const createReviewSchema = z.object({
  eventId: z.coerce.number().int().positive("Event ID is required"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().default(""),
});
