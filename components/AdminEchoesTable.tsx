"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
      <h2 className="text-sm font-semibold text-neutral-900 mb-3">Echoes</h2>
      <div className="border rounded-xl divide-y">
        {items.map((echo) => (
          <div
            key={echo.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <p className="text-sm text-neutral-700">{echo.content}</p>
              <p className="text-xs text-neutral-400">
                {echo.is_anonymous ? "Anonymous" : echo.display_name} on{" "}
                {echo.stories?.title}
              </p>
            </div>
            <button
              onClick={() => handleDelete(echo.id)}
              className="text-neutral-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-6">No echoes</p>
        )}
      </div>
    </div>
  );
}
