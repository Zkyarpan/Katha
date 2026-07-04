import Image from "next/image";
import Header from "@/components/Header";
import ReimagineSection from "@/components/ReimagineSection";
import { supabase } from "@/lib/supabase";
import { User, Volume2 } from "lucide-react";

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

  console.log("[story page] cover_image_url:", story.cover_image_url);

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
          {story.tag && (
            <span className="inline-block bg-katha-indigo/80 backdrop-blur-sm text-katha-gold text-xs font-medium px-3 py-1 rounded-full border border-katha-gold/30 mb-4">
              {story.tag}
            </span>
          )}
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-katha-cream glow-text">
            {story.title}
          </h1>
          <div className="flex items-center gap-2 mt-3 text-katha-muted">
            <User size={15} />
            <span>Told by {story.teller_name}</span>
          </div>

          {/* Story text card */}
          <div className="mt-8 bg-katha-indigoLight/40 border border-katha-plum/40 rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-semibold text-katha-gold">
                The Story
              </h2>
              <button className="flex items-center gap-1.5 text-katha-muted hover:text-katha-gold text-sm transition-colors">
                <Volume2 size={16} />
                Read Aloud
              </button>
            </div>
            <p className="text-katha-cream/90 leading-relaxed text-lg">
              {story.cleaned_text ?? story.raw_text}
            </p>
          </div>

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
