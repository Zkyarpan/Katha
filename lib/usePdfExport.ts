"use client";

// ---------------------------------------------------------------------------
// lib/usePdfExport.ts
//
// Generates a professional downloadable PDF picture-book.
//
// Structure (A4 Portrait — 210 × 297 mm):
//   Page 1  — Cover  : full-bleed illustration + title overlay + teller credit
//   Pages 2–N — Story : top half = illustration, bottom half = styled text
//   Last page — Closing: "The End" decorative page with Katha branding
//
// Why portrait?  Text paragraphs read naturally top-to-bottom; landscape
// forces text into a tiny strip because the image eats the width.
// ---------------------------------------------------------------------------

import { useState, useCallback } from "react";

interface Page {
  text: string;
  imageUrl: string;
}

interface UsePdfExportReturn {
  exporting: boolean;
  progress: number;          // 0–100 for progress feedback
  exportPdf: (pages: Page[], storyTitle: string, tellerName: string) => Promise<void>;
}

// ── A4 Portrait dimensions (mm) ───────────────────────────────────────────────
const PW      = 210;
const PH      = 297;
const MARGIN  = 16;
const INNER_W = PW - MARGIN * 2;   // 178 mm usable width

// Warm storybook palette (RGB)
const COL = {
  bg:        [255, 252, 247] as [number,number,number],   // creamy white
  bgDark:    [42,  28,  60]  as [number,number,number],   // deep plum (cover)
  accent:    [124, 58,  237] as [number,number,number],   // violet
  accentSoft:[237, 233, 254] as [number,number,number],   // lavender tint
  text:      [30,  20,  50]  as [number,number,number],   // near-black
  muted:     [120, 100, 150] as [number,number,number],   // muted purple-grey
  gold:      [217, 157, 47]  as [number,number,number],   // warm gold
  white:     [255, 255, 255] as [number,number,number],
};

// ── Image loader ──────────────────────────────────────────────────────────────
async function toDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas    = document.createElement("canvas");
        canvas.width    = img.naturalWidth  || 800;
        canvas.height   = img.naturalHeight || 600;
        const ctx       = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.88));
      } catch {
        resolve(null);           // tainted canvas (CORS) — skip image gracefully
      }
    };
    img.onerror = () => resolve(null);
    // Small delay so the browser has time to cache the image from the viewer
    setTimeout(() => { img.src = src; }, 50);
  });
}

// ── Decorative corner marks ───────────────────────────────────────────────────
function drawCorners(
  doc: import("jspdf").jsPDF,
  x: number, y: number, w: number, h: number,
  size = 6,
  color: [number,number,number] = COL.gold,
) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.8);
  const corners: [number, number, number, number][] = [
    [x,       y,       x + size, y       ],  // TL horizontal
    [x,       y,       x,        y + size],  // TL vertical
    [x+w-size,y,       x + w,    y       ],  // TR horizontal
    [x+w,     y,       x + w,    y + size],  // TR vertical
    [x,       y+h-size,x,        y + h   ],  // BL vertical
    [x,       y+h,     x + size, y + h   ],  // BL horizontal
    [x+w,     y+h-size,x + w,    y + h   ],  // BR vertical
    [x+w-size,y+h,     x + w,    y + h   ],  // BR horizontal
  ];
  corners.forEach(([x1,y1,x2,y2]) => doc.line(x1,y1,x2,y2));
}

// ── Dot ornament row ──────────────────────────────────────────────────────────
function drawOrnamentLine(
  doc: import("jspdf").jsPDF,
  y: number,
  color: [number,number,number] = COL.gold,
) {
  doc.setFillColor(...color);
  const cx = PW / 2;
  const dots: number[] = [-24, -12, 0, 12, 24];
  dots.forEach((dx) => doc.circle(cx + dx, y, 0.9, "F"));
  // thin line through dots
  doc.setDrawColor(...color);
  doc.setLineWidth(0.2);
  doc.line(cx - 32, y, cx + 32, y);
}

