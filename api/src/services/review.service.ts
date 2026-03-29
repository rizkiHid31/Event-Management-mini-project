import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";
import { createReviewSchema } from "../validations/review.validation.js";

export async function createReviewService(
  userId: number,
  input: Record<string, unknown>,
) {
  const parsed = createReviewSchema.parse(input);
  const reviewModel = prisma as any;

  const event = await prisma.event.findUnique({ where: { id: parsed.eventId } });
  if (!event) throw new AppError("Event not found", 404);

  const hasPaidOrder = await prisma.order.findFirst({
    where: { customerId: userId, eventId: parsed.eventId, status: "PAID" },
  });

  if (!hasPaidOrder) {
    throw new AppError("You must have a paid ticket to review this event", 400);
  }

  const existingReview = await reviewModel.review.findUnique({
    where: { eventId_userId: { eventId: parsed.eventId, userId } },
  });

  if (existingReview) {
    throw new AppError("You have already reviewed this event", 400);
  }

  return reviewModel.review.create({
    data: {
      eventId: parsed.eventId,
      userId,
      rating: parsed.rating,
      comment: parsed.comment,
    },
    include: {
      User: { select: { id: true, name: true, avatar: true } },
    },
  });
}

export async function getEventReviewsService(eventId: number) {
  return (prisma as any).review.findMany({
    where: { eventId },
    include: {
      User: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
