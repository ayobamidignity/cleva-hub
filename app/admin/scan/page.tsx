"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ArrowLeft, CheckCircle2, AlertCircle, Scan, Award, RefreshCw } from "lucide-react";

export default function AdminScannerPage() {
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const processToken = async (token: string) => {
    if (loading) return;
    setLoading(true);
    setScanError(null);

    try {
      const res = await fetch("/api/admin/events/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeToken: token.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setScanResult(data);
      } else {
        setScanError(data.error || "Failed to check in.");
      }
    } catch (err) {
      setScanError("Network or server error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        processToken(decodedText);
      },
      (error) => {
        // Continuous scan tick
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF9F5] p-6 lg:p-12">
      <div className="max-w-lg mx-auto">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Event Operations
        </Link>

        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-[#261505] text-amber-300 flex items-center justify-center">
              <Scan className="w-4 h-4" />
            </span>
            <span className="text-[11px] uppercase font-bold tracking-widest text-stone-400">
              Live Check-In
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#261505] tracking-tight">
            Event Pass Scanner
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Aim camera at attendee ticket QR codes to verify registration and credit attendance points.
          </p>
        </header>

        {/* Scanner Container */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm overflow-hidden mb-6">
          <div id="qr-reader" className="w-full rounded-2xl overflow-hidden" />
        </div>

        {/* Scan Status Feedback */}
        {loading && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs font-bold flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-700" />
            Verifying attendee pass...
          </div>
        )}

        {scanError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {scanError}
          </div>
        )}

        {scanResult && (
          <div
            className={`rounded-2xl p-6 border shadow-sm space-y-3 ${
              scanResult.alreadyCheckedIn
                ? "bg-amber-50/70 border-amber-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  scanResult.alreadyCheckedIn
                    ? "bg-amber-100 text-amber-800"
                    : "bg-green-100 text-green-700"
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  {scanResult.registration?.user?.fullName}
                </h3>
                <span className="text-[11px] text-stone-500">
                  {scanResult.registration?.user?.email} • {scanResult.registration?.user?.campus}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200/60 flex justify-between items-center text-xs">
              <span className="text-stone-600 font-medium">
                Event: {scanResult.registration?.event?.title}
              </span>
              <span className="font-mono font-bold text-amber-900 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> +{scanResult.registration?.event?.pointValue} pts
              </span>
            </div>

            <p
              className={`text-xs font-bold ${
                scanResult.alreadyCheckedIn ? "text-amber-800" : "text-green-800"
              }`}
            >
              {scanResult.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}