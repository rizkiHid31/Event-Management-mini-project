import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/app-error.js";

export async function getWalletService(userId: number) {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    return prisma.wallet.create({
      data: { userId, balance: 0, points: 0 } as any,
    });
  }

  return wallet;
}

export async function getWalletTransactionsService(userId: number) {
  // Get orders that affected wallet (both as payer and receiver)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) throw new AppError("User not found", 404);

  if (user.role === "CUSTOMER") {
    // Customer: show paid orders as debits
    const orders = await (prisma.order as any).findMany({
      where: { customerId: userId, status: "DONE" },
      include: {
        Event: { select: { id: true, title: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return orders.map((o: any) => ({
      id: o.id,
      type: "DEBIT" as const,
      amount: Number(o.totalAmount),
      description: `Ticket: ${o.Event.title}`,
      date: o.updatedAt,
    }));
  } else {
    // Organizer: show paid orders for their events as credits
    const orders = await (prisma.order as any).findMany({
      where: { Event: { organizerId: userId }, status: "DONE" },
      include: {
        Event: { select: { id: true, title: true } },
        Customer: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return orders.map((o: any) => ({
      id: o.id,
      type: "CREDIT" as const,
      amount: Number(o.totalAmount),
      description: `${o.Event.title} — ${o.Customer.name}`,
      date: o.updatedAt,
    }));
  }
}
