"use client";

import { useEffect, useRef, useState } from "react";
import {
  Volume2, VolumeX, ChevronDown, ChevronUp,
  Loader2, Globe, AlertCircle,
} from "lucide-react";

interface StoryReaderProps {
  cleanedText: string | null;
  originalLanguage: string | null;
}

const LANGUAGE_LOCALES: Record<string, string> = {
  english: "en-US",
  spanish: "es-ES",
  french: "fr-FR",
  hindi: "hi-IN",
  nepali: "ne-NP",
  japanese: "ja-JP",
  chinese: "zh-CN",
  arabic: "ar-SA",
  portuguese: "pt-PT",
  german: "de-DE",
};

const LANGUAGES = Object.keys(LANGUAGE_LOCALES).map(
  (language) => language.charAt(0).toUpperCase() + language.slice(1)
);

const normaliseLanguage = (language: string) => language.trim().toLowerCase();

const getSpeechLocale = (language: string) =>
  LANGUAGE_LOCALES[normaliseLanguage(language)] ?? "en-US";

/** Prefer a high-quality free voice, but only when it matches the requested language. */
const findBestVoice = (voices: SpeechSynthesisVoice[], locale: string) => {
  const requestedLocale = locale.toLowerCase().replace("_", "-");
  const requestedLanguage = requestedLocale.split("-")[0];
  const matchingVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().replace("_", "-").split("-")[0] === requestedLanguage
  );

  return matchingVoices.sort((a, b) => {
    const score = (voice: SpeechSynthesisVoice) => {
      const voiceLocale = voice.lang.toLowerCase().replace("_", "-");
      const name = voice.name.toLowerCase();
      let result = voiceLocale === requestedLocale ? 100 : 50;
      if (/premium|enhanced|natural|neural/.test(name)) result += 30;
      if (/google|microsoft|apple/.test(name)) result += 15;
      if (voice.default) result += 5;
      return result;
    };

    return score(b) - score(a);
  })[0];
};

/** Smaller utterances are more reliable than sending an entire long story at once. */
const splitForSpeech = (text: string, maxLength = 220) => {
  const sentences = text.match(/[^.!?\u0964\u0965\u3002\uff01\uff1f]+[.!?\u0964\u0965\u3002\uff01\uff1f]*|.+$/g) ?? [text];
  const chunks: string[] = [];

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    if (trimmedSentence.length <= maxLength) {
      chunks.push(trimmedSentence);
      continue;
    }

    let chunk = "";
    for (const word of trimmedSentence.split(/\s+/)) {
      if (chunk && `${chunk} ${word}`.length > maxLength) {
        chunks.push(chunk);
        chunk = word;
      } else {
        chunk = chunk ? `${chunk} ${word}` : word;
      }
    }
    if (chunk) chunks.push(chunk);
  }

  return chunks;
};

export default function StoryReader({ cleanedText, originalLanguage }: StoryReaderProps) {
  const storyLanguage = originalLanguage?.trim() || "English";
  const canonicalStoryLanguage =
    LANGUAGES.find(
      (candidate) => normaliseLanguage(candidate) === normaliseLanguage(storyLanguage)
    ) ?? storyLanguage;
  const languageOptions = LANGUAGES.some(
    (candidate) => normaliseLanguage(candidate) === normaliseLanguage(canonicalStoryLanguage)
  )
    ? LANGUAGES
    : [canonicalStoryLanguage, ...LANGUAGES];

  const [expanded,       setExpanded]       = useState(false);
  const [language,       setLanguage]       = useState(canonicalStoryLanguage);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translating,    setTranslating]    = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [speaking,       setSpeaking]       = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const synthRef  = useRef<SpeechSynthesisUtterance | null>(null);
  const speechSessionRef = useRef(0);
  const translationCacheRef = useRef<Record<string, string>>({});

  const baseText     = cleanedText ?? "";
  const displayText  = translatedText ?? baseText;
  const isLong       = displayText.length > 1000;
  const visibleText  = isLong && !expanded ? displayText.slice(0, 1000) : displayText;
  const paragraphs   = visibleText.split("\n").map((p) => p.trim()).filter(Boolean);

  const stopSpeaking = () => {
    speechSessionRef.current += 1;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    synthRef.current = null;
    setSpeaking(false);
  };

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const loadVoices = () => {
      voicesRef.current = synth.getVoices();
    };

    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);
    return () => {
      speechSessionRef.current += 1;
      synth.cancel();
      synth.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // Never continue speaking stale text after a translation changes.
  useEffect(() => {
    stopSpeaking();
  }, [displayText]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLanguageChange = async (lang: string) => {
    stopSpeaking();
    setLanguage(lang);
    setTranslateError(null);

    // Selecting the story's actual language should always restore the original.
    const origLang = normaliseLanguage(storyLanguage);
    if (normaliseLanguage(lang) === origLang) {
      setTranslatedText(null);
      return;
    }

    if (!baseText) return;

    const cachedTranslation = translationCacheRef.current[normaliseLanguage(lang)];
    if (cachedTranslation) {
      setTranslatedText(cachedTranslation);
      return;
    }

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
        translationCacheRef.current[normaliseLanguage(lang)] = data.translated;
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
      stopSpeaking();
      return;
    }

    if (
      typeof window === "undefined" ||
      !window.speechSynthesis ||
      translating ||
      translateError ||
      !displayText.trim()
    ) return;

    const synth = window.speechSynthesis;
    const locale = getSpeechLocale(language);
    const voice = findBestVoice(voicesRef.current, locale);
    const chunks = splitForSpeech(displayText);
    const session = speechSessionRef.current + 1;
    speechSessionRef.current = session;

    const speakChunk = (index: number) => {
      if (speechSessionRef.current !== session) return;
      if (index >= chunks.length) {
        synthRef.current = null;
        setSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      // The locale is essential: without it translated text is read as English.
      utterance.lang = locale;
      utterance.rate = 0.92;
      utterance.pitch = 1;
      utterance.volume = 1;
      if (voice) utterance.voice = voice;
      utterance.onend = () => speakChunk(index + 1);
      utterance.onerror = () => {
        if (speechSessionRef.current === session) {
          synthRef.current = null;
          setSpeaking(false);
        }
      };
      synthRef.current = utterance;
      synth.speak(utterance);
    };

    setSpeaking(true);
    speakChunk(0);
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
              {languageOptions.map((lang) => (
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
          {!translating &&
            !translateError &&
            normaliseLanguage(language) !== normaliseLanguage(storyLanguage) &&
            translatedText && (
              <span className="text-xs bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full font-medium">
                {language}
              </span>
            )}
        </div>

        {/* Listen button */}
        <button
          onClick={handleReadAloud}
          disabled={translating || !!translateError || !displayText.trim()}
          aria-label={speaking ? `Stop listening in ${language}` : `Listen in ${language}`}
          title={`Uses the best free ${language} voice available on your device`}
          className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all cursor-pointer active:scale-[0.97] ${
            speaking
              ? "text-white bg-neutral-900 border-neutral-900 shadow-sm"
              : "text-neutral-600 bg-white hover:bg-neutral-50 border-neutral-200 hover:text-neutral-900 hover:border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
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
              Stop {language}
            </>
          ) : (
            <>
              <Volume2 size={14} />
              Listen in {language}
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
