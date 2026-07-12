"use client";

// ---------------------------------------------------------------------------
// components/StoryChainSection.tsx
//
// Shows stories linked to the current story, and lets signed-in users
// add a new link by searching the story library.
// ---------------------------------------------------------------------------

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import AuthModal from "@/components/AuthModal";
import {
  Link2,
  Plus,
  X,
  BookOpen,
  Globe,
  ChevronDown,
  Search,
  Loader2,
  Trash2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────

interface LinkedStory {
  id: string;
  title: string;
  teller_name: string;
  cover_image_url: string | null;
  tag: string | null;
  language: string | null;
  location_name: string | null;
}

interface StoryLink {
  id: string;
  relation_type: string;
  note: string | null;
  linked_by: string | null;
  created_at: string;
  target: LinkedStory;
}

interface SearchResult {
  id: string;
  title: string;
  teller_name: string;
  cover_image_url: string | null;
  language: string | null;
}

const RELATION_TYPES = [
  { value: "variant",       label: "Variant",         desc: "A different version of the same tale" },
  { value: "same_myth",     label: "Same Myth",        desc: "Shares the same mythic archetype" },
  { value: "sequel",        label: "Sequel / Prequel", desc: "Continues or precedes this story" },
  { value: "same_teller",   label: "Same Teller",      desc: "Told by the same person" },
  { value: "same_region",   label: "Same Region",      desc: "From the same geographic area" },
  { value: "similar_theme", label: "Similar Theme",    desc: "Shares a key theme or moral" },
];

// ── Component ─────────────────────────────────────────────────────────────

export default function StoryChainSection({ storyId }: { storyId: string }) {
  const [links, setLinks] = useState<StoryLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // form state
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [relationType, setRelationType] = useState("variant");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = createClient();

  // ── Load user + links ────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    })();
    loadLinks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/story-links?storyId=${storyId}`);
      const data = await res.json();
      setLinks(data.links ?? []);
    } finally {
      setLoading(false);
    }
  };

  // ── Story search ──────────────────────────────────────────────────────

  const searchStories = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data } = await supabase
        .from("stories")
        .select("id, title, teller_name, cover_image_url, language")
        .ilike("title", `%${q}%`)
        .neq("id", storyId)
        .limit(6);
      setSearchResults(data ?? []);
    } finally {
      setSearching(false);
    }
  }, [storyId, supabase]);

  useEffect(() => {
    const t = setTimeout(() => searchStories(query), 300);
    return () => clearTimeout(t);
  }, [query, searchStories]);

  // ── Submit link ───────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) { setShowAuth(true); return; }
    if (!selected) { setFormError("Select a story to link"); return; }
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/story-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceStoryId: storyId,
          targetStoryId: selected.id,
          relationType,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Something went wrong");
        return;
      }
      // reset form, reload links
      setSelected(null);
      setQuery("");
      setNote("");
      setRelationType("variant");
      setShowForm(false);
      await loadLinks();
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete link ───────────────────────────────────────────────────────

  const handleDelete = async (linkId: string) => {
    await fetch(`/api/story-links?id=${linkId}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  };

  // ── Relation badge colour ─────────────────────────────────────────────

  const badgeColor: Record<string, string> = {
    variant:       "bg-purple-50 text-purple-700 border-purple-200",
    same_myth:     "bg-amber-50 text-amber-700 border-amber-200",
    sequel:        "bg-blue-50 text-blue-700 border-blue-200",
    same_teller:   "bg-green-50 text-green-700 border-green-200",
    same_region:   "bg-teal-50 text-teal-700 border-teal-200",
    similar_theme: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const relationLabel = (type: string) =>
    RELATION_TYPES.find((r) => r.value === type)?.label ?? type;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-purple-500" />
          <h2 className="text-lg font-bold tracking-tight text-neutral-900">
            Story Chain
          </h2>
          {links.length > 0 && (
            <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
              {links.length}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            if (!userId) { setShowAuth(true); return; }
            setShowForm((v) => !v);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200 h-8 px-3 rounded-lg transition-colors"
        >
          {showForm ? <X size={12} /> : <Plus size={12} />}
          {showForm ? "Cancel" : "Link a Story"}
        </button>
      </div>

      <p className="text-sm text-neutral-500 mb-5">
        Connect this tale to related stories across cultures — variants,
        sequels, or stories sharing the same ancient myth.
      </p>

      {/* ── Add-link form ─────────────────────────────────────────────── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 border border-neutral-200 rounded-xl p-4 bg-neutral-50 space-y-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Add a link
          </p>

          {/* Story search */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Search stories
            </label>
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (selected) setSelected(null);
                }}
                placeholder="Type a story title…"
                className="w-full pl-8 pr-4 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:border-neutral-400"
              />
              {searching && (
                <Loader2
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 animate-spin"
                />
              )}
            </div>

            {/* Search results dropdown */}
            {searchResults.length > 0 && !selected && (
              <div className="mt-1 border border-neutral-200 rounded-lg bg-white shadow-sm divide-y divide-neutral-100 overflow-hidden">
                {searchResults.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => {
                      setSelected(r);
                      setQuery(r.title);
                      setSearchResults([]);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0">
                      {r.cover_image_url ? (
                        <Image
                          src={r.cover_image_url}
                          alt={r.title}
                          width={32}
                          height={32}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen
                          size={14}
                          className="m-auto mt-1.5 text-neutral-300"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {r.title}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {r.teller_name}
                        {r.language && r.language !== "English"
                          ? ` · ${r.language}`
                          : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected story pill */}
            {selected && (
              <div className="mt-2 inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-1.5">
                <span className="text-sm font-medium text-purple-800 truncate max-w-[220px]">
                  {selected.title}
                </span>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setQuery(""); }}
                  className="text-purple-400 hover:text-purple-700"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Relation type */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Relationship
            </label>
            <div className="relative">
              <select
                value={relationType}
                onChange={(e) => setRelationType(e.target.value)}
                className="w-full appearance-none text-sm bg-white border border-neutral-200 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-neutral-400 cursor-pointer"
              >
                {RELATION_TYPES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label} — {r.desc}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Optional note */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Note{" "}
              <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Explain the connection in a sentence…"
              rows={2}
              maxLength={280}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-neutral-400 resize-none"
            />
          </div>

          {formError && (
            <p className="text-xs text-red-500">{formError}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !selected}
              className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {submitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Link2 size={13} />
              )}
              {submitting ? "Linking…" : "Add Link"}
            </button>
          </div>
        </form>
      )}

      {/* ── Linked stories list ───────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-neutral-100 animate-pulse"
            />
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-neutral-200 rounded-xl">
          <Link2 size={22} className="mx-auto text-neutral-300 mb-2" />
          <p className="text-sm text-neutral-400">
            No linked stories yet.
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Be the first to connect this tale to another.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => {
            const s = link.target;
            return (
              <div
                key={link.id}
                className="group flex items-start gap-4 p-4 border border-neutral-200 rounded-xl hover:border-neutral-300 bg-white hover:bg-neutral-50 transition-all"
              >
                {/* Cover thumbnail */}
                <Link
                  href={`/story/${s.id}`}
                  className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-neutral-100"
                >
                  {s.cover_image_url ? (
                    <Image
                      src={s.cover_image_url}
                      alt={s.title}
                      width={56}
                      height={56}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={18} className="text-neutral-300" />
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span
                          className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            badgeColor[link.relation_type] ??
                            "bg-neutral-50 text-neutral-600 border-neutral-200"
                          }`}
                        >
                          {relationLabel(link.relation_type)}
                        </span>
                        {s.language && s.language !== "English" && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400">
                            <Globe size={10} />
                            {s.language}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/story/${s.id}`}
                        className="block text-sm font-semibold text-neutral-900 hover:text-purple-700 truncate transition-colors"
                      >
                        {s.title}
                      </Link>
                      <p className="text-xs text-neutral-400 mt-0.5 truncate">
                        Told by {s.teller_name}
                        {s.location_name ? ` · ${s.location_name}` : ""}
                      </p>
                    </div>

                    {/* Delete button — only visible to the link creator */}
                    {userId && link.linked_by === userId && (
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-500 transition-all flex-shrink-0 mt-0.5"
                        title="Remove link"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {/* Optional note */}
                  {link.note && (
                    <p className="mt-1.5 text-xs text-neutral-500 italic leading-relaxed">
                      "{link.note}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
