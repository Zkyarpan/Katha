"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import PictureBook from "@/components/PictureBook";
import { BookOpen, MessageSquareText, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";


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
    <div>
      {/* Section heading */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-purple-500" />
        <h2 className="text-lg font-bold tracking-tight text-neutral-900">
          Reimagine this story
        </h2>
      </div>

      {/* Format buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFormat === "children" ? "default" : "outline"}
          size="sm"
          onClick={() => handleReimagine("children")}
          className={activeFormat === "children" ? "bg-neutral-900 text-white" : ""}
        >
          <BookOpen size={14} />
          Children&apos;s Book
        </Button>
        <Button
          variant={activeFormat === "comic" ? "default" : "outline"}
          size="sm"
          onClick={() => handleReimagine("comic")}
          className={activeFormat === "comic" ? "bg-neutral-900 text-white" : ""}
        >
          <MessageSquareText size={14} />
          Comic Script
        </Button>
      </div>

      {/* Result panel */}
      {activeFormat && (
        <div className="mt-5 animate-in fade-in duration-500">
          {loading ? (
            <div className="border border-neutral-200 rounded-lg p-5">
              {activeFormat === "children" ? (
                <div className="space-y-4">
                  <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
              ) : (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-5 w-2/5 mt-4" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-full" />
                </div>
              )}
            </div>
          ) : error ? (
            <div className="border border-red-100 bg-red-50 rounded-lg p-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : result?.kind === "children" ? (
            <PictureBook pages={result.pages} />
          ) : result?.kind === "comic" ? (
            <div className="border border-neutral-200 rounded-lg p-5">
              <div className="prose prose-neutral prose-sm max-w-none">
                <ReactMarkdown>{result.text}</ReactMarkdown>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
