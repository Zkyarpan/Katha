// ---------------------------------------------------------------------------
// app/api/speak/route.ts
// POST /api/speak
//
// Converts text to speech via Pollinations' TTS endpoint and streams the
// raw MP3 audio back to the client.
// ---------------------------------------------------------------------------

import { NextRequest } from "next/server";

const MAX_TEXT_LENGTH = 4000;

interface SpeakRequest {
  text: string;
  voice?: string;
}

export async function POST(req: NextRequest): Promise<Response> {
  // 1. Parse and validate the request body.
  let body: SpeakRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { voice } = body;
  let { text } = body;

  if (!text) {
    return Response.json({ error: "text is required." }, { status: 400 });
  }

  // 2. Guard against texts that exceed Pollinations' 4096-character limit.
  if (text.length > MAX_TEXT_LENGTH) {
    text = text.slice(0, MAX_TEXT_LENGTH) + "...";
  }

  const apiKey = process.env.POLLINATIONS_API_KEY;

  // 3. POST to Pollinations TTS.
  const ttsResponse = await fetch("https://gen.pollinations.ai/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text,
      voice: voice ?? "nova",
    }),
  });

  // 4. Surface HTTP-level errors before reading the audio buffer.
  if (!ttsResponse.ok) {
    const errorText = await ttsResponse.text();
    return Response.json(
      { error: `Pollinations TTS error ${ttsResponse.status}: ${errorText}` },
      { status: ttsResponse.status }
    );
  }

  // 5. Read the raw MP3 bytes and return them with the correct content-type.
  const audioBuffer = await ttsResponse.arrayBuffer();

  return new Response(audioBuffer, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
