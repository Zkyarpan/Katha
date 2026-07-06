import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/is-admin";
import { createClient } from "@/lib/supabase-server";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  const supabase = await createClient();

  const [
    { data: stories },
    { data: echoesRaw },
    { data: users },
  ] = await Promise.all([
    supabase
      .from("stories")
      .select("id, title, teller_name, created_at, language, country")
      .order("created_at", { ascending: false }),
    supabase
      .from("echoes")
      .select("id, content, display_name, is_anonymous, created_at, stories(title)")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url, role, is_anonymous, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const echoes = (echoesRaw ?? []).map((e) => ({
    ...e,
    stories: Array.isArray(e.stories) ? (e.stories[0] ?? null) : e.stories,
  }));

  return (
    <AdminDashboard
      stories={stories ?? []}
      echoes={echoes}
      users={users ?? []}
      currentUserId={admin.id}
    />
  );
}
