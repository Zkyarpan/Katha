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
    <section className="pb-12">
      <BlurFade inView>
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={16} className="text-purple-500" />
          <h2 className="text-lg font-bold tracking-tight text-neutral-900">
            Where Our Stories Come From
          </h2>
        </div>
        <Card className="border border-neutral-200 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <OriginMap stories={stories} />
          </CardContent>
        </Card>
      </BlurFade>
    </section>
  );
}
