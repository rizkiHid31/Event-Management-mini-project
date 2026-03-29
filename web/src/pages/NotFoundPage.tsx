import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl font-black text-violet-200">404</p>
        <h1 className="mt-4 text-2xl font-bold text-zinc-100">Page not found</h1>
        <p className="mt-2 text-zinc-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
