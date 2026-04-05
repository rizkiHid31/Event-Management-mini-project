import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { EventItem, OrganizerStats } from "@/api/types";
import { formatCurrency, formatDate, CATEGORY_EMOJI } from "@/lib/format";
import Spinner from "@/components/Spinner";
import EmptyState from "@/components/EmptyState";

type GroupBy = "day" | "month" | "year";
interface ChartPoint { period: string; orders: number; revenue: number; tickets: number }

export default function OrganizerDashboardPage() {
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [groupBy, setGroupBy] = useState<GroupBy>("month");
  const [chartMetric, setChartMetric] = useState<"revenue" | "orders">("revenue");

  useEffect(() => {
    Promise.all([
      apiClient.get(API_ENDPOINTS.EVENTS.STATS),
      apiClient.get(API_ENDPOINTS.EVENTS.MY_EVENTS),
    ])
      .then(([statsRes, eventsRes]) => {
        setStats(statsRes.data.data);
        setEvents(eventsRes.data.data);
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    apiClient
      .get(API_ENDPOINTS.EVENTS.CHART, { params: { groupBy } })
      .then(({ data }) => setChartData(data.data))
      .catch(() => {});
  }, [groupBy]);

  async function handleDelete(eventId: number, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await apiClient.delete(API_ENDPOINTS.EVENTS.DELETE(eventId));
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success("Event deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            Organizer Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your events and track performance
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/organizer/orders"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-600 px-5 py-2.5 text-sm font-bold text-zinc-200 transition hover:bg-zinc-700"
          >
            Orders
          </Link>
          <Link
            to="/organizer/event/create"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            <span className="text-lg leading-none">+</span> New Event
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Events",
              value: stats.totalEvents,
              icon: "📅",
              bg: "bg-violet-900/40",
              text: "text-violet-200",
            },
            {
              label: "Tickets Sold",
              value: stats.totalOrders,
              icon: "🎫",
              bg: "bg-blue-900/40",
              text: "text-blue-200",
            },
            {
              label: "Total Revenue",
              value: formatCurrency(Number(stats.totalRevenue)),
              icon: "💰",
              bg: "bg-emerald-900/40",
              text: "text-emerald-200",
            },
            {
              label: "Avg Rating",
              value: stats.avgRating
                ? `${Number(stats.avgRating).toFixed(1)} ⭐`
                : "N/A",
              icon: "⭐",
              bg: "bg-amber-900/40",
              text: "text-amber-200",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border border-zinc-700 bg-zinc-800 p-5 transition hover:shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500">
                  {item.label}
                </p>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg} text-lg`}
                >
                  {item.icon}
                </span>
              </div>
              <p className={`mt-2 text-2xl font-bold ${item.text}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Statistics Visualization Chart */}
      <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-800 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-zinc-100">Statistics</h2>
          <div className="flex gap-2">
            {/* Metric toggle */}
            <div className="flex overflow-hidden rounded-lg border border-zinc-700">
              {(["revenue", "orders"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m)}
                  className={`px-3 py-1.5 text-xs font-medium transition ${
                    chartMetric === m
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {m === "revenue" ? "Revenue" : "Orders"}
                </button>
              ))}
            </div>
            {/* GroupBy toggle */}
            <div className="flex overflow-hidden rounded-lg border border-zinc-700">
              {(["day", "month", "year"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGroupBy(g)}
                  className={`px-3 py-1.5 text-xs font-medium capitalize transition ${
                    groupBy === g
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {chartData.length === 0 ? (
          <p className="mt-6 text-center text-sm text-zinc-500">No order data yet.</p>
        ) : (() => {
          const maxVal = Math.max(...chartData.map((d) => chartMetric === "revenue" ? d.revenue : d.orders), 1);
          return (
            <div className="mt-5">
              {/* Bar chart */}
              <div className="flex items-end gap-1.5 overflow-x-auto pb-2" style={{ minHeight: 160 }}>
                {chartData.map((d) => {
                  const val = chartMetric === "revenue" ? d.revenue : d.orders;
                  const pct = (val / maxVal) * 140;
                  return (
                    <div key={d.period} className="group flex min-w-[36px] flex-1 flex-col items-center gap-1">
                      {/* Tooltip */}
                      <div className="invisible mb-1 rounded bg-zinc-700 px-2 py-1 text-center text-xs text-zinc-200 group-hover:visible">
                        {chartMetric === "revenue" ? formatCurrency(d.revenue) : `${d.orders} orders`}
                        <br />
                        <span className="text-zinc-400">{d.tickets} tickets</span>
                      </div>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-violet-700 to-violet-500 transition-all duration-500"
                        style={{ height: `${Math.max(pct, 4)}px` }}
                      />
                      <p className="w-full truncate text-center text-[10px] text-zinc-500">{d.period}</p>
                    </div>
                  );
                })}
              </div>
              {/* Summary row */}
              <div className="mt-3 flex flex-wrap gap-4 border-t border-zinc-700 pt-3 text-xs text-zinc-400">
                <span>Total orders: <strong className="text-zinc-100">{chartData.reduce((s, d) => s + d.orders, 0)}</strong></span>
                <span>Total tickets: <strong className="text-zinc-100">{chartData.reduce((s, d) => s + d.tickets, 0)}</strong></span>
                <span>Total revenue: <strong className="text-emerald-400">{formatCurrency(chartData.reduce((s, d) => s + d.revenue, 0))}</strong></span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* My Events */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-100">My Events</h2>
        <p className="text-sm text-zinc-400">{events.length} total</p>
      </div>

      {events.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon="🎪"
            title="No events yet"
            description="Create your first event and start selling tickets"
            actionLabel="Create Event"
            actionLink="/organizer/event/create"
          />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {events.map((event) => {
            const isPast = new Date(event.endDate || event.startDate) < new Date();
            return (
              <div
                key={event.id}
                className="flex items-center gap-4 rounded-xl border border-zinc-700 bg-zinc-800 p-4 transition hover:border-zinc-600 hover:shadow-sm"
              >
                {/* Thumbnail */}
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-700">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">
                      {CATEGORY_EMOJI[event.category] || "✨"}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/events/${event.slug}`}
                      className="truncate font-semibold text-zinc-100 hover:text-violet-400"
                    >
                      {event.title}
                    </Link>
                    {isPast && (
                      <span className="flex-shrink-0 rounded-full bg-zinc-700 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                        ENDED
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500">
                    {formatDate(event.startDate)} · {event.location}
                  </p>
                </div>

                {/* Stats & Actions */}
                <div className="hidden items-center gap-6 sm:flex">
                  <div className="text-right">
                    <p className="font-bold text-zinc-100">
                      {event.isFree
                        ? "Free"
                        : formatCurrency(Number(event.price))}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {event._count?.Orders || 0} orders ·{" "}
                      {event._count?.Reviews || 0} reviews
                    </p>
                  </div>
                  <Link
                    to={`/organizer/event/${event.id}/attendees`}
                    className="rounded-lg border border-sky-700 px-3 py-1.5 text-xs font-medium text-sky-400 transition hover:bg-sky-900/40"
                  >
                    Attendees
                  </Link>
                  <Link
                    to={`/organizer/event/edit/${event.id}`}
                    className="rounded-lg border border-violet-700 px-3 py-1.5 text-xs font-medium text-violet-400 transition hover:bg-violet-900/40"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/organizer/event/${event.id}/vouchers`}
                    className="rounded-lg border border-amber-700 px-3 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-900/40"
                  >
                    Vouchers
                  </Link>
                  <button
                    onClick={() => handleDelete(event.id, event.title)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
