import { useState } from "react";
import { useSearchParams } from "react-router";
import { useEvents } from "@/hooks/useEvents";
import { useDebounce } from "@/hooks/useDebounce";
import EventCard from "@/components/EventCard";
import { CATEGORY_LABELS } from "@/lib/format";

const CATEGORIES = ["ALL", "MUSIC", "SPORTS", "TECHNOLOGY", "BUSINESS", "FOOD", "ART", "EDUCATION", "OTHER"];

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initSearch = searchParams.get("search") || "";
  const initCategory = searchParams.get("category") || "ALL";

  const [search, setSearch] = useState(initSearch);
  const [category, setCategory] = useState(initCategory);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const { events, meta, loading, error } = useEvents({
    search: debouncedSearch || undefined,
    category: category === "ALL" ? undefined : category,
    page,
    limit: 12,
  });

  function handleCategoryChange(cat: string) {
    setCategory(cat);
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (cat === "ALL") params.delete("category");
    else params.set("category", cat);
    setSearchParams(params);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold text-zinc-100">All Events</h1>
      <p className="mt-1 text-zinc-500">Browse and filter through all available events</p>

      {/* Search + Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search events..."
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-900"
        />
      </div>

      {/* Category pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`hover-scale rounded-full px-4 py-2 text-sm font-medium transition ${
              category === cat
                ? "bg-violet-600 text-white shadow-sm"
                : "border border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-violet-600"
            }`}
          >
            {cat === "ALL" ? "All" : CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="mt-4 text-sm text-zinc-500">
        {meta && `${meta.total} event${meta.total !== 1 ? "s" : ""} found`}
      </div>

      {loading ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-zinc-700 bg-zinc-800">
              <div className="aspect-[16/10] bg-zinc-700" />
              <div className="space-y-3 p-4"><div className="h-4 w-full rounded bg-zinc-700" /></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-red-200 py-16 text-center">
          <p className="text-4xl">⚠️</p>
          <p className="mt-2 text-lg font-medium text-red-600">Failed to load events</p>
          <p className="text-red-400">{error}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-zinc-700 py-16 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-2 text-lg font-medium text-zinc-300">No events found</p>
          <p className="text-zinc-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="flex items-center px-4 text-sm text-zinc-500">
            Page {page} of {meta.totalPages}
          </span>
          <button
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
