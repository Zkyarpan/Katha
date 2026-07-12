"use client";

import { useState, useRef } from "react";
import {
  Volume2, VolumeX, ChevronDown, ChevronUp,
  Loader2, Globe, AlertCircle,
} from "lucide-react";

interface StoryReaderProps {
  cleanedText: string | null;
  originalLanguage: string | null;
}

const LANGUAGES = [
  "English", "Spanish", "French", "Hindi",
  "Nepali", "Japanese", "Chinese", "Arabic",
  "Portuguese", "German",
];

export default function StoryReader({ cleanedText, originalLanguage }: StoryReaderProps) {
  const [expanded,       setExpanded]       = useState(false);
  const [language,       setLanguage]       = useState("English");
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translating,    setTranslating]    = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [speaking,       setSpeaking]       = useState(false);
  const synthRef  = useRef<SpeechSynthesisUtterance | null>(null);

  const baseText     = cleanedText ?? "";
  const displayText  = translatedText ?? baseText;
  const isLong       = displayText.length > 1000;
  const visibleText  = isLong && !expanded ? displayText.slice(0, 1000) : displayText;
  const paragraphs   = visibleText.split("\n").map((p) => p.trim()).filter(Boolean);

  const handleLanguageChange = async (lang: string) => {
    setLanguage(lang);
    setTranslateError(null);

    // If selecting English or the story's own language — just show original
    const origLang = (originalLanguage ?? "English").trim().toLowerCase();
    if (lang.toLowerCase() === "english" || lang.toLowerCase() === origLang) {
      setTranslatedText(null);
      return;
    }

    if (!baseText) return;

    setTranslating(true);
    try {
      const res  = await fetch("/api/translate-story", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text: baseText, targetLanguage: lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTranslateError(data.error ?? "Translation failed. Please try again.");
        setTranslatedText(null);
      } else if (data.translated) {
        setTranslatedText(data.translated);
      } else {
        setTranslateError("No translation returned. Please try again.");
      }
    } catch {
      setTranslateError("Network error — could not reach translation service.");
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
    const utterance  = new SpeechSynthesisUtterance(displayText);
    utterance.rate   = 0.9;
    utterance.onend  = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 mb-8 pb-5 border-b border-neutral-100 flex-wrap">

        {/* Language select */}
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-neutral-400 flex-shrink-0" />
          <div className="relative">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={translating}
              className="appearance-none text-sm font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl pl-3 pr-8 py-2 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 disabled:opacity-50"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
          {translating && (
            <div className="flex items-center gap-1.5 text-xs text-purple-500">
              <Loader2 size={12} className="animate-spin" />
              Translating…
            </div>
          )}
          {!translating && translateError && (
            <div className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle size={12} />
              {translateError}
            </div>
          )}
          {!translating && !translateError && language !== "English" && translatedText && (
            <span className="text-xs bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full font-medium">
              {language}
            </span>
          )}
        </div>

        {/* Listen button */}
        <button
          onClick={handleReadAloud}
          className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all cursor-pointer active:scale-[0.97] ${
            speaking
              ? "text-white bg-neutral-900 border-neutral-900 shadow-sm"
              : "text-neutral-600 bg-white hover:bg-neutral-50 border-neutral-200 hover:text-neutral-900 hover:border-neutral-300"
          }`}
        >
          {speaking ? (
            <>
              <span className="flex gap-0.5 items-end">
                {[3,5,4,6,3].map((h, i) => (
                  <span key={i} className="w-0.5 rounded-full bg-white animate-pulse"
                    style={{ height: h * 2.5, animationDelay: `${i * 0.1}s` }} />
                ))}
              </span>
              <VolumeX size={14} />
              Stop
            </>
          ) : (
            <>
              <Volume2 size={14} />
              Listen
            </>
          )}
        </button>
      </div>

      {/* ── Story text ── */}
      <div className="relative">
        <div className="font-sans text-[1.0625rem] leading-[1.9] tracking-[-0.006em] text-neutral-800 antialiased">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="mb-6">
              {paragraph}
            </p>
          ))}
        </div>

        {isLong && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
        )}
      </div>

      {/* ── Expand / collapse ── */}
      {isLong && (
        <div className="flex flex-col items-center mt-6 gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 px-5 py-2.5 rounded-xl transition-all active:scale-[0.97] shadow-sm"
          >
            {expanded ? (
              <>
                <ChevronUp size={14} />
                Show less
              </>
            ) : (
              <>
                Continue reading
                <ChevronDown size={14} />
              </>
            )}
          </button>
          {!expanded && (
            <p className="text-xs text-neutral-400">
              {Math.ceil((displayText.length - 1000) / 5)} more words
            </p>
          )}
        </div>
      )}
    </div>
  );
}
