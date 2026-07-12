import Image from "next/image";
import Link from "next/link";
import ReimagineSection from "@/components/ReimagineSection";
import EchoesSection from "@/components/EchoesSection";
import StoryChainSection from "@/components/StoryChainSection";
import StoryReader from "@/components/StoryReader";
import VoicePlayer from "@/components/VoicePlayer";
import ReadingProgress from "@/components/ReadingProgress";
import { supabase } from "@/lib/supabase";
import UserAvatar from "@/components/UserAvatar";
import {
  Calendar,
  BookOpen,
  Clock,
  Globe,
  ArrowLeft,
  MapPin,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data: story, error } = await supabase
    .from("stories")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !story) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-40 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-5">
          <BookOpen size={28} className="text-neutral-300" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-800 mb-2">Story Not Found</h2>
        <p className="text-neutral-500 text-sm max-w-sm">
          This story may have been removed or the link might be incorrect.
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

  let tellerAvatarUrl: string | null = null;
  if (story.user_id) {
    const { data: tellerProfile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", story.user_id)
      .single();
    tellerAvatarUrl = tellerProfile?.avatar_url ?? null;
  }

  const formattedDate = new Date(story.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const text        = story.cleaned_text ?? story.raw_text ?? "";
  const wordCount   = text.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const displayTitle = story.title
    ? story.title.charAt(0).toUpperCase() + story.title.slice(1)
    : "";

  return (
    <div className="min-h-screen bg-white">
      <ReadingProgress />

      {/* ── Hero: full-width cover with overlay ── */}
      <div className="relative w-full h-[52vh] min-h-[340px] max-h-[520px] overflow-hidden bg-neutral-900">
        {story.cover_image_url ? (
          <Image
            src={story.cover_image_url}
            alt={displayTitle}
            fill
            unoptimized
            priority
            className="object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
        )}

        {/* gradient overlay — fades bottom into white */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Back button — top left, aligned to the same container as the body */}
        <div className="absolute inset-x-0 top-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 h-8 px-3 rounded-lg transition-all group"
            >
              <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
              Back
            </Link>
          </div>
        </div>

        {/* Hero text — bottom left, aligned to the same container as the body */}
        <div className="absolute bottom-0 left-0 right-0 pb-8 pt-16">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="max-w-4xl">
            {/* Tags row */}
            <div className="flex items-center flex-wrap gap-2 mb-4">
              {story.tag && (
                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/70 bg-white/10 border border-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
                  {story.tag}
                </span>
              )}
              {story.language && story.language.toLowerCase() !== "english" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/70 bg-white/10 border border-white/15 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Globe size={10} />
                  {story.language}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1] text-balance">
              {displayTitle}
            </h1>

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-x-5 gap-y-2 mt-4">
              {story.user_id ? (
                <Link href={`/profile/${story.user_id}`} className="flex items-center gap-2 group/teller">
                  <UserAvatar name={story.teller_name} avatarUrl={tellerAvatarUrl} size={28} />
                  <span className="text-sm text-white/80">
                    Told by{" "}
                    <span className="text-white font-medium group-hover/teller:underline">
                      {story.teller_name}
                    </span>
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <UserAvatar name={story.teller_name} avatarUrl={tellerAvatarUrl} size={28} />
                  <span className="text-sm text-white/80">
                    Told by <span className="text-white font-medium">{story.teller_name}</span>
                  </span>
                </div>
              )}
              <span className="flex items-center gap-1.5 text-xs text-white/60">
                <Clock size={11} />
                {readingTime} min · {wordCount.toLocaleString()} words
              </span>
              <span className="flex items-center gap-1.5 text-xs text-white/60">
                <Calendar size={11} />
                {formattedDate}
              </span>
              {story.location_name && (
                <span className="flex items-center gap-1.5 text-xs text-white/60">
                  <MapPin size={11} />
                  {story.location_name}
                </span>
              )}
            </div>
          </div>
         </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* ── Two-col: sidebar (1/3) + reader (2/3) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14 pt-10 pb-16">

          {/* ── Sidebar ── */}
          <aside className="order-2 lg:order-1 lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-6">

              {/* About card */}
              <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-purple-500 to-violet-400" />
                <div className="p-5">
                  <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
                    About This Story
                  </h3>
                  <dl className="space-y-3.5">
                    <div className="flex items-start gap-3">
                      <UserAvatar name={story.teller_name} avatarUrl={tellerAvatarUrl} size={28} />
                      <div>
                        <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Told by</p>
                        {story.user_id ? (
                          <Link
                            href={`/profile/${story.user_id}`}
                            className="text-sm font-semibold text-neutral-900 hover:text-purple-600 mt-0.5 block transition-colors"
                          >
                            {story.teller_name}
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-neutral-900 mt-0.5">{story.teller_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Calendar size={12} className="text-neutral-500" />
                      </div>
                      <div>
                        <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Preserved</p>
                        <p className="text-sm font-semibold text-neutral-900 mt-0.5">{formattedDate}</p>
                      </div>
                    </div>
                    {story.location_name && (
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin size={12} className="text-neutral-500" />
                        </div>
                        <div>
                          <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Origin</p>
                          <p className="text-sm font-semibold text-neutral-900 mt-0.5">{story.location_name}</p>
                        </div>
                      </div>
                    )}
                    {story.tag && (
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <BookOpen size={12} className="text-neutral-500" />
                        </div>
                        <div>
                          <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Theme</p>
                          <p className="text-sm font-semibold text-neutral-900 mt-0.5">{story.tag}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Globe size={12} className="text-neutral-500" />
                      </div>
                      <div>
                        <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Language</p>
                        <p className="text-sm font-semibold text-neutral-900 mt-0.5">{story.language || "English"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock size={12} className="text-neutral-500" />
                      </div>
                      <div>
                        <p className="text-[11px] text-neutral-400 uppercase tracking-wider">Length</p>
                        <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                          {readingTime} min · {wordCount.toLocaleString()} words
                        </p>
                      </div>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Voice recording player */}
              {story.voice_recording_url && (
                <VoicePlayer
                  url={story.voice_recording_url}
                  tellerName={story.teller_name}
                />
              )}

              {/* Cover thumbnail — small, decorative */}
              {story.cover_image_url && (
                <div className="rounded-2xl overflow-hidden border border-neutral-200 aspect-[4/3] relative hidden lg:block">
                  <Image
                    src={story.cover_image_url}
                    alt={displayTitle}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </aside>

          {/* ── Story reader ── */}
          <div className="order-1 lg:order-2 lg:col-span-2 min-w-0">
            <StoryReader
              cleanedText={story.cleaned_text ?? story.raw_text}
              originalLanguage={story.language}
            />
          </div>
        </div>
      </div>

      {/* ── Bottom sections ── */}
      <div className="border-t border-neutral-100 bg-neutral-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-6">

          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight whitespace-nowrap">
              Keep the Story Going
            </h2>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <ReimagineSection
            storyId={story.id}
            cleanedText={story.cleaned_text ?? story.raw_text}
            storyTitle={displayTitle}
            tellerName={story.teller_name}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
              <StoryChainSection storyId={story.id} />
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
              <EchoesSection storyId={story.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
