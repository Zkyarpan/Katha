"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShieldCheck, User, Shield, Search, Users } from "lucide-react";
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
  admin: "bg-violet-50 text-violet-700 border-violet-200",
  moderator: "bg-blue-50 text-blue-700 border-blue-200",
  user: "bg-neutral-50 text-neutral-600 border-neutral-200",
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
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const filtered = items.filter((u) =>
    (u.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 border-b border-neutral-100">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">
            All Users
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {filtered.length} of {items.length} users
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
            placeholder="Search users..."
            className="w-full text-sm bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-3 py-2 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300"
          />
        </div>
      </div>

      {/* List */}
      <div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <Users size={24} className="mb-2 text-neutral-300" />
            <p className="text-sm">
              {search ? "No users match your search" : "No users yet"}
            </p>
          </div>
        )}
        {filtered.map((user, i) => {
          const role = (user.role ?? "user") as Role;
          const isSelf = user.id === currentUserId;
          const isLoading = loadingId === user.id;

          return (
            <div
              key={user.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-neutral-50/50 transition-colors ${
                i < filtered.length - 1 ? "border-b border-neutral-100" : ""
              }`}
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
                  </p>
                  {isSelf && (
                    <span className="text-[10px] font-medium text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                      you
                    </span>
                  )}
                  {user.is_anonymous && (
                    <span className="text-[10px] font-medium text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                      anon
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Role badge */}
              <span
                className={`hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${ROLE_STYLES[role]}`}
              >
                {ROLE_ICONS[role]}
                {role}
              </span>

              {/* Role selector */}
              <div className="relative flex-shrink-0">
                <select
                  disabled={isSelf || isLoading}
                  value={role}
                  onChange={(e) =>
                    handleRoleChange(user.id, e.target.value as Role)
                  }
                  className="appearance-none text-xs font-medium border border-neutral-200 rounded-lg pl-3 pr-7 py-1.5 bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Delete */}
              <button
                disabled={isSelf || isLoading}
                onClick={() => handleDelete(user.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}