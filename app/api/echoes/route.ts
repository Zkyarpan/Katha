import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storyId = searchParams.get("storyId");

  if (!storyId) {
    return NextResponse.json({ error: "storyId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("echoes")
    .select("*")
    .eq("story_id", storyId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ echoes: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
  }

  const { storyId, content, displayName, isAnonymous } = await request.json();

  if (!storyId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("echoes")
    .insert({
      story_id: storyId,
      user_id: user.id,
      display_name: isAnonymous ? "Anonymous" : displayName,
      content: content.trim(),
      is_anonymous: isAnonymous,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ echo: data });
}