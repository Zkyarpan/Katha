import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/is-admin";
import { createClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import AdminStoriesTable from "@/components/AdminStoriesTable";
import AdminEchoesTable from "@/components/AdminEchoesTable";
import { BookOpen, MessageCircle, Users } from "lucide-react";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  const supabase = await createClient();

  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: echoes } = await supabase
    .from("echoes")
    .select("*, stories(title)")
    .order("created_at", { ascending: false });

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-5xl mx-auto px-6 pt-10 pb-20">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          Admin Dashboard
        </h1>
        <p className="text-sm text-neutral-500 mb-8">
          Manage stories, echoes, and users
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="border rounded-xl p-4">
            <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
              <BookOpen size={14} />
              Stories
            </div>
            <p className="text-2xl font-bold">{stories?.length ?? 0}</p>
          </div>
          <div className="border rounded-xl p-4">
            <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
              <MessageCircle size={14} />
              Echoes
            </div>
            <p className="text-2xl font-bold">{echoes?.length ?? 0}</p>
          </div>
          <div className="border rounded-xl p-4">
            <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1">
              <Users size={14} />
              Users
            </div>
            <p className="text-2xl font-bold">{userCount ?? 0}</p>
          </div>
        </div>

        <AdminStoriesTable stories={stories ?? []} />
        <AdminEchoesTable echoes={echoes ?? []} />
      </div>
    </div>
  );
}