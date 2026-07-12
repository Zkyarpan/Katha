// ---------------------------------------------------------------------------
// app/api/upload-recording/route.ts
//
// POST /api/upload-recording
// Receives a raw audio blob (multipart/form-data, field "audio"),
// uploads it to Supabase Storage bucket "voice-recordings",
// and returns the public URL.
//
// The story row is then updated by the caller (clean-story route or client)
// with the returned URL.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const audioFile = formData.get("audio") as File | null;
  const storyId   = formData.get("storyId") as string | null;

  if (!audioFile || audioFile.size === 0) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  if (!storyId) {
    return NextResponse.json({ error: "storyId required" }, { status: 400 });
  }

  // Determine file extension from MIME type
  const mime = audioFile.type || "audio/webm";
  const ext  = mime.includes("ogg")  ? "ogg"
             : mime.includes("mp4")  ? "mp4"
             : mime.includes("wav")  ? "wav"
             : "webm";

  const path = `${storyId}/voice.${ext}`;

  const supabase = await createClient();

  // Upload to Supabase Storage (upsert so re-submissions overwrite)
  const arrayBuffer = await audioFile.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("voice-recordings")
    .upload(path, arrayBuffer, {
      contentType: mime,
      upsert: true,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError.message);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from("voice-recordings")
    .getPublicUrl(path);

  const publicUrl = urlData.publicUrl;

  // Persist the URL back onto the story row
  const { error: updateError } = await supabase
    .from("stories")
    .update({ voice_recording_url: publicUrl })
    .eq("id", storyId);

  if (updateError) {
    console.error("Story update error:", updateError.message);
    // Non-fatal — the URL was uploaded; caller can retry the update
  }

  return NextResponse.json({ url: publicUrl });
}
