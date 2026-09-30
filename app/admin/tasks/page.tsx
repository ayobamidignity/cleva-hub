"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Award, 
  Users, 
  AlertCircle,
  Loader2,
  X
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  pointValue: number;
  deadline?: string | null;
  isActive: boolean;
  _count?: {
    submissions: number;
  };
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New task form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pointValue: 50,
    deadline: "",
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to load tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create task");
      }

      setIsModalOpen(false);
      setFormData({ title: "", description: "", pointValue: 50, deadline: "" });
      fetchTasks();
    } catch (err: any) {
      setError(err.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] p-6 md:p-10 text-stone-900">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Task Management</h1>
            <p className="text-sm text-stone-500 mt-1">
              Create, review, and allocate points for ambassador campus activities.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-stone-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Loading tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 bg-white border border-stone-200 rounded-2xl p-8">
            <CheckSquare className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-stone-800">No tasks created yet</h3>
            <p className="text-sm text-stone-500 mt-1 mb-6">
              Create your first ambassador task to begin awarding points.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl"
            >
              Create First Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-stone-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-stone-900 text-base line-clamp-1">{task.title}</h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                      <Award className="w-3 h-3" />
                      {task.pointValue} pts
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-3 mb-4">{task.description}</p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString()
                        : "No deadline"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{task._count?.submissions ?? 0} Submissions</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Task Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold text-stone-900 mb-1">Create Ambassador Task</h2>
              <p className="text-xs text-stone-500 mb-5">
                Set instructions, points, and deadlines for ambassadors.
              </p>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Post Instagram Story with Cleva banner"
                    className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Description & Requirements</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide exact requirements (links, screenshots required, hashtags, etc.)"
                    className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Points Allocated</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.pointValue}
                      onChange={(e) => setFormData({ ...formData, pointValue: Number(e.target.value) })}
                      className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Deadline (Optional)</label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full text-sm border border-stone-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg text-xs font-semibold hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {submitting ? "Creating..." : "Publish Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}