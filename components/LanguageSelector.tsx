"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Volume2, VolumeX } from "lucide-react";

// ---------------------------------------------------------------------------
// LanguageSelector
// Self-contained "The Story" section: heading, Read Aloud, language picker,
// and translated text card — all in one client component.
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
  "English",
  "Spanish",
  "French",
  "Hindi",
  "Nepali",
  "Arabic",
  "Chinese",
  "Portuguese",
  "German",
  "Japanese",
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

  // --- Read Aloud state ---
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cache maps language name → translated text so each language is only
  // fetched once per page load.
  const cacheRef = useRef<Record<string, string>>({ English: originalText });

  // Keep the English cache entry in sync if originalText ever changes.
  useEffect(() => {
    cacheRef.current["English"] = originalText;
    if (selectedLanguage === "English") setDisplayText(originalText);
  }, [originalText, selectedLanguage]);

  // Cancel speech on unmount.
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  // Stop speaking whenever the displayed text changes (language switch).
  useEffect(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, [displayText]);

  // --- Read Aloud handler ---
  const handleReadAloud = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(displayText);

      // BCP47 language code so the browser picks an appropriate voice.
      utterance.lang  = langCodes[selectedLanguage.toLowerCase()] ?? "en-US";
      utterance.rate  = 0.95; // slightly slower reads more naturally
      utterance.pitch = 1.0;

      // Prefer a higher-quality voice when the browser has one available.
      // getVoices() may return [] before voices load; that's fine — the
      // browser falls back to its default voice automatically.
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
      // speak() can throw in rare browser/OS edge cases.
      setIsSpeaking(false);
    }
  };

  // --- Translation handler ---
  const handleChange = async (language: string) => {
    setSelectedLanguage(language);
    setError(null);

    // English — show the original immediately, no API call needed.
    if (language === "English") {
      setDisplayText(originalText);
      return;
    }

    // Cache hit — show instantly.
    if (cacheRef.current[language]) {
      setDisplayText(cacheRef.current[language]);
      return;
    }

    // Cache miss — fetch the translation.
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

  // Show attribution only when displaying a language other than the source.
  const showingTranslation =
    selectedLanguage !== "English" &&
    selectedLanguage.toLowerCase() !== originalLanguage.toLowerCase();

  return (
    <div className="mt-8 bg-katha-indigoLight/40 border border-katha-plum/40 rounded-2xl p-6 md:p-8">

      {/* ── Row 1: "The Story" heading + Read Aloud button ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg font-semibold text-katha-gold">
          The Story
        </h2>
        <button
          onClick={handleReadAloud}
          disabled={loading}
          className="flex items-center gap-1.5 text-katha-muted hover:text-katha-gold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSpeaking ? (
            <>
              <VolumeX size={16} />
              Stop
            </>
          ) : (
            <>
              <Volume2 size={16} />
              Read Aloud
            </>
          )}
        </button>
      </div>

      {/* ── Row 2: "🌍 Read in:" label + language dropdown ── */}
      <div className="flex items-center gap-3 mb-5">
        <label
          htmlFor="language-select"
          className="text-katha-muted text-sm whitespace-nowrap"
        >
          🌍 Read in:
        </label>
        <select
          id="language-select"
          value={selectedLanguage}
          onChange={(e) => handleChange(e.target.value)}
          disabled={loading}
          className="bg-katha-indigo/60 border border-katha-plum/50 rounded-xl px-4 py-2 text-katha-cream text-sm focus:outline-none focus:border-katha-gold/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang} className="bg-katha-indigo">
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* ── Story text ── */}
      {loading ? (
        <p className="text-katha-muted flex items-center gap-2">
          <Sparkles size={16} className="animate-pulse text-katha-gold" />
          Translating...
        </p>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : (
        <>
          <p className="text-katha-cream/90 leading-relaxed text-lg">
            {displayText}
          </p>
          {showingTranslation && (
            <p className="mt-4 text-katha-muted text-xs">
              Translated from{" "}
              <span className="text-katha-gold">{originalLanguage}</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
