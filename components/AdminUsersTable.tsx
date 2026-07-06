"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShieldCheck, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
  is_anonymous: boolean;
  created_at: string;
}

const ROLE_OPTIONS = ["user", "moderator", "admin"] as const;
type Role = (typeof ROLE_OPTIONS)[number];

const ROLE_STYLES: Record<Role, string> = {
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  moderator: "bg-blue-50 text-blue-700 border-blue-200",
  user: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  admin: <ShieldCheck size={11} />,
  moderator: <Shield size={11} />,
  user: <User size={11} />,
};

export default function AdminUsersTable({
  users,
  currentUserId,
}: {
  users: Profile[];
  currentUserId: string;
}) {
  const [items, setItems] = useState(users);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleRoleChange = async (userId: string, role: Role) => {
    setLoadingId(userId);
    const res = await fetch("/api/admin/update-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    if (res.ok) {
      setItems(items.map((u) => (u.id === userId ? { ...u, role } : u)));
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to update role");
    }
    setLoadingId(null);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this user permanently? This cannot be undone.")) return;
    setLoadingId(userId);
    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      setItems(items.filter((u) => u.id !== userId));
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete user");
    }
    setLoadingId(null);
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-neutral-400 text-center py-8">No users yet</p>
    );
  }

  return (
    <div className="divide-y divide-neutral-100">
      {items.map((user) => {
        const role = (user.role ?? "user") as Role;
        const isSelf = user.id === currentUserId;
        const isLoading = loadingId === user.id;

        return (
          <div
            key={user.id}
            className="flex items-center gap-3 py-3 px-1 hover:bg-neutral-50 transition-colors rounded-lg"
          >
            {/* Avatar */}
            <UserAvatar
              name={user.display_name || "?"}
              avatarUrl={user.avatar_url}
              size={36}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {user.display_name || "Unnamed"}
                  {isSelf && (
                    <span className="ml-1.5 text-xs text-neutral-400">(you)</span>
                  )}
                </p>
                {user.is_anonymous && (
                  <span className="text-xs text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                    anon
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Joined {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Role badge + selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${ROLE_STYLES[role] ?? ROLE_STYLES.user}`}
              >
                {ROLE_ICONS[role] ?? ROLE_ICONS.user}
                {role}
              </span>

              <select
                disabled={isSelf || isLoading}
                value={role}
                onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 bg-white text-neutral-700 focus:outline-none focus:border-neutral-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Delete */}
            <Button
              variant="ghost"
              size="icon"
              disabled={isSelf || isLoading}
              onClick={() => handleDelete(user.id)}
              className="shrink-0 text-neutral-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
