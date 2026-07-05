import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/is-admin";
import { createClient } from "@/lib/supabase-server";
import { Card, CardContent } from "@/components/ui/card";
import AdminStoriesTable from "@/components/AdminStoriesTable";
import AdminEchoesTable from "@/components/AdminEchoesTable";

export default async function AdminPage() {
  const admin = await requireAdmin();

  if (!admin) redirect("/");
  console.log("Admin page reached, user:", admin);

  const supabase = await createClient();

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, teller_name, created_at")
    .order("created_at", { ascending: false });

  const { data: echoesRaw } = await supabase
    .from("echoes")
    .select("id, content, display_name, is_anonymous, stories(title)")
    .order("created_at", { ascending: false });

  const echoes = (echoesRaw ?? []).map((e) => ({
    ...e,
    stories: Array.isArray(e.stories) ? (e.stories[0] ?? null) : e.stories,
  }));

  const storyCount = (stories ?? []).length;
  const echoCount = echoes.length;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Admin Dashboard
          </h1>
          <p className="text-neutral-500 text-sm mt-1">Manage stories and echoes</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Stories</p>
              <p className="text-3xl font-bold tracking-tight text-neutral-900 mt-1">{storyCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Echoes</p>
              <p className="text-3xl font-bold tracking-tight text-neutral-900 mt-1">{echoCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 gap-8">
          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <AdminStoriesTable stories={stories ?? []} />
            </CardContent>
          </Card>

          <Card className="bg-white border border-neutral-200 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <AdminEchoesTable echoes={echoes ?? []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
