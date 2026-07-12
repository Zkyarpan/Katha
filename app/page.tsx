import Link from "next/link";
import { Plus, MapPin, ArrowRight, BookOpen, Globe, Languages } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import StoryCard from "@/components/StoryCard";
import { supabase } from "@/lib/supabase";
import { BlurFade } from "@/components/ui/blur-fade";
import OriginMapClient from "@/components/OriginMapClient";

export default async function HomePage() {
  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .order("created_at", { ascending: false });

  const storyList = stories ?? [];

  // ── Real impact stats computed from live data ──────────────────────────
  const totalStories   = storyList.length;
  const uniqueLanguages = new Set(
    storyList.map((s) => (s.language ?? "English").trim().toLowerCase()).filter(Boolean)
  ).size;
  const uniqueLocations = new Set(
    storyList
      .map((s) => (s.location_name ?? "").split(",").pop()?.trim().toLowerCase())
      .filter(Boolean)
  ).size;

  const pinned = storyList
    .filter((s) => s.latitude && s.longitude)
    .map((s) => ({
      id: s.id,
      title: s.title,
      latitude: s.latitude,
      longitude: s.longitude,
    }));

  const STATS = [
    { icon: BookOpen,   value: totalStories,    label: "stories preserved" },
    { icon: Languages,  value: uniqueLanguages,  label: "languages"         },
    { icon: Globe,      value: uniqueLocations,  label: "places"            },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <HeroSection />

      {/* ── Impact stats strip ── */}
      {totalStories > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <BlurFade delay={0.05}>
            <div className="grid grid-cols-3 gap-3 sm:gap-4 -mt-2 mb-10">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center gap-1 py-5 px-3 bg-white rounded-xl border border-neutral-200 shadow-sm"
                >
                  <Icon size={16} className="text-purple-400 mb-0.5" />
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 tabular-nums">
                    {value}
                  </span>
                  <span className="text-xs text-neutral-400 text-center leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </BlurFade>
        </div>
      )}

      {/* ── Stories + Map ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Recent Stories */}
        {storyList.length > 0 && (
          <section className="pt-6 pb-16">
            <BlurFade delay={0.1}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                  Recent Stories
                </h2>
                <Link
                  href="/stories"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200 h-9 px-4 rounded-lg shadow-xs transition-all active:scale-[0.98] group"
                >
                  View All {storyList.length} Stories
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </Link>
              </div>
            </BlurFade>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {storyList.slice(0, 6).map((story, index) => (
                <BlurFade key={story.id} delay={0.05 * index}>
                  <StoryCard
                    id={story.id}
                    title={story.title}
                    tellerName={story.teller_name}
                    coverImage={story.cover_image_url}
                    tag={story.tag ?? undefined}
                  />
                </BlurFade>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {storyList.length === 0 && (
          <section className="pt-6 pb-16">
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-neutral-200 rounded-xl bg-white">
              <p className="text-neutral-400 text-sm mb-4">
                No stories yet — be the first to preserve one
              </p>
              <Link
                href="/new-story"
                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 h-9 px-5 rounded-lg transition-all active:scale-[0.98]"
              >
                <Plus size={15} />
                Add a Story
              </Link>
            </div>
          </section>
        )}

        {/* Story Origins Map */}
        {pinned.length > 0 && (
          <section className="pb-16">
            <BlurFade delay={0.2}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <MapPin size={15} className="text-neutral-500" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                    Story Origins
                  </h2>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                <OriginMapClient stories={pinned} />
              </div>
            </BlurFade>
          </section>
        )}
      </div>
    </div>
  );
}
