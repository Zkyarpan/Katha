"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

interface StoryCardProps {
  id: string;
  title: string;
  tellerName: string;
  coverImage: string;
  tag?: string;
}

export default function StoryCard({
  id,
  title,
  tellerName,
  coverImage,
  tag,
}: StoryCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link href={`/story/${id}`} className="group block">
      <div className="rounded-xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-neutral-100">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="text-neutral-300 animate-pulse" size={28} />
            </div>
          )}
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
          {tag && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full text-neutral-700">
              {tag}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-neutral-900 group-hover:text-purple-600 transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            Told by {tellerName}
          </p>
        </div>
      </div>
    </Link>
  );
}