import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { useMyOrders } from "@/hooks/useOrders";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { formatCurrency, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import WriteReviewModal from "@/components/WriteReviewModal";
import type { Order } from "@/api/types";

const ORDER_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

function useCountdown(createdAt: string) {
  const expireAt = new Date(createdAt).getTime() + ORDER_EXPIRY_MS;
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, expireAt - Date.now()),
  );

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      const r = Math.max(0, expireAt - Date.now());
      setRemaining(r);
    }, 1000);
    return () => clearInterval(id);
  }, [expireAt, remaining]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return { label: `${hours}:${minutes}:${seconds}`, expired: remaining <= 0 };
}

function PaymentProofModal({
  order,
  onClose,
  onSuccess,
}: {
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("paymentProof", file);
      await apiClient.post(
        API_ENDPOINTS.ORDERS.PAYMENT_PROOF(order.id),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      toast.success("Payment proof uploaded! Waiting for confirmation.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">Upload Payment Proof</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-sm">
          <p className="font-semibold text-zinc-100">{order.Event.title}</p>
          <p className="text-zinc-400">
            {order.quantity} ticket{order.quantity > 1 ? "s" : ""} ·{" "}
            <span className="font-semibold text-zinc-100">
              {formatCurrency(Number(order.totalAmount))}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-sm text-zinc-300">
              Upload a screenshot or photo of your payment transfer.
            </p>

            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-56 w-full rounded-xl object-contain border border-zinc-700 bg-zinc-800"
                />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute right-2 top-2 rounded-full bg-zinc-900/80 px-2 py-0.5 text-xs text-zinc-300 hover:bg-zinc-700"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-800 py-10 transition hover:border-violet-500 hover:bg-zinc-700"
              >
                <span className="text-3xl">📎</span>
                <span className="mt-2 text-sm font-medium text-zinc-300">
                  Click to select image
                </span>
                <span className="mt-1 text-xs text-zinc-500">
                  JPG, PNG, WebP · max 5MB
                </span>
              </button>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Submit Proof"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderRow({
  order,
  onUploadProof,
  onCancel,
  onReview,
}: {
  order: Order;
  onUploadProof: (order: Order) => void;
  onCancel: (id: number) => void;
  onReview: (eventId: number, title: string) => void;
}) {
  const { label: countdownLabel, expired } = useCountdown(order.createdAt);
  const isPending = order.status === "WAITING_PAYMENT";
  const isWaitingConfirmation = order.status === "WAITING_CONFIRMATION";

  return (
    <div
      className={`rounded-xl border bg-zinc-800 p-5 ${
        isPending && !expired ? "border-amber-700/50" : "border-zinc-700"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {order.Event.image ? (
            <img
              src={order.Event.image}
              alt=""
              className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-violet-900/40 text-2xl">
              🎫
            </div>
          )}
          <div>
            <Link
              to={`/events/${order.Event.slug || ""}`}
              className="font-semibold text-zinc-100 hover:text-violet-400"
            >
              {order.Event.title}
            </Link>
            <p className="text-sm text-zinc-500">
              {formatDate(order.Event.startDate)} · {order.Event.location}
            </p>
            <p className="text-sm text-zinc-500">
              {order.quantity} ticket{order.quantity > 1 ? "s" : ""} ·{" "}
              {formatCurrency(Number(order.totalAmount))}
              {Number(order.discountAmount) > 0 && (
                <span className="ml-1 text-emerald-400">
                  (voucher -{formatCurrency(Number(order.discountAmount))})
                </span>
              )}
              {order.pointsUsed > 0 && (
                <span className="ml-1 text-amber-400">
                  (points -{formatCurrency(order.pointsUsed)})
                </span>
              )}
            </p>

            {/* Countdown for pending orders */}
            {isPending && (
              <div className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold tabular-nums ${
                expired
                  ? "bg-red-900/40 text-red-400"
                  : "bg-amber-900/40 text-amber-300"
              }`}>
                <span>{expired ? "⚠" : "⏱"}</span>
                {expired
                  ? "Order expired — please create a new order"
                  : `Upload payment proof within ${countdownLabel}`}
              </div>
            )}

            {isWaitingConfirmation && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-900/40 px-2.5 py-1 text-xs font-semibold text-blue-300">
                <span>🔍</span> Waiting for organizer confirmation
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <StatusBadge status={order.status} />

          {isPending && !expired && (
            <div className="flex gap-2">
              {(!order.paymentMethod || order.paymentMethod === "TRANSFER") && (
                <button
                  onClick={() => onUploadProof(order)}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700"
                >
                  Upload Proof
                </button>
              )}
              <button
                onClick={() => onCancel(order.id)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700"
              >
                Cancel
              </button>
            </div>
          )}

          {(order.status === "DONE" || order.status === "PAID") && (
            <div className="flex gap-2">
              <Link
                to={`/ticket/${order.id}`}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                View Ticket
              </Link>
              <button
                onClick={() => onReview(order.eventId, order.Event.title)}
                className="rounded-lg border border-violet-700 px-4 py-2 text-xs font-medium text-violet-400 hover:bg-violet-900/40"
              >
                Write Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomerOrdersPage() {
  const { orders, loading, refetch } = useMyOrders();
  const [proofTarget, setProofTarget] = useState<Order | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{
    eventId: number;
    eventTitle: string;
  } | null>(null);

  async function handleCancel(orderId: number) {
    try {
      await apiClient.put(API_ENDPOINTS.ORDERS.CANCEL(orderId));
      toast.info("Order cancelled");
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cancel failed");
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded bg-zinc-700" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-700" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-100">My Orders</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Track and manage your event tickets
      </p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-zinc-700 py-16 text-center">
          <p className="text-4xl">🎫</p>
          <p className="mt-2 font-medium text-zinc-300">No orders yet</p>
          <Link
            to="/events"
            className="mt-2 inline-block text-sm text-violet-600 hover:underline"
          >
            Browse events →
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              onUploadProof={setProofTarget}
              onCancel={handleCancel}
              onReview={(eventId, title) =>
                setReviewTarget({ eventId, eventTitle: title })
              }
            />
          ))}
        </div>
      )}

      {proofTarget && (
        <PaymentProofModal
          order={proofTarget}
          onClose={() => setProofTarget(null)}
          onSuccess={refetch}
        />
      )}

      {reviewTarget && (
        <WriteReviewModal
          eventId={reviewTarget.eventId}
          eventTitle={reviewTarget.eventTitle}
          onClose={() => setReviewTarget(null)}
          onSuccess={refetch}
        />
      )}
    </main>
  );
}
