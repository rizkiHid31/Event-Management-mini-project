import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";
import {
  createVoucherSchema,
  validateVoucherSchema,
} from "../validations/voucher.validation.js";

export async function createVoucherService(
  organizerId: number,
  input: Record<string, unknown>,
) {
  const parsed = createVoucherSchema.parse(input);

  if (parsed.endDate <= parsed.startDate) {
    throw new AppError("End date must be after start date", 400);
  }

  if (parsed.discountType === "PERCENTAGE" && parsed.discountValue > 100) {
    throw new AppError("Percentage discount cannot exceed 100", 400);
  }

  // Verify the event belongs to this organizer
  const event = await (prisma.event as any).findUnique({
    where: { id: parsed.eventId, deletedAt: null },
  });

  if (!event) throw new AppError("Event not found", 404);
  if (event.organizerId !== organizerId) {
    throw new AppError("You can only create vouchers for your own events", 403);
  }

  // Ensure code is unique (Prisma will also catch this, but give a nicer error)
  const existing = await (prisma.voucher as any).findUnique({
    where: { code: parsed.code },
  });
  if (existing) throw new AppError("Voucher code already exists", 409);

  return (prisma.voucher as any).create({
    data: {
      eventId: parsed.eventId,
      organizerId,
      code: parsed.code,
      discountType: parsed.discountType,
      discountValue: parsed.discountValue,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      maxUses: parsed.maxUses,
    },
  });
}

export async function getVouchersByEventService(
  eventId: number,
  organizerId: number,
) {
  const event = await (prisma.event as any).findUnique({
    where: { id: eventId, deletedAt: null },
  });

  if (!event) throw new AppError("Event not found", 404);
  if (event.organizerId !== organizerId) {
    throw new AppError("Forbidden", 403);
  }

  return (prisma.voucher as any).findMany({
    where: { eventId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteVoucherService(
  voucherId: number,
  organizerId: number,
) {
  const voucher = await (prisma.voucher as any).findUnique({
    where: { id: voucherId, deletedAt: null },
  });

  if (!voucher) throw new AppError("Voucher not found", 404);
  if (voucher.organizerId !== organizerId) {
    throw new AppError("Forbidden", 403);
  }

  return (prisma.voucher as any).update({
    where: { id: voucherId },
    data: { deletedAt: new Date() },
  });
}

export async function validateVoucherService(
  input: Record<string, unknown>,
) {
  const parsed = validateVoucherSchema.parse(input);
  const now = new Date();

  const voucher = await (prisma.voucher as any).findUnique({
    where: { code: parsed.code, deletedAt: null },
  });

  if (!voucher) throw new AppError("Invalid voucher code", 404);
  if (voucher.eventId !== parsed.eventId) {
    throw new AppError("Voucher is not valid for this event", 400);
  }
  if (now < voucher.startDate) {
    throw new AppError("Voucher promotion has not started yet", 400);
  }
  if (now > voucher.endDate) {
    throw new AppError("Voucher promotion has expired", 400);
  }
  if (voucher.usedCount >= voucher.maxUses) {
    throw new AppError("Voucher has reached its maximum usage limit", 400);
  }

  return {
    id: voucher.id,
    code: voucher.code,
    discountType: voucher.discountType,
    discountValue: Number(voucher.discountValue),
    endDate: voucher.endDate,
  };
}