// ── Cover page ────────────────────────────────────────────────────────────────
async function buildCoverPage(
  doc: import("jspdf").jsPDF,
  imageUrl: string,
  title: string,
  tellerName: string,
) {
  // Deep plum background
  doc.setFillColor(...COL.bgDark);
  doc.rect(0, 0, PW, PH, "F");

  // Full-page illustration (top 65%)
  const imgH = PH * 0.62;
  const dataUrl = await toDataUrl(imageUrl);
  if (dataUrl) {
    doc.addImage(dataUrl, "JPEG", 0, 0, PW, imgH, undefined, "MEDIUM");
    // gradient overlay — fake with a semi-transparent rect
    doc.setFillColor(42, 28, 60);
    doc.setGState(doc.GState({ opacity: 0.55 }));
    doc.rect(0, imgH * 0.55, PW, imgH * 0.45, "F");
    doc.setGState(doc.GState({ opacity: 1 }));
  } else {
    // placeholder gradient
    doc.setFillColor(80, 50, 120);
    doc.rect(0, 0, PW, imgH, "F");
  }

  // Gold rule at bottom of image area
  doc.setDrawColor(...COL.gold);
  doc.setLineWidth(1);
  doc.line(MARGIN, imgH + 0.5, PW - MARGIN, imgH + 0.5);

  // "A Children's Picture Book" eyebrow
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COL.gold);
  doc.text("✦  A CHILDREN'S PICTURE BOOK  ✦", PW / 2, imgH + 10, { align: "center" });

  // Title
  const titleLines = doc.splitTextToSize(title.toUpperCase(), INNER_W - 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(titleLines.length > 1 ? 22 : 28);
  doc.setTextColor(...COL.white);
  let titleY = imgH + 24;
  doc.text(titleLines, PW / 2, titleY, { align: "center", lineHeightFactor: 1.3 });
  titleY += (titleLines.length - 1) * (doc.getFontSize() * 0.352 * 1.3);

  // Teller credit
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(...COL.muted);
  doc.text(`A story told by ${tellerName}`, PW / 2, titleY + 14, { align: "center" });

  // Katha branding bottom
  drawOrnamentLine(doc, PH - 24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COL.gold);
  doc.text("KATHA", PW / 2, PH - 14, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COL.muted);
  doc.text("Preserving Stories That Must Not Be Forgotten", PW / 2, PH - 8, { align: "center" });

  // Corner decorations
  drawCorners(doc, MARGIN - 4, MARGIN - 4, INNER_W + 8, PH - MARGIN * 2 + 8);
}

// ── Story page (image top + text bottom) ──────────────────────────────────────
async function buildStoryPage(
  doc: import("jspdf").jsPDF,
  pageIndex: number,
  totalPages: number,
  imageUrl: string,
  text: string,
  title: string,
) {
  // Background
  doc.setFillColor(...COL.bg);
  doc.rect(0, 0, PW, PH, "F");

  // Thin top border strip
  doc.setFillColor(...COL.accentSoft);
  doc.rect(0, 0, PW, 7, "F");

  // Book title in top strip
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...COL.accent);
  doc.text(title.toUpperCase(), PW / 2, 4.6, { align: "center" });

  // ── Illustration area (top 52% of page, below strip) ──
  const imgAreaY = 9;
  const imgAreaH = PH * 0.50;
  const imgAreaW = INNER_W;
  const imgX     = MARGIN;

  // Image frame shadow
  doc.setFillColor(200, 190, 220);
  doc.roundedRect(imgX + 1.5, imgAreaY + 1.5, imgAreaW, imgAreaH, 4, 4, "F");

  // Image
  const dataUrl = await toDataUrl(imageUrl);
  if (dataUrl) {
    // clip to rounded rect by drawing image then overlaying corners
    doc.addImage(dataUrl, "JPEG", imgX, imgAreaY, imgAreaW, imgAreaH, undefined, "MEDIUM");
    // re-draw rounded corners as mask overlay using bg colour
    doc.setFillColor(...COL.bg);
    // top-left
    doc.rect(imgX, imgAreaY, 4, 4, "F");
    doc.circle(imgX + 4, imgAreaY + 4, 4, "F");
    // top-right
    doc.rect(imgX + imgAreaW - 4, imgAreaY, 4, 4, "F");
    doc.circle(imgX + imgAreaW - 4, imgAreaY + 4, 4, "F");
    // bottom-left
    doc.rect(imgX, imgAreaY + imgAreaH - 4, 4, 4, "F");
    doc.circle(imgX + 4, imgAreaY + imgAreaH - 4, 4, "F");
    // bottom-right
    doc.rect(imgX + imgAreaW - 4, imgAreaY + imgAreaH - 4, 4, 4, "F");
    doc.circle(imgX + imgAreaW - 4, imgAreaY + imgAreaH - 4, 4, "F");
    // image border
    doc.setDrawColor(...COL.accent);
    doc.setLineWidth(0.5);
    doc.roundedRect(imgX, imgAreaY, imgAreaW, imgAreaH, 4, 4, "S");
  } else {
    doc.setFillColor(...COL.accentSoft);
    doc.roundedRect(imgX, imgAreaY, imgAreaW, imgAreaH, 4, 4, "F");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...COL.muted);
    doc.text("Illustration", PW / 2, imgAreaY + imgAreaH / 2, { align: "center" });
  }

  // ── Text area (bottom ~42% of page) ──
  const textAreaY = imgAreaY + imgAreaH + 8;
  const textAreaH = PH - textAreaY - 18;

  // Subtle text card background
  doc.setFillColor(249, 246, 255);
  doc.roundedRect(MARGIN, textAreaY, INNER_W, textAreaH, 3, 3, "F");
  doc.setDrawColor(...COL.accentSoft);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN, textAreaY, INNER_W, textAreaH, 3, 3, "S");

  // Page number badge top-right of text card
  doc.setFillColor(...COL.accent);
  doc.roundedRect(PW - MARGIN - 16, textAreaY - 4, 16, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...COL.white);
  doc.text(`${pageIndex + 1} / ${totalPages}`, PW - MARGIN - 8, textAreaY + 0.8, { align: "center" });

  // Story text — nicely typeset
  doc.setFont("times", "normal");
  doc.setFontSize(12.5);
  doc.setTextColor(...COL.text);

  const textPad  = 8;
  const textW    = INNER_W - textPad * 2;
  const wrapped  = doc.splitTextToSize(text, textW);

  // Calculate vertical centering within the text card
  const lineH    = 12.5 * 0.352 * 1.7;   // font-size × mm-per-pt × line-height
  const blockH   = wrapped.length * lineH;
  const textStartY = textAreaY + (textAreaH - blockH) / 2 + lineH * 0.7;

  doc.text(wrapped, PW / 2, Math.max(textStartY, textAreaY + textPad + 4), {
    align: "center",
    lineHeightFactor: 1.7,
  });

  // Bottom ornament
  drawOrnamentLine(doc, PH - 9, COL.muted);
}

