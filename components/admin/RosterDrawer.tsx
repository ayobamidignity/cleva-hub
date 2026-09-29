"use client";

import { useState, useEffect } from "react";
import { X, Download, Search, CheckCircle, Clock, KeyRound, QrCode, Check } from "lucide-react";

interface RosterDrawerProps {
  eventId: string | null;
  onClose: () => void;
}

export default function RosterDrawer({ eventId, onClose }: RosterDrawerProps) {
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Manual QR input or OTP states
  const [manualToken, setManualToken] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [selectedUserForOtp, setSelectedUserForOtp] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const fetchRoster = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`);
      if (res.ok) {
        const resData = await res.json();
        setData(resData);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
    setStatusMessage(null);
    setManualToken("");
    setSelectedUserForOtp(null);
  }, [eventId]);

  if (!eventId) return null;

  // Direct QR token check-in submission
  const handleCheckInByToken = async (tokenToUse?: string) => {
    const token = tokenToUse || manualToken;
    if (!token.trim()) return;

    setActionLoading("token");
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/events/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, qrToken: token.trim() }),
      });

      const resData = await res.json();
      if (res.ok) {
        setStatusMessage({ text: resData.message || "Ambassador checked in successfully!" });
        setManualToken("");
        await fetchRoster();
      } else {
        setStatusMessage({ text: resData.error || "Failed to check in", error: true });
      }
    } catch {
      setStatusMessage({ text: "Network error occurred", error: true });
    } finally {
      setActionLoading(null);
    }
  };

  // OTP-based check-in submission
  const handleCheckInByOtp = async (userId: string) => {
    if (!otpInput.trim()) return;

    setActionLoading(userId);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/events/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          userId,
          checkInOtp: otpInput.trim(),
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        setStatusMessage({ text: resData.message || "Check-in confirmed with OTP!" });
        setOtpInput("");
        setSelectedUserForOtp(null);
        await fetchRoster();
      } else {
        setStatusMessage({ text: resData.error || "Invalid OTP code", error: true });
      }
    } catch {
      setStatusMessage({ text: "Error submitting OTP", error: true });
    } finally {
      setActionLoading(null);
    }
  };

  const registrations = data?.registrations || [];
  const filtered = registrations.filter((r: any) =>
    r.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    r.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    (r.user?.campus && r.user.campus.toLowerCase().includes(search.toLowerCase()))
  );

  const attendedCount = registrations.filter((r: any) => r.attended).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col text-black">
        {/* Drawer Header */}
        <div className="p-5 border-b flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900 text-base">{data?.title || "Event Roster"}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span>{attendedCount} of {registrations.length} checked in</span>
              {data?.checkInOtp && (
                <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold border border-blue-200">
                  Event PIN: {data.checkInOtp}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/api/admin/events/${eventId}/roster`}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </a>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick QR Token Input Panel */}
        <div className="p-4 border-b bg-gray-50/70 space-y-3">
          <label className="block text-[11px] font-semibold text-gray-700 uppercase tracking-wider">
            Quick Pass / Token Verification
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <QrCode className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Scan or paste attendee QR token UUID..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <button
              onClick={() => handleCheckInByToken()}
              disabled={actionLoading === "token" || !manualToken.trim()}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold whitespace-nowrap"
            >
              {actionLoading === "token" ? "Verifying..." : "Verify Pass"}
            </button>
          </div>

          {statusMessage && (
            <div
              className={`p-2.5 rounded-lg text-xs font-medium ${
                statusMessage.error
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {statusMessage.text}
            </div>
          )}
        </div>

        {/* Search Filter Bar */}
        <div className="p-3 border-b bg-white">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendee by name, email, or campus..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Attendee List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {loading ? (
            <p className="text-center text-xs text-gray-400 py-10">Loading roster...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-10">No registered ambassadors found.</p>
          ) : (
            filtered.map((r: any) => (
              <div
                key={r.id}
                className="p-3 border rounded-xl flex flex-col gap-2 hover:bg-gray-50/70 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{r.user?.fullName}</h4>
                    <p className="text-[11px] text-gray-500">{r.user?.email}</p>
                    <span className="text-[10px] text-blue-600 font-medium">
                      {r.user?.campus || "Unassigned Campus"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.attended ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                        <CheckCircle className="w-3 h-3" /> Checked In
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCheckInByToken(r.qrCodeToken)}
                          disabled={actionLoading === "token"}
                          title="Instant Check-in"
                          className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-[11px] font-semibold rounded-md flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3 h-3" /> Check In
                        </button>
                        <button
                          onClick={() =>
                            setSelectedUserForOtp(selectedUserForOtp === r.user.id ? null : r.user.id)
                          }
                          title="Enter PIN manually"
                          className="p-1 border hover:bg-gray-100 rounded text-gray-600"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-form: Check in by entering Event PIN */}
                {!r.attended && selectedUserForOtp === r.user.id && (
                  <div className="pt-2 border-t mt-1 flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="6-digit PIN"
                      className="w-28 px-2 py-1 text-xs border rounded bg-white text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleCheckInByOtp(r.user.id)}
                      disabled={actionLoading === r.user.id || !otpInput.trim()}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-semibold"
                    >
                      {actionLoading === r.user.id ? "Checking..." : "Confirm PIN"}
                    </button>
                    <button
                      onClick={() => setSelectedUserForOtp(null)}
                      className="text-gray-400 hover:text-gray-600 text-xs px-1"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}