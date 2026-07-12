"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/UserAvatar";

interface StoryCardProps {
  id: string;
  title: string;
  tellerName: string;
  coverImage: string;
  tag?: string;
  language?: string;
}

export default function StoryCard({
  id,
  title,
  tellerName,
  coverImage,
  tag,
  language,
}: StoryCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link href={`/story/${id}`} className="group block h-full">
      <div className="h-full flex flex-col rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-sm hover:shadow-lg hover:border-neutral-300 hover:-translate-y-0.5 transition-all duration-300">
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-neutral-100 flex-shrink-0">
          {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
          <Image
            src={coverImage}
            alt={title}
            fill
            unoptimized
            onLoad={() => setLoaded(true)}
            className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {tag && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full text-neutral-700 shadow-sm">
              {tag}
            </span>
          )}
          {language && language.toLowerCase() !== "english" && (
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[11px] font-medium px-2 py-1 rounded-full text-neutral-600 shadow-sm">
              <Globe size={10} />
              {language}
            </span>
          )}
          <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 shadow-sm">
            <ArrowUpRight size={14} className="text-neutral-700" />
          </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-neutral-900 group-hover:text-purple-600 transition-colors line-clamp-1">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-2.5">
            <UserAvatar name={tellerName} size={20} />
            <p className="text-sm text-neutral-500 truncate">
              Told by <span className="text-neutral-700 font-medium">{tellerName}</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
