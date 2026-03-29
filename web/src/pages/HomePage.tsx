import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useEvents } from "@/hooks/useEvents";
import EventCard from "@/components/EventCard";
import { CATEGORY_LABELS, CATEGORY_EMOJI } from "@/lib/format";

const CATEGORIES = ["ALL", "MUSIC", "SPORTS", "TECHNOLOGY", "BUSINESS", "FOOD", "ART", "EDUCATION"];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { events, loading } = useEvents({ limit: 8, sortBy: "startDate", sortOrder: "asc" });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/events?search=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 py-24 sm:py-32">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Discover Amazing
            <br />
            <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
              Events Near You
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-violet-100">
            Find concerts, workshops, conferences, and more. Join thousands of attendees
            discovering unforgettable experiences.
          </p>

          <form onSubmit={handleSearch} className="mx-auto mt-10 flex max-w-xl overflow-hidden rounded-2xl bg-zinc-800 shadow-2xl">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, categories, locations..."
              className="flex-1 px-6 py-4 text-base text-zinc-100 outline-none placeholder:text-zinc-500 bg-zinc-800"
            />
            <button
              type="submit"
              className="m-2 rounded-xl bg-violet-600 px-6 py-2 font-semibold text-white transition hover:bg-violet-700"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.filter((c) => c !== "ALL").map((cat) => (
            <Link
              key={cat}
              to={`/events?category=${cat}`}
              className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-200 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-600 hover:shadow-md"
            >
              <span>{CATEGORY_EMOJI[cat]}</span>
              <span>{CATEGORY_LABELS[cat]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
              Upcoming Events
            </h2>
            <p className="mt-1 text-zinc-500">
              Don't miss out on these exciting events
            </p>
          </div>
          <Link
            to="/events"
            className="hidden rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-violet-600 hover:text-violet-400 sm:inline-flex"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-zinc-700 bg-zinc-800">
                <div className="aspect-[16/10] bg-zinc-700" />
                <div className="space-y-3 p-4">
                  <div className="h-3 w-20 rounded bg-zinc-700" />
                  <div className="h-4 w-full rounded bg-zinc-700" />
                  <div className="h-3 w-32 rounded bg-zinc-700" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-700 py-16 text-center">
            <p className="text-4xl">🎉</p>
            <p className="mt-2 text-lg font-medium text-zinc-300">No events yet</p>
            <p className="text-zinc-500">Check back soon for new events!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/events"
            className="inline-flex rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-violet-600"
          >
            View all events →
          </Link>
        </div>
      </section>
    </main>
  );
}
