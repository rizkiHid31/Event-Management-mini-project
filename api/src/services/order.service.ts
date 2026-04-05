import fs from "node:fs/promises";
import { prisma } from "../lib/prisma.js";
import { cloudinary } from "../lib/cloudinery.js";
import { AppError } from "../utils/app-error.js";
import { createOrderSchema } from "../validations/order.validation.js";
import { sendEmail } from "../utils/email.js";
import { logger } from "../utils/logger.js";

export async function createOrderService(
  customerId: number,
  input: Record<string, unknown>,
) {
  const parsed = createOrderSchema.parse(input);
  const eventModel = prisma.event as any;

  const event = await eventModel.findUnique({
    where: { id: parsed.eventId, deletedAt: null },
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  const soldAggregate = await prisma.order.aggregate({
    where: { eventId: parsed.eventId, status: { notIn: ["EXPIRED", "REJECTED", "CANCELLED"] } },
    _sum: { quantity: true },
  });
  const ticketsSold = soldAggregate._sum.quantity ?? 0;
  if (ticketsSold + parsed.quantity > event.capacity) {
    throw new AppError("Not enough tickets available", 400);
  }

  if (event.organizerId === customerId) {
    throw new AppError("Cannot order your own event", 400);
  }

  const paymentMethod = parsed.paymentMethod ?? "TRANSFER";
  const baseAmount = Number(event.price) * parsed.quantity;
  let discountAmount = 0;
  let voucherId: number | undefined;
  const pointsUsed = parsed.pointsUsed ?? 0;

  if (parsed.voucherCode) {
    const now = new Date();
    const voucher = await (prisma.voucher as any).findUnique({
      where: { code: parsed.voucherCode, deletedAt: null },
    });

    if (!voucher) throw new AppError("Invalid voucher code", 400);
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

    if (voucher.discountType === "PERCENTAGE") {
      discountAmount = (baseAmount * Number(voucher.discountValue)) / 100;
    } else {
      discountAmount = Math.min(Number(voucher.discountValue), baseAmount);
    }
    voucherId = voucher.id;
  }

  const afterVoucher = Math.max(0, baseAmount - discountAmount);

  // Validate and apply points (for TRANSFER method with points toggle)
  if (pointsUsed > 0 && paymentMethod === "TRANSFER") {
    const wallet = await prisma.wallet.findUnique({ where: { userId: customerId } });
    const availablePoints = wallet?.points ?? 0;
    if (pointsUsed > availablePoints) {
      throw new AppError(`Insufficient points. Available: ${availablePoints}`, 400);
    }
    if (pointsUsed > afterVoucher) {
      throw new AppError(`Points used cannot exceed the order total`, 400);
    }
  }

  // WALLET payment: validate customer balance
  if (paymentMethod === "WALLET") {
    const wallet = await prisma.wallet.findUnique({ where: { userId: customerId } });
    const balance = Number(wallet?.balance ?? 0);
    if (balance < afterVoucher) {
      throw new AppError(`Insufficient wallet balance. Available: ${balance}`, 400);
    }
  }

  // POINTS payment: validate customer points (points cover the full remaining amount)
  let actualPointsUsed = paymentMethod === "TRANSFER" ? pointsUsed : 0;
  if (paymentMethod === "POINTS") {
    const wallet = await prisma.wallet.findUnique({ where: { userId: customerId } });
    const availablePoints = wallet?.points ?? 0;
    actualPointsUsed = Math.ceil(afterVoucher);
    if (availablePoints < actualPointsUsed) {
      throw new AppError(`Insufficient points. Available: ${availablePoints}`, 400);
    }
  }

  const totalAmount = paymentMethod === "POINTS"
    ? 0
    : Math.max(0, baseAmount - discountAmount - actualPointsUsed);

  const orderStatus = paymentMethod === "TRANSFER" ? "WAITING_PAYMENT" : "DONE";

  const order = await (prisma.$transaction as any)(async (tx: any) => {
    // Deduct points for TRANSFER + points toggle
    if (actualPointsUsed > 0 && paymentMethod === "TRANSFER") {
      await tx.wallet.update({
        where: { userId: customerId },
        data: { points: { decrement: actualPointsUsed } },
      });
    }

    // WALLET payment: deduct customer balance + credit organizer
    if (paymentMethod === "WALLET" && afterVoucher > 0) {
      await tx.wallet.upsert({
        where: { userId: customerId },
        update: { balance: { decrement: afterVoucher } },
        create: { userId: customerId, balance: 0, points: 0 },
      });
      await tx.wallet.upsert({
        where: { userId: event.organizerId },
        update: { balance: { increment: afterVoucher } },
        create: { userId: event.organizerId, balance: afterVoucher, points: 0 },
      });
    }

    // POINTS payment: deduct customer points + credit organizer
    if (paymentMethod === "POINTS" && actualPointsUsed > 0) {
      await tx.wallet.upsert({
        where: { userId: customerId },
        update: { points: { decrement: actualPointsUsed } },
        create: { userId: customerId, balance: 0, points: 0 },
      });
      await tx.wallet.upsert({
        where: { userId: event.organizerId },
        update: { balance: { increment: afterVoucher } },
        create: { userId: event.organizerId, balance: afterVoucher, points: 0 },
      });
    }

    const newOrder = await tx.order.create({
      data: {
        eventId: parsed.eventId,
        customerId,
        quantity: parsed.quantity,
        totalAmount,
        discountAmount,
        pointsUsed: actualPointsUsed,
        paymentMethod,
        status: orderStatus,
        ...(voucherId ? { voucherId } : {}),
      },
      include: {
        Event: { select: { id: true, title: true, startDate: true, location: true } },
      },
    });

    if (voucherId) {
      await tx.voucher.update({
        where: { id: voucherId },
        data: { usedCount: { increment: 1 } },
      });
    }

    return newOrder;
  });

  return order;
}

export async function uploadPaymentProofService(
  orderId: number,
  customerId: number,
  file: Express.Multer.File,
) {
  const orderModel = prisma.order as any;

  const order = await orderModel.findUnique({
    where: { id: orderId },
    include: { Event: true },
  });

  if (!order) throw new AppError("Order not found", 404);
  if (order.customerId !== customerId) throw new AppError("Forbidden", 403);
  if (order.status !== "WAITING_PAYMENT") {
    throw new AppError("Payment proof can only be uploaded for pending orders", 400);
  }

  // Check order hasn't expired (2 hours)
  const twoHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 2);
  if (order.createdAt < twoHoursAgo) {
    throw new AppError("Order has expired", 400);
  }

  let proofUrl: string;
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "payment-proofs",
    });
    proofUrl = result.secure_url;
  } finally {
    await fs.unlink(file.path).catch(() => {});
  }

  return orderModel.update({
    where: { id: orderId },
    data: { paymentProof: proofUrl, status: "WAITING_CONFIRMATION" },
    include: {
      Event: { select: { id: true, title: true, startDate: true, location: true } },
    },
  });
}

