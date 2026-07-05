"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Story {
  id: string;
  title: string;
  teller_name: string;
  created_at: string;
}

export default function AdminStoriesTable({ stories }: { stories: Story[] }) {
  const [items, setItems] = useState(stories);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this story permanently?")) return;
    const res = await fetch("/api/admin/delete-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId: id }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(`Failed to delete: ${data.error || "Unknown error"}`);
      return;
    }
    setItems(items.filter((s) => s.id !== id));
    router.refresh();
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-neutral-900 mb-4">
        Stories
        <span className="ml-2 text-neutral-400 font-normal">({items.length})</span>
      </h2>

      <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 overflow-hidden">
        {items.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-8">No stories yet</p>
        )}
        {items.map((story) => (
          <div key={story.id} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors">
            <div className="min-w-0">
              <Link
                href={`/story/${story.id}`}
                className="text-sm font-medium text-neutral-900 hover:text-purple-600 transition-colors truncate block"
              >
                {story.title}
              </Link>
              <p className="text-xs text-neutral-400 mt-0.5">
                Told by {story.teller_name} · {new Date(story.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(story.id)}
              className="shrink-0 text-neutral-400 hover:text-red-500 hover:bg-red-50 ml-3"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
