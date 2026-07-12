import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";
import StoryCard from "@/components/StoryCard";
import UserAvatar from "@/components/UserAvatar";
import { BlurFade } from "@/components/ui/blur-fade";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, is_anonymous, created_at")
    .eq("id", id)
    .single();

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-40 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-5">
          <BookOpen size={28} className="text-neutral-300" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-800 mb-2">Profile Not Found</h2>
        <p className="text-neutral-500 text-sm max-w-sm">
          This storyteller may not exist or the link might be incorrect.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200 h-9 px-4 rounded-lg shadow-sm transition-all mt-6"
        >
          <ArrowLeft size={14} /> Back to Stories
        </Link>
      </div>
    );
  }

  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const storyList = stories ?? [];
  const displayName = profile.display_name || "Storyteller";

  const joined = new Date(profile.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long",
  });

  const supabaseServer = await createClient();
  const { data: { user: viewer } } = await supabaseServer.auth.getUser();
  const isOwnProfile = viewer?.id === id;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-20">
        <BlurFade delay={0.1}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-900 transition-colors group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>
        </BlurFade>

        <BlurFade delay={0.15}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mt-5 mb-10">
            <div className="flex items-center gap-4">
              <UserAvatar name={displayName} avatarUrl={profile.avatar_url} size={64} />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">{displayName}</h1>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5">
                  <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Calendar size={12} />
                    Joined {joined}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <BookOpen size={12} />
                    {storyList.length} {storyList.length === 1 ? "story" : "stories"} preserved
                  </span>
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200 h-9 px-4 rounded-lg shadow-sm transition-all self-start sm:self-center"
              >
                <Settings size={13} />
                Edit Profile
              </Link>
            )}
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
            <p className="text-neutral-400 text-sm">
              {displayName} hasn&apos;t preserved any stories yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
