/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Button from '@/components/Button';
import Link from 'next/link';

export default function NewStoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    toldBy: '',
    story: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission - in real app, this would call an API
    console.log('Story submitted:', formData);
    // Redirect to home page
    router.push('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-2 text-cream/70 hover:text-accent-gold transition-colors mb-8">
          <ArrowLeft size={20} />
          <span>Back to Stories</span>
        </Link>

        {/* Form Container */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block mb-4">
              <Sparkles className="text-accent-gold animate-pulse" size={48} />
            </div>
            <h1 className="text-5xl font-bold text-cream mb-4 text-shadow">
              Share a Story
            </h1>
            <p className="text-lg text-cream/70">
              Tell us a folk tale that deserves to be remembered
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-background-end/30 rounded-3xl p-8 md:p-12 border border-accent-gold/20 shadow-2xl glow-gold">
            {/* Story Title */}
            <div className="mb-8">
              <label htmlFor="title" className="block text-cream font-medium mb-3 text-lg">
                Story Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="The Moon Weaver"
                required
                className="w-full px-5 py-4 bg-background-start/50 border border-accent-gold/30 rounded-xl text-cream placeholder-cream/40 focus:outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 transition-all"
              />
            </div>

            {/* Told By */}
            <div className="mb-8">
              <label htmlFor="toldBy" className="block text-cream font-medium mb-3 text-lg">
                Who told you this story?
              </label>
              <input
                type="text"
                id="toldBy"
                name="toldBy"
                value={formData.toldBy}
                onChange={handleChange}
                placeholder="Grandmother, Uncle, Elder..."
                required
                className="w-full px-5 py-4 bg-background-start/50 border border-accent-gold/30 rounded-xl text-cream placeholder-cream/40 focus:outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 transition-all"
              />
            </div>

            {/* Story Content */}
            <div className="mb-10">
              <label htmlFor="story" className="block text-cream font-medium mb-3 text-lg">
                The Story
              </label>
              <p className="text-sm text-cream/60 mb-3">
                Write the story as you remember it. Don't worry about perfect grammar - we'll help clean it up!
              </p>
              <textarea
                id="story"
                name="story"
                value={formData.story}
                onChange={handleChange}
                placeholder="Once upon a time, in a village nestled between mountains..."
                required
                rows={12}
                className="w-full px-5 py-4 bg-background-start/50 border border-accent-gold/30 rounded-xl text-cream placeholder-cream/40 focus:outline-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button type="submit" icon={Sparkles} variant="primary" className="text-lg px-10 py-4">
                Save & Clean Up
              </Button>
            </div>
          </form>

          {/* Helper Text */}
          <div className="mt-8 text-center text-cream/60 text-sm">
            <p>After saving, our AI will help polish the story and generate a beautiful cover image.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
