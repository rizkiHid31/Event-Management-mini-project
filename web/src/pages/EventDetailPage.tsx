import { useParams, Link, useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useEventDetail } from "@/hooks/useEvents";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import WriteReviewModal from "@/components/WriteReviewModal";
import ReviewForm from "@/components/ReviewForm";
import {
  formatCurrency,
  formatDateTime,
  formatRelative,
  CATEGORY_EMOJI,
  CATEGORY_LABELS,
} from "@/lib/format";

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { event, loading, error } = useEventDetail(slug!);
  const { isAuthenticated, user } = useAuthStore();
  const [ordering, setOrdering] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showReview, setShowReview] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherApplied, setVoucherApplied] = useState<{
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
  } | null>(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"TRANSFER" | "WALLET" | "POINTS">("TRANSFER");
  const [pointsInput, setPointsInput] = useState(0);

  async function handleApplyVoucher() {
    if (!voucherCode.trim()) return;
    setApplyingVoucher(true);
    try {
      const { data } = await apiClient.post(API_ENDPOINTS.VOUCHERS.VALIDATE, {
        code: voucherCode.trim().toUpperCase(),
        eventId: event!.id,
      });
      setVoucherApplied(data.data);
      toast.success("Voucher applied!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid voucher");
      setVoucherApplied(null);
    } finally {
      setApplyingVoucher(false);
    }
  }

  async function handleOrder() {
    if (!isAuthenticated) {
      toast.error("Please login to order tickets");
      navigate("/auth/login");
      return;
    }
    setOrdering(true);
    try {
      const subtotal = Number(event!.price) * quantity;
      const afterVoucher = voucherApplied
        ? voucherApplied.discountType === "PERCENTAGE"
          ? subtotal * (1 - voucherApplied.discountValue / 100)
          : Math.max(0, subtotal - voucherApplied.discountValue)
        : subtotal;
      const availablePoints = user?.Wallet?.points ?? 0;
      const pointsToUse = paymentMethod === "TRANSFER"
        ? Math.min(pointsInput, availablePoints, Math.floor(afterVoucher))
        : paymentMethod === "POINTS"
        ? Math.min(availablePoints, Math.ceil(afterVoucher))
        : 0;

      await apiClient.post(API_ENDPOINTS.ORDERS.CREATE, {
        eventId: event!.id,
        quantity,
        ...(voucherApplied ? { voucherCode: voucherApplied.code } : {}),
        pointsUsed: pointsToUse,
        paymentMethod,
      });
      toast.success(
        paymentMethod === "TRANSFER"
          ? "Order created! Upload your payment proof."
          : "Payment successful! Your ticket is ready."
      );
      navigate("/customer/orders");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create order");
    } finally {
      setOrdering(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-80 rounded-2xl bg-zinc-700" />
          <div className="h-8 w-2/3 rounded bg-zinc-700" />
          <div className="h-4 w-1/3 rounded bg-zinc-700" />
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-24 text-center">
        <p className="text-5xl">😕</p>
        <p className="mt-4 text-xl font-bold text-zinc-100">
          {error || "Event not found"}
        </p>
        <Link
          to="/events"
          className="mt-4 inline-block text-violet-600 hover:underline"
        >
          ← Back to events
        </Link>
      </main>
    );
  }

  const isPast = new Date(event.endDate) < new Date();
  const isOwner = user?.id === event.User?.id;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        to="/events"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-200"
      >
        ← Back to events
      </Link>

      {/* Image */}
      <div className="overflow-hidden rounded-2xl bg-zinc-700">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="h-80 w-full object-cover sm:h-96"
          />
        ) : (
          <div className="flex h-80 items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100 sm:h-96">
            <span className="text-8xl">
              {CATEGORY_EMOJI[event.category] || "✨"}
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Left - Details */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-900/40 px-3 py-1 text-xs font-semibold text-violet-400">
              {CATEGORY_EMOJI[event.category]}{" "}
              {CATEGORY_LABELS[event.category]}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-zinc-100 sm:text-4xl">
              {event.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-zinc-300">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <div>
                <p className="font-medium text-zinc-100">
                  {formatDateTime(event.startDate)}
                </p>
                <p className="text-zinc-400">
                  to {formatDateTime(event.endDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span className="font-medium text-zinc-100">
                {event.location}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-6">
            <h2 className="text-lg font-bold text-zinc-100">
              About This Event
            </h2>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-zinc-300">
              {event.description || "No description provided."}
            </p>
          </div>

          {/* Organizer */}
          <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-6">
            <h2 className="text-lg font-bold text-zinc-100">Organizer</h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-900/40 font-bold text-violet-400">
                {event.User.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-zinc-100">{event.User.name}</p>
                {event.User.email && (
                  <p className="text-sm text-zinc-400">{event.User.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-100">
                Reviews
                {event._count?.Reviews
                  ? ` (${event._count.Reviews})`
                  : ""}
              </h2>
              {isAuthenticated && user?.role === "CUSTOMER" && !isOwner && (
                <button
                  onClick={() => setShowReview(true)}
                  className="rounded-lg border border-violet-700 px-3 py-1.5 text-xs font-medium text-violet-400 transition hover:bg-violet-900/40"
                >
                  Write Review
                </button>
              )}
            </div>
            {event.avgRating !== undefined && event.avgRating > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg text-amber-500">
                  {"★".repeat(Math.round(event.avgRating))}
                  {"☆".repeat(5 - Math.round(event.avgRating))}
                </span>
                <span className="text-sm font-semibold text-zinc-200">
                  {event.avgRating.toFixed(1)}/5
                </span>
              </div>
            )}

            {event.Reviews && event.Reviews.length > 0 ? (
              <div className="mt-4 space-y-4">
                {event.Reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-t border-zinc-700 pt-4 first:border-0 first:pt-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-zinc-300">
                        {review.User.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-zinc-100">
                        {review.User.name}
                      </span>
                      <span className="text-xs text-amber-500">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-zinc-300">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-400">No reviews yet.</p>
            )}

            {/* Inline Review Form */}
            {isAuthenticated &&
              user?.role === "CUSTOMER" &&
              !isOwner &&
              isPast && (
                <div className="mt-6 border-t border-zinc-700 pt-6">
                  <h3 className="text-sm font-bold text-zinc-100">
                    Leave a Review
                  </h3>
                  <div className="mt-3">
                    <ReviewForm
                      eventId={event.id}
                      onReviewCreated={() => window.location.reload()}
                    />
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Right - Order Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-zinc-700 bg-zinc-800 p-6 shadow-sm">
            <p className="text-3xl font-extrabold text-zinc-100">
              {event.isFree
                ? "Free"
                : formatCurrency(Number(event.price))}
            </p>
            {!event.isFree && (
              <p className="text-sm text-zinc-500">per ticket</p>
            )}

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Status</span>
                <span
                  className={`font-medium ${isPast ? "text-red-500" : "text-emerald-600"}`}
                >
                  {isPast ? "Ended" : formatRelative(event.startDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Capacity</span>
                <span className="font-medium text-zinc-100">
                  {event.capacity}
                </span>
              </div>
              {event.availableSeats !== undefined && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Available</span>
                  <span
                    className={`font-medium ${event.availableSeats === 0 ? "text-red-500" : "text-emerald-600"}`}
                  >
                    {event.availableSeats === 0
                      ? "Sold out"
                      : `${event.availableSeats} seats`}
                  </span>
                </div>
              )}
              {event.ticketsSold !== undefined && event.ticketsSold > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tickets sold</span>
                  <span className="font-medium text-zinc-100">
                    {event.ticketsSold}
                  </span>
                </div>
              )}
            </div>

            {!isPast && !isOwner && event.availableSeats !== 0 && (
              <>
                {!event.isFree && (
                  <div className="mt-5 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-zinc-200">
                        Quantity
                      </label>
                      <select
                        value={quantity}
                        onChange={(e) => {
                          setQuantity(Number(e.target.value));
                          setVoucherApplied(null);
                          setVoucherCode("");
                          setPointsInput(0);
                        }}
                        className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Voucher Input */}
                    <div>
                      <label className="text-sm font-medium text-zinc-200">
                        Voucher Code
                      </label>
                      {voucherApplied ? (
                        <div className="mt-1 flex items-center justify-between rounded-lg border border-emerald-700 bg-emerald-900/30 px-3 py-2">
                          <div>
                            <p className="font-mono text-sm font-bold text-emerald-400">
                              {voucherApplied.code}
                            </p>
                            <p className="text-xs text-emerald-300">
                              {voucherApplied.discountType === "PERCENTAGE"
                                ? `${voucherApplied.discountValue}% off`
                                : `${formatCurrency(voucherApplied.discountValue)} off`}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setVoucherApplied(null);
                              setVoucherCode("");
                              setPointsInput(0);
                            }}
                            className="text-xs text-zinc-400 hover:text-zinc-200"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1 flex gap-2">
                          <input
                            value={voucherCode}
                            onChange={(e) =>
                              setVoucherCode(e.target.value.toUpperCase())
                            }
                            placeholder="Enter code"
                            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm uppercase text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                          />
                          <button
                            onClick={handleApplyVoucher}
                            disabled={applyingVoucher || !voucherCode.trim()}
                            className="rounded-lg bg-zinc-700 px-3 py-2 text-xs font-medium text-zinc-100 transition hover:bg-zinc-600 disabled:opacity-50"
                          >
                            {applyingVoucher ? "..." : "Apply"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Payment Method Selector */}
                    {isAuthenticated && user?.role === "CUSTOMER" && (
                      <div>
                        <label className="text-sm font-medium text-zinc-200">Metode Pembayaran</label>
                        <div className="mt-1 grid grid-cols-3 gap-1.5">
                          {(
                            [
                              { value: "TRANSFER", icon: "🏦", label: "Transfer" },
                              { value: "WALLET", icon: "💰", label: "Wallet" },
                              { value: "POINTS", icon: "⭐", label: "Points" },
                            ] as const
                          ).map(({ value, icon, label }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => {
                                setPaymentMethod(value);
                                setPointsInput(0);
                              }}
                              className={`flex flex-col items-center gap-0.5 rounded-lg border py-2 text-xs font-medium transition ${
                                paymentMethod === value
                                  ? "border-violet-500 bg-violet-900/40 text-violet-300"
                                  : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600"
                              }`}
                            >
                              <span className="text-base">{icon}</span>
                              {label}
                            </button>
                          ))}
                        </div>
                        {/* Wallet balance info */}
                        {paymentMethod === "WALLET" && (
                          <p className="mt-1 text-xs text-zinc-500">
                            Saldo:{" "}
                            <span className="font-semibold text-zinc-300">
                              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(user?.Wallet?.balance ?? 0))}
                            </span>
                          </p>
                        )}
                        {/* Points balance info */}
                        {paymentMethod === "POINTS" && (
                          <p className="mt-1 text-xs text-zinc-500">
                            Points:{" "}
                            <span className="font-semibold text-amber-400">
                              {(user?.Wallet?.points ?? 0).toLocaleString("id-ID")} pts
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Points input — hanya untuk TRANSFER */}
                    {paymentMethod === "TRANSFER" && isAuthenticated && user?.role === "CUSTOMER" && (user?.Wallet?.points ?? 0) > 0 && (() => {
                      const subtotal = Number(event.price) * quantity;
                      const voucherDiscount = voucherApplied
                        ? voucherApplied.discountType === "PERCENTAGE"
                          ? (subtotal * voucherApplied.discountValue) / 100
                          : Math.min(voucherApplied.discountValue, subtotal)
                        : 0;
                      const afterVoucher = Math.max(0, subtotal - voucherDiscount);
                      const availablePoints = user?.Wallet?.points ?? 0;
                      const maxUsable = Math.min(availablePoints, Math.floor(afterVoucher));
                      return (
                        <div className="rounded-lg border border-amber-700/50 bg-amber-900/10 px-3 py-2.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-zinc-200">Kurangi dengan Points</p>
                              <p className="text-xs text-amber-400">
                                {availablePoints.toLocaleString("id-ID")} pts tersedia · max {maxUsable.toLocaleString("id-ID")} pts
                              </p>
                            </div>
                            {pointsInput > 0 && (
                              <button
                                type="button"
                                onClick={() => setPointsInput(0)}
                                className="text-xs text-zinc-500 hover:text-zinc-300"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              max={maxUsable}
                              value={pointsInput === 0 ? "" : pointsInput}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(maxUsable, Number(e.target.value) || 0));
                                setPointsInput(val);
                              }}
                              placeholder="0"
                              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <button
                              type="button"
                              onClick={() => setPointsInput(maxUsable)}
                              className="shrink-0 rounded-lg border border-amber-700 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-900/30"
                            >
                              Maks
                            </button>
                          </div>
                          {pointsInput > 0 && (
                            <p className="mt-1 text-xs text-amber-300">
                              Hemat {formatCurrency(pointsInput)} dari transfer
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Price Summary */}
                    {(() => {
                      const subtotal = Number(event.price) * quantity;
                      const voucherDiscount = voucherApplied
                        ? voucherApplied.discountType === "PERCENTAGE"
                          ? (subtotal * voucherApplied.discountValue) / 100
                          : Math.min(voucherApplied.discountValue, subtotal)
                        : 0;
                      const afterVoucher = Math.max(0, subtotal - voucherDiscount);
                      const availablePoints = user?.Wallet?.points ?? 0;
                      const pointsDiscount = paymentMethod === "TRANSFER"
                        ? Math.min(pointsInput, availablePoints, Math.floor(afterVoucher))
                        : paymentMethod === "POINTS"
                        ? Math.min(availablePoints, Math.ceil(afterVoucher))
                        : 0;
                      const finalTotal = Math.max(0, afterVoucher - pointsDiscount);
                      return (
                        <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-3 text-sm">
                          <div className="flex justify-between text-zinc-400">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                          </div>
                          {voucherDiscount > 0 && (
                            <div className="flex justify-between text-emerald-400">
                              <span>Voucher</span>
                              <span>- {formatCurrency(voucherDiscount)}</span>
                            </div>
                          )}
                          {pointsDiscount > 0 && (
                            <div className="flex justify-between text-amber-400">
                              <span>Points ({pointsDiscount.toLocaleString("id-ID")} pts)</span>
                              <span>- {formatCurrency(pointsDiscount)}</span>
                            </div>
                          )}
                          {paymentMethod === "WALLET" && afterVoucher > 0 && (
                            <div className="flex justify-between text-sky-400">
                              <span>Wallet</span>
                              <span>- {formatCurrency(afterVoucher)}</span>
                            </div>
                          )}
                          <div className="mt-1 flex justify-between border-t border-zinc-700 pt-1 font-bold text-zinc-100">
                            <span>Total</span>
                            <span>{formatCurrency(finalTotal)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <button
                  onClick={handleOrder}
                  disabled={ordering}
                  className="mt-5 w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {ordering
                    ? "Processing..."
                    : event.isFree
                      ? "Register for Free"
                      : paymentMethod === "TRANSFER"
                        ? "Pesan & Upload Bukti"
                        : paymentMethod === "WALLET"
                          ? "Bayar dengan Wallet"
                          : "Bayar dengan Points"}
                </button>
              </>
            )}

            {isPast && (
              <p className="mt-5 rounded-lg bg-zinc-700 py-3 text-center text-sm font-medium text-zinc-400">
                This event has ended
              </p>
            )}

            {isOwner && (
              <Link
                to="/organizer/dashboard"
                className="mt-5 block rounded-xl border border-violet-700 bg-violet-900/40 py-3 text-center text-sm font-bold text-violet-400 transition hover:bg-violet-900/60"
              >
                Manage Event
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReview && (
        <WriteReviewModal
          eventId={event.id}
          eventTitle={event.title}
          onClose={() => setShowReview(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </main>
  );
}
