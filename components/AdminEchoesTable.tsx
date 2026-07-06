"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Search, MessageSquare } from "lucide-react";

interface Echo {
  id: string;
  content: string;
  display_name: string;
  is_anonymous: boolean;
  stories: { title: string } | null;
}

export default function AdminEchoesTable({ echoes }: { echoes: Echo[] }) {
  const [items, setItems] = useState(echoes);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  const filtered = items.filter(
    (e) =>
      e.content.toLowerCase().includes(search.toLowerCase()) ||
      e.display_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this echo permanently?")) return;
    setDeleting(id);
    const res = await fetch("/api/admin/delete-echo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ echoId: id }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(`Failed: ${data.error || "Unknown error"}`);
      setDeleting(null);
      return;
    }
    setItems(items.filter((e) => e.id !== id));
    setDeleting(null);
    router.refresh();
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 border-b border-neutral-100">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">
            All Echoes
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {filtered.length} of {items.length} echoes
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
            placeholder="Search echoes..."
            className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-3 py-2 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300"
          />
        </div>
      </div>

      {/* List */}
      <div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <MessageSquare size={24} className="mb-2 text-neutral-300" />
            <p className="text-sm">
              {search ? "No echoes match your search" : "No echoes yet"}
            </p>
          </div>
        )}
        {filtered.map((echo, i) => (
          <div
            key={echo.id}
            className={`flex items-start justify-between gap-4 px-5 py-4 hover:bg-neutral-50/50 transition-colors ${
              i < filtered.length - 1 ? "border-b border-neutral-100" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm text-neutral-800 leading-relaxed">
                &ldquo;{echo.content}&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    echo.is_anonymous
                      ? "bg-neutral-100 text-neutral-500"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {echo.is_anonymous ? "Anonymous" : echo.display_name}
                </span>
                {echo.stories?.title && (
                  <span className="text-xs text-neutral-400">
                    on {echo.stories.title}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDelete(echo.id)}
              disabled={deleting === echo.id}
              className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-50 flex-shrink-0 mt-0.5"
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}