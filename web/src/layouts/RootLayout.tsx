import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import { Outlet } from "react-router";
import { Toaster } from "sonner";

export default function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-900">
      <Toaster position="bottom-right" richColors />
      <Header />
      <PageTransition>
        <Outlet />
      </PageTransition>
      <footer className="border-t border-zinc-700 bg-zinc-800 py-8 text-center text-sm text-zinc-400">
        <div className="mx-auto max-w-7xl px-4">
          <p className="font-medium text-zinc-100">Master Event</p>
          <p className="mt-1">Discover and manage events seamlessly.</p>
        </div>
      </footer>
    </div>
  );
}
