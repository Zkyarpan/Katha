"use client";

import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StoryCard from "@/components/StoryCard";

interface Story {
  id: string;
  title: string;
  tellerName: string;
  coverImage?: string | null;
  tag?: string;
}

interface StoryLibrarySectionProps {
  storyList: Story[];
}

export default function StoryLibrarySection({
  storyList,
}: StoryLibrarySectionProps) {
  return (
    <section className="px-6 md:px-12 pb-20">
      <BlurFade inView>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-katha-cream">
            Story Library
          </h2>
          <Badge
            variant="outline"
            className="border-katha-gold/30 bg-katha-gold/10 text-katha-gold"
          >
            {storyList.length} {storyList.length === 1 ? "story" : "stories"} preserved
          </Badge>
        </div>
      </BlurFade>

      {storyList.length === 0 ? (
        <BlurFade inView>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen size={40} className="text-katha-muted/40 mb-4" />
            <p className="text-katha-cream font-serif text-xl mb-2">
              No stories yet
            </p>
            <p className="text-katha-muted text-sm max-w-xs mb-6">
              Be the first to preserve a fading folk tale for future generations.
            </p>
            <Button
              asChild
              className="gap-2 rounded-full bg-katha-gold font-semibold text-katha-indigo hover:bg-katha-goldLight"
            >
              <Link href="/new-story">
                <Sparkles size={16} />
                Save Your First Story
              </Link>
            </Button>
          </div>
        </BlurFade>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {storyList.map((story, index) => (
            <BlurFade key={story.id} inView delay={index * 0.1}>
              <StoryCard
                id={story.id}
                title={story.title}
                tellerName={story.tellerName}
                coverImage={story.coverImage ?? ""}
                tag={story.tag}
              />
            </BlurFade>
          ))}
        </div>
      )}
    </section>
  );
}
