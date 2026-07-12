/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import UserAvatar from "@/components/UserAvatar";
import AuthModal from "@/components/AuthModal";
import { MessageCircle, Send, EyeOff, Loader2 } from "lucide-react";

interface Echo {
  id: string;
  display_name: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
}

export default function EchoesSection({ storyId }: { storyId: string }) {
  const [echoes,      setEchoes]      = useState<Echo[]>([]);
  const [content,     setContent]     = useState("");
  const [postAsAnon,  setPostAsAnon]  = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [user,        setUser]        = useState<any>(null);
  const [displayName, setDisplayName] = useState("Storyteller");
  const [showAuth,    setShowAuth]    = useState(false);

  const supabase = createClient();

  useEffect(() => { loadEchoes(); loadUser(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles").select("display_name").eq("id", data.user.id).single();
      if (profile?.display_name) setDisplayName(profile.display_name);
    }
  };

  const loadEchoes = async () => {
    const res  = await fetch(`/api/echoes?storyId=${storyId}`);
    const data = await res.json();
    setEchoes(data.echoes || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!user) { setShowAuth(true); return; }
    setLoading(true);
    await fetch("/api/echoes", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ storyId, content, displayName, isAnonymous: postAsAnon }),
    });
    setContent("");
    await loadEchoes();
    setLoading(false);
  };

  const timeAgo = (date: string) => {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60)   return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1">
        <MessageCircle size={16} className="text-purple-500" />
        <h2 className="text-base font-bold tracking-tight text-neutral-900">
          Echoes
        </h2>
        {echoes.length > 0 && (
          <span className="text-xs font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
            {echoes.length}
          </span>
        )}
      </div>
      <p className="text-xs text-neutral-500 mb-5 leading-relaxed">
        Share how this story echoes in your life, or a related memory.
      </p>

      {/* Compose */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="border border-neutral-200 rounded-xl overflow-hidden focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/10 transition-all bg-white">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="This story reminds me of…"
            rows={3}
            className="w-full px-4 pt-3 pb-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-neutral-100">
            <label className="flex items-center gap-1.5 text-xs text-neutral-400 cursor-pointer hover:text-neutral-600 transition-colors select-none">
              <input
                type="checkbox"
                checked={postAsAnon}
                onChange={(e) => setPostAsAnon(e.target.checked)}
                className="rounded accent-purple-600"
              />
              <EyeOff size={11} />
              Anonymous
            </label>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              {loading ? "Posting…" : "Share Echo"}
            </button>
          </div>
        </div>
      </form>

      {/* Echo list */}
      <div className="space-y-4">
        {echoes.length === 0 && (
          <div className="text-center py-8 border border-dashed border-neutral-200 rounded-xl">
            <MessageCircle size={20} className="mx-auto text-neutral-300 mb-2" />
            <p className="text-sm text-neutral-400">No echoes yet — be the first.</p>
          </div>
        )}
        {echoes.map((echo) => (
          <div key={echo.id} className="flex gap-3 group">
            <UserAvatar
              name={echo.is_anonymous ? "?" : echo.display_name}
              size={32}
            />
            <div className="flex-1 min-w-0">
              <div className="bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-100 group-hover:border-neutral-200 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-neutral-900">
                    {echo.is_anonymous ? "Anonymous" : echo.display_name}
                  </span>
                  <span className="text-[11px] text-neutral-400 ml-auto flex-shrink-0">
                    {timeAgo(echo.created_at)}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed">{echo.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
