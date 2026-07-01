import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-accent-gold/20 bg-background-start/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-accent-gold/20 p-2 rounded-lg group-hover:bg-accent-gold/30 transition-all">
              <BookOpen className="text-accent-gold" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-accent-gold text-shadow">Katha</h1>
              <p className="text-xs text-cream/70">Stories that must not be forgotten</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/" 
              className="text-cream/80 hover:text-accent-gold transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/new-story" 
              className="text-cream/80 hover:text-accent-gold transition-colors"
            >
              Add Story
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

// Made with Bob
