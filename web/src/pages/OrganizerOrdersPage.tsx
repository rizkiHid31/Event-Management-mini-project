import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { Order, OrderStatus } from "@/api/types";
import { formatCurrency, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import Spinner from "@/components/Spinner";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Waiting Confirmation", value: "WAITING_CONFIRMATION" },
  { label: "Done", value: "DONE" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Waiting Payment", value: "WAITING_PAYMENT" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function OrganizerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [processing, setProcessing] = useState<number | null>(null);

  function fetchOrders(status: string) {
    setLoading(true);
    apiClient
      .get(API_ENDPOINTS.ORDERS.ORGANIZER_ORDERS, {
        params: status ? { status } : {},
      })
      .then(({ data }) => setOrders(data.data))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [statusFilter]);

  async function handleConfirm(orderId: number) {
    if (!confirm("Confirm this payment?")) return;
    setProcessing(orderId);
    try {
      await apiClient.put(API_ENDPOINTS.ORDERS.CONFIRM(orderId));
      toast.success("Order confirmed — payment received");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "DONE" as OrderStatus } : o)),
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to confirm");
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(orderId: number) {
    if (!confirm("Reject this order? The customer will be refunded.")) return;
    setProcessing(orderId);
    try {
      await apiClient.put(API_ENDPOINTS.ORDERS.REJECT(orderId));
      toast.success("Order rejected — customer refunded");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "REJECTED" as OrderStatus } : o,
        ),
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject");
    } finally {
      setProcessing(null);
    }
  }

  const pendingCount = orders.filter(
    (o) => o.status === "WAITING_CONFIRMATION",
  ).length;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/organizer/dashboard"
            className="mb-1 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200"
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-zinc-100">Order Management</h1>
        </div>
        {pendingCount > 0 && (
          <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white">
            {pendingCount} need confirmation
          </span>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === f.value
                ? "bg-violet-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
            }`}
          >
            {f.label}
            {f.value === "WAITING_CONFIRMATION" && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] text-white">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 py-16 text-center">
            <p className="text-3xl">📋</p>
            <p className="mt-2 text-sm text-zinc-400">No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isWaiting = order.status === "WAITING_CONFIRMATION";
              const busy = processing === order.id;

              return (
                <div
                  key={order.id}
                  className={`rounded-xl border bg-zinc-800 p-4 transition ${
                    isWaiting
                      ? "border-blue-700/50"
                      : "border-zinc-700"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-zinc-100">
                          {order.Event.title}
                        </p>
                        <StatusBadge status={order.status} />
                      </div>

                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-zinc-400">
                        <span>
                          Customer:{" "}
                          <span className="text-zinc-200">
                            {order.Customer?.name ?? "—"}
                          </span>
                        </span>
                        <span>
                          {order.quantity} ticket
                          {order.quantity > 1 ? "s" : ""}
                        </span>
                        <span className="font-semibold text-zinc-100">
                          {formatCurrency(Number(order.totalAmount))}
                        </span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>

                    {isWaiting && (
                      <div className="flex flex-shrink-0 flex-col items-end gap-2">
                        {order.paymentProof && (
                          <a
                            href={order.paymentProof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block"
                          >
                            <img
                              src={order.paymentProof}
                              alt="Payment proof"
                              className="h-16 w-16 rounded-lg border border-zinc-600 object-cover transition group-hover:opacity-80"
                            />
                            <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                              View
                            </span>
                          </a>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirm(order.id)}
                            disabled={busy}
                            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {busy ? "..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => handleReject(order.id)}
                            disabled={busy}
                            className="rounded-lg border border-red-800 px-4 py-2 text-xs font-medium text-red-400 transition hover:bg-red-900/30 disabled:opacity-50"
                          >
                            {busy ? "..." : "Reject"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
