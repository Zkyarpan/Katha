import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import StoryCard from "@/components/StoryCard";
import { supabase } from "@/lib/supabase";
import { BlurFade } from "@/components/ui/blur-fade";

export default async function AllStoriesPage() {
  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .order("created_at", { ascending: false });

  const storyList = stories ?? [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-20">
        <BlurFade delay={0.1}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-900 transition-colors group"
          >
            <ArrowLeft
              size={15}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back 
          </Link>
        </BlurFade>

        <BlurFade delay={0.15}>
          <div className="flex items-center justify-between mb-8 mt-5">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                All Stories
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                {storyList.length} stories preserved from around the world
              </p>
            </div>
            <Link
              href="/new-story"
              className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={14} />
              Add a Story
            </Link>
          </div>
        </BlurFade>

        {storyList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {storyList.map((story, index) => (
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
        ) : (
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
        )}
      </div>
    </div>
  );
}
