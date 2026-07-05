import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import ReimagineSection from "@/components/ReimagineSection";
import EchoesSection from "@/components/EchoesSection";
import StoryReader from "@/components/StoryReader";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

      {/* ── Split Layout: Image Left + Content Right ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left — Cover Image (sticky) */}
          <div className="lg:sticky lg:top-20">
            <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100">
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

            {/* Badges below image */}
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
                    Translated from {story.language}
                  </span>
                )}
              <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-lg">
                <Clock size={11} />
                {readingTime} min read
              </span>
            </div>
          </div>

          {/* Right — Title + Story */}
          <div className="min-w-0">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter text-balance text-neutral-900 leading-[1.1]">
              {displayTitle}
            </h1>

            {/* Author row */}
            <div className="flex items-center gap-3 mt-6">
              <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-neutral-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {story.teller_name}
                </p>
                <p className="text-xs text-neutral-400">
                  {formattedDate}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="mt-6 mb-6 border-t border-neutral-100" />

            {/* Story body */}
            <div className="story-reader-wrapper">
              <StoryReader
                storyId={story.id}
                cleanedText={story.cleaned_text ?? story.raw_text}
                originalLanguage={story.language}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Below: About + Reimagine + Echoes ── */}
      <section className="border-t border-neutral-100 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
          {/* Three-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* About */}
            <Card className="border border-neutral-200 bg-white shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-5">
                  About This Story
                </h3>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-xs text-neutral-400">Storyteller</dt>
                    <dd className="text-neutral-900 font-medium mt-0.5">
                      {story.teller_name}
                    </dd>
                  </div>
                  {story.tag && (
                    <div>
                      <dt className="text-xs text-neutral-400">Theme</dt>
                      <dd className="text-neutral-900 font-medium mt-0.5">
                        {story.tag}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs text-neutral-400">Language</dt>
                    <dd className="text-neutral-900 font-medium mt-0.5">
                      {story.language || "English"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-400">Preserved On</dt>
                    <dd className="text-neutral-900 font-medium mt-0.5">
                      {formattedDate}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-400">Length</dt>
                    <dd className="text-neutral-900 font-medium mt-0.5">
                      {wordCount.toLocaleString()} words · {readingTime} min
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Reimagine */}
            <Card className="border border-neutral-200 bg-white shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <ReimagineSection
                  storyId={story.id}
                  cleanedText={story.cleaned_text ?? story.raw_text}
                />
              </CardContent>
            </Card>

            {/* Echoes */}
            <Card className="border border-neutral-200 bg-white shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <EchoesSection storyId={story.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}