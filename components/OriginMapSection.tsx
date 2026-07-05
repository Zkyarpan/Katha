"use client";

import { MapPin } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Card, CardContent } from "@/components/ui/card";
import OriginMap from "@/components/OriginMapClient";
import type { MapStory } from "@/components/OriginMap";

interface OriginMapSectionProps {
  stories: MapStory[];
}

export default function OriginMapSection({ stories }: OriginMapSectionProps) {
  return (
    <section className="px-6 md:px-12 pb-12">
      <BlurFade inView>
        <h2 className="flex items-center gap-2 font-serif text-2xl md:text-3xl font-bold text-katha-cream mb-6">
          <MapPin className="text-katha-gold" size={22} />
          Where Our Stories Come From
        </h2>
        <Card className="border border-katha-plum/40 shadow-[0_0_40px_rgba(240,185,92,0.1)]">
          <CardContent>
            <OriginMap stories={stories} />
          </CardContent>
        </Card>
      </BlurFade>
    </section>
  );
}
