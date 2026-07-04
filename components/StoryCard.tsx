"use client";

import Link from "next/link";
import Image from "next/image";
import { User, ImageIcon } from "lucide-react";
import { useState } from "react";

interface StoryCardProps {
  id: string;
  title: string;
  tellerName: string;
  coverImage?: string | null;
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
    <Link
      href={`/story/${id}`}
      className="group block rounded-2xl overflow-hidden bg-katha-indigoLight/50 border border-katha-plum/40 hover:border-katha-gold/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-katha-gold/10"
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-katha-plum/30">
        {/* Placeholder shown when there's no image or while loading */}
        {(!coverImage || !loaded) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="text-katha-muted/40 animate-pulse" size={32} />
          </div>
        )}
        {coverImage && (
          <Image
            src={coverImage}
            alt={title}
            fill
            unoptimized
            onLoad={() => setLoaded(true)}
            className={`object-cover group-hover:scale-110 transition-all duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-katha-indigo via-transparent to-transparent" />
        {tag && (
          <span className="absolute top-3 left-3 bg-katha-indigo/80 backdrop-blur-sm text-katha-gold text-xs font-medium px-3 py-1 rounded-full border border-katha-gold/30">
            {tag}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-katha-cream group-hover:text-katha-gold transition-colors line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1.5 text-katha-muted text-sm">
          <User size={13} />
          <span>Told by {tellerName}</span>
        </div>
      </div>
    </Link>
  );
}