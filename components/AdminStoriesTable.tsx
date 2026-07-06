"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Search, ExternalLink } from "lucide-react";

interface Story {
  id: string;
  title: string;
  teller_name: string;
  created_at: string;
}

export default function AdminStoriesTable({ stories }: { stories: Story[] }) {
  const [items, setItems] = useState(stories);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  const filtered = items.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.teller_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this story permanently?")) return;
    setDeleting(id);
    const res = await fetch("/api/admin/delete-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId: id }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(`Failed: ${data.error || "Unknown error"}`);
      setDeleting(null);
      return;
    }
    setItems(items.filter((s) => s.id !== id));
    setDeleting(null);
    router.refresh();
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 border-b border-neutral-100">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">
            All Stories
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {filtered.length} of {items.length} stories
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories..."
            className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-3 py-2 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/50">
              <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-5 py-3">
                Title
              </th>
              <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                Storyteller
              </th>
              <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                Date
              </th>
              <th className="text-right text-xs font-medium text-neutral-400 uppercase tracking-wider px-5 py-3 w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-12 text-sm text-neutral-400"
                >
                  {search ? "No stories match your search" : "No stories yet"}
                </td>
              </tr>
            )}
            {filtered.map((story) => (
              <tr
                key={story.id}
                className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <Link
                    href={`/story/${story.id}`}
                    className="font-medium text-neutral-900 hover:text-neutral-600 transition-colors inline-flex items-center gap-1.5 group"
                  >
                    {story.title}
                    <ExternalLink
                      size={12}
                      className="text-neutral-300 group-hover:text-neutral-500 transition-colors"
                    />
                  </Link>
                  <p className="text-xs text-neutral-400 mt-0.5 sm:hidden">
                    {story.teller_name}
                  </p>
                </td>
                <td className="px-5 py-3.5 text-neutral-600 hidden sm:table-cell">
                  {story.teller_name}
                </td>
                <td className="px-5 py-3.5 text-neutral-400 tabular-nums hidden md:table-cell">
                  {new Date(story.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => handleDelete(story.id)}
                    disabled={deleting === story.id}
                    className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}