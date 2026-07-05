"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";

interface StoryReaderProps {
  storyId: string;
  cleanedText: string;
  originalLanguage: string;
}

export default function StoryReader({
  cleanedText,
  originalLanguage,
}: StoryReaderProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = cleanedText.length > 800;

  return (
    <Card className="border border-neutral-200 shadow-sm">
      <CardContent className="p-6">
        <div
          className={`relative ${
            !expanded && isLong ? "max-h-[400px] overflow-hidden" : ""
          }`}
        >
          <LanguageSelector
            originalText={cleanedText}
            originalLanguage={originalLanguage}
          />

          {!expanded && isLong && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>

        {isLong && (
          <div className="flex justify-center mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-neutral-600 hover:text-neutral-900"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp size={14} className="ml-1" />
                </>
              ) : (
                <>
                  Read more <ChevronDown size={14} className="ml-1" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}