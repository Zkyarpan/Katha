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

function StatCard({
  label,
  value,
  icon,
  accent,
  sub,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
      <div className={`rounded-lg p-2.5 ${accent}`}>{icon}</div>
      <div>
        <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-3xl font-bold text-neutral-900 tracking-tight mt-0.5">
          {value}
        </p>
        {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function RecentRow({ label, sub, dot }: { label: string; sub: string; dot: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-neutral-100 last:border-0">
      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${dot}`} />
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-800 truncate">{label}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

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

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Header ── */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                Admin
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Admin Dashboard
            </h1>
            <p className="text-neutral-500 text-sm mt-0.5">
              Full control over stories, echoes, and users
            </p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 mb-8 border-b border-neutral-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {t.icon}
              {t.label}
              {t.id === "stories" && (
                <span className="ml-1 text-xs bg-neutral-100 text-neutral-500 rounded-full px-1.5 py-0.5">
                  {stories.length}
                </span>
              )}
              {t.id === "echoes" && (
                <span className="ml-1 text-xs bg-neutral-100 text-neutral-500 rounded-full px-1.5 py-0.5">
                  {echoes.length}
                </span>
              )}
              {t.id === "users" && (
                <span className="ml-1 text-xs bg-neutral-100 text-neutral-500 rounded-full px-1.5 py-0.5">
                  {users.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === "overview" && (
          <div className="space-y-8">
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                label="Stories"
                value={stories.length}
                icon={<BookOpen size={18} className="text-purple-600" />}
                accent="bg-purple-50"
                sub={`${languages} language${languages !== 1 ? "s" : ""}`}
              />
              <StatCard
                label="Echoes"
                value={echoes.length}
                icon={<MessageSquare size={18} className="text-blue-600" />}
                accent="bg-blue-50"
              />
              <StatCard
                label="Users"
                value={users.length}
                icon={<Users size={18} className="text-emerald-600" />}
                accent="bg-emerald-50"
                sub={`${anonCount} anonymous`}
              />
              <StatCard
                label="Countries"
                value={countries}
                icon={<Globe size={18} className="text-orange-500" />}
                accent="bg-orange-50"
              />
            </div>

            {/* Secondary row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide mb-3">
                  Role breakdown
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Admins", count: adminCount, color: "bg-purple-400" },
                    { label: "Moderators", count: modCount, color: "bg-blue-400" },
                    {
                      label: "Users",
                      count: users.length - adminCount - modCount,
                      color: "bg-neutral-300",
                    },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${r.color}`} />
                      <span className="text-sm text-neutral-700 flex-1">{r.label}</span>
                      <span className="text-sm font-semibold text-neutral-900">
                        {r.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide mb-3">
                  Recent stories
                </p>
                <div>
                  {stories.slice(0, 4).map((s) => (
                    <RecentRow
                      key={s.id}
                      label={s.title}
                      sub={`${s.teller_name} · ${new Date(s.created_at).toLocaleDateString()}`}
                      dot="bg-purple-400"
                    />
                  ))}
                  {stories.length === 0 && (
                    <p className="text-xs text-neutral-400">No stories yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide mb-3">
                  Recent echoes
                </p>
                <div>
                  {echoes.slice(0, 4).map((e) => (
                    <RecentRow
                      key={e.id}
                      label={e.content}
                      sub={`${e.is_anonymous ? "Anonymous" : e.display_name}${e.stories?.title ? ` · ${e.stories.title}` : ""}`}
                      dot="bg-blue-400"
                    />
                  ))}
                  {echoes.length === 0 && (
                    <p className="text-xs text-neutral-400">No echoes yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Languages breakdown */}
            {languages > 0 && (
              <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Languages size={15} className="text-neutral-400" />
                  <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
                    Languages represented
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...new Set(stories.map((s) => s.language).filter(Boolean))].map(
                    (lang) => (
                      <span
                        key={lang}
                        className="text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-full px-3 py-1"
                      >
                        {lang}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Trending */}
            <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={15} className="text-neutral-400" />
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
                  Activity summary
                </p>
              </div>
              <p className="text-sm text-neutral-600 mt-1">
                <span className="font-semibold text-neutral-900">{stories.length}</span> stories preserved across{" "}
                <span className="font-semibold text-neutral-900">{countries}</span> countries in{" "}
                <span className="font-semibold text-neutral-900">{languages}</span> languages,
                with <span className="font-semibold text-neutral-900">{echoes.length}</span> echoes from{" "}
                <span className="font-semibold text-neutral-900">{users.length}</span> community members.
              </p>
            </div>
          </div>
        )}

        {/* ── Stories tab ── */}
        {tab === "stories" && (
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">
                  All Stories
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {stories.length} total
                </p>
              </div>
            </div>
            <AdminStoriesTable stories={stories} />
          </div>
        )}

        {/* ── Echoes tab ── */}
        {tab === "echoes" && (
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-neutral-900">
                All Echoes
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">{echoes.length} total</p>
            </div>
            <AdminEchoesTable echoes={echoes} />
          </div>
        )}

        {/* ── Users tab ── */}
        {tab === "users" && (
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">
                  All Users
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {users.length} total · {adminCount} admin
                  {modCount > 0 ? ` · ${modCount} moderator` : ""} · {anonCount} anonymous
                </p>
              </div>
            </div>
            <AdminUsersTable users={users} currentUserId={currentUserId} />
          </div>
        )}

      </div>
    </div>
  );
}
