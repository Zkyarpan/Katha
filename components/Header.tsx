"use client";

import Link from "next/link";
import { BookOpen, Plus, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import AuthModal from "@/components/AuthModal";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import UserAvatar from "./UserAvatar";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  is_anonymous: boolean;
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
          .select("display_name, avatar_url, is_anonymous")
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

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
              <BookOpen size={15} className="text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              Katha
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/new-story"
              className="inline-flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={14} />
              Add a Story
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="rounded-full overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <UserAvatar
                    name={profile?.display_name || "?"}
                    avatarUrl={profile?.avatar_url}
                    size={32}
                  />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-1">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {profile?.display_name || "Storyteller"}
                      </p>
                      {profile?.is_anonymous && (
                        <p className="text-xs text-neutral-400">
                          Anonymous session
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
