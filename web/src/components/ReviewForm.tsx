import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";

interface Props {
  eventId: number;
  onReviewCreated: () => void;
}

export default function ReviewForm({ eventId, onReviewCreated }: Props) {
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
      setComment("");
      setRating(5);
      onReviewCreated();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star Rating */}
      <div>
        <label className="block text-xs font-medium text-zinc-500">Rating</label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-xl transition-transform hover:scale-110"
            >
              {star <= rating ? "★" : "☆"}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Share your experience..."
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-900"
      />

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
