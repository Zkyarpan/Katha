"use client";

import Link from "next/link";
import { BookOpen, Plus, LogOut, Shield, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import AuthModal from "@/components/AuthModal";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import UserAvatar from "./UserAvatar";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  is_anonymous: boolean;
  role: string | null;
}

export default function Header() {
  const [scrolled, setScrolled]   = useState(false);
  const [user,     setUser]        = useState<SupabaseUser | null>(null);
  const [profile,  setProfile]     = useState<Profile | null>(null);
  const [showAuth, setShowAuth]    = useState(false);
  const [showMenu, setShowMenu]    = useState(false);
  // Tracks whether we have already attempted the first profile load so the
  // avatar doesn't flash "?" while the async call is in-flight.
  const [ready,    setReady]       = useState(false);

  const supabase   = createClient();
  const menuRef    = useRef<HTMLDivElement>(null);

  // ── Profile loader ──────────────────────────────────────────────────────
  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, is_anonymous, role")
      .eq("id", userId)
      .single();
    setProfile(data ?? null);
  };

  // ── Bootstrap + auth listener ──────────────────────────────────────────
  useEffect(() => {
    // Read scroll position immediately on mount so the shadow is correct on
    // page load / browser-back / hard-refresh — not just after first scroll.
    setScrolled(window.scrollY > 10);

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial session read
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id).finally(() => setReady(true));
      else   setReady(true);
    });

    // Listen for sign-in / sign-out / token-refresh events
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await loadProfile(u.id);
        } else {
          setProfile(null);
        }
        setReady(true);
      }
    );

    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      listener.subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setShowMenu(false);
  };

  const isAdmin = profile?.role === "admin";

  // Display name — fall back gracefully while loading
  const displayName = profile?.display_name
    || (user?.email ? user.email.split("@")[0] : null)
    || "Storyteller";

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-neutral-200 shadow-[0_2px_16px_0_rgba(0,0,0,0.10)]"
            : "bg-white border-b border-neutral-100"
        }`}
      >
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-10">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <BookOpen size={15} className="text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-neutral-900">
              Katha
            </span>
          </Link>

          {/* ── Right side ── */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Nav links */}
            <Link
              href="/stories"
              className="hidden sm:inline-flex text-sm font-medium text-neutral-500 hover:text-neutral-900 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-all"
            >
              Browse
            </Link>

            {user && (
              <Link
                href="/my-stories"
                className="hidden sm:inline-flex text-sm font-medium text-neutral-500 hover:text-neutral-900 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-all"
              >
                My Stories
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-all"
              >
                <Shield size={13} />
                Admin
              </Link>
            )}

            <div className="hidden sm:block w-px h-5 bg-neutral-200 mx-1" />

            {/* Add a Story */}
            <Link
              href="/new-story"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 h-9 px-4 rounded-lg transition-all active:scale-[0.98]"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add a Story</span>
              <span className="sm:hidden">Add</span>
            </Link>

            {/* ── Auth / Avatar ── */}
            {!ready ? (
              /* Placeholder while first auth check is in-flight — prevents layout shift */
              <div className="w-9 h-9 rounded-full bg-neutral-100 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full ring-2 ring-transparent hover:ring-neutral-200 transition-all cursor-pointer"
                  aria-label="Open account menu"
                  aria-expanded={showMenu}
                >
                  <UserAvatar
                    name={displayName}
                    avatarUrl={profile?.avatar_url}
                    size={34}
                  />
                </button>

                {/* Dropdown */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* User info header */}
                    <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-neutral-100">
                      <UserAvatar
                        name={displayName}
                        avatarUrl={profile?.avatar_url}
                        size={28}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 truncate">
                          {displayName}
                        </p>
                        {profile?.is_anonymous ? (
                          <p className="text-xs text-neutral-400">
                            Anonymous session
                          </p>
                        ) : user.email ? (
                          <p className="text-xs text-neutral-400 truncate">
                            {user.email}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="py-1">
                      {/* Mobile-only nav items */}
                      <Link
                        href="/my-stories"
                        onClick={() => setShowMenu(false)}
                        className="sm:hidden w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        My Stories
                      </Link>
                      <Link
                        href="/stories"
                        onClick={() => setShowMenu(false)}
                        className="sm:hidden w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        Browse
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setShowMenu(false)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <Shield size={13} />
                          Admin Dashboard
                        </Link>
                      )}

                      <div className="border-t border-neutral-100 my-1" />

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer rounded-b-xl"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="inline-flex items-center text-sm font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200 h-9 px-4 rounded-lg shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
