export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
  },
  EVENTS: {
    LIST: "/events",
    DETAIL: (slug: string) => `/events/detail/${slug}`,
    BY_ID: (id: number) => `/events/id/${id}`,
    CREATE: "/events",
    UPDATE: (id: number) => `/events/${id}`,
    DELETE: (id: number) => `/events/${id}`,
    MY_EVENTS: "/events/organizer/my-events",
    STATS: "/events/organizer/stats",
  },
  ORDERS: {
    CREATE: "/orders",
    MY_ORDERS: "/orders/my",
    ORGANIZER_ORDERS: "/orders/organizer",
    PAYMENT_PROOF: (id: number) => `/orders/${id}/payment-proof`,
    CANCEL: (id: number) => `/orders/${id}/cancel`,
    CONFIRM: (id: number) => `/orders/${id}/confirm`,
    REJECT: (id: number) => `/orders/${id}/reject`,
  },
  REVIEWS: {
    CREATE: "/reviews",
    BY_EVENT: (eventId: number) => `/reviews/event/${eventId}`,
  },
  USERS: {
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
  },
  VOUCHERS: {
    CREATE: "/vouchers",
    BY_EVENT: (eventId: number) => `/vouchers/event/${eventId}`,
    DELETE: (id: number) => `/vouchers/${id}`,
    VALIDATE: "/vouchers/validate",
  },
};
