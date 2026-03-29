import z from "zod";

const EventCategoryEnum = z.enum([
  "MUSIC", "SPORTS", "TECHNOLOGY", "BUSINESS",
  "FOOD", "ART", "EDUCATION", "OTHER",
]);

export const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional().default(""),
  location: z.string().min(1, "Location is required"),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  category: EventCategoryEnum.optional().default("OTHER"),
  startDate: z.coerce.date({ message: "Valid start date is required" }),
  endDate: z.coerce.date({ message: "Valid end date is required" }),
  capacity: z.coerce.number().int().min(1, "Capacity must be >= 1").default(100),
  isFree: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional().default(false),
});

export const updateEventSchema = createEventSchema.partial();

export const eventQuerySchema = z.object({
  search: z.string().optional(),
  category: EventCategoryEnum.optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  startDate: z.coerce.date().optional(),
  isFree: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sortBy: z.enum(["createdAt", "price", "startDate", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
