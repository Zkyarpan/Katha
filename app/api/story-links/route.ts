// ---------------------------------------------------------------------------
// app/api/story-links/route.ts
//
// GET  /api/story-links?storyId=<id>
//   Returns all stories linked to the given story (in both directions),
//   joining the target story's title, teller, cover, and tag.
//
// POST /api/story-links
//   Body: { sourceStoryId, targetStoryId, relationType, note }
//   Creates a bidirectional link between two stories.
//   Requires authentication.
//
// DELETE /api/story-links?id=<link_id>
//   Deletes a link. Only the creator can delete their own link.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// ── GET ─────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const storyId = req.nextUrl.searchParams.get("storyId");
  if (!storyId) {
    return NextResponse.json({ error: "storyId required" }, { status: 400 });
  }

  const supabase = await createClient();

  // Fetch links where this story is the source
  const { data: asSource, error: e1 } = await supabase
    .from("story_links")
    .select(`
      id,
      relation_type,
      note,
      linked_by,
      created_at,
      target:target_story_id (
        id, title, teller_name, cover_image_url, tag, language, location_name
      )
    `)
    .eq("source_story_id", storyId);

  // Fetch links where this story is the target (reverse direction)
  const { data: asTarget, error: e2 } = await supabase
    .from("story_links")
    .select(`
      id,
      relation_type,
      note,
      linked_by,
      created_at,
      target:source_story_id (
        id, title, teller_name, cover_image_url, tag, language, location_name
      )
    `)
    .eq("target_story_id", storyId);

  if (e1 || e2) {
    return NextResponse.json(
      { error: e1?.message ?? e2?.message },
      { status: 500 }
    );
  }

  // Deduplicate by linked story id (in case a bidirectional pair was inserted)
  const seen = new Set<string>();
  const links = [...(asSource ?? []), ...(asTarget ?? [])].filter((l) => {
    const raw = l.target;
    const t = (Array.isArray(raw) ? raw[0] : raw) as { id: string } | null;
    if (!t || seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });

  return NextResponse.json({ links });
}

// ── POST ────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sourceStoryId, targetStoryId, relationType, note } = body;

  if (!sourceStoryId || !targetStoryId || !relationType) {
    return NextResponse.json(
      { error: "sourceStoryId, targetStoryId, and relationType are required" },
      { status: 400 }
    );
  }

  if (sourceStoryId === targetStoryId) {
    return NextResponse.json(
      { error: "A story cannot be linked to itself" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("story_links")
    .insert({
      source_story_id: sourceStoryId,
      target_story_id: targetStoryId,
      relation_type: relationType,
      note: note?.trim() || null,
      linked_by: user?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    // unique constraint = already linked
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "These two stories are already linked" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ link: data }, { status: 201 });
}

// ── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Must be signed in" }, { status: 401 });
  }

  const { error } = await supabase
    .from("story_links")
    .delete()
    .eq("id", id)
    .eq("linked_by", user.id); // RLS + app-level guard

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
