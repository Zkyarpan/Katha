"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { BookOpen, MessageSquareText, Sparkles } from "lucide-react";

// ---------------------------------------------------------------------------
// ReimagineSection
// Isolated client component so the parent Story page can be a Server Component.
// ---------------------------------------------------------------------------

type ReimagineFormat = "children" | "comic" | null;

interface ReimagineSection {
  storyId: string;
  cleanedText: string;
}

const mockResults: Record<string, string> = {
  children:
    "Once upon a time, high on a snowy mountain, lived a kind spirit. 🏔️ Whenever danger came near the village, the spirit would call the clouds together and make a big, swirling storm to keep everyone safe! ⛈️ The villagers loved their invisible friend very much.",
  comic:
    "PANEL 1: Wide shot of a snow-capped mountain at dusk. A glowing figure watches over a village below.\nCAPTION: \"For generations, the Mountain Spirit has protected this village...\"\n\nPANEL 2: A shadowy figure approaches the village gate.\nSPIRIT (thought bubble): \"An intruder...\"",
};

export default function ReimagineSection({ storyId, cleanedText }: ReimagineSection) {
  const [activeFormat, setActiveFormat] = useState<ReimagineFormat>(null);
  const [loading, setLoading] = useState(false);

  // storyId and cleanedText are available for when /api/reimagine is wired up.
  void storyId;
  void cleanedText;

  const handleReimagine = (format: ReimagineFormat) => {
    setLoading(true);
    setActiveFormat(format);
    // TODO: connect to /api/reimagine once backend is ready
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-katha-gold" />
        <h2 className="font-serif text-xl font-semibold text-katha-cream">
          Reimagine this story
        </h2>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant={activeFormat === "children" ? "primary" : "secondary"}
          onClick={() => handleReimagine("children")}
          icon={<BookOpen size={16} />}
        >
          Children&apos;s Book
        </Button>
        <Button
          variant={activeFormat === "comic" ? "primary" : "secondary"}
          onClick={() => handleReimagine("comic")}
          icon={<MessageSquareText size={16} />}
        >
          Comic Script
        </Button>
      </div>

      {/* Result */}
      {activeFormat && (
        <div className="mt-6 bg-katha-indigoLight/40 border border-katha-gold/30 rounded-2xl p-6 md:p-8 animate-in fade-in duration-500">
          {loading ? (
            <p className="text-katha-muted flex items-center gap-2">
              <Sparkles size={16} className="animate-pulse text-katha-gold" />
              Reimagining your story...
            </p>
          ) : (
            <p className="text-katha-cream/90 leading-relaxed whitespace-pre-line">
              {mockResults[activeFormat]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
