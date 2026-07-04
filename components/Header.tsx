import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full px-6 md:px-12 py-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-katha-gold to-katha-sunset flex items-center justify-center shadow-lg shadow-katha-gold/20 group-hover:scale-105 transition-transform">
          <BookOpen size={18} className="text-katha-indigo" />
        </div>
        <span className="font-serif text-2xl font-bold text-katha-cream tracking-wide">
          Katha
        </span>
      </Link>

      <Link
        href="/new-story"
        className="flex items-center gap-2 bg-katha-gold hover:bg-katha-goldLight text-katha-indigo font-semibold px-4 py-2.5 rounded-full transition-all hover:scale-105 shadow-lg shadow-katha-gold/20"
      >
        <Plus size={18} strokeWidth={2.5} />
        <span className="hidden sm:inline">Add a Story</span>
      </Link>
    </header>
  );
}