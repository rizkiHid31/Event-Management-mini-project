import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/api/endpoints";
import { formatCurrency, formatDate } from "@/lib/format";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Attendee {
  id: number;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  Customer: { id: number; name: string; email: string };
}

export default function AttendeeListPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get(API_ENDPOINTS.EVENTS.ATTENDEES(Number(eventId))),
      apiClient.get(API_ENDPOINTS.EVENTS.BY_ID(Number(eventId))),
    ])
      .then(([attendeesRes, eventRes]) => {
        setAttendees(attendeesRes.data.data);
        setEventTitle(eventRes.data.data?.title || "");
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  const totalTickets = attendees.reduce((s, a) => s + a.quantity, 0);
  const totalRevenue = attendees.reduce((s, a) => s + Number(a.totalAmount), 0);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <LoadingSpinner text="Loading attendees..." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        to="/organizer/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200"
      >
        ← Back to Dashboard
      </Link>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Attendee List</h1>
          {eventTitle && <p className="mt-0.5 text-sm text-zinc-500">{eventTitle}</p>}
        </div>
        <div className="flex gap-4 text-sm text-zinc-400">
          <span><span className="font-bold text-zinc-100">{attendees.length}</span> attendees</span>
          <span><span className="font-bold text-zinc-100">{totalTickets}</span> tickets</span>
          <span><span className="font-bold text-emerald-400">{formatCurrency(totalRevenue)}</span> revenue</span>
        </div>
      </div>

      {attendees.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-zinc-700 py-16 text-center">
          <p className="text-4xl">🎟️</p>
          <p className="mt-2 text-lg font-medium text-zinc-300">No attendees yet</p>
          <p className="text-sm text-zinc-500">Orders will appear here once confirmed.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 bg-zinc-800/80">
                <th className="px-4 py-3 text-left font-semibold text-zinc-400">#</th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-400">Name</th>
                <th className="hidden px-4 py-3 text-left font-semibold text-zinc-400 sm:table-cell">Email</th>
                <th className="px-4 py-3 text-center font-semibold text-zinc-400">Qty</th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-400">Total Paid</th>
                <th className="hidden px-4 py-3 text-center font-semibold text-zinc-400 sm:table-cell">Status</th>
                <th className="hidden px-4 py-3 text-right font-semibold text-zinc-400 md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((a, i) => (
                <tr
                  key={a.id}
                  className="border-b border-zinc-700/50 bg-zinc-800 transition hover:bg-zinc-700/40 last:border-0"
                >
                  <td className="px-4 py-3 text-zinc-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-zinc-100">{a.Customer.name}</td>
                  <td className="hidden px-4 py-3 text-zinc-400 sm:table-cell">{a.Customer.email}</td>
                  <td className="px-4 py-3 text-center font-bold text-zinc-100">{a.quantity}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                    {formatCurrency(Number(a.totalAmount))}
                  </td>
                  <td className="hidden px-4 py-3 text-center sm:table-cell">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      a.status === "DONE" || a.status === "PAID"
                        ? "bg-emerald-900/40 text-emerald-400"
                        : "bg-blue-900/40 text-blue-400"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-right text-zinc-500 md:table-cell">
                    {formatDate(a.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-600 bg-zinc-800/80">
                <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-zinc-400">Total</td>
                <td className="px-4 py-3 text-center font-bold text-zinc-100">{totalTickets}</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-400">{formatCurrency(totalRevenue)}</td>
                <td colSpan={2} className="hidden sm:table-cell" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </main>
  );
}
