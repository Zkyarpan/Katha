// ---------------------------------------------------------------------------
// app/api/profile/upload-avatar/route.ts
//
// POST /api/profile/upload-avatar
// Receives an image (multipart/form-data, field "avatar") from the signed-in
// user, uploads it to the Supabase Storage bucket "avatars", and writes the
// resulting public URL onto the caller's own profiles row.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("avatar") as File | null;

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const ext  = file.type.includes("png")  ? "png"
             : file.type.includes("webp") ? "webp"
             : file.type.includes("gif")  ? "gif"
             : "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
  // Cache-bust so the new image shows immediately even though the path is stable
  const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ url: publicUrl });
}
