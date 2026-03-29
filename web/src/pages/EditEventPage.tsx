import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import type { EventItem } from "@/api/types";
import { CATEGORY_LABELS } from "@/lib/format";
import Spinner from "@/components/Spinner";

const CATEGORIES = [
  "MUSIC", "SPORTS", "TECHNOLOGY", "BUSINESS",
  "FOOD", "ART", "EDUCATION", "OTHER",
];

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "0",
    category: "OTHER",
    startDate: "",
    endDate: "",
    capacity: "100",
    isFree: false,
  });

  useEffect(() => {
    apiClient
      .get(API_ENDPOINTS.EVENTS.BY_ID(Number(id)))
      .then(({ data }) => {
        const e: EventItem = data.data;
        setForm({
          title: e.title,
          description: e.description || "",
          location: e.location,
          price: String(e.price),
          category: e.category,
          startDate: toDateTimeLocal(e.startDate),
          endDate: toDateTimeLocal(e.endDate),
          capacity: String(e.capacity),
          isFree: e.isFree,
        });
        if (e.image) setPreview(e.image);
      })
      .catch(() => toast.error("Event not found"))
      .finally(() => setLoading(false));
  }, [id]);

  function toDateTimeLocal(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function update(field: string, value: string | boolean) {
    setForm((p) => ({
      ...p,
      [field]: value,
      ...(field === "isFree" && value === true ? { price: "0" } : {}),
    }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) =>
        formData.append(key, String(val)),
      );
      if (file) formData.append("image", file);

      await apiClient.put(API_ENDPOINTS.EVENTS.UPDATE(Number(id)), formData, {
        headers: { "content-type": "multipart/form-data" },
      });
      toast.success("Event updated!");
      navigate("/organizer/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
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
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/organizer/dashboard"
        className="mb-4 inline-flex text-sm text-zinc-400 hover:text-zinc-200"
      >
        ← Back to dashboard
      </Link>
      <h1 className="text-2xl font-bold text-zinc-100">Edit Event</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Update your event details below
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-zinc-200">
            Event Image
          </label>
          {preview ? (
            <div className="relative mt-2">
              <img
                src={preview}
                alt="Preview"
                className="h-52 w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                }}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white transition hover:bg-black/70"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              className="mt-2 flex h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 transition hover:border-violet-400 hover:bg-violet-900/20"
            >
              <input
                type="file"
                ref={inputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="text-3xl">📸</span>
              <p className="mt-2 text-sm font-medium text-zinc-300">
                Click to upload new image
              </p>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-zinc-200">
            Event Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-900"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-zinc-200">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-900"
          />
        </div>

        {/* Category & Location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-200">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 px-4 py-3 text-sm outline-none focus:border-violet-300"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-200">
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-900"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-200">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 px-4 py-3 text-sm outline-none focus:border-violet-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-200">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 px-4 py-3 text-sm outline-none focus:border-violet-300"
            />
          </div>
        </div>

        {/* Price & Capacity */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 sm:col-span-1">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => update("isFree", e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-violet-600"
              />
              <span className="text-sm font-medium text-zinc-200">
                Free Event
              </span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-200">
              Price (IDR)
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              disabled={form.isFree}
              min="0"
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 px-4 py-3 text-sm outline-none disabled:bg-zinc-900 disabled:text-zinc-500 focus:border-violet-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-200">
              Capacity
            </label>
            <input
              type="number"
              value={form.capacity}
              onChange={(e) => update("capacity", e.target.value)}
              min="1"
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 px-4 py-3 text-sm outline-none focus:border-violet-300"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to="/organizer/dashboard"
            className="flex-1 rounded-xl border border-zinc-700 py-3.5 text-center text-sm font-medium text-zinc-300 transition hover:bg-zinc-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-violet-600 py-3.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </main>
  );
}
