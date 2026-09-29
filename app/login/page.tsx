"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Sparkles, Mail, ArrowRight, CheckCircle2, ShieldCheck, UserCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  // Instant local dev login
  const handleQuickDevLogin = (role: "AMBASSADOR" | "ADMIN") => {
    document.cookie = `cleva_dev_user=true; path=/; max-age=86400`;
    document.cookie = `cleva_dev_role=${role}; path=/; max-age=86400`;

    if (role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/ambassador");
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-[#261505] flex items-center justify-center text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Cleva Hub
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-[#261505] tracking-tight">
          Welcome to Campus Hub
        </h1>
        <p className="text-xs text-stone-500 mt-1 mb-6">
          Sign in to manage your campus tasks, event check-ins, and point rewards.
        </p>

        {/* Quick Dev Switcher for localhost */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-6">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-2">
            Local Development Fast Login
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDevLogin("AMBASSADOR")}
              className="py-2.5 px-3 bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-700" />
              Ambassador
            </button>
            <button
              type="button"
              onClick={() => handleQuickDevLogin("ADMIN")}
              className="py-2.5 px-3 bg-[#261505] hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              Admin Portal
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-stone-200"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-stone-400">
            Or Use Supabase Magic Link
          </span>
          <div className="flex-grow border-t border-stone-200"></div>
        </div>

        {sent ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-amber-700 mx-auto" />
            <h3 className="font-bold text-amber-950 text-sm">Check your inbox</h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              We&apos;ve sent a magic link to <span className="font-bold">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Campus Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="amara@unilag.edu.ng"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#261505]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#261505] hover:bg-stone-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              {loading ? "Sending..." : "Send Magic Link"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}