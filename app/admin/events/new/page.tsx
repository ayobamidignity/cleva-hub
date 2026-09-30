"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type EventFormat = "IN_PERSON" | "VIRTUAL";

export default function NewEventPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [format, setFormat] = useState<EventFormat>("IN_PERSON");
  const [locationOrLink, setLocationOrLink] = useState("");
  const [pointValue, setPointValue] = useState(50);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !eventDate || !locationOrLink.trim()) {
      setError("Fill in the title, description, date and location or link.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          // datetime-local has no timezone, so convert to a full ISO date string
          eventDate: new Date(eventDate).toISOString(),
          format,
          locationOrLink: locationOrLink.trim(),
          pointValue: Number(pointValue),
        }),
      });

      if (!res.ok) {
        let message = `Could not save the event (error ${res.status}).`;
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          /* response had no JSON body */
        }
        setError(message);
        return;
      }

      router.push("/admin/events");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#261505]/30 focus:border-[#261505]";
  const labelClass = "block text-xs font-bold text-stone-700 mb-1.5";

  return (
    <div className="min-h-screen bg-[#FBF9F5] p-6 lg:p-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to events
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#261505] tracking-tight">
            Create event
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Ambassadors can register for the event and earn points when they check in.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-5"
        >
          <div>
            <label htmlFor="title" className={labelClass}>
              Event title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Campus Orientation and Welcome"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What will happen, who should come, and what to bring."
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="eventDate" className={labelClass}>
                Date and time
              </label>
              <input
                id="eventDate"
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="format" className={labelClass}>
                Format
              </label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value as EventFormat)}
                className={inputClass}
              >
                <option value="IN_PERSON">In person</option>
                <option value="VIRTUAL">Virtual</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="locationOrLink" className={labelClass}>
              {format === "VIRTUAL" ? "Meeting link" : "Venue"}
            </label>
            <input
              id="locationOrLink"
              type="text"
              value={locationOrLink}
              onChange={(e) => setLocationOrLink(e.target.value)}
              placeholder={
                format === "VIRTUAL"
                  ? "https://meet.google.com/abc-defg-hij"
                  : "Faculty of Arts Lecture Hall, Main Campus"
              }
              className={inputClass}
              required
            />
          </div>

          <div className="sm:w-1/2">
            <label htmlFor="pointValue" className={labelClass}>
              Points for checking in
            </label>
            <input
              id="pointValue"
              type="number"
              min={0}
              step={1}
              value={pointValue}
              onChange={(e) => setPointValue(Number(e.target.value))}
              className={inputClass}
              required
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5"
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/admin/events"
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#261505] hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              {submitting ? "Saving..." : "Save event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
