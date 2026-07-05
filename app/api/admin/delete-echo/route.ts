import { requireAdmin } from "@/lib/is-admin";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { echoId } = await request.json();
  const supabase = await createClient();
  const { error } = await supabase.from("echoes").delete().eq("id", echoId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}