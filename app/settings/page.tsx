"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, ArrowLeft, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import UserAvatar from "@/components/UserAvatar";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  is_anonymous: boolean;
}

export default function SettingsPage() {
  const [user, setUser]           = useState<SupabaseUser | null>(null);
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [name, setName]           = useState("");
  const [ready, setReady]         = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase      = createClient();
  const router         = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user ?? null;
      setUser(u);

      if (!u) {
        setReady(true);
        return;
      }

      const { data: p } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, is_anonymous")
        .eq("id", u.id)
        .single();

      setProfile(p ?? null);
      setName(p?.display_name ?? "");
      setReady(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch("/api/profile/upload-avatar", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to upload image");
    } else {
      setProfile((prev) => (prev ? { ...prev, avatar_url: data.url } : prev));
      router.refresh();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ display_name: name.trim() || null })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-neutral-300" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-xl font-semibold text-neutral-800 mb-2">Sign in required</h2>
        <p className="text-neutral-500 text-sm max-w-sm mb-6">
          Sign in to edit your profile and add a picture.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200 h-9 px-4 rounded-lg shadow-sm transition-all"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>
    );
  }

  const displayName = profile?.display_name || (user.email ? user.email.split("@")[0] : "Storyteller");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-6 pt-10 pb-20">
        <Link
          href={`/profile/${user.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-900 transition-colors group mb-5"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Profile
        </Link>

        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Edit Profile</h1>
        <p className="text-sm text-neutral-500 mb-8">
          Update your picture and display name.
        </p>

        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <UserAvatar name={displayName} avatarUrl={profile?.avatar_url} size={72} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                aria-label="Change profile picture"
              >
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">Profile picture</p>
              <p className="text-xs text-neutral-400 mt-0.5">JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>

          {/* Display name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-2.5 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 h-10 px-5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : saved ? (
              <Check size={14} />
            ) : null}
            {saved ? "Saved" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
