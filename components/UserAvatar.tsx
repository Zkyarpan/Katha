"use client";

import { useState } from "react";

const COLORS = [
  "bg-red-400", "bg-orange-400", "bg-amber-400", "bg-green-400",
  "bg-teal-400", "bg-blue-400", "bg-indigo-400", "bg-purple-400", "bg-pink-400",
];

function getColor(name: string) {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}

export default function UserAvatar({ name, avatarUrl, size = 32 }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  if (avatarUrl && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const initial = name?.trim()?.[0]?.toUpperCase() || "?";
  const color = getColor(name || "?");

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold ${color}`}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {initial}
    </div>
  );
}