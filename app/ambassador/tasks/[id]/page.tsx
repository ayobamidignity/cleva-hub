"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ResponsiveNav from "@/components/ambassador/ResponsiveNav";
import { ArrowLeft, Award, Link2, Send, CheckCircle2 } from "lucide-react";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<any>(null);
  const [proofLink, setProofLink] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    async function loadTask() {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const list = await res.json();
        const found = list.find((t: any) => t.id === taskId);
        if (found) setTask(found);
      }
    }
    loadTask();
  }, [taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofLink.trim() && !notes.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, proofLink, notes }),
      });

      if (res.ok) {
        setSubmittedSuccess(true);
      } else {
        const err = await res.json();
        alert(err.error || "Submission failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex w-full">
        <ResponsiveNav />
        <main className="flex-1 md:pl-64 lg:pl-72 p-8">
          <p className="text-xs text-stone-400">Loading task instructions...</p>
        </main>
      </div>
    );
  }

  const existingSubmission = task.submissions?.[0];

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex w-full">
      <ResponsiveNav />

      <main className="flex-1 md:pl-64 lg:pl-72 pb-24 md:pb-12 pt-8 px-4 sm:px-8 lg:px-12 w-full max-w-3xl mx-auto">
        <Link
          href="/ambassador/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to tasks
        </Link>

        {/* Task Header Box */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 px-2.5 py-1 rounded">
              {task.category}
            </span>
            <span className="text-sm font-extrabold text-amber-700 bg-amber-100/60 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Award className="w-4 h-4" /> +{task.pointValue} points
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-stone-900 mt-4">{task.title}</h1>

          <div className="mt-6 pt-5 border-t border-stone-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              What to do
            </h2>
            <p className="text-sm text-stone-700 leading-relaxed">{task.description}</p>
          </div>
        </div>

        {/* Proof Submission Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-extrabold text-stone-900 mb-4">Submit proof of work</h2>

          {submittedSuccess || existingSubmission ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
              <h3 className="font-bold text-green-900 text-sm">Submission Under Review</h3>
              <p className="text-xs text-green-700 max-w-sm mx-auto">
                Your proof has been submitted. Admins will review it and credit{" "}
                <span className="font-bold">{task.pointValue} points</span> to your balance upon approval.
              </p>
              {existingSubmission?.proofLink && (
                <div className="pt-2 text-xs font-mono text-stone-500 truncate max-w-xs mx-auto">
                  Link: {existingSubmission.proofLink}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Link to Post / Reel / Drive
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="url"
                    required
                    value={proofLink}
                    onChange={(e) => setProofLink(e.target.value)}
                    placeholder="https://instagram.com/reel/... or TikTok link"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#261505]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any details or context about your submission..."
                  className="w-full p-3 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#261505]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !proofLink.trim()}
                className="w-full py-3 bg-[#261505] hover:bg-stone-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? "Submitting Proof..." : "Submit Task for Points"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}