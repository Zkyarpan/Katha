"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Globe, Users, Languages } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";

const MARQUEE_ITEMS = [
  { icon: BookOpen, label: "1,200+ stories preserved" },
  { icon: Globe, label: "45 countries" },
  { icon: Languages, label: "80+ languages" },
  { icon: Users, label: "3,000+ storytellers" },
  { icon: BookOpen, label: "Folktales" },
  { icon: BookOpen, label: "Myths & Legends" },
  { icon: Globe, label: "Nepal" },
  { icon: Globe, label: "Nigeria" },
  { icon: Globe, label: "Mexico" },
  { icon: Globe, label: "Japan" },
  { icon: Globe, label: "India" },
  { icon: Globe, label: "Peru" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-14 text-center">
        {/* Eyebrow */}
        <BlurFade delay={0.15}>
          <Link
            href="/stories"
            className="inline-flex items-center gap-3 text-sm font-medium text-neutral-700 hover:text-neutral-900 border border-neutral-200 bg-white hover:bg-neutral-50 shadow-xs pl-3 pr-4 py-1.5 rounded-full transition-all mb-8 group"
          >
            <span className="flex items-center gap-3">
              <span className="text-base">📖</span>
              <span className="w-px h-4 bg-neutral-200" />
            </span>
            Every voice deserves a legacy
            <ArrowRight
              size={14}
              className="text-neutral-400 group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </BlurFade>

        {/* Headline */}
        <BlurFade delay={0.25}>
          <div className="relative flex flex-col gap-4 md:items-center">
            <h1 className="relative mx-0 max-w-[720px] pt-5 md:mx-auto md:px-4 md:py-2 text-left font-semibold tracking-tighter text-balance md:text-center text-5xl sm:text-7xl md:text-7xl lg:text-7xl text-neutral-900">
              Stories that must not be forgotten
            </h1>
          </div>
        </BlurFade>

        {/* Subtitle */}
        <BlurFade delay={0.4}>
          <p className="mt-6 text-neutral-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed text-balance text-center">
            Preserve fading oral folk tales, and let AI transform them into
            children&apos;s books, comics, and new creative worlds.
          </p>
        </BlurFade>

        {/* CTAs */}
        <BlurFade delay={0.55}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link
              href="/new-story"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-900 rounded-lg shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              Save your first story
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/stories"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              Explore stories
              <ArrowRight size={15} />
            </Link>
          </div>
        </BlurFade>

        {/* Marquee — inside the same container */}
        <BlurFade delay={0.65}>
          <div className="relative mt-14 max-w-2xl mx-auto">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-neutral-50 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-neutral-50 to-transparent" />

            <Marquee pauseOnHover className="[--duration:30s]">
              {MARQUEE_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 mx-1.5 px-3.5 py-2 rounded-lg border border-neutral-200 bg-white"
                >
                  <item.icon
                    size={13}
                    className="text-neutral-400 flex-shrink-0"
                  />
                  <span className="text-xs font-medium text-neutral-600 whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              ))}
            </Marquee>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}