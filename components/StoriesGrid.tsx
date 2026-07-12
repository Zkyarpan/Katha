"use client";

import { useMemo, useState } from "react";
import { Search, BookOpen } from "lucide-react";
import StoryCard from "@/components/StoryCard";
import { BlurFade } from "@/components/ui/blur-fade";
import type { Story } from "@/lib/supabase";

export default function StoriesGrid({ stories }: { stories: Story[] }) {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    stories.forEach((s) => s.tag && set.add(s.tag));
    return Array.from(set).sort();
  }, [stories]);

  const filtered = stories.filter((s) => {
    const matchesSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.teller_name.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !activeTag || s.tag === activeTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div>
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative sm:w-72 sm:flex-shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or teller..."
            className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-3 py-2.5 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300"
          />
        </div>

        {tags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 sm:min-w-0 sm:flex-1">
            <button
              onClick={() => setActiveTag(null)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                activeTag === null
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                  activeTag === tag
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((story, index) => (
            <BlurFade key={story.id} delay={0.03 * index}>
              <StoryCard
                id={story.id}
                title={story.title}
                tellerName={story.teller_name}
                coverImage={story.cover_image_url ?? ""}
                tag={story.tag ?? undefined}
                language={story.language}
              />
            </BlurFade>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-neutral-200 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-3">
            <BookOpen size={20} className="text-neutral-300" />
          </div>
          <p className="text-neutral-400 text-sm">
            No stories match {search ? `"${search}"` : "this filter"}
          </p>
        </div>
      )}
    </div>
  );
}
