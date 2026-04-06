import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { EventCategory } from "@/api/types";

interface UpcomingEvent {
  id: number;
  title: string;
  slug: string;
  image?: string;
  category: EventCategory;
  startDate: string;
  location: string;
  isFree: boolean;
  price: number;
}

interface OrganizerEntry {
  id: number;
  name: string;
  avatar?: string;
  avgRating: number;
  totalEvents: number;
  upcomingEvents: UpcomingEvent[];
}

export default function OrganizersPage() {
  const [organizers, setOrganizers] = useState<OrganizerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get(API_ENDPOINTS.USERS.ORGANIZERS)
      .then(({ data }) => setOrganizers(data.data ?? []))
      .catch((err) => setError(err.response?.data?.message || "Failed to load organizers"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-zinc-100">Event Organizers</h1>
      <p className="mt-1 text-zinc-500">Browse organizers with upcoming events</p>

      {error ? (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-red-800 py-16 text-center">
          <p className="text-4xl">⚠️</p>
          <p className="mt-2 text-lg font-medium text-red-400">Failed to load organizers</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-zinc-700 bg-zinc-800 p-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-zinc-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-zinc-700" />
                  <div className="h-3 w-20 rounded bg-zinc-700" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-14 rounded-xl bg-zinc-700" />
                <div className="h-14 rounded-xl bg-zinc-700" />
              </div>
            </div>
          ))}
        </div>
      ) : organizers.length === 0 ? (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-zinc-700 py-16 text-center">
          <p className="text-4xl">🎭</p>
          <p className="mt-2 text-lg font-medium text-zinc-300">No organizers with upcoming events</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {organizers.map((org, i) => (
            <Link
              key={org.id}
              to={`/organizers/${org.id}`}
              className="animate-fade-in-up flex flex-col items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-800 p-5 text-center transition hover:border-violet-600 hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-violet-900/50 text-2xl font-bold text-violet-300 overflow-hidden">
                {org.avatar ? (
                  <img src={org.avatar} alt={org.name} className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  org.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="font-semibold text-zinc-100">{org.name}</p>
                <div className="mt-1 flex items-center justify-center gap-1.5">
                  {org.avgRating > 0 ? (
                    <>
                      <Stars rating={org.avgRating} />
                      <span className="text-xs text-zinc-400">{org.avgRating.toFixed(1)}</span>
                    </>
                  ) : (
                    <span className="text-xs text-zinc-500">No ratings yet</span>
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
          className={`h-3.5 w-3.5 ${s <= Math.round(rating) ? "text-amber-400" : "text-zinc-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}
