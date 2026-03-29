import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { Voucher, EventItem } from "@/api/types";
import { formatDate, formatCurrency } from "@/lib/format";
import Spinner from "@/components/Spinner";

interface VoucherForm {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  startDate: string;
  endDate: string;
  maxUses: string;
}

const emptyForm: VoucherForm = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  startDate: "",
  endDate: "",
  maxUses: "1",
};

export default function VouchersPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<VoucherForm>(emptyForm);

  useEffect(() => {
    Promise.all([
      apiClient.get(API_ENDPOINTS.EVENTS.BY_ID(Number(eventId))),
      apiClient.get(API_ENDPOINTS.VOUCHERS.BY_EVENT(Number(eventId))),
    ])
      .then(([eventRes, vouchersRes]) => {
        setEvent(eventRes.data.data);
        setVouchers(vouchersRes.data.data);
      })
      .catch(() => toast.error("Failed to load vouchers"))
      .finally(() => setLoading(false));
  }, [eventId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await apiClient.post(API_ENDPOINTS.VOUCHERS.CREATE, {
        eventId: Number(eventId),
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        startDate: form.startDate,
        endDate: form.endDate,
        maxUses: Number(form.maxUses),
      });
      setVouchers((prev) => [data.data, ...prev]);
      setForm(emptyForm);
      toast.success("Voucher created!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create voucher");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(voucherId: number, code: string) {
    if (!confirm(`Delete voucher "${code}"?`)) return;
    try {
      await apiClient.delete(API_ENDPOINTS.VOUCHERS.DELETE(voucherId));
      setVouchers((prev) => prev.filter((v) => v.id !== voucherId));
      toast.success("Voucher deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete voucher");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </main>
    );
  }

  const now = new Date();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/organizer/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-200"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-zinc-100">Voucher Promotions</h1>
      {event && (
        <p className="mt-1 text-sm text-zinc-400">
          Event:{" "}
          <span className="font-medium text-zinc-200">{event.title}</span>
        </p>
      )}

      {/* Create Voucher Form */}
      <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-800 p-6">
        <h2 className="mb-4 text-base font-bold text-zinc-100">
          Create New Voucher
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Code */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">
                Voucher Code
              </label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. SUMMER20"
                required
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm uppercase text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Max Uses */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">
                Max Uses
              </label>
              <input
                name="maxUses"
                type="number"
                min="1"
                value={form.maxUses}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">
                Discount Type
              </label>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (Rp)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">
                Discount Value{" "}
                {form.discountType === "PERCENTAGE" ? "(%)" : "(Rp)"}
              </label>
              <input
                name="discountValue"
                type="number"
                min="1"
                max={form.discountType === "PERCENTAGE" ? "100" : undefined}
                step="0.01"
                value={form.discountValue}
                onChange={handleChange}
                placeholder={
                  form.discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 50000"
                }
                required
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">
                Start Date
              </label>
              <input
                name="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-300">
                End Date
              </label>
              <input
                name="endDate"
                type="datetime-local"
                value={form.endDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Voucher"}
          </button>
        </form>
      </div>

      {/* Vouchers List */}
      <div className="mt-8">
        <h2 className="mb-3 text-base font-bold text-zinc-100">
          Vouchers ({vouchers.length})
        </h2>

        {vouchers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 py-12 text-center">
            <p className="text-3xl">🎟️</p>
            <p className="mt-2 text-sm text-zinc-400">No vouchers yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vouchers.map((voucher) => {
              const isActive =
                now >= new Date(voucher.startDate) &&
                now <= new Date(voucher.endDate) &&
                voucher.usedCount < voucher.maxUses;
              const isExpired = now > new Date(voucher.endDate);
              const isExhausted = voucher.usedCount >= voucher.maxUses;

              let statusLabel = "Scheduled";
              let statusColor = "text-blue-400 bg-blue-900/40";
              if (isExpired) {
                statusLabel = "Expired";
                statusColor = "text-zinc-400 bg-zinc-700";
              } else if (isExhausted) {
                statusLabel = "Exhausted";
                statusColor = "text-orange-400 bg-orange-900/40";
              } else if (isActive) {
                statusLabel = "Active";
                statusColor = "text-emerald-400 bg-emerald-900/40";
              }

              return (
                <div
                  key={voucher.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-zinc-700 bg-zinc-800 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-zinc-700 px-2 py-0.5 font-mono text-sm font-bold text-violet-300">
                        {voucher.code}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-zinc-100">
                      {voucher.discountType === "PERCENTAGE"
                        ? `${voucher.discountValue}% off`
                        : `${formatCurrency(Number(voucher.discountValue))} off`}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {formatDate(voucher.startDate)} →{" "}
                      {formatDate(voucher.endDate)}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Used: {voucher.usedCount} / {voucher.maxUses}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(voucher.id, voucher.code)}
                    className="flex-shrink-0 rounded-lg border border-red-800 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-900/30"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
