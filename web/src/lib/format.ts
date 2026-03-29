export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelative(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  return formatDate(date);
}

export const CATEGORY_LABELS: Record<string, string> = {
  MUSIC: "Music",
  SPORTS: "Sports",
  TECHNOLOGY: "Technology",
  BUSINESS: "Business",
  FOOD: "Food & Drink",
  ART: "Art",
  EDUCATION: "Education",
  OTHER: "Other",
};

export const CATEGORY_EMOJI: Record<string, string> = {
  MUSIC: "🎵",
  SPORTS: "⚽",
  TECHNOLOGY: "💻",
  BUSINESS: "💼",
  FOOD: "🍕",
  ART: "🎨",
  EDUCATION: "📚",
  OTHER: "✨",
};

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  WAITING_PAYMENT:      { label: "Waiting Payment",      color: "text-amber-300 bg-amber-900/40" },
  WAITING_CONFIRMATION: { label: "Waiting Confirmation", color: "text-blue-300 bg-blue-900/40" },
  DONE:                 { label: "Done",                 color: "text-emerald-300 bg-emerald-900/40" },
  REJECTED:             { label: "Rejected",             color: "text-red-400 bg-red-900/40" },
  EXPIRED:              { label: "Expired",              color: "text-zinc-400 bg-zinc-700" },
  CANCELLED:            { label: "Cancelled",            color: "text-zinc-400 bg-zinc-700" },
  PAID:                 { label: "Done",                 color: "text-emerald-300 bg-emerald-900/40" }, // legacy
};