export async function cancelOrderService(orderId: number, customerId: number) {
  const orderModel = prisma.order as any;
  const order = await orderModel.findUnique({ where: { id: orderId } });

  if (!order) throw new AppError("Order not found", 404);
  if (order.customerId !== customerId) throw new AppError("Forbidden", 403);
  if (order.status !== "WAITING_PAYMENT") throw new AppError("Only pending orders can be cancelled", 400);

  return prisma.$transaction(async (tx: any) => {
    if (order.pointsUsed > 0) {
      await tx.wallet.update({
        where: { userId: customerId },
        data: { points: { increment: order.pointsUsed } },
      });
    }
    return tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
  });
}

export async function confirmOrderService(orderId: number, organizerId: number) {
  const orderModel = prisma.order as any;

  const order = await orderModel.findUnique({
    where: { id: orderId },
    include: { Event: true },
  });

  if (!order) throw new AppError("Order not found", 404);
  if (order.Event.organizerId !== organizerId) throw new AppError("Forbidden", 403);
  if (order.status !== "WAITING_CONFIRMATION") {
    throw new AppError("Only orders waiting for confirmation can be confirmed", 400);
  }

  const totalAmount = Number(order.totalAmount);

  // 1% of paid amount as points reward for customer
  const pointsEarned = Math.floor(totalAmount * 0.01);

  console.log("[confirmOrder] totalAmount:", totalAmount, "pointsEarned:", pointsEarned, "customerId:", order.customerId);

  // Credit organizer wallet
  await (prisma.wallet as any).upsert({
    where: { userId: organizerId },
    update: { balance: { increment: totalAmount } },
    create: { userId: organizerId, balance: totalAmount, points: 0 },
  });

  // Credit customer points
  if (pointsEarned > 0) {
    await (prisma.wallet as any).upsert({
      where: { userId: order.customerId },
      update: { points: { increment: pointsEarned } },
      create: { userId: order.customerId, balance: 0, points: pointsEarned },
    });
    console.log("[confirmOrder] points credited:", pointsEarned, "to userId:", order.customerId);
  }

  return (prisma.order as any).update({
    where: { id: orderId },
    data: { status: "DONE" },
    include: {
      Event: { select: { id: true, title: true, startDate: true, location: true } },
      Customer: { select: { name: true, email: true } },
    },
  });
}

