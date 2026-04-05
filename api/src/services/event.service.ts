import fs from "fs/promises";
import { Prisma } from "../generated/prisma/client.js";
import { cloudinary } from "../lib/cloudinery.js";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";
import { AppError } from "../utils/app-error.js";
import {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
} from "../validations/event.validation.js";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Date.now().toString(36);
}

export async function createEventService(
  organizerId: number,
  data: Record<string, unknown>,
  file?: Express.Multer.File,
) {
  const parsed = createEventSchema.parse(data);

  if (parsed.endDate <= parsed.startDate) {
    throw new AppError("End date must be after start date", 400);
  }

  let imageUrl: string | undefined;

  try {
    if (file) {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "events",
      });
      imageUrl = uploadResult.secure_url;
    }

    let event;
    try {
      event = await (prisma.event as any).create({
        data: {
          title: parsed.title,
          slug: slugify(parsed.title),
          description: parsed.description,
          location: parsed.location,
          price: parsed.price,
          category: parsed.category,
          startDate: parsed.startDate,
          endDate: parsed.endDate,
          capacity: parsed.capacity,
          isFree: parsed.isFree ?? parsed.price === 0,
          image: imageUrl,
          organizerId,
        },
        include: {
          User: { select: { id: true, name: true, email: true } },
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new AppError("Event dengan judul tersebut sudah ada", 409);
      }
      throw err;
    }

    redis.keys("events:*").then((keys) => { if (keys.length) redis.del(...keys); }).catch(() => {});
    return event;
  } finally {
    if (file) {
      await fs.unlink(file.path).catch(() => {});
    }
  }
}

