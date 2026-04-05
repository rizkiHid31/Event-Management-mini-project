import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {sent ? (
          <div className="rounded-2xl border border-emerald-700 bg-emerald-900/20 p-8 text-center">
            <p className="text-4xl">📧</p>
            <h1 className="mt-3 text-xl font-bold text-zinc-100">Check your email</h1>
            <p className="mt-2 text-sm text-zinc-400">
              If <strong className="text-zinc-200">{email}</strong> is registered, we've sent a password reset link. Check your inbox.
            </p>
            <Link
              to="/auth/login"
              className="mt-6 inline-block text-sm font-medium text-violet-400 hover:underline"
            >
              ← Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-zinc-100">Forgot password?</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Enter your email and we'll send a reset link.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-200">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-900"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-zinc-500">
              Remembered it?{" "}
              <Link to="/auth/login" className="font-semibold text-violet-600 hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
