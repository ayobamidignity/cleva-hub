"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ResponsiveNav from "@/components/ambassador/ResponsiveNav";
import { ChevronRight, Calendar, Sparkles, ArrowUpRight, Award } from "lucide-react";

export default function AmbassadorDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [upcomingEvent, setUpcomingEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch("/api/ambassador/me");
        if (userRes.ok) setProfile(await userRes.json());

        const evtRes = await fetch("/api/events?filter=upcoming");
        if (evtRes.ok) {
          const events = await evtRes.json();
          if (events.length > 0) setUpcomingEvent(events[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex w-full">
      {/* Responsive Navigation Shell (Sidebar on Desktop, Bottom Bar on Mobile) */}
      <ResponsiveNav user={profile} />

      {/* Main Content Area spanning full width */}
      <main className="flex-1 md:pl-64 lg:pl-72 pb-24 md:pb-12 pt-8 px-4 sm:px-8 lg:px-12 w-full max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-widest text-stone-400 block">
              Cleva Ambassador
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2 mt-1">
              Hey, {profile?.fullName?.split(" ")[0] || "Amara"} <span>👋</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-stone-900">
                {profile?.fullName || "Cleva Ambassador"}
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                {profile?.campus || "Campus Ambassador"}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-950 text-sm">
              {profile?.fullName?.charAt(0) || "C"}
            </div>
          </div>
        </header>

        {/* Dashboard Grid Layout (1 column on mobile, 3 columns on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: Balance Card + Stats + Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dark Walnut Balance Card */}
            <div className="bg-[#261505] text-[#FBF9F5] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold tracking-wider uppercase text-amber-200/80">
                  Your Balance
                </span>
                <Link
                  href="/ambassador/rewards"
                  className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 px-3.5 py-1.5 rounded-full font-medium transition-colors"
                >
                  History &rarr;
                </Link>
              </div>

              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-3 flex items-baseline gap-2">
                {profile?.pointsBalance?.toLocaleString() || "100"}
                <span className="text-base font-semibold text-amber-300/80">pts</span>
              </div>

              {/* Progress Bar to next tier */}
              <div className="mt-8 pt-5 border-t border-white/10">
                <div className="flex justify-between text-xs text-stone-300 mb-2 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 520 pts to Gold Tier
                  </span>
                  <span className="font-bold text-amber-300">82%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-200 h-2 rounded-full w-[82%]" />
                </div>
              </div>
            </div>

            {/* Metric Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                <span className="text-3xl font-extrabold text-stone-900 block">4</span>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 mt-1 block">
                  Active Tasks
                </span>
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                <span className="text-3xl font-extrabold text-stone-900 block">#12</span>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 mt-1 block">
                  Campus Rank
                </span>
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm col-span-2 sm:col-span-1">
                <span className="text-3xl font-extrabold text-amber-700 block">1</span>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 mt-1 block">
                  Events Attended
                </span>
              </div>
            </div>

            {/* Active Tasks Feed */}
            <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                  Active Tasks
                </h2>
                <Link href="/ambassador/tasks" className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  View all <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                <div className="p-4 border border-stone-100 rounded-xl bg-stone-50/50 flex items-center justify-between hover:bg-stone-50 transition-colors">
                  <div>
                    <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      In Progress
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm mt-1">Create a campus reel</h4>
                    <p className="text-xs text-stone-500 mt-0.5">Film 15-30s reel on campus life</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 font-mono">+450 pts</span>
                </div>

                <div className="p-4 border border-stone-100 rounded-xl bg-stone-50/50 flex items-center justify-between hover:bg-stone-50 transition-colors">
                  <div>
                    <span className="text-[10px] font-bold uppercase bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                      Upcoming
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm mt-1">Invite 5 friends to Cleva</h4>
                    <p className="text-xs text-stone-500 mt-0.5">Share your referral link on WhatsApp</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 font-mono">+250 pts</span>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Up Next Event Widget & Perks */}
          <div className="space-y-6">
            <section className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400">
                  Up Next
                </h2>
                <Link href="/events" className="text-xs font-semibold text-amber-900">
                  See all
                </Link>
              </div>

              {upcomingEvent ? (
                <div className="border border-stone-200/80 rounded-2xl p-4 bg-stone-50/50">
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded uppercase">
                    {upcomingEvent.format}
                  </span>
                  <h3 className="font-bold text-stone-900 text-sm mt-2">{upcomingEvent.title}</h3>
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(upcomingEvent.eventDate).toLocaleDateString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-stone-400 mt-1 truncate">{upcomingEvent.locationOrLink}</p>

                  <div className="mt-4 pt-3 border-t border-stone-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-amber-700">+{upcomingEvent.pointValue} pts</span>
                    <Link
                      href="/events"
                      className="text-xs font-bold text-white bg-[#261505] hover:bg-stone-800 px-3 py-1.5 rounded-lg"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-400 text-center py-6">No registered events yet.</p>
              )}
            </section>

            {/* Ambassador Tier Status Widget */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-950 text-sm">Silver Ambassador</h4>
                  <p className="text-xs text-amber-800/80">Next perk: Exclusive Cleva Merch Box</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}