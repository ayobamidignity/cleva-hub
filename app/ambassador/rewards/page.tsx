"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ResponsiveNav from "@/components/ambassador/ResponsiveNav";
import {
  Gift,
  ShoppingBag,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

export default function AmbassadorRewardsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"CATALOG" | "HISTORY">("CATALOG");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch("/api/ambassador/rewards");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRedeem = async (reward: any) => {
    if (!confirm(`Are you sure you want to redeem "${reward.title}" for ${reward.pointCost} points?`)) {
      return;
    }

    setRedeemingId(reward.id);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/ambassador/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId: reward.id }),
      });

      const result = await res.json();
      if (res.ok) {
        setSuccessMessage(`Successfully redeemed ${reward.title}! Check your History tab.`);
        await loadData();
      } else {
        alert(result.error || "Redemption failed.");
      }
    } finally {
      setRedeemingId(null);
    }
  };

  const balance = data?.balance || 0;
  const rewards = data?.rewards || [];
  const redemptions = data?.redemptions || [];

  const categories = ["ALL", ...Array.from(new Set(rewards.map((r: any) => r.category)))];

  const filteredRewards = rewards.filter((r: any) => {
    if (categoryFilter === "ALL") return true;
    return r.category === categoryFilter;
  });

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex w-full">
      <ResponsiveNav />

      <main className="flex-1 md:pl-64 lg:pl-72 pb-24 md:pb-12 pt-8 px-4 sm:px-8 lg:px-12 w-full max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <Link
          href="/ambassador"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        {/* Top Header */}
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-widest text-stone-400 block">
              Cleva Ambassador
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#261505] tracking-tight mt-0.5">
              Rewards & Redemption Store
            </h1>
          </div>

          {/* Quick Balance Pill */}
          <div className="bg-[#261505] text-[#FBF9F5] px-5 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div className="text-xs">
              <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                Spendable Balance
              </span>
              <span className="font-extrabold text-sm sm:text-base text-amber-300">
                {balance.toLocaleString()} pts
              </span>
            </div>
          </div>
        </header>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-xs px-4 py-3 rounded-2xl mb-6 flex items-center justify-between">
            <span className="font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> {successMessage}
            </span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-stone-400 hover:text-stone-600 font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-stone-200 pb-3 mb-6">
          <button
            onClick={() => setActiveTab("CATALOG")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "CATALOG"
                ? "bg-[#261505] text-[#FBF9F5]"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            Rewards Catalog
          </button>
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "HISTORY"
                ? "bg-[#261505] text-[#FBF9F5]"
                : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            Redemption History ({redemptions.length})
          </button>
        </div>

        {/* Tab 1: Catalog */}
        {activeTab === "CATALOG" && (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat: any) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    categoryFilter === cat
                      ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {cat === "ALL" ? "All Perks" : cat}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-xs text-stone-400 py-12 text-center">Loading rewards store...</p>
            ) : filteredRewards.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-xs text-stone-400">
                No items available under this category.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRewards.map((reward: any) => {
                  const canAfford = balance >= reward.pointCost;

                  return (
                    <div
                      key={reward.id}
                      className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                            {reward.category}
                          </span>
                          <span className="text-xs font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-mono">
                            {reward.pointCost} pts
                          </span>
                        </div>

                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center mb-3">
                          <Gift className="w-6 h-6" />
                        </div>

                        <h3 className="text-base font-extrabold text-stone-900">{reward.title}</h3>
                        <p className="text-xs text-stone-500 mt-1.5 line-clamp-3 leading-relaxed">
                          {reward.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                        {canAfford ? (
                          <span className="text-[11px] font-bold text-green-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-stone-400">
                            Need {reward.pointCost - balance} more pts
                          </span>
                        )}

                        <button
                          disabled={!canAfford || redeemingId === reward.id}
                          onClick={() => handleRedeem(reward)}
                          className="px-4 py-2 bg-[#261505] hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {redeemingId === reward.id ? "Redeeming..." : "Redeem Perk"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: History */}
        {activeTab === "HISTORY" && (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4">
              Your Past Redemptions
            </h2>

            {redemptions.length === 0 ? (
              <div className="text-center py-12 text-xs text-stone-400">
                You haven&apos;t redeemed any perks yet. Earn points by completing tasks and events!
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {redemptions.map((red: any) => (
                  <div key={red.id} className="py-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">{red.reward?.title}</h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Redeemed on{" "}
                        {new Date(red.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-stone-800 block">
                        -{red.pointsPaid} pts
                      </span>
                      <span
                        className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          red.status === "FULFILLED"
                            ? "bg-green-100 text-green-800"
                            : red.status === "PROCESSING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {red.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}