import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo + tagline */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-neutral-900 flex items-center justify-center">
              <BookOpen size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-neutral-900">
              Katha
            </span>
            <span className="text-xs text-neutral-300 ml-1">·</span>
            <span className="text-xs text-neutral-400">
              Every voice deserves a legacy
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5 text-sm text-neutral-500">
            <Link href="/stories" className="hover:text-neutral-900 transition-colors">
              Browse
            </Link>
            <Link href="/new-story" className="hover:text-neutral-900 transition-colors">
              Add a Story
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400">
          <span>© {new Date().getFullYear()} Katha. Made by Zkyarpan</span>
          <span>Built for IBM AI Builders Challenge 2026 · Powered by IBM watsonx</span>
        </div>
      </div>
    </footer>
  );
}