export async function getEventsService(query: Record<string, unknown>) {
  const parsed = eventQuerySchema.parse(query);
  const { search, category, location, minPrice, maxPrice, startDate, isFree, page, limit, sortBy, sortOrder } = parsed;

  const cacheKey = `events:${JSON.stringify(parsed)}`;
  const cached = await redis.get(cacheKey).catch(() => null);
  if (cached) {
    return JSON.parse(cached);
  }

  const where: Record<string, any> = { deletedAt: null, endDate: { gt: new Date() } };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) where.category = category;
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (isFree !== undefined) where.isFree = isFree;

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {} as Record<string, any>;
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (startDate) {
    where.startDate = { gte: startDate };
  }

  const skip = (page - 1) * limit;
  const eventModel = prisma.event as any;

  const [events, total] = await Promise.all([
    eventModel.findMany({
      where,
      include: {
        User: { select: { id: true, name: true } },
        _count: { select: { Orders: true, Reviews: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    eventModel.count({ where }),
  ]);

  const result = {
    data: events,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  await redis.set(cacheKey, JSON.stringify(result), "EX", 60).catch(() => {});
  return result;
}

export async function getEventBySlugService(slug: string) {
  const eventModel = prisma.event as any;

  const event = await eventModel.findUnique({
    where: { slug, deletedAt: null },
    include: {
      User: { select: { id: true, name: true, email: true, avatar: true } },
      EventImages: true,
      Reviews: {
        include: { User: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { Reviews: true } },
    },
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  const reviewModel = prisma as any;
  const [avgRating, soldAggregate] = await Promise.all([
    reviewModel.review.aggregate({
      where: { eventId: event.id },
      _avg: { rating: true },
    }),
    prisma.order.aggregate({
      where: { eventId: event.id, status: { notIn: ["EXPIRED", "REJECTED", "CANCELLED"] } },
      _sum: { quantity: true },
    }),
  ]);

  const ticketsSold = soldAggregate._sum.quantity ?? 0;
  const availableSeats = event.capacity - ticketsSold;

  return {
    ...event,
    avgRating: avgRating._avg.rating || 0,
    ticketsSold,
    availableSeats: availableSeats > 0 ? availableSeats : 0,
  };
}

export async function getEventByIdService(id: number) {
  const eventModel = prisma.event as any;

  const event = await eventModel.findUnique({
    where: { id, deletedAt: null },
    include: {
      User: { select: { id: true, name: true, email: true } },
      _count: { select: { Orders: { where: { status: { notIn: ["EXPIRED", "REJECTED", "CANCELLED"] } } }, Reviews: true } },
    },
  });

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  return event;
}

export async function updateEventService(
  eventId: number,
  organizerId: number,
  data: Record<string, unknown>,
  file?: Express.Multer.File,
) {
  const eventModel = prisma.event as any;
  const event = await eventModel.findUnique({ where: { id: eventId } });

  if (!event) throw new AppError("Event not found", 404);
  if (event.organizerId !== organizerId) throw new AppError("Forbidden", 403);

  const parsed = updateEventSchema.parse(data);

  let imageUrl: string | undefined;

  try {
    if (file) {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "events",
      });
      imageUrl = uploadResult.secure_url;
    }

    // Build update data without undefined values
    const updateData: Record<string, any> = {};
    if (parsed.title !== undefined) updateData.title = parsed.title;
    if (parsed.description !== undefined) updateData.description = parsed.description;
    if (parsed.location !== undefined) updateData.location = parsed.location;
    if (parsed.price !== undefined) {
      updateData.price = parsed.price;
      updateData.isFree = parsed.price === 0;
    }
    if (parsed.category !== undefined) updateData.category = parsed.category;
    if (parsed.startDate !== undefined) updateData.startDate = parsed.startDate;
    if (parsed.endDate !== undefined) updateData.endDate = parsed.endDate;
    if (parsed.capacity !== undefined) updateData.capacity = parsed.capacity;
    if (parsed.isFree !== undefined) updateData.isFree = parsed.isFree;
    if (imageUrl) updateData.image = imageUrl;

    const updated = await eventModel.update({
      where: { id: eventId },
      data: updateData,
    });

    redis.keys("events:*").then((keys) => { if (keys.length) redis.del(...keys); }).catch(() => {});
    return updated;
  } finally {
    if (file) {
      await fs.unlink(file.path).catch(() => {});
    }
  }
}

export async function deleteEventService(eventId: number, organizerId: number) {
  const eventModel = prisma.event as any;
  const event = await eventModel.findUnique({ where: { id: eventId } });

  if (!event) throw new AppError("Event not found", 404);
  if (event.organizerId !== organizerId) throw new AppError("Forbidden", 403);

  await eventModel.update({
    where: { id: eventId },
    data: { deletedAt: new Date() },
  });

  redis.keys("events:*").then((keys) => { if (keys.length) redis.del(...keys); }).catch(() => {});
  return { message: "Event deleted" };
}

export async function getOrganizerEventsService(organizerId: number) {
  const eventModel = prisma.event as any;

  return eventModel.findMany({
    where: { organizerId, deletedAt: null },
    include: {
      _count: { select: { Orders: true, Reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrganizerChartService(organizerId: number, groupBy = "month") {
  const orders = await (prisma.order as any).findMany({
    where: {
      Event: { organizerId },
      status: { in: ["DONE", "PAID", "WAITING_CONFIRMATION"] },
    },
    select: { createdAt: true, totalAmount: true, quantity: true },
    orderBy: { createdAt: "asc" },
  });

  const map = new Map<string, { orders: number; revenue: number; tickets: number }>();

  for (const o of orders) {
    const d = new Date(o.createdAt);
    let key: string;
    if (groupBy === "year") {
      key = `${d.getFullYear()}`;
    } else if (groupBy === "day") {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }
    const entry = map.get(key) ?? { orders: 0, revenue: 0, tickets: 0 };
    entry.orders += 1;
    entry.revenue += Number(o.totalAmount);
    entry.tickets += o.quantity;
    map.set(key, entry);
  }

  return Array.from(map.entries()).map(([period, data]) => ({ period, ...data }));
}

export async function getEventAttendeesService(eventId: number, organizerId: number) {
  const event = await (prisma.event as any).findUnique({ where: { id: eventId, deletedAt: null } });
  if (!event) throw new AppError("Event not found", 404);
  if (event.organizerId !== organizerId) throw new AppError("Forbidden", 403);

  return (prisma.order as any).findMany({
    where: { eventId, status: { in: ["DONE", "PAID", "WAITING_CONFIRMATION"] } },
    include: { Customer: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrganizerStatsService(organizerId: number) {
  const eventModel = prisma.event as any;
  const reviewModel = prisma as any;

  const [totalEvents, totalOrders, revenue, avgRating] = await Promise.all([
    eventModel.count({ where: { organizerId, deletedAt: null } }),
    prisma.order.count({
      where: { Event: { organizerId }, status: "PAID" } as any,
    }),
    prisma.order.aggregate({
      where: { Event: { organizerId }, status: "PAID" } as any,
      _sum: { totalAmount: true },
    }),
    reviewModel.review.aggregate({
      where: { Event: { organizerId } },
      _avg: { rating: true },
    }),
  ]);

  return {
    totalEvents,
    totalOrders,
    totalRevenue: revenue._sum.totalAmount || 0,
    avgRating: avgRating._avg.rating || 0,
  };
}
