"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Check, X, Clock, Award, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminTasksReviewPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState<{ [key: string]: string }>({});

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/tasks");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleReview = async (submissionId: string, status: "APPROVED" | "REJECTED") => {
    setActionLoading(submissionId);
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          status,
          reviewNotes: feedbackNotes[submissionId] || "",
        }),
      });

      if (res.ok) {
        await fetchSubmissions();
      } else {
        const err = await res.json();
        alert(err.error || "Review action failed");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = submissions.filter((s) => {
    if (filter === "ALL") return true;
    return s.status === filter;
  });

  return (
    <div className="min-h-screen bg-[#FBF9F5] p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Link
              href="/admin/events"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Event Operations
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#261505] tracking-tight">
              Task Submissions Review
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Verify proof of work and award ambassador points
            </p>
          </div>

          <div className="flex gap-2">
            {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === tab
                    ? "bg-[#261505] text-[#FBF9F5] shadow-sm"
                    : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        {loading ? (
          <p className="text-xs text-stone-400 py-12 text-center">Loading submissions...</p>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-xs text-stone-400">
            No submissions found under the selected filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between gap-6"
              >
                {/* Ambassador & Task Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-900 text-xs">
                      {item.user?.fullName?.charAt(0) || "A"}
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-stone-900 leading-tight">
                        {item.user?.fullName}
                      </h2>
                      <span className="text-[11px] text-stone-500">
                        {item.user?.email} • {item.user?.campus || "Unassigned"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-900">{item.task?.title}</span>
                      <span className="text-xs font-bold text-amber-800 flex items-center gap-1 font-mono">
                        <Award className="w-3.5 h-3.5" /> +{item.task?.pointValue} pts
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-xs text-stone-600 mt-1 italic">
                        &quot;{item.notes}&quot;
                      </p>
                    )}
                    {item.proofLink && (
                      <a
                        href={item.proofLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 mt-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Submitted Proof Link
                      </a>
                    )}
                  </div>
                </div>

                {/* Status & Action Buttons */}
                <div className="flex flex-col justify-between items-start md:items-end gap-3 min-w-[200px]">
                  <div>
                    {item.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                        <Clock className="w-3 h-3" /> Pending Review
                      </span>
                    )}
                    {item.status === "APPROVED" && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    )}
                    {item.status === "REJECTED" && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                        <AlertCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    )}
                  </div>

                  {item.status === "PENDING" && (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={() => handleReview(item.id, "APPROVED")}
                        disabled={actionLoading === item.id}
                        className="flex-1 md:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Check className="w-4 h-4" /> Approve (+{item.task?.pointValue} pts)
                      </button>
                      <button
                        onClick={() => handleReview(item.id, "REJECTED")}
                        disabled={actionLoading === item.id}
                        className="flex-1 md:flex-none px-3.5 py-2 bg-stone-100 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}