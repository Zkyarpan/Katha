"use client";

import { useState } from "react";
import Button from "@/components/Button";
import PictureBook from "@/components/PictureBook";
import { BookOpen, MessageSquareText, Sparkles } from "lucide-react";

// ---------------------------------------------------------------------------
// ReimagineSection
// Isolated client component so the parent Story page can be a Server Component.
// ---------------------------------------------------------------------------

type ReimagineFormat = "children" | "comic" | null;

interface BookPage {
  text: string;
  imageUrl: string;
}

type ReimagineResult =
  | { kind: "comic";    text: string }
  | { kind: "children"; pages: BookPage[] }
  | null;

interface ReimagineProps {
  storyId: string;
  cleanedText: string;
}

export default function ReimagineSection({ storyId }: ReimagineProps) {
  const [activeFormat, setActiveFormat] = useState<ReimagineFormat>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReimagineResult>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReimagine = async (format: NonNullable<ReimagineFormat>) => {
    // If the same button is clicked again, just re-show the cached result.
    if (format === activeFormat && result !== null) return;

    setActiveFormat(format);
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/reimagine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, format }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      if (format === "children" && Array.isArray(data.pages)) {
        setResult({ kind: "children", pages: data.pages });
      } else {
        setResult({ kind: "comic", text: data.result });
      }
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
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

      {/* Result panel — shown once a format has been selected */}
      {activeFormat && (
        <div className="mt-6 animate-in fade-in duration-500">
          {loading ? (
            <div className="bg-katha-indigoLight/40 border border-katha-gold/30 rounded-2xl p-6 md:p-8">
              <p className="text-katha-muted flex items-center gap-2">
                <Sparkles size={16} className="animate-pulse text-katha-gold" />
                {activeFormat === "children"
                  ? "Illustrating your picture book… (this takes a bit longer)"
                  : "Reimagining your story…"}
              </p>
            </div>
          ) : error ? (
            <div className="bg-katha-indigoLight/40 border border-katha-gold/30 rounded-2xl p-6 md:p-8">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : result?.kind === "children" ? (
            <PictureBook pages={result.pages} />
          ) : result?.kind === "comic" ? (
            <div className="bg-katha-indigoLight/40 border border-katha-gold/30 rounded-2xl p-6 md:p-8">
              <p className="text-katha-cream/90 leading-relaxed whitespace-pre-line">
                {result.text}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
