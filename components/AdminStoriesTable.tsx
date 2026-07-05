"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    <div className="mb-10">
      <h2 className="text-sm font-semibold text-neutral-900 mb-3">Stories</h2>
      <div className="border rounded-xl divide-y">
        {items.map((story) => (
          <div key={story.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <Link href={`/story/${story.id}`} className="text-sm font-medium hover:text-purple-600">
                {story.title}
              </Link>
              <p className="text-xs text-neutral-400">Told by {story.teller_name}</p>
            </div>
            <button
              onClick={() => handleDelete(story.id)}
              className="text-neutral-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-6">No stories</p>
        )}
      </div>
    </div>
  );
}