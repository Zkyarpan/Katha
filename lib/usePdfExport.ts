"use client";

// ---------------------------------------------------------------------------
// lib/usePdfExport.ts
//
// Hook that generates a downloadable PDF picture-book from a set of pages
// (each with an imageUrl and text). Uses jsPDF directly in the browser —
// no server round-trip, no html2canvas.
//
// Layout per page (A4 landscape, mm):
//   ┌──────────────────────────────────────────┐
//   │  [story title – top, small]              │
//   │  ┌──────────────────────────────────────┐│
//   │  │          illustration                ││
//   │  └──────────────────────────────────────┘│
//   │  [page text – centred, serif, below img] │
//   │  [page n / total  – bottom right, muted] │
//   └──────────────────────────────────────────┘
// ---------------------------------------------------------------------------

import { useState, useCallback } from "react";

interface Page {
  text: string;
  imageUrl: string;
}

interface UsePdfExportReturn {
  exporting: boolean;
  exportPdf: (pages: Page[], storyTitle: string, tellerName: string) => Promise<void>;
}

// Page dimensions in mm (A4 landscape)
const PW = 297;  // page width
const PH = 210;  // page height
const MARGIN = 14;

/** Fetch an image URL and return a base64 data-URL string. */
async function toDataUrl(src: string): Promise<string> {
  // Proxy through a canvas so cross-origin images are handled
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = img.naturalWidth  || 600;
      canvas.height = img.naturalHeight || 450;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export function usePdfExport(): UsePdfExportReturn {
  const [exporting, setExporting] = useState(false);

  const exportPdf = useCallback(async (
    pages: Page[],
    storyTitle: string,
    tellerName: string,
  ) => {
    setExporting(true);
    try {
      // Dynamic import keeps jsPDF out of the initial JS bundle
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const imgW  = PW - MARGIN * 2;        // illustration width
      const imgH  = imgW * (3 / 4);         // keep 4:3 aspect
      const imgY  = MARGIN + 10;            // top of illustration
      const textY = imgY + imgH + 8;        // top of text block
      const footY = PH - 8;                 // bottom footnote line

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) doc.addPage();

        const page = pages[i];

        // ── Background ───────────────────────────────────────────────────
        doc.setFillColor(252, 249, 245); // warm off-white
        doc.rect(0, 0, PW, PH, "F");

        // ── Title bar (page 1 only) ───────────────────────────────────────
        if (i === 0) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(60, 40, 80);
          doc.text(storyTitle, MARGIN, MARGIN + 4);
        }

        // ── Illustration ──────────────────────────────────────────────────
        try {
          const dataUrl = await toDataUrl(page.imageUrl);
          doc.addImage(dataUrl, "JPEG", MARGIN, imgY, imgW, imgH, undefined, "FAST");
        } catch {
          // If image fails, draw a placeholder rectangle
          doc.setFillColor(220, 210, 230);
          doc.roundedRect(MARGIN, imgY, imgW, imgH, 4, 4, "F");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(140, 120, 160);
          doc.text("Illustration", PW / 2, imgY + imgH / 2, { align: "center" });
        }

        // ── Thin decorative rule below image ──────────────────────────────
        doc.setDrawColor(180, 150, 200);
        doc.setLineWidth(0.4);
        doc.line(MARGIN, imgY + imgH + 3, PW - MARGIN, imgY + imgH + 3);

        // ── Page text (wrapped, centred) ──────────────────────────────────
        doc.setFont("times", "normal");
        doc.setFontSize(13);
        doc.setTextColor(40, 30, 55);
        const wrapped = doc.splitTextToSize(page.text, imgW);
        doc.text(wrapped, PW / 2, textY, { align: "center", lineHeightFactor: 1.5 });

        // ── Footer: page number + teller credit ──────────────────────────
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(160, 140, 180);
        doc.text(
          `Page ${i + 1} of ${pages.length}`,
          PW - MARGIN,
          footY,
          { align: "right" }
        );
        if (i === pages.length - 1) {
          // Last page: teller credit centred
          doc.text(
            `A story told by ${tellerName}  ·  Preserved with Katha`,
            PW / 2,
            footY,
            { align: "center" }
          );
        }
      }

      // ── Download ──────────────────────────────────────────────────────────
      const filename = `${storyTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-picture-book.pdf`;
      doc.save(filename);
    } finally {
      setExporting(false);
    }
  }, []);

  return { exporting, exportPdf };
}
