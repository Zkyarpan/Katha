/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Link from 'next/link';

// Mock story data
const mockStory = {
  id: '1',
  title: 'The Moon Weaver',
  toldBy: 'Grandmother Amara',
  coverImage: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=1200&q=80',
  content: `Long ago, in a village where the mountains touched the sky, there lived a young woman named Lila who could weave moonlight into cloth. Every full moon, she would climb to the highest peak and collect the silver threads that fell from the moon's surface.

The villagers treasured her moon-cloth, for it had magical properties. A blanket woven from moonlight could cure any illness. A scarf could grant the wearer the ability to understand the language of animals. A tapestry could show visions of distant lands.

But Lila kept the most precious piece for herself - a shawl that allowed her to walk among the stars. Each night, she would wrap herself in this shawl and dance with the constellations, learning their ancient secrets.

One day, a greedy merchant heard of Lila's gift and demanded she weave him a cloak of pure moonlight. When she refused, he threatened to tell the king, who would surely imprison her for hoarding such magic. Lila knew she had to protect her gift.

That night, she wove one final piece - a ladder of moonlight that reached all the way to the moon itself. She climbed it and never returned, but on every full moon, the villagers say they can see her dancing among the stars, still weaving her magical cloth.

And sometimes, if you're very lucky, a thread of moonlight might fall into your hands, carrying with it a whisper of Lila's ancient magic.`,
};

export default function StoryDetailPage() {
  const [reimaginedType, setReimaginedType] = useState<'children' | 'comic' | null>(null);

  const handleReimagine = (type: 'children' | 'comic') => {
    setReimaginedType(type);
  };

  const reimaginedContent = {
    children: `Once upon a time, high up in the mountains, there lived a kind girl named Lila who had a very special gift - she could weave moonlight!

Every month when the moon was big and round, Lila would climb up, up, up to the tallest mountain. There, she would catch the silvery threads that fell from the moon and weave them into the most beautiful cloth you've ever seen!

The people in her village loved Lila's moon-cloth. A blanket made from moonlight could make sick people feel better. A scarf could help you talk to animals! And a big tapestry could show you faraway places.

But one day, a mean merchant wanted all of Lila's magic for himself. So Lila did something amazing - she wove a ladder made of moonlight that went all the way up to the moon! She climbed up and now she lives among the stars.

And you know what? On nights when the moon is full, if you look very carefully, you might see Lila dancing with the stars, still making her magical moon-cloth!`,
    comic: `PANEL 1:
[Wide shot of mountain village at night, full moon overhead]
CAPTION: In a village where mountains touch the sky...

PANEL 2:
[Close-up of young woman (Lila) reaching up toward moonbeams]
LILA: The moon's threads are falling tonight!

PANEL 3:
[Lila at her loom, weaving glowing silver cloth]
CAPTION: Lila wove moonlight into magical cloth.

PANEL 4:
[Villagers gathered around, one wrapped in glowing blanket]
VILLAGER: Your moon-cloth cured my daughter!
LILA: The moon's magic belongs to everyone.

PANEL 5:
[Menacing merchant pointing at Lila]
MERCHANT: Weave me a cloak of pure moonlight, or I'll tell the king!
LILA: I cannot.

PANEL 6:
[Lila weaving a glowing ladder reaching to the moon]
CAPTION: That night, Lila wove one final piece...

PANEL 7:
[Lila climbing the moonlight ladder into the starry sky]
CAPTION: She climbed to the moon and never returned.

PANEL 8:
[Villagers looking up at the night sky, seeing Lila's silhouette among stars]
CAPTION: But on every full moon, she dances among the stars, still weaving her magic.`,
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-2 text-cream/70 hover:text-accent-gold transition-colors mb-8">
          <ArrowLeft size={20} />
          <span>Back to Stories</span>
        </Link>

        {/* Cover Image Banner */}
        <div className="relative h-96 rounded-3xl overflow-hidden mb-12 shadow-2xl">
          <img 
            src={mockStory.coverImage} 
            alt={mockStory.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background-start via-background-start/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <h1 className="text-5xl md:text-6xl font-bold text-cream mb-4 text-shadow">
              {mockStory.title}
            </h1>
            <p className="text-xl text-accent-gold flex items-center gap-2">
              <BookOpen size={24} />
              Told by {mockStory.toldBy}
            </p>
          </div>
        </div>

        {/* Story Content */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-background-end/30 rounded-3xl p-8 md:p-12 border border-accent-gold/20 shadow-xl">
            <div className="prose prose-lg prose-invert max-w-none">
              {mockStory.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-cream/90 leading-relaxed mb-6 text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Reimagine Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-accent-gold/10 to-accent-orange/10 rounded-3xl p-8 md:p-12 border border-accent-gold/30">
            <div className="text-center mb-8">
              <Sparkles className="text-accent-gold mx-auto mb-4" size={40} />
              <h2 className="text-3xl font-bold text-cream mb-3">
                Reimagine This Story
              </h2>
              <p className="text-cream/70">
                Transform this tale into a different format
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                onClick={() => handleReimagine('children')}
                variant={reimaginedType === 'children' ? 'primary' : 'secondary'}
                icon={BookOpen}
              >
                Children's Book
              </Button>
              <Button 
                onClick={() => handleReimagine('comic')}
                variant={reimaginedType === 'comic' ? 'primary' : 'secondary'}
                icon={Sparkles}
              >
                Comic Script
              </Button>
            </div>

            {/* Reimagined Content */}
            {reimaginedType && (
              <div className="bg-background-start/50 rounded-2xl p-8 border border-accent-gold/20 animate-fadeIn">
                <h3 className="text-2xl font-bold text-accent-gold mb-6">
                  {reimaginedType === 'children' ? "Children's Book Version" : 'Comic Script Version'}
                </h3>
                <div className="text-cream/90 leading-relaxed whitespace-pre-line">
                  {reimaginedContent[reimaginedType]}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
