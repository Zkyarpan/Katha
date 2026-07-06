"use client";

import { useState } from "react";
import {
  BookOpen,
  MessageSquare,
  Users,
  LayoutDashboard,
  TrendingUp,
  Globe,
  Languages,
  Shield,
  Activity,
} from "lucide-react";
import AdminStoriesTable from "@/components/AdminStoriesTable";
import AdminEchoesTable from "@/components/AdminEchoesTable";
import AdminUsersTable from "@/components/AdminUsersTable";

interface Story {
  id: string;
  title: string;
  teller_name: string;
  created_at: string;
  language?: string | null;
  country?: string | null;
}

interface Echo {
  id: string;
  content: string;
  display_name: string;
  is_anonymous: boolean;
  created_at: string;
  stories: { title: string } | null;
}

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
  is_anonymous: boolean;
  created_at: string;
}

type Tab = "overview" | "stories" | "echoes" | "users";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={15} /> },
  { id: "stories", label: "Stories", icon: <BookOpen size={15} /> },
  { id: "echoes", label: "Echoes", icon: <MessageSquare size={15} /> },
  { id: "users", label: "Users", icon: <Users size={15} /> },
];

export default function AdminDashboard({
  stories,
  echoes,
  users,
  currentUserId,
}: {
  stories: Story[];
  echoes: Echo[];
  users: Profile[];
  currentUserId: string;
}) {
  const [tab, setTab] = useState<Tab>("overview");

  const adminCount = users.filter((u) => u.role === "admin").length;
  const modCount = users.filter((u) => u.role === "moderator").length;
  const anonCount = users.filter((u) => u.is_anonymous).length;
  const languages = new Set(stories.map((s) => s.language).filter(Boolean)).size;
  const countries = new Set(stories.map((s) => s.country).filter(Boolean)).size;

  const stats = [
    {
      label: "Stories",
      value: stories.length,
      sub: `${languages} language${languages !== 1 ? "s" : ""}`,
      icon: <BookOpen size={18} />,
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "Echoes",
      value: echoes.length,
      sub: "Community responses",
      icon: <MessageSquare size={18} />,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Users",
      value: users.length,
      sub: `${anonCount} anonymous`,
      icon: <Users size={18} />,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Countries",
      value: countries,
      sub: `${languages} languages`,
      icon: <Globe size={18} />,
      color: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-medium bg-neutral-900 text-white rounded-full px-3 py-1">
                <Shield size={11} />
                Admin
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tighter text-neutral-900">
              Dashboard
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Manage stories, echoes, and users
            </p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 mb-8 border-b border-neutral-200 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap cursor-pointer ${
                tab === t.id
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-400 hover:text-neutral-700"
              }`}
            >
              {t.icon}
              {t.label}
              {t.id !== "overview" && (
                <span
                  className={`ml-1 text-[11px] font-medium rounded-full px-1.5 py-0.5 ${
                    tab === t.id
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {t.id === "stories"
                    ? stories.length
                    : t.id === "echoes"
                      ? echoes.length
                      : users.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`rounded-lg p-2 ${s.color}`}
                    >
                      {s.icon}
                    </div>
                    <Activity size={14} className="text-neutral-200" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900 tracking-tight">
                    {s.value}
                  </p>
                  <p className="text-sm text-neutral-500 mt-0.5">{s.label}</p>
                  {s.sub && (
                    <p className="text-xs text-neutral-400 mt-1">{s.sub}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Three column detail */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Role breakdown */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                  Role Breakdown
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Admins", count: adminCount, color: "bg-violet-500" },
                    { label: "Moderators", count: modCount, color: "bg-blue-500" },
                    {
                      label: "Users",
                      count: users.length - adminCount - modCount,
                      color: "bg-neutral-300",
                    },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
                      <span className="text-sm text-neutral-600 flex-1">
                        {r.label}
                      </span>
                      <span className="text-sm font-semibold text-neutral-900 tabular-nums">
                        {r.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent stories */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                  Recent Stories
                </p>
                {stories.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-4 text-center">
                    No stories yet
                  </p>
                ) : (
                  <div className="space-y-0">
                    {stories.slice(0, 4).map((s, i) => (
                      <div
                        key={s.id}
                        className={`flex items-start gap-3 py-2.5 ${
                          i < Math.min(stories.length, 4) - 1
                            ? "border-b border-neutral-100"
                            : ""
                        }`}
                      >
                        <span className="mt-1.5 h-2 w-2 rounded-full shrink-0 bg-violet-400" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-800 truncate">
                            {s.title}
                          </p>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {s.teller_name} ·{" "}
                            {new Date(s.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent echoes */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                  Recent Echoes
                </p>
                {echoes.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-4 text-center">
                    No echoes yet
                  </p>
                ) : (
                  <div className="space-y-0">
                    {echoes.slice(0, 4).map((e, i) => (
                      <div
                        key={e.id}
                        className={`flex items-start gap-3 py-2.5 ${
                          i < Math.min(echoes.length, 4) - 1
                            ? "border-b border-neutral-100"
                            : ""
                        }`}
                      >
                        <span className="mt-1.5 h-2 w-2 rounded-full shrink-0 bg-blue-400" />
                        <div className="min-w-0">
                          <p className="text-sm text-neutral-700 truncate">
                            {e.content}
                          </p>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {e.is_anonymous ? "Anonymous" : e.display_name}
                            {e.stories?.title ? ` · ${e.stories.title}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Languages + Activity summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {languages > 0 && (
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Languages size={14} className="text-neutral-400" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Languages
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(stories.map((s) => s.language).filter(Boolean))].map(
                      (lang) => (
                        <span
                          key={lang}
                          className="text-xs font-medium bg-neutral-100 text-neutral-700 rounded-lg px-3 py-1.5"
                        >
                          {lang}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={14} className="text-neutral-400" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Summary
                  </p>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  <span className="font-semibold text-neutral-900">
                    {stories.length}
                  </span>{" "}
                  stories preserved across{" "}
                  <span className="font-semibold text-neutral-900">
                    {countries}
                  </span>{" "}
                  countries in{" "}
                  <span className="font-semibold text-neutral-900">
                    {languages}
                  </span>{" "}
                  languages, with{" "}
                  <span className="font-semibold text-neutral-900">
                    {echoes.length}
                  </span>{" "}
                  echoes from{" "}
                  <span className="font-semibold text-neutral-900">
                    {users.length}
                  </span>{" "}
                  members.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Stories tab ── */}
        {tab === "stories" && <AdminStoriesTable stories={stories} />}

        {/* ── Echoes tab ── */}
        {tab === "echoes" && <AdminEchoesTable echoes={echoes} />}

        {/* ── Users tab ── */}
        {tab === "users" && (
          <AdminUsersTable users={users} currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
}