import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/api/types";

export default function RegisterPage() {
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER" as UserRole,
    usedReferralCode: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! Please sign in.");
      navigate("/auth/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  function update(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-100">Create an account</h1>
          <p className="mt-1 text-sm text-zinc-500">Join Eventify today</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-200">Full Name</label>
            <input
              type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
              placeholder="John Doe"
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200">Email</label>
            <input
              type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200">Password</label>
            <input
              type="password" value={form.password} onChange={(e) => update("password", e.target.value)}
              placeholder="Min 6 chars, uppercase, lowercase, number, symbol"
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200">I want to</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(["CUSTOMER", "ORGANIZER"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => update("role", role)}
                  className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                    form.role === role
                      ? "border-violet-500 bg-violet-900/40 text-violet-300"
                      : "border-zinc-700 text-zinc-300 hover:border-zinc-600"
                  }`}
                >
                  {role === "CUSTOMER" ? "🎫 Attend Events" : "🎪 Organize Events"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-200">Referral Code (optional)</label>
            <input
              type="text" value={form.usedReferralCode} onChange={(e) => update("usedReferralCode", e.target.value)}
              placeholder="Enter a referral code"
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-900"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link to="/auth/login" className="font-semibold text-violet-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
