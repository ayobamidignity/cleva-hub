'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Mail, Sparkles, User, ShieldCheck, Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom') || '/ambassador';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        redirectedFrom
      )}`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }

      setSuccessMsg('Check your email for the magic link!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const handleFastLogin = (role: 'ambassador' | 'admin') => {
    // Sets session cookie directly for quick local/preview testing
    document.cookie = `mock_role=${role}; path=/; max-age=86400`;
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push(redirectedFrom);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-stone-100 flex flex-col gap-6 text-[#2b1704]">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#2b1704] flex items-center justify-center text-[#ffc567]">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold tracking-wider uppercase text-stone-500">
            Cleva Hub
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#2b1704] tracking-tight">
          Welcome to Campus Hub
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Sign in to manage your campus tasks, event check-ins, and point rewards.
        </p>
      </div>

      {/* Local Development Fast Login */}
      <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-2xl flex flex-col gap-2.5">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider text-center">
          Local Development Fast Login
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleFastLogin('ambassador')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-stone-200 rounded-xl text-xs font-bold text-[#2b1704] hover:bg-stone-100 transition shadow-sm"
          >
            <User className="w-3.5 h-3.5 text-[#ff8008]" />
            Ambassador
          </button>
          <button
            type="button"
            onClick={() => handleFastLogin('admin')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#2b1704] text-white rounded-xl text-xs font-bold hover:bg-stone-900 transition shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#ffc567]" />
            Admin Portal
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <hr className="w-full border-stone-200" />
        <span className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          Or use Supabase Magic Link
        </span>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl">
          {successMsg}
        </div>
      )}

      {/* Magic Link Form */}
      <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5"
          >
            Campus Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2b1704] focus:bg-white transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#2b1704] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-stone-900 transition disabled:opacity-60 shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#ffc567]" />
              Sending Link...
            </>
          ) : (
            <>Send Magic Link &rarr;</>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#fdfbf7]">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 bg-white rounded-3xl border border-stone-100 flex items-center justify-center min-h-[350px]">
            <Loader2 className="w-6 h-6 animate-spin text-[#2b1704]" />
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </main>
  );
}