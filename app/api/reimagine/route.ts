// ---------------------------------------------------------------------------
// app/api/reimagine/route.ts
// POST /api/reimagine
//
// Fetches a story's cleaned text from Supabase, builds a format-specific
// prompt, and returns the AI-generated reimagining as JSON.
//
// "children" → { pages: [{ text, imageUrl }] }  (4-page picture book)
// "comic"    → { result: string }               (plain text, unchanged)
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { askGranite } from "@/lib/watsonx";
import { supabase } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReimagineFormat = "children" | "comic";

interface ReimagineRequest {
  storyId: string;
  format: ReimagineFormat;
}

/** Shape the AI must return for the children's format. */
interface BookPage {
  text: string;
  imagePrompt: string;
}

interface BookJson {
  pages: BookPage[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build the Pollinations image URL for a picture-book page. */
function pageImageUrl(imagePrompt: string): string {
  const enriched = `${imagePrompt}, children's book illustration, warm colors, storybook art style`;
  return (
    `https://gen.pollinations.ai/image/${encodeURIComponent(enriched)}` +
    `?nologo=true&width=600&height=450&key=${process.env.POLLINATIONS_API_KEY}`
  );
}

/** Strip markdown code fences the model sometimes wraps around JSON. */
function stripFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

/**
 * Ask the model for the 4-page children's book JSON.
 * Retries once (without re-sending the story text) if the first response
 * can't be parsed — avoids doubling the prompt length on retry.
 */
async function fetchBookPages(sourceText: string): Promise<BookJson> {
  const prompt =
    `Rewrite this story as a children's picture book with exactly 4 pages. ` +
    `For each page, write 1-2 simple, warm sentences (age 5-8 reading level) ` +
    `AND a short visual description for an illustrator (describing the scene, ` +
    `characters, setting, mood - 10-15 words). ` +
    `Return ONLY valid JSON in this exact format, no markdown, no extra text:\n` +
    `{"pages":[{"text":"...","imagePrompt":"..."},{"text":"...","imagePrompt":"..."},` +
    `{"text":"...","imagePrompt":"..."},{"text":"...","imagePrompt":"..."}]}\n` +
    `Story: ${sourceText}`;

  const raw = await askGranite(prompt);

  // Strip markdown fences before parsing — models sometimes wrap JSON in ```json.
  try {
    return JSON.parse(stripFences(raw)) as BookJson;
  } catch {
    // Retry once with a short correction nudge, NOT re-sending the full story.
    const corrected = await askGranite(
      `The following is almost valid JSON but may have minor formatting issues. ` +
      `Fix it and return ONLY the corrected JSON, nothing else:\n${stripFences(raw)}`
    );
    return JSON.parse(stripFences(corrected)) as BookJson; // throws if still invalid
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Parse and validate the request body.
  let body: ReimagineRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { storyId, format } = body;

  if (!storyId || !format) {
    return NextResponse.json(
      { error: "storyId and format are required." },
      { status: 400 }
    );
  }

  if (format !== "children" && format !== "comic") {
    return NextResponse.json(
      { error: 'format must be "children" or "comic".' },
      { status: 400 }
    );
  }

  // 2. Fetch the story's cleaned_text from Supabase.
  const { data: story, error: dbError } = await supabase
    .from("stories")
    .select("cleaned_text, raw_text")
    .eq("id", storyId)
    .single();

  if (dbError || !story) {
    return NextResponse.json({ error: "Story not found." }, { status: 404 });
  }

  // Fall back to raw_text if cleaning hasn't run yet.
  const sourceText = story.cleaned_text ?? story.raw_text;

  try {
    // ── Children's picture book ──────────────────────────────────────────────
    if (format === "children") {
      // 3. Get the 4-page JSON from the AI (with one retry on parse failure).
      const book = await fetchBookPages(sourceText);

      // 4. Build image URLs for each page from the AI's imagePrompt strings.
      const pages = book.pages.map((page) => ({
        text:     page.text,
        imageUrl: pageImageUrl(page.imagePrompt),
      }));

      return NextResponse.json({ pages });
    }

    // ── Comic script (unchanged) ─────────────────────────────────────────────
    const comicPrompt =
      `Rewrite this story as a comic script with PANEL descriptions and ` +
      `dialogue/captions, 3-4 panels. Story: ${sourceText}`;

    const result = await askGranite(comicPrompt);
    return NextResponse.json({ result });

  } catch (err) {
    console.error("reimagine route error:", err);
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
