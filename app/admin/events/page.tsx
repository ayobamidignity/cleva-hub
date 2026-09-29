"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users, Calendar, MapPin, CheckCircle, ArrowRight, Scan } from "lucide-react";
import RosterDrawer from "@/components/admin/RosterDrawer";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error("Failed to load events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF9F5] p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-widest text-stone-400 block">
              Cleva Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#261505] tracking-tight mt-0.5">
              Event Operations
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Manage events, check-in attendees, and track ambassador participation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/tasks"
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              Task Submissions Review <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Step 4 Scanner Link */}
            <Link
              href="/admin/scan"
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Scan className="w-4 h-4" /> Scan Passes
            </Link>

            <Link
              href="/admin/events/new"
              className="px-4 py-2 bg-[#261505] hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Event
            </Link>
          </div>
        </header>

        {/* Events Table / Card List */}
        {loading ? (
          <p className="text-xs text-stone-400 py-12 text-center">Loading events...</p>
        ) : events.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-xs text-stone-400">
            No events scheduled yet. Click &quot;Create Event&quot; to publish your first one.
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-[11px] uppercase font-bold text-stone-500 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Event Details</th>
                    <th className="py-3.5 px-4">Date & Format</th>
                    <th className="py-3.5 px-4">Points</th>
                    <th className="py-3.5 px-4">Registrations</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {events.map((evt) => {
                    const totalRegs = evt.registrations?.length || 0;
                    const attended = evt.registrations?.filter((r: any) => r.attended).length || 0;

                    return (
                      <tr key={evt.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <h2 className="font-bold text-stone-900 text-xs">{evt.title}</h2>
                          <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {evt.locationOrLink}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-stone-800">
                            {new Date(evt.eventDate).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="block text-[10px] uppercase font-bold text-stone-400 mt-0.5">
                            {evt.format}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-amber-800">
                          +{evt.pointValue} pts
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium">
                            {attended} / {totalRegs} checked in
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedEventId(evt.id)}
                            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                          >
                            <Users className="w-3.5 h-3.5" /> Roster &amp; Check-In
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Roster & Check-In Drawer */}
      <RosterDrawer
        eventId={selectedEventId}
        onClose={() => {
          setSelectedEventId(null);
          fetchEvents();
        }}
      />
    </div>
  );
}