import Link from 'next/link';
import { Plus, Sparkles, Moon, Mountain } from 'lucide-react';
import Header from '@/components/Header';
import StoryCard from '@/components/StoryCard';
import Button from '@/components/Button';

// Mock data for stories
const mockStories = [
  {
    id: '1',
    title: 'The Moon Weaver',
    toldBy: 'Grandmother Amara',
    coverImage: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=800&q=80',
  },
  {
    id: '2',
    title: 'The River Spirit\'s Gift',
    toldBy: 'Elder Rajesh',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  },
  {
    id: '3',
    title: 'The Dancing Mountains',
    toldBy: 'Aunt Fatima',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  },
  {
    id: '4',
    title: 'The Forgotten Garden',
    toldBy: 'Uncle Chen',
    coverImage: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 text-accent-gold/20 animate-pulse">
          <Moon size={80} />
        </div>
        <div className="absolute bottom-10 left-10 text-accent-orange/20">
          <Mountain size={100} />
        </div>
        <div className="absolute top-40 left-1/4 text-accent-gold/10">
          <Sparkles size={60} />
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6">
              <Sparkles className="text-accent-gold animate-pulse" size={48} />
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-cream mb-6 text-shadow">
              Katha
            </h1>
            
            <p className="text-2xl md:text-3xl text-accent-gold mb-4 font-serif italic">
              Stories that must not be forgotten
            </p>
            
            <p className="text-lg text-cream/80 mb-10 max-w-2xl mx-auto">
              Preserve the magic of oral folk tales. Share the stories passed down through generations, 
              and reimagine them for the future.
            </p>
            
            <Link href="/new-story">
              <Button icon={Plus} variant="primary" className="text-lg px-8 py-4">
                Add a Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-cream mb-3 text-center">
            Preserved Stories
          </h2>
          <p className="text-center text-cream/70">
            Tales from around the world, kept alive through Katha
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {mockStories.map((story) => (
            <StoryCard key={story.id} {...story} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-accent-gold/20 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-cream/60">
          <p>© 2026 Katha. Preserving stories, one tale at a time.</p>
        </div>
      </footer>
    </div>
  );
}

// Made with Bob
