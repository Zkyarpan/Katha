"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Echo {
  id: string;
  content: string;
  display_name: string;
  is_anonymous: boolean;
  stories: { title: string } | null;
}

export default function AdminEchoesTable({ echoes }: { echoes: Echo[] }) {
  const [items, setItems] = useState(echoes);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this echo permanently?")) return;
    const res = await fetch("/api/admin/delete-echo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ echoId: id }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(`Failed to delete: ${data.error || "Unknown error"}`);
      return;
    }
    setItems(items.filter((e) => e.id !== id));
    router.refresh();
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-neutral-900 mb-4">
        Echoes
        <span className="ml-2 text-neutral-400 font-normal">({items.length})</span>
      </h2>

      <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 overflow-hidden">
        {items.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-8">No echoes yet</p>
        )}
        {items.map((echo) => (
          <div key={echo.id} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors">
            <div className="min-w-0">
              <p className="text-sm text-neutral-700 truncate">{echo.content}</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {echo.is_anonymous ? "Anonymous" : echo.display_name}
                {echo.stories?.title ? ` · on "${echo.stories.title}"` : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(echo.id)}
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
