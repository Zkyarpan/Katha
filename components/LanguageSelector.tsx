"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ---------------------------------------------------------------------------
// LanguageSelector
// Self-contained "The Story" section: heading, Read Aloud, language picker,
// and translated text — all in one client component.
// ---------------------------------------------------------------------------

const langCodes: Record<string, string> = {
  english:    "en-US",
  spanish:    "es-ES",
  french:     "fr-FR",
  hindi:      "hi-IN",
  nepali:     "ne-NP",
  arabic:     "ar-SA",
  chinese:    "zh-CN",
  portuguese: "pt-PT",
  german:     "de-DE",
  japanese:   "ja-JP",
};

const LANGUAGES = [
  "English", "Spanish", "French", "Hindi", "Nepali",
  "Arabic", "Chinese", "Portuguese", "German", "Japanese",
];

interface LanguageSelectorProps {
  originalText: string;
  originalLanguage: string;
}

export default function LanguageSelector({
  originalText,
  originalLanguage,
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [displayText, setDisplayText] = useState(originalText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const cacheRef = useRef<Record<string, string>>({ English: originalText });

  useEffect(() => {
    cacheRef.current["English"] = originalText;
    if (selectedLanguage === "English") setDisplayText(originalText);
  }, [originalText, selectedLanguage]);

  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, [displayText]);

  const handleReadAloud = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    try {
      const utterance = new SpeechSynthesisUtterance(displayText);
      utterance.lang  = langCodes[selectedLanguage.toLowerCase()] ?? "en-US";
      utterance.rate  = 0.95;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const goodVoice = voices.find(
        (v) =>
          v.name.includes("Samantha") ||
          v.name.includes("Google")   ||
          v.name.includes("Natural")
      );
      if (goodVoice) utterance.voice = goodVoice;
      utterance.onend   = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } catch {
      setIsSpeaking(false);
    }
  };

  const handleChange = async (language: string) => {
    setSelectedLanguage(language);
    setError(null);
    if (language === "English") { setDisplayText(originalText); return; }
    if (cacheRef.current[language]) { setDisplayText(cacheRef.current[language]); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/translate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText, targetLanguage: language }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Translation failed. Please try again.");
        setDisplayText(originalText);
        return;
      }
      cacheRef.current[language] = data.translated;
      setDisplayText(data.translated);
    } catch {
      setError("Network error — please check your connection and try again.");
      setDisplayText(originalText);
    } finally {
      setLoading(false);
    }
  };

  const showingTranslation =
    selectedLanguage !== "English" &&
    selectedLanguage.toLowerCase() !== originalLanguage.toLowerCase();

  return (
    <div>
      {/* ── Row 1: heading + Read Aloud ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold tracking-tight text-neutral-900">
          The Story
        </h2>
        <button
          onClick={handleReadAloud}
          disabled={loading}
          className="flex items-center gap-1.5 text-neutral-500 hover:text-purple-600 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSpeaking ? (
            <><VolumeX size={15} /> Stop</>
          ) : (
            <><Volume2 size={15} /> Read Aloud</>
          )}
        </button>
      </div>

      {/* ── Row 2: language dropdown ── */}
      <div className="flex items-center gap-3 mb-5">
        <label
          htmlFor="language-select"
          className="text-neutral-500 text-sm whitespace-nowrap"
        >
          🌍 Read in:
        </label>
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={(e) => handleChange(e.target.value)}
          disabled={loading}
          className="border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      {/* ── Story text ── */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <>
          <p className="text-neutral-800 leading-relaxed text-base">
            {displayText}
          </p>
          {showingTranslation && (
            <p className="mt-4 text-neutral-400 text-xs">
              Translated from{" "}
              <span className="text-purple-600 font-medium">{originalLanguage}</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
