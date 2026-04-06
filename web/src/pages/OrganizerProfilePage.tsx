import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { formatDate, formatCurrency, CATEGORY_EMOJI, CATEGORY_LABELS } from "@/lib/format";
import type { EventCategory } from "@/api/types";

interface OrganizerEvent {
  id: number;
  title: string;
  slug: string;
  image?: string;
  category: EventCategory;
  startDate: string;
  endDate: string;
  location: string;
  isFree: boolean;
  price: number;
  avgRating: number;
  _count: { Orders: number; Reviews: number };
}

interface OrganizerProfile {
  id: number;
  name: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  avgRating: number;
  totalEvents: number;
  totalReviews: number;
  upcomingEvents: OrganizerEvent[];
  pastEvents: OrganizerEvent[];
}

export default function OrganizerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [organizer, setOrganizer] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    if (!id) return;
    apiClient
      .get(API_ENDPOINTS.USERS.ORGANIZER_BY_ID(Number(id)))
      .then(({ data }) => setOrganizer(data.data))
      .catch((err) => setError(err.response?.data?.message || "Organizer not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  if (error || !organizer) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-5xl">😕</p>
        <p className="mt-4 text-xl font-semibold text-zinc-200">Organizer not found</p>
        <Link to="/organizers" className="mt-4 inline-block text-sm text-violet-400 hover:underline">
          ← Back to organizers
        </Link>
      </main>
    );
  }

  const displayEvents = tab === "upcoming" ? organizer.upcomingEvents : organizer.pastEvents;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">

      {/* Back */}
      <Link to="/organizers" className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition mb-6">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All Organizers
      </Link>

      {/* Profile card */}
      <div className="rounded-2xl border border-zinc-700 bg-zinc-800 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-violet-900/50 text-3xl font-bold text-violet-300 overflow-hidden">
            {organizer.avatar ? (
              <img src={organizer.avatar} alt={organizer.name} className="h-20 w-20 object-cover" />
            ) : (
              organizer.name.charAt(0).toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-100">{organizer.name}</h1>
            {organizer.bio && (
              <p className="mt-1 text-sm text-zinc-400">{organizer.bio}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Stars rating={organizer.avgRating} />
                <span className="text-sm font-medium text-zinc-300">
                  {organizer.avgRating > 0 ? organizer.avgRating.toFixed(1) : "No ratings"}
                </span>
              </div>
              <span className="text-sm text-zinc-500">·</span>
              <span className="text-sm text-zinc-400">{organizer.totalReviews} review{organizer.totalReviews !== 1 ? "s" : ""}</span>
              <span className="text-sm text-zinc-500">·</span>
              <span className="text-sm text-zinc-400">{organizer.totalEvents} event{organizer.totalEvents !== 1 ? "s" : ""} total</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 sm:flex-col sm:items-end">
            <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-violet-400">{organizer.upcomingEvents.length}</p>
              <p className="text-xs text-zinc-500">Upcoming</p>
            </div>
            <div className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-zinc-300">{organizer.pastEvents.length}</p>
              <p className="text-xs text-zinc-500">Past</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-zinc-700">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition border-b-2 -mb-px ${
              tab === t
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t} Events
            <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
              tab === t ? "bg-violet-900/60 text-violet-300" : "bg-zinc-700 text-zinc-400"
            }`}>
              {t === "upcoming" ? organizer.upcomingEvents.length : organizer.pastEvents.length}
            </span>
          </button>
        ))}
      </div>

      {/* Events grid */}
      {displayEvents.length === 0 ? (
        <div className="mt-10 rounded-2xl border-2 border-dashed border-zinc-700 py-14 text-center">
          <p className="text-3xl">{tab === "upcoming" ? "📅" : "📦"}</p>
          <p className="mt-2 text-zinc-400">No {tab} events</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayEvents.map((event, i) => (
            <Link
              key={event.id}
              to={`/events/${event.slug}`}
              className="animate-fade-in-up group flex flex-col overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-800 transition hover:border-violet-600 hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden bg-zinc-700">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-indigo-900/40">
                    <span className="text-4xl">{CATEGORY_EMOJI[event.category] || "✨"}</span>
                  </div>
                )}
                <div className="absolute left-2 top-2 rounded-full bg-zinc-800/90 px-2 py-0.5 text-xs font-medium text-zinc-200 backdrop-blur-sm">
                  {CATEGORY_LABELS[event.category] || event.category}
                </div>
                {event.isFree && (
                  <div className="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                    FREE
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col p-3.5">
                <p className="text-xs font-semibold text-violet-500">{formatDate(event.startDate)}</p>
                <h3 className="mt-1 line-clamp-2 text-sm font-bold text-zinc-100 group-hover:text-violet-400">
                  {event.title}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500 truncate">
                  <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.location}
                </p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-sm font-bold text-zinc-100">
                    {event.isFree ? "Free" : formatCurrency(Number(event.price))}
                  </span>
                  {event.avgRating > 0 && (
                    <div className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-zinc-400">{event.avgRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`h-4 w-4 ${s <= Math.round(rating) ? "text-amber-400" : "text-zinc-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 h-4 w-32 rounded bg-zinc-700 animate-pulse" />
      <div className="animate-pulse rounded-2xl border border-zinc-700 bg-zinc-800 p-6">
        <div className="flex gap-4">
          <div className="h-20 w-20 rounded-full bg-zinc-700" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-48 rounded bg-zinc-700" />
            <div className="h-4 w-64 rounded bg-zinc-700" />
            <div className="h-4 w-40 rounded bg-zinc-700" />
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-zinc-700 bg-zinc-800">
            <div className="aspect-[16/9] bg-zinc-700" />
            <div className="space-y-2 p-3.5">
              <div className="h-3 w-24 rounded bg-zinc-700" />
              <div className="h-4 w-full rounded bg-zinc-700" />
              <div className="h-3 w-32 rounded bg-zinc-700" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
