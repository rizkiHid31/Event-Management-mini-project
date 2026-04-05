import { Link, useNavigate } from "react-router";
import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
    setMenuOpen(false);
  }

  const dashboardLink =
    user?.role === "ORGANIZER" ? "/organizer/dashboard" : "/customer/orders";

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-700 bg-zinc-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-black text-white">
            ME
          </span>
          <span className="hidden sm:inline">Master Event</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100"
          >
            Home
          </Link>
          <Link
            to="/events"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100"
          >
            Events
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((p) => !p)}
                className="flex items-center gap-2 rounded-full border border-zinc-700 py-1.5 pl-3 pr-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:shadow-sm"
              >
                <span className="max-w-[120px] truncate">{user.name}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-900/40 text-xs font-bold text-violet-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-zinc-700 bg-zinc-800 py-1 shadow-lg">
                    <div className="border-b border-zinc-700 px-4 py-3">
                      <p className="text-sm font-semibold text-zinc-100">
                        {user.name}
                      </p>
                      <p className="text-xs text-zinc-400">{user.email}</p>
                      <span className="mt-1 inline-block rounded-full bg-violet-900/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to={dashboardLink}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-200 transition hover:bg-zinc-700"
                    >
                      <span className="text-base">
                        {user.role === "ORGANIZER" ? "📊" : "🎫"}
                      </span>
                      {user.role === "ORGANIZER" ? "Dashboard" : "My Orders"}
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-200 transition hover:bg-zinc-700"
                    >
                      <span className="text-base">👤</span>
                      Profile
                    </Link>

                    <Link
                      to="/wallet"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-200 transition hover:bg-zinc-700"
                    >
                      <span className="text-base">💰</span>
                      Wallet
                    </Link>

                    {user.role === "ORGANIZER" && (
                      <Link
                        to="/organizer/event/create"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-200 transition hover:bg-zinc-700"
                      >
                        <span className="text-base">➕</span>
                        Create Event
                      </Link>
                    )}

                    <div className="border-t border-zinc-700">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                      >
                        <span className="text-base">🚪</span>
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
              >
                Log in
              </Link>
              <Link
                to="/auth/register"
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