export async function rejectOrderService(orderId: number, organizerId: number) {
  const orderModel = prisma.order as any;

  const order = await orderModel.findUnique({
    where: { id: orderId },
    include: { Event: true },
  });

  if (!order) throw new AppError("Order not found", 404);
  if (order.Event.organizerId !== organizerId) throw new AppError("Forbidden", 403);
  if (order.status !== "WAITING_CONFIRMATION") {
    throw new AppError("Only orders waiting for confirmation can be rejected", 400);
  }

  const totalAmount = Number(order.totalAmount);
  const isTransfer = order.paymentMethod === "TRANSFER";

  logger.info(`[rejectOrder] orderId=${orderId} paymentMethod=${order.paymentMethod} totalAmount=${totalAmount} pointsUsed=${order.pointsUsed} customerId=${order.customerId}`);

  // Build single wallet update to avoid double-hit on same row
  const walletRefund: Record<string, any> = {};
  if (isTransfer && totalAmount > 0) walletRefund.balance = { increment: totalAmount };
  if (order.pointsUsed > 0) walletRefund.points = { increment: order.pointsUsed };

  logger.info(`[rejectOrder] walletRefund=${JSON.stringify(walletRefund)}`);

  const walletModel = prisma.wallet as any;

  if (Object.keys(walletRefund).length > 0) {
    try {
      await walletModel.update({
        where: { userId: order.customerId },
        data: walletRefund,
      });
      logger.info(`[rejectOrder] wallet updated OK for customerId=${order.customerId}`);
    } catch (err: any) {
      logger.error(`[rejectOrder] wallet update FAILED: ${err.message}`);
      throw err;
    }
  } else {
    logger.info(`[rejectOrder] no wallet update needed`);
  }

  return (prisma.order as any).update({
    where: { id: orderId },
    data: { status: "REJECTED" },
    include: {
      Event: { select: { id: true, title: true, startDate: true, location: true } },
      Customer: { select: { name: true, email: true } },
    },
  });
}

export async function getOrganizerOrdersService(organizerId: number, status?: string) {
  return (prisma.order as any).findMany({
    where: {
      Event: { organizerId },
      ...(status ? { status } : {}),
    },
    include: {
      Event: { select: { id: true, title: true, slug: true, startDate: true, location: true } },
      Customer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomerOrdersService(customerId: number) {
  return (prisma.order as any).findMany({
    where: { customerId },
    include: {
      Event: {
        select: { id: true, title: true, slug: true, image: true, startDate: true, location: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function expireUnpaidOrdersService() {
  const tenMinutesAgo = new Date(Date.now() - 1000 * 60 * 60 * 2);

  return prisma.order.updateMany({
    where: {
      status: "WAITING_PAYMENT",
      createdAt: { lte: tenMinutesAgo },
    },
    data: { status: "EXPIRED" },
  });
}

export async function expireUnpaidSingleOrderService(orderId: number) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order || order.status !== "WAITING_PAYMENT") return null;

  return prisma.order.update({
    where: { id: orderId },
    data: { status: "EXPIRED" },
  });
}
