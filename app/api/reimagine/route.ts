// ---------------------------------------------------------------------------
// app/api/reimagine/route.ts
// POST /api/reimagine
//
// Fetches a story's cleaned text from Supabase, builds a format-specific
// prompt, and returns the AI-generated reimagining as JSON.
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

  // 3. Build the format-specific prompt.
  const prompts: Record<ReimagineFormat, string> = {
    children:
      `Rewrite this story as a warm, simple children's book passage ` +
      `(3-4 sentences, playful tone, age 5-8). Story: ${sourceText}`,
    comic:
      `Rewrite this story as a comic script with PANEL descriptions and ` +
      `dialogue/captions, 3-4 panels. Story: ${sourceText}`,
  };

  try {
    // 4. Call the AI and return the result.
    const result = await askGranite(prompts[format]);
    return NextResponse.json({ result });
  } catch (err) {
    console.error("reimagine route error:", err);
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
