import Link from "next/link";
import { Plus, MapPin, Sparkles } from "lucide-react";
import Header from "@/components/Header";
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

  const pinned = storyList
    .filter((s) => s.latitude && s.longitude)
    .map((s) => ({
      id: s.id,
      title: s.title,
      latitude: s.latitude,
      longitude: s.longitude,
    }));

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="px-6 pt-24 pb-16 text-center max-w-2xl mx-auto">
        <BlurFade delay={0.1}>
          <div className="inline-flex items-center gap-1.5 text-purple-600 text-xs font-medium bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-full mb-8">
            <Sparkles size={12} />
            Powered by IBM watsonx AI
          </div>
        </BlurFade>

        <BlurFade delay={0.2}>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] text-neutral-900">
            Stories that must{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              not be forgotten
            </span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.3}>
          <p className="mt-4 text-neutral-500 text-base max-w-lg mx-auto leading-relaxed">
            Preserve fading oral folk tales with AI. Transform them into
            children&apos;s books, comics, and creative works.
          </p>
        </BlurFade>

        <BlurFade delay={0.4}>
          <Link
            href="/new-story"
            className="inline-flex items-center gap-2 mt-8 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={15} />
            Save Your First Story
          </Link>
        </BlurFade>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        {/* Stories */}
        {storyList.length > 0 && (
          <section className="pb-16">
            <BlurFade delay={0.2}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Recent Stories
                </h2>
               <Link
  href="/stories"
  className="inline-flex items-center gap-1.5 text-sm font-medium bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg transition-colors"
>
  View all {storyList.length} stories 
</Link>
              </div>
            </BlurFade>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {storyList.slice(0, 3).map((story, index) => (
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

        {storyList.length === 0 && (
          <section className="pb-16">
            <div className="text-center py-16 border border-dashed border-neutral-200 rounded-xl">
              <p className="text-neutral-400 text-sm mb-4">
                No stories yet — be the first to preserve one
              </p>
              <Link
                href="/new-story"
                className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                <Plus size={15} />
                Add a Story
              </Link>
            </div>
          </section>
        )}

        {/* Map */}
        {pinned.length > 0 && (
          <section className="pb-16">
            <BlurFade delay={0.3}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-purple-500" />
                <h2 className="text-lg font-semibold text-neutral-900">
                  Story Origins
                </h2>
              </div>
              <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                <OriginMapClient stories={pinned} />
              </div>
            </BlurFade>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-8 text-center text-xs text-neutral-400">
        Built for IBM AI Builders Challenge 2026 · Powered by IBM Bob
      </footer>
    </div>
  );
}
