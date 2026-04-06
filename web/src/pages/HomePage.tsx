import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { useEvents } from "@/hooks/useEvents";
import EventCard from "@/components/EventCard";
import { CATEGORY_LABELS, CATEGORY_EMOJI, formatDate } from "@/lib/format";

const CATEGORIES = ["ALL", "MUSIC", "SPORTS", "TECHNOLOGY", "BUSINESS", "FOOD", "ART", "EDUCATION"];

export default function HomePage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideKey, setSlideKey] = useState(0);
  const { events, loading } = useEvents({ limit: 8, sortBy: "startDate", sortOrder: "asc" });

  const slideEvents = events.filter((e) => e.image);

  const goTo = useCallback(
    (index: number) => {
      if (slideEvents.length === 0) return;
      setSlideIndex((index + slideEvents.length) % slideEvents.length);
      setSlideKey((k) => k + 1);
    },
    [slideEvents.length]
  );

  // Auto-advance: interval tidak reset tiap slide change
  useEffect(() => {
    if (slideEvents.length < 2) return;
    const id = setInterval(() => {
      setSlideIndex((current) => (current + 1) % slideEvents.length);
      setSlideKey((k) => k + 1);
    }, 5000);
    return () => clearInterval(id);
  }, [slideEvents.length]);

  const currentSlide = slideEvents[slideIndex];
  const hasSlides = slideEvents.length > 0;

  return (
    <main>
      {/* Title */}
      <section className="pt-8 pb-4 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 sm:text-5xl">
          Discover Amazing{" "}
          <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
            Events Near You
          </span>
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Find concerts, workshops, conferences, and more.
        </p>
      </section>

      {/* Hero slideshow */}
      <section className="px-8 pb-6 sm:px-20 lg:px-36">
        <div className="relative overflow-hidden rounded-3xl aspect-[3/1]">

          {/* Background */}
          {hasSlides ? (
            <div
              key={slideKey}
              className="hero-slide-enter absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${currentSlide.image})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700" />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Slide info bottom-left */}
          {hasSlides && currentSlide && (
            <div key={`info-${slideKey}`} className="hero-slide-enter absolute bottom-10 left-5 sm:left-8 max-w-xs">
              <span className="inline-block rounded-full bg-violet-600/80 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                {CATEGORY_EMOJI[currentSlide.category]} {currentSlide.category}
              </span>
              <p className="mt-1.5 text-base font-bold text-white drop-shadow line-clamp-2">
                {currentSlide.title}
              </p>
              <p className="text-xs text-zinc-300">{formatDate(currentSlide.startDate)} · {currentSlide.location}</p>
            </div>
          )}

          {/* Arrows */}
          {slideEvents.length > 1 && (
            <>
              <button
                onClick={() => goTo(slideIndex - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/60"
                aria-label="Previous"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => goTo(slideIndex + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/60"
                aria-label="Next"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Dot indicators */}
          {slideEvents.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {slideEvents.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === slideIndex ? "w-5 bg-white" : "w-1.5 bg-white/40"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>


      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.filter((c) => c !== "ALL").map((cat) => (
            <Link
              key={cat}
              to={`/events?category=${cat}`}
              className="hover-scale flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-200 shadow-sm transition hover:border-violet-600"
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
            className="hover-scale hidden rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-violet-600 hover:text-violet-400 sm:inline-flex"
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
            {events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/events"
            className="hover-scale inline-flex rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-200 transition hover:border-violet-600"
          >
            View all events →
          </Link>
        </div>
      </section>
    </main>
  );
}
