"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, CheckSquare, Users, Award, ArrowRight, Clock, Plus } from "lucide-react";

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [evtsRes, subsRes] = await Promise.all([
          fetch("/api/admin/events"),
          fetch("/api/admin/tasks"),
        ]);

        if (evtsRes.ok) setEvents(await evtsRes.json());
        if (subsRes.ok) setSubmissions(await subsRes.json());
      } catch (err) {
        console.error("Admin overview fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const pendingSubmissions = submissions.filter((s) => s.status === "PENDING");

  return (
    <div className="min-h-screen bg-[#FBF9F5] p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200/80 pb-6">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-widest text-stone-400 block">
              Cleva Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#261505] tracking-tight mt-0.5">
              Operations Hub
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Live overview of campus campaigns, attendee rosters, and reward approvals.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/events"
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors"
            >
              Manage Events
            </Link>
            <Link
              href="/admin/tasks"
              className="px-4 py-2 bg-[#261505] hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Review Tasks ({pendingSubmissions.length})
            </Link>
          </div>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-stone-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Scheduled Events</span>
              <Calendar className="w-4 h-4 text-amber-800" />
            </div>
            <span className="text-3xl font-extrabold text-stone-900">{events.length}</span>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-stone-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending Reviews</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-3xl font-extrabold text-amber-800">
              {pendingSubmissions.length}
            </span>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-stone-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Approved Proofs</span>
              <CheckSquare className="w-4 h-4 text-green-700" />
            </div>
            <span className="text-3xl font-extrabold text-green-800">
              {submissions.filter((s) => s.status === "APPROVED").length}
            </span>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center text-stone-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Campus Reps</span>
              <Users className="w-4 h-4 text-stone-600" />
            </div>
            <span className="text-3xl font-extrabold text-stone-900">
              {new Set(submissions.map((s) => s.userId)).size || 1}
            </span>
          </div>
        </div>

        {/* Action Shortcuts & Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events Box */}
          <section className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                Upcoming Events
              </h2>
              <Link
                href="/admin/events"
                className="text-xs font-bold text-amber-900 inline-flex items-center gap-1 hover:underline"
              >
                View all ({events.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <p className="text-xs text-stone-400 py-6">Loading events...</p>
            ) : events.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">No upcoming events found.</p>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 3).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                        {evt.format}
                      </span>
                      <h3 className="font-bold text-stone-900 text-xs mt-1.5">{evt.title}</h3>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {new Date(evt.eventDate).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })} • {evt.locationOrLink}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-800 font-mono">
                      +{evt.pointValue} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pending Task Submissions Box */}
          <section className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                Awaiting Approval
              </h2>
              <Link
                href="/admin/tasks"
                className="text-xs font-bold text-amber-900 inline-flex items-center gap-1 hover:underline"
              >
                Go to Review Queue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <p className="text-xs text-stone-400 py-6">Loading submissions...</p>
            ) : pendingSubmissions.length === 0 ? (
              <div className="text-center py-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <p className="text-xs font-medium text-stone-500">All submissions reviewed!</p>
                <span className="text-[11px] text-stone-400 mt-0.5 block">
                  New ambassador tasks will show up here.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingSubmissions.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">
                          {item.user?.fullName}
                        </span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-semibold">
                          Needs Review
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">{item.task?.title}</p>
                    </div>
                    <Link
                      href="/admin/tasks"
                      className="px-3 py-1.5 bg-[#261505] text-white rounded-lg text-xs font-bold hover:bg-stone-800 transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}