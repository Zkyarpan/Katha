"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import PictureBook from "@/components/PictureBook";
import {
  BookOpen, MessageSquareText, Sparkles, Loader2, AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type ReimagineFormat = "children" | "comic" | null;

interface BookPage { text: string; imageUrl: string; }

type ReimagineResult =
  | { kind: "comic";    text: string }
  | { kind: "children"; pages: BookPage[] }
  | null;

interface ReimagineProps {
  storyId: string;
  cleanedText: string;
  storyTitle?: string;
  tellerName?: string;
}

export default function ReimagineSection({ storyId, storyTitle, tellerName }: ReimagineProps) {
  const [activeFormat, setActiveFormat] = useState<ReimagineFormat>(null);
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState<ReimagineResult>(null);
  const [error,        setError]        = useState<string | null>(null);

  const handleReimagine = async (format: NonNullable<ReimagineFormat>) => {
    if (format === activeFormat && result !== null) return;
    setActiveFormat(format);
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res  = await fetch("/api/reimagine", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ storyId, format }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      if (format === "children" && Array.isArray(data.pages)) {
        setResult({ kind: "children", pages: data.pages });
      } else {
        setResult({ kind: "comic", text: data.result });
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      {/* Top accent */}
      <div className="h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-500" />
              <h2 className="text-base font-bold tracking-tight text-neutral-900">
                Reimagine This Story
              </h2>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-sm">
              Let AI transform this folk tale into a new creative format.
            </p>
          </div>
        </div>

        {/* Format buttons */}
        <div className="flex flex-wrap gap-2.5 mb-6">
          {[
            { format: "children" as const, icon: BookOpen,          label: "Children's Book",  desc: "6-page illustrated story" },
            { format: "comic"    as const, icon: MessageSquareText, label: "Comic Script",      desc: "Panels & dialogue"         },
          ].map(({ format, icon: Icon, label, desc }) => {
            const active = activeFormat === format;
            return (
              <button
                key={format}
                onClick={() => handleReimagine(format)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  active
                    ? "bg-neutral-900 border-neutral-900 text-white shadow-sm"
                    : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  active ? "bg-white/15" : "bg-neutral-100"
                }`}>
                  <Icon size={15} className={active ? "text-white" : "text-neutral-600"} />
                </div>
                <div>
                  <p className={`text-sm font-semibold leading-tight ${active ? "text-white" : "text-neutral-900"}`}>
                    {label}
                  </p>
                  <p className={`text-[11px] mt-0.5 ${active ? "text-white/70" : "text-neutral-400"}`}>
                    {desc}
                  </p>
                </div>
                {active && loading && (
                  <Loader2 size={14} className="ml-auto animate-spin text-white/60" />
                )}
              </button>
            );
          })}
        </div>

        {/* Result */}
        {activeFormat && (
          <div className="animate-in fade-in duration-300">
            {loading ? (
              <div className="space-y-4">
                {activeFormat === "children" ? (
                  <>
                    <Skeleton className="w-full aspect-[4/3] rounded-xl" />
                    <Skeleton className="h-4 w-3/4 mx-auto rounded-lg" />
                    <Skeleton className="h-4 w-1/2 mx-auto rounded-lg" />
                  </>
                ) : (
                  <div className="space-y-2.5 border border-neutral-100 rounded-xl p-5">
                    <Skeleton className="h-5 w-1/3 rounded-lg" />
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-5/6 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-5 w-2/5 rounded-lg mt-4" />
                    <Skeleton className="h-3 w-4/5 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                  </div>
                )}
                <p className="text-xs text-neutral-400 text-center animate-pulse">
                  AI is crafting your {activeFormat === "children" ? "picture book" : "comic script"}…
                </p>
              </div>
            ) : error ? (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : result?.kind === "children" ? (
              <PictureBook pages={result.pages} storyTitle={storyTitle} tellerName={tellerName} />
            ) : result?.kind === "comic" ? (
              <div className="border border-neutral-200 rounded-xl p-5 bg-neutral-50">
                <div className="prose prose-neutral prose-sm max-w-none">
                  <ReactMarkdown>{result.text}</ReactMarkdown>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
