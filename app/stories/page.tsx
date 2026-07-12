import Link from "next/link";
import { ArrowLeft, Plus, BookOpen } from "lucide-react";
import StoriesGrid from "@/components/StoriesGrid";
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
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-neutral-900 flex items-center justify-center flex-shrink-0">
                <BookOpen size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  All Stories
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {storyList.length} {storyList.length === 1 ? "story" : "stories"} preserved from around the world
                </p>
              </div>
            </div>
            <Link
              href="/new-story"
              className="hidden sm:inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all active:scale-[0.98]"
            >
              <Plus size={14} />
              Add a Story
            </Link>
          </div>
        </BlurFade>

        <BlurFade delay={0.2}>
          <StoriesGrid stories={storyList} />
        </BlurFade>
      </div>
    </div>
  );
}
