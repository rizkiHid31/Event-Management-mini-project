import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { useAuthStore } from "@/store/auth.store";
import type { User } from "@/api/types";
import { formatCurrency } from "@/lib/format";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ProfilePage() {
  const { updateUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", bio: "" });

  useEffect(() => {
    apiClient
      .get(API_ENDPOINTS.USERS.PROFILE)
      .then(({ data }) => {
        setProfile(data.data);
        setForm({
          name: data.data.name || "",
          phone: data.data.phone || "",
          bio: data.data.bio || "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const { data } = await apiClient.put(
        API_ENDPOINTS.USERS.UPDATE_PROFILE,
        form,
      );
      setProfile((p) => (p ? { ...p, ...data.data } : p));
      updateUser(data.data);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <LoadingSpinner text="Loading profile..." />
      </main>
    );
  }

  if (!profile) return null;

  const balance = profile.Wallet ? Number(profile.Wallet.balance) : 0;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-2xl border border-zinc-700 bg-zinc-800">
        {/* Avatar */}
        <div className="flex flex-col items-center border-b border-zinc-700 px-8 py-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-900/40 text-3xl font-bold text-violet-400">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="mt-4 text-xl font-bold text-zinc-100">
            {profile.name}
          </h1>
          <p className="text-sm text-zinc-500">{profile.email}</p>
          <span className="mt-2 rounded-full bg-violet-900/40 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-violet-400">
            {profile.role}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-px border-b border-zinc-700 bg-zinc-700 sm:grid-cols-4">
          {[
            {
              label: "Orders",
              value: profile._count?.Orders || 0,
            },
            {
              label: "Referrals",
              value: profile._count?.Referrals || 0,
            },
            {
              label: "Reviews",
              value: profile._count?.Reviews || 0,
            },
            {
              label: "Wallet",
              value: formatCurrency(balance),
              link: "/wallet",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-zinc-800 px-4 py-4 text-center"
            >
              <p className="text-lg font-bold text-zinc-100">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
              {stat.link && (
                <Link
                  to={stat.link}
                  className="mt-1 inline-block text-xs text-violet-600 hover:underline"
                >
                  Details →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Referral Code */}
        <div className="border-b border-zinc-700 px-8 py-5">
          <div className="flex items-center justify-between rounded-xl bg-violet-900/40 px-4 py-3">
            <div>
              <p className="text-xs font-medium text-violet-400">
                Your Referral Code
              </p>
              <p className="mt-0.5 text-lg font-bold tracking-widest text-violet-200">
                {profile.referralCode}
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(profile.referralCode);
                toast.success("Referral code copied!");
              }}
              className="rounded-lg bg-violet-900/40 px-3 py-1.5 text-xs font-semibold text-violet-400 transition hover:bg-violet-900/60"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-100">Profile Details</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-sm font-medium text-violet-600 hover:underline"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="text-sm text-zinc-500 hover:underline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-violet-600 px-3 py-1 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500">
                Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-900"
                />
              ) : (
                <p className="mt-1 text-sm text-zinc-100">{profile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500">
                Phone
              </label>
              {editing ? (
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="e.g. +62 812..."
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-900"
                />
              ) : (
                <p className="mt-1 text-sm text-zinc-100">
                  {profile.phone || "—"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500">
                Bio
              </label>
              {editing ? (
                <textarea
                  value={form.bio}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, bio: e.target.value }))
                  }
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 px-3 py-2 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-900"
                />
              ) : (
                <p className="mt-1 text-sm text-zinc-100">
                  {profile.bio || "—"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
