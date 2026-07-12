"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePdfExport } from "@/lib/usePdfExport";

// ---------------------------------------------------------------------------
// PictureBook
// Renders a multi-page children's picture book with navigation,
// page-turn fade transitions, and a PDF export button.
// ---------------------------------------------------------------------------

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
  const [imgLoaded, setImgLoaded] = useState(false);
  const [visible, setVisible] = useState(true);

  const { exporting, exportPdf } = usePdfExport();

  // Fade out → update page → fade in whenever currentPage changes.
  const goTo = (index: number) => {
    if (index === currentPage) return;
    setVisible(false);
    setTimeout(() => {
      setCurrentPage(index);
      setImgLoaded(false);
      setVisible(true);
    }, 150);
  };

  // Reset image-loaded state when the page content swaps in.
  useEffect(() => {
    setImgLoaded(false);
  }, [currentPage]);

  const page   = pages[currentPage];
  const isFirst = currentPage === 0;
  const isLast  = currentPage === pages.length - 1;

  return (
    <div className="bg-katha-indigoLight/40 border border-katha-plum/40 rounded-2xl p-6 md:p-8">

      {/* ── Page content with fade transition ── */}
      <div
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 150ms ease-in-out",
        }}
      >
        {/* Illustration */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-katha-plum/30 mb-6">
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
        </div>

        {/* Page text */}
        <p className="font-serif text-xl text-katha-cream text-center leading-relaxed px-2 md:px-6">
          {page.text}
        </p>
      </div>

      {/* ── Page counter ── */}
      <p className="text-katha-muted text-xs text-center mt-5">
        Page {currentPage + 1} of {pages.length}
      </p>

      {/* ── Dot indicators ── */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to page ${i + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i === currentPage
                ? "bg-katha-gold"
                : "bg-katha-muted/40 hover:bg-katha-muted/70"
            }`}
          />
        ))}
      </div>

      {/* ── Navigation + Download row ── */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={isFirst}
          className="flex items-center gap-1.5 text-sm text-katha-muted hover:text-katha-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {/* Download PDF button — centre */}
        <button
          onClick={() => exportPdf(pages, storyTitle, tellerName)}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white transition-colors shadow-sm"
        >
          {exporting ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Building PDF…
            </>
          ) : (
            <>
              <Download size={13} />
              Download PDF
            </>
          )}
        </button>

        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={isLast}
          className="flex items-center gap-1.5 text-sm text-katha-muted hover:text-katha-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
