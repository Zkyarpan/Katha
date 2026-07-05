"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="px-6 md:px-12 pt-10 pb-16 text-center relative overflow-hidden">
      {/* soft glow behind hero */}
      <div className="orb-breathe absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-katha-gold/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-6">
        <BlurFade delay={0.1}>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-katha-gold/20 bg-katha-gold/10 px-4 py-1.5 text-sm font-medium">
            <Sparkles size={14} className="text-katha-gold" />
            <AnimatedGradientText colorFrom="#F0B95C" colorTo="#DB7052">
              Powered by IBM watsonx AI
            </AnimatedGradientText>
          </div>
        </BlurFade>

        <BlurFade delay={0.25}>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-katha-cream glow-text leading-tight">
            Stories that must
            <span className="block text-katha-gold">not be forgotten</span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.4}>
          <p className="text-katha-muted text-lg max-w-xl mx-auto">
            Preserve fading oral folk tales, and let AI transform them into
            children&apos;s books, comics, and new creative worlds.
          </p>
        </BlurFade>

        <BlurFade delay={0.55}>
          <Button
            asChild
            size="lg"
            className="h-auto gap-2 rounded-full bg-katha-gold px-7 py-3.5 text-base font-semibold text-katha-indigo shadow-lg shadow-katha-gold/20 transition-all hover:scale-105 hover:bg-katha-goldLight"
          >
            <Link href="/new-story">
              <Sparkles size={18} />
              Save Your First Story
            </Link>
          </Button>
        </BlurFade>
      </div>
    </section>
  );
}
