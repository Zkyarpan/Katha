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

  const { title, tellerName, rawText } = body;

  if (!title || !tellerName || !rawText) {
    return NextResponse.json(
      { error: "title, tellerName, and rawText are all required." },
      { status: 400 }
    );
  }

  try {
    // 2. Ask the AI to clean up and structure the raw story text.
    const cleanPrompt =
      `Clean up and structure this folk tale into a well-written short story ` +
      `of 3-5 sentences. Keep the cultural details and meaning intact. ` +
      `Do not add commentary, just return the story text. Story: ${rawText}`;

    const cleanedText = await askGranite(cleanPrompt);

    // 3. Ask the AI to suggest a single short tag / category for the story.
    const tagPrompt =
      `Read this story and suggest ONE short tag or category (2-3 words, like ` +
      `"Mountain Spirit" or "Trickster Tale") that best describes it. ` +
      `Reply with only the tag, no punctuation or explanation. Story: ${cleanedText}`;

    const rawTag = await askGranite(tagPrompt);

    // Trim stray quotes and whitespace the model sometimes adds.
    const tag = rawTag.replace(/^["'\s]+|["'\s]+$/g, "").trim();

    // 4. Build a cover image URL using the Pollinations image endpoint.
    //    We combine the title and the cleaned text's opening phrase as the prompt.
    //    The API key is appended as a query param because <Image> tags cannot
    //    send Authorization headers the way fetch() can.
    const imagePrompt = `${title} — ${cleanedText.slice(0, 120)}`;
    const coverImageUrl =
      `https://gen.pollinations.ai/image/${encodeURIComponent(imagePrompt)}` +
      `?nologo=true&width=800&height=600&key=${process.env.POLLINATIONS_API_KEY}`;

    // 5. Insert the new story row into Supabase.
    //    `language` defaults to "en"; the column is NOT NULL in the schema.
    const { data, error } = await supabase
      .from("stories")
      .insert({
        title,
        teller_name: tellerName,
        raw_text: rawText,
        cleaned_text: cleanedText,
        cover_image_url: coverImageUrl,
        tag,
        language: "en",
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
