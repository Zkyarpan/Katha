"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  BookOpen,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePdfExport } from "@/lib/usePdfExport";

interface Page {
  text: string;
  imageUrl: string;
}

interface PictureBookProps {
  pages: Page[];
  storyTitle?: string;
  tellerName?: string;
}

export default function PictureBook({
  pages,
  storyTitle = "A Folk Tale",
  tellerName = "an unknown storyteller",
}: PictureBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [imgLoaded,   setImgLoaded]   = useState(false);
  const [visible,     setVisible]     = useState(true);

  const { exporting, progress, exportPdf } = usePdfExport();

  // Fade out → swap → fade in
  const goTo = (index: number) => {
    if (index === currentPage || index < 0 || index >= pages.length) return;
    setVisible(false);
    setTimeout(() => {
      setCurrentPage(index);
      setImgLoaded(false);
      setVisible(true);
    }, 160);
  };

  useEffect(() => { setImgLoaded(false); }, [currentPage]);

  // keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(currentPage + 1);
      if (e.key === "ArrowLeft")  goTo(currentPage - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const page    = pages[currentPage];
  const isFirst = currentPage === 0;
  const isLast  = currentPage === pages.length - 1;

  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-sm">

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-neutral-50">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-purple-500" />
          <span className="text-sm font-semibold text-neutral-800 truncate max-w-[200px] sm:max-w-none">
            {storyTitle}
          </span>
        </div>
        <span className="text-xs font-medium text-neutral-400 tabular-nums">
          Page {currentPage + 1} of {pages.length}
        </span>
      </div>

      {/* ── Illustration ── */}
      <div
        style={{ opacity: visible ? 1 : 0, transition: "opacity 160ms ease" }}
      >
        <div className="relative w-full aspect-[4/3] bg-neutral-100">
          {!imgLoaded && (
            <Skeleton className="absolute inset-0 rounded-none" />
          )}
          <Image
            key={page.imageUrl}
            src={page.imageUrl}
            alt={`Page ${currentPage + 1} illustration`}
            fill
            unoptimized
            onLoad={() => setImgLoaded(true)}
            className={`object-cover transition-opacity duration-500 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          {/* Page number overlay */}
          <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
            {currentPage + 1} / {pages.length}
          </div>
        </div>

        {/* ── Story text ── */}
        <div className="px-6 py-5 bg-gradient-to-b from-white to-purple-50/40">
          <p className="font-serif text-[1.15rem] leading-[1.85] text-neutral-800 text-center">
            {page.text}
          </p>
        </div>
      </div>

      {/* ── Dot indicators ── */}
      <div className="flex items-center justify-center gap-2 py-3 border-t border-neutral-100">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to page ${i + 1}`}
            className={`rounded-full transition-all ${
              i === currentPage
                ? "w-5 h-2 bg-purple-600"
                : "w-2 h-2 bg-neutral-200 hover:bg-purple-300"
            }`}
          />
        ))}
      </div>

      {/* ── Navigation + Download ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-t border-neutral-100 bg-neutral-50">

        {/* Prev */}
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={isFirst}
          className="flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-lg hover:bg-neutral-100"
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        {/* Download PDF — centre, primary action */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <button
            onClick={() => exportPdf(pages, storyTitle, tellerName)}
            disabled={exporting}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white transition-all shadow-sm hover:shadow-md active:scale-[0.97]"
          >
            {exporting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Building PDF… {progress > 0 ? `${progress}%` : ""}
              </>
            ) : (
              <>
                <Download size={14} />
                Download PDF Book
              </>
            )}
          </button>

          {/* Progress bar */}
          {exporting && (
            <div className="w-full max-w-[200px] h-1 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {!exporting && (
            <p className="text-[11px] text-neutral-400">
              A4 · {pages.length + 2} pages · cover + story + closing
            </p>
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={isLast}
          className="flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-lg hover:bg-neutral-100"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-[10px] text-neutral-300 pb-3">
        Use ← → arrow keys to navigate
      </p>
    </div>
  );
}
