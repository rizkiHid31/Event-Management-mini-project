import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { formatCurrency } from "@/lib/format";
import type { User } from "@/api/types";

export default function WalletPage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get(API_ENDPOINTS.USERS.PROFILE)
      .then(({ data }) => {
        console.log("[WalletPage] raw profile:", data.data);
        console.log("[WalletPage] Wallet:", data.data?.Wallet);
        console.log("[WalletPage] points:", data.data?.Wallet?.points);
        setProfile(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-40 rounded-2xl bg-zinc-700" />
        </div>
      </main>
    );
  }

  const balance = profile?.Wallet ? Number(profile.Wallet.balance) : 0;
  const points = profile?.Wallet?.points ?? 0;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-100">My Wallet</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Manage your balance and earn rewards
      </p>

      {/* Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Balance Card */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-violet-200">Wallet Balance</p>
          <p className="mt-2 text-3xl font-extrabold">{formatCurrency(balance)}</p>
          <p className="mt-4 text-xs text-violet-300">
            {profile?._count?.Referrals || 0} referrals earned
          </p>
        </div>

        {/* Points Card */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 p-6 text-white shadow-lg">
          <p className="text-sm font-medium text-amber-100">Points Balance</p>
          <p className="mt-2 text-3xl font-extrabold">
            {points.toLocaleString("id-ID")}
            <span className="ml-1 text-lg font-semibold">pts</span>
          </p>
          <p className="mt-4 text-xs text-amber-100">
            ≈ {formatCurrency(points)} · 1% cashback per order
          </p>
        </div>
      </div>

      {/* Referral Section — CUSTOMER only */}
      {profile?.role === "CUSTOMER" && (
        <div className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-800 p-6">
          <h2 className="text-lg font-bold text-zinc-100">Earn More</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Share your referral code with friends. Both of you get Rp 10,000 bonus!
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 rounded-xl bg-violet-900/40 px-4 py-3">
              <p className="text-xs font-medium text-violet-400">Your Referral Code</p>
              <p className="mt-1 text-xl font-bold tracking-widest text-violet-200">
                {profile?.referralCode}
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(profile?.referralCode || "");
                alert("Referral code copied!");
              }}
              className="rounded-xl border border-violet-700 bg-violet-900/40 px-4 py-3 text-sm font-semibold text-violet-400 transition hover:bg-violet-900/60"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-800 p-6">
        <h2 className="text-lg font-bold text-zinc-100">How it works</h2>
        <div className="mt-4 space-y-4">
          {[
            {
              icon: "🔗",
              title: "Share your code",
              desc: "Give your referral code to friends who want to join Eventify.",
            },
            {
              icon: "👤",
              title: "Friend registers",
              desc: "When they sign up using your code, you both receive Rp 10,000.",
            },
            {
              icon: "💰",
              title: "Use your balance",
              desc: "Wallet balance is automatically used when purchasing event tickets.",
            },
            {
              icon: "⭐",
              title: "Earn & use points",
              desc: "Get 1% of your ticket price back as points on every confirmed order. Use points to reduce future purchases (1 point = Rp 1).",
            },
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-700 text-xl">
                {step.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-100">{step.title}</p>
                <p className="text-sm text-zinc-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center">
        <Link
          to="/profile"
          className="text-sm text-violet-600 hover:underline"
        >
          ← Back to Profile
        </Link>
      </div>
    </main>
  );
}
