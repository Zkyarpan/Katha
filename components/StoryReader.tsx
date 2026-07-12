"use client";

import { useState, useRef } from "react";
import {
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Languages,
} from "lucide-react";

interface StoryReaderProps {
  storyId: string;
  cleanedText: string;
  originalLanguage: string;
}

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "Hindi",
  "Nepali",
  "Japanese",
  "Chinese",
  "Arabic",
  "Portuguese",
  "German",
];

export default function StoryReader({
  storyId,
  cleanedText,
  originalLanguage,
}: StoryReaderProps) {
  const [expanded, setExpanded] = useState(false);
  const [language, setLanguage] = useState("English");
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const displayText = translatedText ?? cleanedText ?? "";
  const isLong = displayText.length > 800;
  const visibleText =
    isLong && !expanded ? displayText.slice(0, 800) : displayText;

  const handleLanguageChange = async (lang: string) => {
    setLanguage(lang);
    if (lang === "English" || lang === originalLanguage) {
      setTranslatedText(null);
      return;
    }
    setTranslating(true);
    try {
      const res = await fetch("/api/translate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanedText,
          targetLanguage: lang,
        }),
      });
      const data = await res.json();
      if (data.translated) setTranslatedText(data.translated);
    } catch {
      // silent
    } finally {
      setTranslating(false);
    }
  };

  const handleReadAloud = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(displayText);
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const paragraphs = visibleText
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div>
      {/* ── Controls ── */}
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <Languages size={14} className="text-neutral-400" />
          <div className="relative">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={translating}
              className="appearance-none text-sm font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg pl-3 pr-8 py-2 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-300 disabled:opacity-50"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
          </div>
          {translating && (
            <span className="text-xs text-neutral-400 animate-pulse">
              Translating…
            </span>
          )}
        </div>

        <button
          onClick={handleReadAloud}
          className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-all cursor-pointer active:scale-[0.97] ${
            speaking
              ? "text-neutral-900 bg-neutral-100 border-neutral-300"
              : "text-neutral-500 bg-white hover:bg-neutral-50 border-neutral-200 hover:text-neutral-700 hover:border-neutral-300"
          }`}
        >
          {speaking ? (
            <>
              <VolumeX size={15} />
              Stop
            </>
          ) : (
            <>
              <Volume2 size={15} />
              Listen
            </>
          )}
        </button>
      </div>

      {/* ── Story text ── */}
      <div className="relative">
        <div className="font-serif text-[1.175rem] leading-[1.9] tracking-[-0.003em] text-neutral-800">
          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className={`mb-6 ${
                i === 0
                  ? "text-[1.3rem] leading-[1.8] text-neutral-900"
                  : ""
              }`}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {isLong && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>

      {/* ── Expand / collapse ── */}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 mx-auto mt-6 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          {expanded ? (
            <>
              Show less
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              Continue reading
              <ChevronDown size={14} />
            </>
          )}
        </button>
      )}
    </div>
  );
}