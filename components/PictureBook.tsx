"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// PictureBook
// Renders a multi-page children's picture book with navigation and
// page-turn fade transitions.
// ---------------------------------------------------------------------------

interface Page {
  text: string;
  imageUrl: string;
}

interface PictureBookProps {
  pages: Page[];
}

export default function PictureBook({ pages }: PictureBookProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [visible, setVisible] = useState(true); // drives the fade transition

  // Fade out → update page → fade in whenever currentPage changes.
  const goTo = (index: number) => {
    if (index === currentPage) return;
    setVisible(false);
    // Wait for the fade-out (150 ms) before updating the page content.
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

  const page = pages[currentPage];
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
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon size={32} className="text-katha-muted/40 animate-pulse" />
            </div>
          )}
          <Image
            key={page.imageUrl} // remount on URL change so onLoad fires reliably
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

      {/* ── Previous / Next navigation ── */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={isFirst}
          className="flex items-center gap-1.5 text-sm text-katha-muted hover:text-katha-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          Previous
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
