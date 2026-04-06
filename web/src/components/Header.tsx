import { Link, useNavigate } from "react-router";
import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const [search, setSearch] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/events?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  }

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

        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
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
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100"
            >
              Home
            </Link>
            <Link
              to="/events"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100"
            >
              Events
            </Link>
            <Link
              to="/organizers"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100"
            >
              Event Organizer
            </Link>
            <button className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100">
              About Us
            </button>
          </nav>
        </div>

        {/* Right: Search + Auth */}
        <div className="flex items-center gap-2">

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="rounded-lg border border-zinc-700 p-1.5 text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800 transition focus-within:border-violet-500">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-48 lg:w-64 px-3 py-1.5 text-sm text-zinc-100 bg-transparent outline-none placeholder:text-zinc-500"
          />
          <button type="submit" className="px-3 py-1.5 text-zinc-400 transition hover:text-violet-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>
        </form>

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
