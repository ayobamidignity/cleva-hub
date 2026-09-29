"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ResponsiveNav from "@/components/ambassador/ResponsiveNav";
import { ArrowLeft, Clock, CheckCircle, ChevronRight, Award, PlusCircle } from "lucide-react";

export default function AmbassadorTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL");
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((t) => {
    const userSubmission = t.submissions?.[0];
    if (activeTab === "IN_PROGRESS") {
      return userSubmission && userSubmission.status === "PENDING";
    }
    if (activeTab === "COMPLETED") {
      return userSubmission && userSubmission.status === "APPROVED";
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex w-full">
      <ResponsiveNav />

      <main className="flex-1 md:pl-64 lg:pl-72 pb-24 md:pb-12 pt-8 px-4 sm:px-8 lg:px-12 w-full max-w-5xl mx-auto">
        <header className="mb-6">
          <Link
            href="/ambassador"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 mb-2 md:hidden"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <span className="text-[11px] uppercase font-bold tracking-widest text-stone-400 block">
            Cleva Ambassador
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
            Campaigns & Tasks
          </h1>
        </header>

        {/* Tab Filters */}
        <div className="flex gap-2 mb-6 border-b border-stone-200/80 pb-3">
          {(["ALL", "IN_PROGRESS", "COMPLETED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                activeTab === tab
                  ? "bg-[#261505] text-[#FBF9F5]"
                  : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
              }`}
            >
              {tab === "ALL" ? "All Tasks" : tab === "IN_PROGRESS" ? "Submitted / Review" : "Completed"}
            </button>
          ))}
        </div>

        {/* Task Cards Grid */}
        {loading ? (
          <p className="text-xs text-stone-400 py-10">Loading campaigns...</p>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center text-xs text-stone-400">
            No tasks found under this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => {
              const submission = task.submissions?.[0];

              return (
                <div
                  key={task.id}
                  className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-amber-50 text-amber-900 px-2 py-0.5 rounded">
                        {task.category}
                      </span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100/50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> +{task.pointValue} pts
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-stone-900 mt-2">{task.title}</h2>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      {submission?.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                          <Clock className="w-3 h-3" /> Under Review
                        </span>
                      )}
                      {submission?.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-md">
                          <CheckCircle className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {!submission && (
                        <span className="text-[11px] font-medium text-stone-400">
                          Not submitted yet
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/ambassador/tasks/${task.id}`}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#261505] hover:bg-stone-800 text-white inline-flex items-center gap-1 transition-colors"
                    >
                      {submission ? "View Proof" : "Start Task"} <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}