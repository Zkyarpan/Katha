import Header from "@/components/Header";
import StoryCard from "@/components/StoryCard";
import Link from "next/link";
import { Sparkles, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default async function HomePage() {
  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .order("created_at", { ascending: false });

  const storyList = stories ?? [];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="px-6 md:px-12 pt-10 pb-16 text-center relative overflow-hidden">
        {/* soft glow behind hero */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-katha-gold/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 text-katha-gold text-sm font-medium bg-katha-gold/10 border border-katha-gold/20 px-4 py-1.5 rounded-full mb-6">
            <Sparkles size={14} />
            Powered by IBM watsonx AI
          </span>

          <h1 className="font-serif text-4xl md:text-6xl font-bold text-katha-cream glow-text leading-tight">
            Stories that must
            <br />
            <span className="text-katha-gold">not be forgotten</span>
          </h1>

          <p className="text-katha-muted text-lg mt-6 max-w-xl mx-auto">
            Preserve fading oral folk tales, and let AI transform them into
            children&apos;s books, comics, and new creative worlds.
          </p>

          <Link
            href="/new-story"
            className="inline-flex items-center gap-2 mt-8 bg-katha-gold hover:bg-katha-goldLight text-katha-indigo font-semibold px-7 py-3.5 rounded-full transition-all hover:scale-105 shadow-lg shadow-katha-gold/20"
          >
            <Sparkles size={18} />
            Save Your First Story
          </Link>
        </div>
      </section>

      {/* Story Library */}
      <section className="px-6 md:px-12 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-katha-cream">
            Story Library
          </h2>
          <span className="text-katha-muted text-sm">
            {storyList.length} {storyList.length === 1 ? "story" : "stories"} preserved
          </span>
        </div>

        {storyList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen size={40} className="text-katha-muted/40 mb-4" />
            <p className="text-katha-cream font-serif text-xl mb-2">No stories yet</p>
            <p className="text-katha-muted text-sm max-w-xs">
              Be the first to preserve a fading folk tale for future generations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {storyList.map((story) => (
              <StoryCard
                key={story.id}
                id={story.id}
                title={story.title}
                tellerName={story.teller_name}
                coverImage={story.cover_image_url}
                tag={story.tag ?? undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}