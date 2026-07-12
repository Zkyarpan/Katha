import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import StoryCard from "@/components/StoryCard";
import { createClient } from "@/lib/supabase-server";
import { BlurFade } from "@/components/ui/blur-fade";

export default async function MyStoriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const storyList = stories ?? [];

  return (
    <div className="min-h-screen bg-white">

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-20">
        <BlurFade delay={0.1}>
          <h1 className="text-2xl font-bold text-neutral-900">My Stories</h1>
          <p className="text-sm text-neutral-500 mt-1 mb-8">
            {storyList.length > 0
              ? `You've preserved ${storyList.length} ${storyList.length === 1 ? "story" : "stories"}`
              : "You haven't saved any stories yet"}
          </p>
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
              You haven&apos;t saved any stories yet
            </p>
            <Link
              href="/new-story"
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              <Plus size={15} />
              Save Your First Story
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}