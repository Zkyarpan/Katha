import Image from "next/image";
import Header from "@/components/Header";
import ReimagineSection from "@/components/ReimagineSection";
import LanguageSelector from "@/components/LanguageSelector";
import { supabase } from "@/lib/supabase";
import { User } from "lucide-react";

// ---------------------------------------------------------------------------
// app/story/[id]/page.tsx — async Server Component
// Fetches the story from Supabase by id, then renders it.
// Interactive Reimagine state lives in <ReimagineSection> (client component).
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StoryDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch the story row from Supabase.
  const { data: story, error } = await supabase
    .from("stories")
    .select("*")
    .eq("id", id)
    .single();

  // Not found or DB error — show a simple message rather than crashing.
  if (error || !story) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center py-40 text-center px-6">
          <p className="text-katha-muted text-lg">Story not found.</p>
        </div>
      </div>
    );
  }

  console.log("[story page] story:", story);

  return (
    <div className="min-h-screen">
      <Header />

      <article className="pb-24">
        {/* Cover banner */}
        <div className="relative w-full h-[45vh] min-h-[320px] overflow-hidden bg-katha-plum/30">
          {story.cover_image_url && (
            <Image
              src={story.cover_image_url}
              alt={story.title}
              fill
              unoptimized
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-katha-indigo via-katha-indigo/40 to-transparent" />
        </div>

        <div className="px-6 md:px-12 max-w-3xl mx-auto -mt-16 relative">
          {(story.tag || (story.language && story.language.toLowerCase() !== "english")) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {story.tag && (
                <span className="inline-block bg-katha-indigo/80 backdrop-blur-sm text-katha-gold text-xs font-medium px-3 py-1 rounded-full border border-katha-gold/30">
                  {story.tag}
                </span>
              )}
              {story.language && story.language.toLowerCase() !== "english" && (
                <span className="inline-block bg-katha-plum/60 text-katha-muted text-xs font-medium px-3 py-1 rounded-full border border-katha-muted/20">
                  Translated from {story.language}
                </span>
              )}
            </div>
          )}
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-katha-cream glow-text">
            {story.title}
          </h1>
          <div className="flex items-center gap-2 mt-3 text-katha-muted">
            <User size={15} />
            <span>Told by {story.teller_name}</span>
          </div>

          {/* Language selector — "The Story" card with Read Aloud + translation */}
          <LanguageSelector
            originalText={story.cleaned_text ?? story.raw_text}
            originalLanguage={story.language}
          />

          {/* Reimagine — client component, receives story data as props */}
          <ReimagineSection
            storyId={story.id}
            cleanedText={story.cleaned_text ?? story.raw_text}
          />
        </div>
      </article>
    </div>
  );
}
