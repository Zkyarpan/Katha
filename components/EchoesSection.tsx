/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import UserAvatar from "@/components/UserAvatar";
import AuthModal from "@/components/AuthModal";
import { MessageCircle, Send, EyeOff } from "lucide-react";

interface Echo {
  id: string;
  display_name: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
}

export default function EchoesSection({ storyId }: { storyId: string }) {
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [content, setContent] = useState("");
  const [postAsAnon, setPostAsAnon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("Storyteller");
  const [showAuth, setShowAuth] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadEchoes();
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", data.user.id)
        .single();
      if (profile?.display_name) setDisplayName(profile.display_name);
    }
  };

  const loadEchoes = async () => {
    const res = await fetch(`/api/echoes?storyId=${storyId}`);
    const data = await res.json();
    setEchoes(data.echoes || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!user) {
      setShowAuth(true);
      return;
    }

    setLoading(true);
    await fetch("/api/echoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storyId,
        content,
        displayName,
        isAnonymous: postAsAnon,
      }),
    });
    setContent("");
    await loadEchoes();
    setLoading(false);
  };

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={18} className="text-purple-500" />
        <h2 className="text-lg font-semibold text-neutral-900">
          Echoes ({echoes.length})
        </h2>
      </div>
      <p className="text-sm text-neutral-500 mb-5">
        Share a related memory, or how this story echoes in your own life.
      </p>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="This story reminds me of..."
          rows={3}
          className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-400 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer">
            <input
              type="checkbox"
              checked={postAsAnon}
              onChange={(e) => setPostAsAnon(e.target.checked)}
              className="rounded"
            />
            <EyeOff size={12} />
            Post anonymously
          </label>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Send size={13} />
            Share Echo
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {echoes.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-6">
            No echoes yet — be the first to share one.
          </p>
        )}
        {echoes.map((echo) => (
          <div key={echo.id} className="flex gap-3">
            <UserAvatar
              name={echo.is_anonymous ? "?" : echo.display_name}
              size={32}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-900">
                  {echo.is_anonymous ? "Anonymous" : echo.display_name}
                </span>
                <span className="text-xs text-neutral-400">
                  {new Date(echo.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-neutral-600 mt-0.5">{echo.content}</p>
            </div>
          </div>
        ))}
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}