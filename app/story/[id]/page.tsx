import Image from "next/image";
import Link from "next/link";
import ReimagineSection from "@/components/ReimagineSection";
import EchoesSection from "@/components/EchoesSection";
import StoryReader from "@/components/StoryReader";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  Calendar,
  BookOpen,
  Clock,
  Globe,
  ArrowLeft,
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
      <div className="min-h-screen bg-white">
        <div className="flex flex-col items-center justify-center py-40 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-5">
            <BookOpen size={28} className="text-neutral-400" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            Story Not Found
          </h2>
          <p className="text-neutral-500 text-base max-w-md">
            This story may have been removed or the link might be incorrect.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200 h-9 px-4 rounded-lg shadow-xs transition-all active:scale-[0.98] mt-6"
          >
            <ArrowLeft size={14} />
            Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(story.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const text = story.cleaned_text ?? story.raw_text ?? "";
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const displayTitle = story.title
    ? story.title.charAt(0).toUpperCase() + story.title.slice(1)
    : "";

  return (
    <div className="min-h-screen bg-white">
      {/* ── Back ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-5">
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
      </div>

      {/* ── Split: Image (2/5) + Content (3/5) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-14 items-start">
          {/* Left — Image + Meta (sticky) */}
          <div className="lg:col-span-2 lg:sticky lg:top-20">
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100">
              {story.cover_image_url ? (
                <Image
                  src={story.cover_image_url}
                  alt={displayTitle}
                  fill
                  unoptimized
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen size={48} className="text-neutral-300" />
                </div>
              )}
            </div>

            {/* Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {story.tag && (
                <span className="inline-flex items-center text-xs font-medium text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-lg">
                  {story.tag}
                </span>
              )}
              {story.language &&
                story.language.toLowerCase() !== "english" && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-lg">
                    <Globe size={11} />
                    {story.language}
                  </span>
                )}
              <span className="inline-flex items-center gap-1 text-xs text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-lg">
                <Clock size={11} />
                {readingTime} min · {wordCount.toLocaleString()} words
              </span>
            </div>

            {/* About — under image, desktop only */}
            <div className="hidden lg:block mt-6 pt-6 border-t border-neutral-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                About This Story
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center gap-2.5">
                  <User
                    size={13}
                    className="text-neutral-400 flex-shrink-0"
                  />
                  <span className="text-neutral-400 text-xs">Told by</span>
                  <span className="text-neutral-900 font-medium">
                    {story.teller_name}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar
                    size={13}
                    className="text-neutral-400 flex-shrink-0"
                  />
                  <span className="text-neutral-400 text-xs">Preserved</span>
                  <span className="text-neutral-900 font-medium">
                    {formattedDate}
                  </span>
                </div>
                {story.tag && (
                  <div className="flex items-center gap-2.5">
                    <BookOpen
                      size={13}
                      className="text-neutral-400 flex-shrink-0"
                    />
                    <span className="text-neutral-400 text-xs">Theme</span>
                    <span className="text-neutral-900 font-medium">
                      {story.tag}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <Globe
                    size={13}
                    className="text-neutral-400 flex-shrink-0"
                  />
                  <span className="text-neutral-400 text-xs">Language</span>
                  <span className="text-neutral-900 font-medium">
                    {story.language || "English"}
                  </span>
                </div>
              </dl>
            </div>
          </div>

          {/* Right — Title + Story */}
          <div className="lg:col-span-3 min-w-0">
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tighter text-balance text-neutral-900 leading-[1.1]">
              {displayTitle}
            </h1>

            <div className="flex items-center gap-3 mt-6">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-neutral-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {story.teller_name}
                </p>
                <p className="text-xs text-neutral-400">
                  {formattedDate} · {readingTime} min read
                </p>
              </div>
            </div>

            <div className="mt-8 mb-2 border-t border-neutral-100" />

            {/* Story — no card, no wrapper, clean */}
            <StoryReader
              storyId={story.id}
              cleanedText={story.cleaned_text ?? story.raw_text}
              originalLanguage={story.language}
            />
          </div>
        </div>
      </section>

      {/* ── Bottom: Reimagine + Echoes ── */}
      <section className="border-t border-neutral-100 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-8">
          {/* Reimagine — compact row */}
          <Card className="border border-neutral-200 bg-white shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <ReimagineSection
                storyId={story.id}
                cleanedText={story.cleaned_text ?? story.raw_text}
              />
            </CardContent>
          </Card>

          {/* Echoes — full width, taller */}
          <Card className="border border-neutral-200 bg-white shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <EchoesSection storyId={story.id} />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}