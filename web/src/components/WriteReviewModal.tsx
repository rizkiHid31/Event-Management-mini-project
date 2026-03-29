import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";

interface Props {
  eventId: number;
  eventTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WriteReviewModal({ eventId, eventTitle, onClose, onSuccess }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.REVIEWS.CREATE, {
        eventId,
        rating,
        comment,
      });
      toast.success("Review submitted!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-800 p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-zinc-400 transition hover:text-zinc-200"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold text-zinc-100">Write a Review</h2>
        <p className="mt-1 text-sm text-zinc-500">{eventTitle}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-200">Rating</label>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl transition-transform hover:scale-110"
                >
                  {star <= rating ? "★" : "☆"}
                </button>
              ))}
              <span className="ml-2 self-center text-sm text-zinc-500">{rating}/5</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Tell others about your experience..."
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-900"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
