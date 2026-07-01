import Link from 'next/link';
import { User } from 'lucide-react';

interface StoryCardProps {
  id: string;
  title: string;
  toldBy: string;
  coverImage: string;
}

export default function StoryCard({ id, title, toldBy, coverImage }: StoryCardProps) {
  return (
    <Link href={`/story/${id}`}>
      <div className="group cursor-pointer">
        <div className="bg-background-end/30 rounded-2xl overflow-hidden border border-accent-gold/20 hover:border-accent-gold/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl glow-gold-hover">
          {/* Cover Image */}
          <div className="relative h-64 overflow-hidden bg-gradient-to-br from-accent-gold/20 to-accent-orange/20">
            <img 
              src={coverImage} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-start/80 to-transparent" />
          </div>
          
          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-cream mb-2 group-hover:text-accent-gold transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-cream/70 text-sm">
              <User size={16} />
              <span>Told by {toldBy}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Made with Bob
