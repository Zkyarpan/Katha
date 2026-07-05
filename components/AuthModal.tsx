"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Mail, Loader2, X } from "lucide-react";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleAnonymous = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onClose();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold text-neutral-900">
          Welcome to Katha
        </h2>
        <p className="text-sm text-neutral-500 mt-1 mb-6">
          Sign in to save and preserve your stories
        </p>

        {sent ? (
          <div className="text-center py-6">
            <Mail className="mx-auto text-purple-500 mb-3" size={32} />
            <p className="text-sm text-neutral-600">
              Check <span className="font-medium">{email}</span> for a magic
              link to sign in.
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Mail size={15} />
                )}
                Send magic link
              </button>
            </form>

            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-xs text-neutral-400">or</span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            <button
              onClick={handleGoogle}
              className="w-full border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={handleAnonymous}
              disabled={loading}
              className="w-full text-neutral-400 hover:text-neutral-600 text-xs font-medium py-3 transition-colors"
            >
              Continue anonymously
            </button>
          </>
        )}
      </div>
    </div>
  );
}
