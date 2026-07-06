"use client";

import Link from "next/link";
import { BookOpen, Plus, LogOut, Shield } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("display_name, avatar_url, is_anonymous, role")
          .eq("id", data.user.id)
          .single();
        setProfile(profileData);
      }
    };
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUser();
      else setProfile(null);
    });

    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
    window.location.reload();
  };

  const isAdmin = profile?.role === "admin";

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-neutral-200 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-neutral-900 flex items-center justify-center">
              <BookOpen size={15} className="text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-neutral-900">
              Katha
            </span>
          </Link>

          {/* Right side */}
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

            {/* Divider */}
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

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-1.5 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <UserAvatar
                    name={profile?.display_name || "?"}
                    avatarUrl={profile?.avatar_url}
                    size={32}
                  />
                </button>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 z-50">
                      <div className="px-3 py-2.5 border-b border-neutral-100">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {profile?.display_name || "Storyteller"}
                        </p>
                        {profile?.is_anonymous && (
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Anonymous session
                          </p>
                        )}
                      </div>
                      <div className="py-1">
                        <Link
                          href="/my-stories"
                          className="sm:hidden w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                        >
                          My Stories
                        </Link>
                        <Link
                          href="/stories"
                          className="sm:hidden w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                        >
                          Browse
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                          >
                            <Shield size={13} />
                            Admin Dashboard
                          </Link>
                        )}
                        <div className="border-t border-neutral-100 my-1" />
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="inline-flex items-center text-sm font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200 h-9 px-4 rounded-lg shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}