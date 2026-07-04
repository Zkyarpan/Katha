import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Story {
  id: string;
  title: string;
  teller_name: string;
  raw_text: string;
  cleaned_text: string | null;
  cover_image_url: string | null;
  tag: string | null;
  language: string;
  created_at: string;
}