// ---------------------------------------------------------------------------
// scripts/migrate-voice-recording.mjs
//
// Adds the `voice_recording_url` column to the `stories` table and creates
// the Supabase Storage bucket for audio files.
//
// Usage:
//   node --env-file=.env.local scripts/migrate-voice-recording.mjs
// ---------------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const SQL = `
-- 1. Add voice recording column (nullable — old stories won't have one)
alter table public.stories
  add column if not exists voice_recording_url text;
`;

const BUCKET_SQL = `
-- 2. Storage bucket is created via the Supabase dashboard or Management API.
--    Name: voice-recordings
--    Public: true (so the audio URL can be streamed without auth)
--    Allowed MIME types: audio/webm, audio/ogg, audio/mp4, audio/wav
--    Max file size: 50 MB
`;

console.log("─────────────────────────────────────────────────────");
console.log("  Voice Recording Migration");
console.log("─────────────────────────────────────────────────────");
console.log("");
console.log("STEP 1 — Run this SQL in the Supabase SQL editor:");
console.log("  https://supabase.com/dashboard/project/_/sql/new");
console.log("");
console.log(SQL);
console.log(BUCKET_SQL);
console.log("─────────────────────────────────────────────────────");
console.log("STEP 2 — Create the Storage bucket manually:");
console.log("  1. Go to Storage → New bucket");
console.log("  2. Name: voice-recordings");
console.log("  3. Toggle ON: Public bucket");
console.log("  4. Click Save");
console.log("─────────────────────────────────────────────────────");
console.log("");
console.log("STEP 3 — Add this Storage policy in SQL editor:");
console.log(`
-- Allow anyone to read audio files
create policy "voice_recordings_read"
  on storage.objects for select
  using (bucket_id = 'voice-recordings');

-- Allow authenticated users (and anon uploads from new-story form) to insert
create policy "voice_recordings_insert"
  on storage.objects for insert
  with check (bucket_id = 'voice-recordings');
`);
console.log("─────────────────────────────────────────────────────");
