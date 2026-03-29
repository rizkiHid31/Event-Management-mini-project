import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { apiClient } from "@/api/client";
import type { Order } from "@/api/types";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default function TicketPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/orders/my")
      .then(({ data }) => {
        const found = data.data.find((o: Order) => o.id === Number(orderId));
        setOrder(found || null);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-64 rounded-2xl bg-zinc-700" />
        </div>
      </main>
    );
  }

  if (!order || (order.status !== "DONE" && order.status !== "PAID")) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-4xl">🎫</p>
        <p className="mt-4 text-lg font-bold text-zinc-100">Ticket not found</p>
        <Link to="/customer/orders" className="mt-4 inline-block text-sm text-violet-600 hover:underline">
          ← Back to my orders
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <div className="overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-800 shadow-lg">
        {/* Ticket Header */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-violet-200">E-Ticket</p>
              <p className="mt-1 text-xs text-violet-200">#{String(order.id).padStart(6, "0")}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <span className="text-lg">🎫</span>
            </div>
          </div>
          <h2 className="mt-4 text-xl font-bold">{order.Event.title}</h2>
        </div>

        {/* Dashed border separator */}
        <div className="relative">
          <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-zinc-900" />
          <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-zinc-900" />
          <div className="border-t-2 border-dashed border-zinc-700" />
        </div>

        {/* Ticket Body */}
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium uppercase text-zinc-400">Date & Time</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">
                {formatDateTime(order.Event.startDate)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-zinc-400">Location</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">{order.Event.location}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-zinc-400">Tickets</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">{order.quantity}x</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-zinc-400">Total Paid</p>
              <p className="mt-1 text-sm font-semibold text-emerald-600">
                {formatCurrency(Number(order.totalAmount))}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-emerald-900/40 p-3 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              ✓ Payment Confirmed
            </p>
          </div>

          {/* QR placeholder */}
          <div className="flex flex-col items-center py-4">
            <div className="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900">
              <div className="text-center">
                <p className="text-3xl">📱</p>
                <p className="mt-1 text-[10px] text-zinc-400">Show at entry</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              Order ID: EVT-{String(order.id).padStart(6, "0")}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/customer/orders"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
        >
          My Orders
        </Link>
        <Link
          to="/events"
          className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
        >
          Browse More Events
        </Link>
      </div>
    </main>
  );
}
