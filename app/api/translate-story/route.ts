// ---------------------------------------------------------------------------
// app/api/translate-story/route.ts
// POST /api/translate-story
//
// Translates a story into a target language using askGranite.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { askGranite } from "@/lib/watsonx";

interface TranslateRequest {
  text: string;
  targetLanguage: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Parse and validate the request body.
  let body: TranslateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { text, targetLanguage } = body;

  if (!text || !targetLanguage) {
    return NextResponse.json(
      { error: "text and targetLanguage are required." },
      { status: 400 }
    );
  }

  // 2. Build the translation prompt.
  const prompt =
    `Translate the following story into ${targetLanguage}. ` +
    `Keep the tone, meaning, and cultural details intact. ` +
    `Return ONLY the translated text, no notes or explanations. ` +
    `Story: ${text}`;

  try {
    // 3. Call the AI and return the translation.
    const translated = await askGranite(prompt);
    return NextResponse.json({ translated });
  } catch (err) {
    console.error("translate-story route error:", err);
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
