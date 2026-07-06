// ---------------------------------------------------------------------------
// app/api/clean-story/route.ts
// POST /api/clean-story
//
// Accepts a raw folk-tale submission, uses AI to clean + tag it, generates
// a cover image URL, then persists everything to Supabase.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { askGranite } from "@/lib/watsonx";
import { supabase, Story } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Request / Response types
// ---------------------------------------------------------------------------

interface CleanStoryRequest {
  title: string;
  tellerName: string;
  rawText: string;
  locationName?: string;
  language?: string; // optional hint from the client; AI detects if omitted
  userId?: string | null;
}

interface NominatimResult {
  lat: string;
  lon: string;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Parse and validate the incoming JSON body.
  let body: CleanStoryRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { title, tellerName, rawText, locationName, userId, language: hintLang } = body;

  if (!title || !tellerName || !rawText) {
    return NextResponse.json(
      { error: "title, tellerName, and rawText are all required." },
      { status: 400 }
    );
  }

  try {
    // 2. Ask the AI to clean up, translate if necessary, and return polished
    //    English. If the client told us the source language, include it in the
    //    prompt so the model doesn't have to guess — this is the key accuracy fix.
    const langContext = hintLang && hintLang.toLowerCase() !== "english"
      ? `The story is told in ${hintLang}. Translate it faithfully to English first, preserving all cultural names, places, and meaning. `
      : `If the story is not in English, translate it to English, keeping cultural details intact. `;

    const cleanPrompt =
      `You are preserving an oral folk tale. ${langContext}` +
      `Then clean up grammar, structure and flow into a well-written short story. ` +
      `Keep the storyteller's original voice and all cultural references. ` +
      `Return only the final polished English story with no extra commentary. ` +
      `Story: ${rawText}`;

    const cleanedText = await askGranite(cleanPrompt);

    // 3. Run tag generation, language detection, and geocoding in parallel —
    //    none of these depend on each other, only on already-resolved values.
    const tagPrompt =
      `Read this story and suggest ONE short tag or category (2-3 words, like ` +
      `"Mountain Spirit" or "Trickster Tale") that best describes it. ` +
      `Reply with only the tag, no punctuation or explanation. Story: ${cleanedText}`;

    const langPrompt = hintLang
      ? Promise.resolve(hintLang)
      : askGranite(
          `What language is this text written in? Reply with only the language name, nothing else. Text: ${rawText}`
        );

    // Geocode using OpenStreetMap Nominatim (no API key required).
    const geocodePromise = locationName
      ? fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`,
          { headers: { "User-Agent": "Katha-App/1.0" } }
        )
          .then((r) => r.json() as Promise<NominatimResult[]>)
          .catch(() => [] as NominatimResult[]) // soft-fail: missing coords are non-fatal
      : Promise.resolve([] as NominatimResult[]);

    const [rawTag, rawLang, geoData] = await Promise.all([
      askGranite(tagPrompt),
      langPrompt,
      geocodePromise,
    ]);

    const latitude  = geoData[0]?.lat ? parseFloat(geoData[0].lat) : null;
    const longitude = geoData[0]?.lon ? parseFloat(geoData[0].lon) : null;

    // Trim stray quotes and whitespace the model sometimes adds.
    const tag = rawTag.replace(/^["'\s]+|["'\s]+$/g, "").trim();
    const language = rawLang.replace(/^["'\s.]+|["'\s.]+$/g, "").trim() || "English";

    // 4. Build a cover image URL using the Pollinations image endpoint.
    //    We combine the title and the cleaned text's opening phrase as the prompt.
    //    The API key is appended as a query param because <Image> tags cannot
    //    send Authorization headers the way fetch() can.
    const imagePrompt = `${title} — ${cleanedText.slice(0, 120)}`;
    const coverImageUrl =
      `https://gen.pollinations.ai/image/${encodeURIComponent(imagePrompt)}` +
      `?nologo=true&width=800&height=600&key=${process.env.POLLINATIONS_API_KEY}`;

    // 5. Insert the new story row into Supabase.
    const { data, error } = await supabase
      .from("stories")
      .insert({
        title,
        teller_name: tellerName,
        raw_text: rawText,
        cleaned_text: cleanedText,
        cover_image_url: coverImageUrl,
        tag,
        language,
        location_name: locationName ?? null,
        latitude,
        longitude,
        user_id: userId ?? null,
      })
      .select()          // return the inserted row (including generated id)
      .single();         // we inserted exactly one row

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save story to database." },
        { status: 500 }
      );
    }

    // 6. Return the newly created story.
    return NextResponse.json(data as Story, { status: 201 });

  } catch (err) {
    console.error("clean-story route error:", err);
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
