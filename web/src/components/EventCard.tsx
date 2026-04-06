import { Link } from "react-router";
import type { EventItem } from "@/api/types";
import { formatCurrency, formatDate, CATEGORY_EMOJI } from "@/lib/format";

interface Props {
  event: EventItem;
  index?: number;
}

export default function EventCard({ event, index = 0 }: Props) {
  return (
    <Link
      to={`/events/${event.slug}`}
      className="animate-fade-in-up group flex flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-700">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100">
            <span className="text-5xl">
              {CATEGORY_EMOJI[event.category] || "✨"}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-zinc-800/90 px-2.5 py-1 text-xs font-semibold text-zinc-200 shadow-sm backdrop-blur-sm">
          {CATEGORY_EMOJI[event.category]} {event.category}
        </div>
        {event.isFree && (
          <div className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">
            FREE
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
          {formatDate(event.startDate)}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-bold text-zinc-100 group-hover:text-violet-400">
          {event.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{event.location}</span>
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-bold text-zinc-100">
            {event.isFree ? "Free" : formatCurrency(Number(event.price))}
          </span>
          <span className="text-xs text-zinc-400">
            by {event.User?.name}
          </span>
        </div>
      </div>
    </Link>
  );
}
