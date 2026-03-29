export type UserRole = "CUSTOMER" | "ORGANIZER";

export type EventCategory =
  | "MUSIC" | "SPORTS" | "TECHNOLOGY" | "BUSINESS"
  | "FOOD" | "ART" | "EDUCATION" | "OTHER";

export type PaymentMethod = "TRANSFER" | "WALLET" | "POINTS";

export type OrderStatus =
  | "WAITING_PAYMENT"
  | "WAITING_CONFIRMATION"
  | "DONE"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED"
  | "PAID"; // legacy

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  referralCode: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  createdAt: string;
  Wallet?: { balance: number; points: number };
  _count?: {
    Events: number;
    Orders: number;
    Reviews: number;
    Referrals: number;
    Vouchers: number;
  };
}

export interface EventItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  location: string;
  image?: string;
  price: number;
  category: EventCategory;
  startDate: string;
  endDate: string;
  capacity: number;
  isFree: boolean;
  createdAt: string;
  User: { id: number; name: string; email?: string; avatar?: string };
  _count?: { Orders: number; Reviews: number };
  Reviews?: Review[];
  avgRating?: number;
  ticketsSold?: number;
  availableSeats?: number;
}

export type DiscountType = "PERCENTAGE" | "FIXED";

export interface Voucher {
  id: number;
  eventId: number;
  organizerId: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  maxUses: number;
  usedCount: number;
  createdAt: string;
}

export interface Order {
  id: number;
  eventId: number;
  customerId: number;
  quantity: number;
  totalAmount: number;
  discountAmount: number;
  pointsUsed: number;
  voucherId?: number;
  status: OrderStatus;
  createdAt: string;
  Event: {
    id: number;
    title: string;
    slug?: string;
    image?: string;
    startDate: string;
    location: string;
  };
  paymentProof?: string;
  paymentMethod?: PaymentMethod;
  Customer?: { id: number; name: string; email: string };
}

export interface Review {
  id: number;
  eventId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  User: { id: number; name: string; avatar?: string };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginCredential {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  usedReferralCode?: string;
}

export interface OrganizerStats {
  totalEvents: number;
  totalOrders: number;
  totalRevenue: number;
  avgRating: number;
}
