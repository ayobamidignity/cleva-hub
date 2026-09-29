"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ResponsiveNav from "@/components/ambassador/ResponsiveNav";
import {
  Trophy,
  Award,
  Sparkles,
  Copy,
  Check,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function AmbassadorProfilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/ambassador/profile");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const copyReferral = () => {
    if (!data?.user?.referralCode) return;
    const url = `https://getcleva.com/join?ref=${data.user.referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex w-full">
        <ResponsiveNav />
        <main className="flex-1 md:pl-64 lg:pl-72 p-8">
          <p className="text-xs text-stone-400">Loading ambassador profile...</p>
        </main>
      </div>
    );
  }

  const { user, leaderboard } = data || {};

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex w-full">
      <ResponsiveNav user={user} />

      <main className="flex-1 md:pl-64 lg:pl-72 pb-24 md:pb-12 pt-8 px-4 sm:px-8 lg:px-12 w-full max-w-6xl mx-auto">
        {/* Top Header */}
        <header className="mb-8">
          <span className="text-[11px] uppercase font-bold tracking-widest text-stone-400 block">
            Cleva Ambassador
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#261505] tracking-tight mt-1">
            Profile & Leaderboard
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Ambassador Card, Perks & Referral Link */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dark Walnut Profile Hero Card */}
            <div className="bg-[#261505] text-[#FBF9F5] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-200/20 border border-amber-400/30 flex items-center justify-center font-extrabold text-amber-200 text-2xl">
                    {user?.fullName?.charAt(0) || "A"}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold tracking-tight text-white">
                      {user?.fullName}
                    </h2>
                    <p className="text-xs text-stone-300 font-medium mt-0.5">
                      {user?.campus || "Campus Ambassador"}
                    </p>
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {user?.tier} Ambassador
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-semibold uppercase text-stone-400 block tracking-wider">
                    Total Balance
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white mt-0.5">
                    {user?.pointsBalance?.toLocaleString()}{" "}
                    <span className="text-sm font-semibold text-amber-300">pts</span>
                  </div>
                </div>
              </div>

              {/* Tier Progress Indicator */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center text-xs text-stone-300 mb-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Tier Progress: {user?.tier} &rarr; {user?.nextTier}
                  </span>
                  <span className="font-bold text-amber-300">{user?.progressPercent}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-100 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${user?.progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-2">
                  Earn {Math.max(0, user?.nextTierPoints - user?.pointsBalance)} more pts to unlock{" "}
                  <span className="text-amber-200 font-semibold">{user?.nextTier} Status Perks</span>.
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                <span className="text-xs uppercase font-bold text-stone-400 block">Rank</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#261505] mt-1 block">
                  #{user?.rank}
                </span>
                <span className="text-[11px] text-stone-500 mt-0.5 block">Campus rep rank</span>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                <span className="text-xs uppercase font-bold text-stone-400 block">Tasks Completed</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1 block">
                  {user?.approvedTasksCount || 0}
                </span>
                <span className="text-[11px] text-stone-500 mt-0.5 block">Approved proofs</span>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                <span className="text-xs uppercase font-bold text-stone-400 block">Events</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1 block">
                  {user?.eventsAttendedCount || 0}
                </span>
                <span className="text-[11px] text-stone-500 mt-0.5 block">Attended & verified</span>
              </div>
            </div>

            {/* Custom Referral Link Box */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-stone-900">Your Campus Referral Link</h3>
                <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  +100 pts per signup
                </span>
              </div>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Share this referral link with students on your campus. Every verified onboarding credits points straight to your balance.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`https://getcleva.com/join?ref=${user?.referralCode || "CLEVA"}`}
                  className="flex-1 bg-stone-50 border border-stone-200 text-stone-700 text-xs px-4 py-2.5 rounded-xl font-mono focus:outline-none"
                />
                <button
                  onClick={copyReferral}
                  className="px-4 py-2.5 bg-[#261505] hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Campus Rep Leaderboard */}
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-700">
                    Campus Leaderboard
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500 px-2 py-0.5 rounded">
                  Top 10
                </span>
              </div>

              <div className="divide-y divide-stone-100">
                {leaderboard?.map((ambassador: any, idx: number) => {
                  const isCurrent = ambassador.id === user?.id;

                  return (
                    <div
                      key={ambassador.id}
                      className={`py-3.5 flex items-center justify-between transition-colors ${
                        isCurrent ? "bg-amber-50/60 -mx-3 px-3 rounded-xl" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 text-center font-extrabold text-xs ${
                            idx === 0
                              ? "text-amber-500 text-sm"
                              : idx === 1
                              ? "text-stone-400 text-sm"
                              : idx === 2
                              ? "text-amber-700 text-sm"
                              : "text-stone-400"
                          }`}
                        >
                          {idx + 1}
                        </span>

                        <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 text-xs">
                          {ambassador.fullName.charAt(0)}
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-stone-900 leading-snug flex items-center gap-1.5">
                            {ambassador.fullName}
                            {isCurrent && (
                              <span className="text-[9px] uppercase font-bold bg-[#261505] text-[#FBF9F5] px-1.5 py-0.2 rounded">
                                You
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] text-stone-400 block truncate max-w-[130px]">
                            {ambassador.campus || "Cleva Ambassador"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-amber-900 block">
                          {ambassador.pointsBalance.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium">pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}