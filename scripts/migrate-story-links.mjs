// ---------------------------------------------------------------------------
// scripts/migrate-story-links.mjs
//
// Creates the `story_links` table in Supabase via raw SQL through the
// Supabase Management API. Run once.
//
// Usage:
//   node --env-file=.env.local scripts/migrate-story-links.mjs
// ---------------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// We can't run DDL via the anon key directly, so we'll create the table
// by inserting a dummy row and catching the error to detect if it exists,
// or use the REST API approach. Instead, let's use Supabase's rpc if available,
// otherwise print the SQL for the user to run.

const SQL = `
-- story_links: join table linking related stories
-- source_story_id  = the story being viewed
-- target_story_id  = the related story being linked to
-- relation_type    = short label, e.g. "variant", "sequel", "same myth"
-- note             = optional free-text explaining the connection
-- linked_by        = user_id of who created the link (nullable = seeded)

create table if not exists public.story_links (
  id               uuid primary key default gen_random_uuid(),
  source_story_id  uuid not null references public.stories(id) on delete cascade,
  target_story_id  uuid not null references public.stories(id) on delete cascade,
  relation_type    text not null default 'variant',
  note             text,
  linked_by        uuid references auth.users(id) on delete set null,
  created_at       timestamp with time zone default now(),
  constraint no_self_link check (source_story_id <> target_story_id),
  constraint unique_link unique (source_story_id, target_story_id)
);

-- index for fast lookup in both directions
create index if not exists idx_story_links_source on public.story_links(source_story_id);
create index if not exists idx_story_links_target on public.story_links(target_story_id);

-- enable Row Level Security
alter table public.story_links enable row level security;

-- anyone can read links
create policy if not exists "story_links_read"
  on public.story_links for select using (true);

-- authenticated users can insert links
create policy if not exists "story_links_insert"
  on public.story_links for insert
  with check (auth.uid() is not null or linked_by is null);

-- only the creator (or service role) can delete
create policy if not exists "story_links_delete"
  on public.story_links for delete
  using (linked_by = auth.uid());
`;

console.log("─────────────────────────────────────────────────────");
console.log("  Story Links Migration");
console.log("─────────────────────────────────────────────────────");
console.log("");
console.log("Run the following SQL in your Supabase SQL editor:");
console.log("  https://supabase.com/dashboard/project/_/sql/new");
console.log("");
console.log(SQL);
console.log("─────────────────────────────────────────────────────");
console.log("");

// Try calling it via rpc if supabase exposes exec_sql (service role only)
// For anon key we just print and let the user run it.
const { error } = await supabase.rpc("exec_sql", { sql: SQL }).single();
if (error) {
  if (error.message?.includes("exec_sql")) {
    console.log("ℹ️  exec_sql RPC not available with anon key — copy the SQL above");
    console.log("   and run it in the Supabase dashboard SQL editor.");
  } else {
    console.error("❌  RPC error:", error.message);
  }
} else {
  console.log("✅  Table created successfully via RPC.");
}
