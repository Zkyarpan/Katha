"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { Sparkles, User, BookText, PenLine } from "lucide-react";

export default function NewStoryPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [teller, setTeller] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/clean-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tellerName: teller, rawText: story }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push(`/story/${data.id}`);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <section className="px-6 md:px-12 pb-24 pt-4 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 text-katha-gold text-sm font-medium bg-katha-gold/10 border border-katha-gold/20 px-4 py-1.5 rounded-full mb-5">
            <PenLine size={14} />
            New Story
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-katha-cream glow-text">
            Save a Fading Story
          </h1>
          <p className="text-katha-muted mt-3">
            Don&apos;t worry about making it perfect — rough is okay. AI will
            help clean it up.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-katha-indigoLight/40 border border-katha-plum/40 rounded-2xl p-6 md:p-8 space-y-6"
        >
          {/* Story Title */}
          <div>
            <label className="flex items-center gap-2 text-katha-cream font-medium mb-2">
              <BookText size={16} className="text-katha-gold" />
              Story Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Mountain Spirit of Taplejung"
              className="w-full bg-katha-indigo/60 border border-katha-plum/50 rounded-xl px-4 py-3 text-katha-cream placeholder:text-katha-muted/60 focus:outline-none focus:border-katha-gold/60 transition-colors"
            />
          </div>

          {/* Who told it */}
          <div>
            <label className="flex items-center gap-2 text-katha-cream font-medium mb-2">
              <User size={16} className="text-katha-gold" />
              Who told you this story?
            </label>
            <input
              type="text"
              required
              value={teller}
              onChange={(e) => setTeller(e.target.value)}
              placeholder="e.g. My Grandmother, Taplejung"
              className="w-full bg-katha-indigo/60 border border-katha-plum/50 rounded-xl px-4 py-3 text-katha-cream placeholder:text-katha-muted/60 focus:outline-none focus:border-katha-gold/60 transition-colors"
            />
          </div>

          {/* The story */}
          <div>
            <label className="flex items-center gap-2 text-katha-cream font-medium mb-2">
              <Sparkles size={16} className="text-katha-gold" />
              Write the story (rough is okay!)
            </label>
            <textarea
              required
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={8}
              placeholder="Tell it the way you remember it..."
              className="w-full bg-katha-indigo/60 border border-katha-plum/50 rounded-xl px-4 py-3 text-katha-cream placeholder:text-katha-muted/60 focus:outline-none focus:border-katha-gold/60 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            icon={<Sparkles size={18} />}
            className="w-full"
          >
            {loading ? "Polishing your story..." : "Save & Clean Up"}
          </Button>
        </form>
      </section>
    </div>
  );
}