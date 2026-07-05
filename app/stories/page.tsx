import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
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
      <Header />

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-20">
        <BlurFade delay={0.1}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </BlurFade>

        <BlurFade delay={0.15}>
          <h1 className="text-2xl font-bold text-neutral-900">
            All Stories
          </h1>
          <p className="text-sm text-neutral-500 mt-1 mb-8">
            {storyList.length} stories preserved from around the world
          </p>
        </BlurFade>

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
      </div>
    </div>
  );
}