// ── Closing "The End" page ────────────────────────────────────────────────────
function buildClosingPage(
  doc: import("jspdf").jsPDF,
  title: string,
  tellerName: string,
) {
  doc.setFillColor(...COL.bgDark);
  doc.rect(0, 0, PW, PH, "F");

  drawCorners(doc, MARGIN - 4, MARGIN - 4, INNER_W + 8, PH - MARGIN * 2 + 8);

  const cy = PH / 2;

  drawOrnamentLine(doc, cy - 36, COL.gold);

  doc.setFont("times", "italic");
  doc.setFontSize(38);
  doc.setTextColor(...COL.gold);
  doc.text("The End", PW / 2, cy - 18, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COL.white);
  doc.text(`"${title}"`, PW / 2, cy + 4, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...COL.muted);
  doc.text(`A story told by ${tellerName}`, PW / 2, cy + 16, { align: "center" });

  drawOrnamentLine(doc, cy + 30, COL.gold);

  // Katha footer
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COL.gold);
  doc.text("KATHA", PW / 2, PH - 22, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...COL.muted);
  doc.text("Preserving Stories That Must Not Be Forgotten", PW / 2, PH - 14, { align: "center" });
  doc.text("katha.app", PW / 2, PH - 8, { align: "center" });
}

// ── Main hook ─────────────────────────────────────────────────────────────────
export function usePdfExport(): UsePdfExportReturn {
  const [exporting, setExporting] = useState(false);
  const [progress,  setProgress]  = useState(0);

  const exportPdf = useCallback(async (
    pages: Page[],
    storyTitle: string,
    tellerName: string,
  ) => {
    setExporting(true);
    setProgress(0);

    try {
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({
        orientation: "portrait",
        unit:        "mm",
        format:      "a4",
        compress:    true,
      });

      const total = pages.length + 2; // cover + story pages + closing

      // ── Cover ──
      await buildCoverPage(doc, pages[0].imageUrl, storyTitle, tellerName);
      setProgress(Math.round((1 / total) * 100));

      // ── Story pages ──
      for (let i = 0; i < pages.length; i++) {
        doc.addPage();
        await buildStoryPage(doc, i, pages.length, pages[i].imageUrl, pages[i].text, storyTitle);
        setProgress(Math.round(((i + 2) / total) * 100));
      }

      // ── Closing ──
      doc.addPage();
      buildClosingPage(doc, storyTitle, tellerName);
      setProgress(100);

      // ── Save ──
      const filename = `${storyTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-picture-book.pdf`;
      doc.save(filename);

    } finally {
      setExporting(false);
      setProgress(0);
    }
  }, []);

  return { exporting, progress, exportPdf };
}
