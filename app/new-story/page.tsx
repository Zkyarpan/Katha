"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button as ShadButton } from "@/components/ui/button";
import {
  Sparkles,
  User,
  BookText,
  Mic,
  MicOff,
  MapPin,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  Wand2,
  ImageIcon,
  BookOpen,
  LocateFixed,
  Loader2,
  Languages,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Minimal types for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

// ── Language list ──────────────────────────────────────────────────────────
// Each entry is [BCP-47 tag, display label, native script label]
// The tag is passed directly to SpeechRecognition.lang — must be exact.
const LANGUAGES: [string, string, string][] = [
  ["en-US", "English", "English"],
  ["ne-NP", "Nepali", "नेपाली"],
  ["hi-IN", "Hindi", "हिन्दी"],
  ["bn-BD", "Bengali", "বাংলা"],
  ["ta-IN", "Tamil", "தமிழ்"],
  ["te-IN", "Telugu", "తెలుగు"],
  ["ur-PK", "Urdu", "اردو"],
  ["es-ES", "Spanish", "Español"],
  ["fr-FR", "French", "Français"],
  ["pt-BR", "Portuguese", "Português"],
  ["ar-SA", "Arabic", "العربية"],
  ["zh-CN", "Chinese", "中文"],
  ["ja-JP", "Japanese", "日本語"],
  ["ko-KR", "Korean", "한국어"],
  ["de-DE", "German", "Deutsch"],
  ["ru-RU", "Russian", "Русский"],
  ["sw-KE", "Swahili", "Kiswahili"],
  ["yo-NG", "Yoruba", "Yorùbá"],
  ["ig-NG", "Igbo", "Igbo"],
  ["ha-NG", "Hausa", "Hausa"],
  ["id-ID", "Indonesian", "Bahasa Indonesia"],
  ["ms-MY", "Malay", "Bahasa Melayu"],
  ["vi-VN", "Vietnamese", "Tiếng Việt"],
  ["th-TH", "Thai", "ภาษาไทย"],
  ["tr-TR", "Turkish", "Türkçe"],
];

const inputCls =
  "w-full border border-neutral-200 bg-white rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400 transition-all";

export default function NewStoryPage() {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [teller, setTeller] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Location detection
  const [locatingUser, setLocatingUser] = useState(false);

  // Speech recognition
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [speechLang, setSpeechLang] = useState("ne-NP"); // default Nepali — user should pick their own
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const committedRef = useRef("");

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setIsSpeechSupported(!!SR);
  }, []);

  const wordCount = story.trim().split(/\s+/).filter(Boolean).length;

  // ── Auto-detect location ──
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
          );
          const data = await res.json();
          const addr = data.address ?? {};
          // Build a readable location: city/town/village, state, country
          const city =
            addr.city ?? addr.town ?? addr.village ?? addr.county ?? "";
          const state = addr.state ?? "";
          const country = addr.country ?? "";
          const parts = [city, state, country].filter(Boolean);
          setLocation(parts.join(", "));
        } catch {
          // Fallback: just show coords
          setLocation(
            `${position.coords.latitude.toFixed(2)}°, ${position.coords.longitude.toFixed(2)}°`,
          );
        } finally {
          setLocatingUser(false);
        }
      },
      () => {
        setLocatingUser(false);
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  // ── Speech recognition ──
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    setSpeechError(null);
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    // Must be a concrete BCP-47 tag — the browser does NOT auto-detect speech
    // language; passing "" silently falls back to the OS UI language (usually
    // English) which is why Nepali was being mis-transcribed.
    recognition.lang = speechLang;

    const storyAtStart = story;
    committedRef.current = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }
      committedRef.current += finalTranscript;
      setStory(storyAtStart + committedRef.current + interimTranscript);
    };

    recognition.onend = () => setIsListening(false);

    recognition.onerror = (event: Event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errEvent = event as any;
      const code: string = errEvent?.error ?? "unknown";
      if (code === "language-not-supported") {
        setSpeechError(`"${LANGUAGES.find(([t]) => t === speechLang)?.[1] ?? speechLang}" is not supported by your browser for speech. Try Chrome on desktop.`);
      } else if (code === "not-allowed") {
        setSpeechError("Microphone access was denied. Please allow it in your browser settings.");
      } else if (code !== "aborted") {
        setSpeechError(`Speech error: ${code}`);
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [speechLang, story]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) stopListening();
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Find the human-readable name for the selected BCP-47 tag
      const langLabel = LANGUAGES.find(([tag]) => tag === speechLang)?.[1] ?? null;

      const res = await fetch("/api/clean-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tellerName: teller,
          rawText: story,
          locationName: location,
          language: langLabel,   // pass the confirmed language to the API
          userId: user?.id ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push(`/story/${data.id}`);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-24">
        {/* ── Back button ── */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-900 transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back
        </Link>

        {/* ── Page header ── */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 leading-tight mt-5">
            Save a fading story
          </h1>
          <p className="text-neutral-500 text-sm mt-2 max-w-lg">
            Tell it the way you remember it - rough is perfectly fine. AI will
            help clean it up while keeping your voice.
          </p>
        </div>

        {/* ── Main grid: Form (3/5) + Sidebar (2/5) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── Form card ── */}
          <Card className="lg:col-span-3 bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-5 sm:p-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: Title + Location side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 mb-2">
                      <BookText size={14} className="text-neutral-400" />
                      Story title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="The Mountain Spirit"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 mb-2">
                      <MapPin size={14} className="text-neutral-400" />
                      Where is it from?
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Taplejung, Nepal"
                        className={`${inputCls} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={handleUseMyLocation}
                        disabled={locatingUser}
                        title="Use my location"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {locatingUser ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <LocateFixed size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 2: Storyteller */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 mb-2">
                    <User size={14} className="text-neutral-400" />
                    Who told you this story?
                  </label>
                  <input
                    type="text"
                    required
                    value={teller}
                    onChange={(e) => setTeller(e.target.value)}
                    placeholder="My Grandmother"
                    className={inputCls}
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-neutral-100" />

                {/* Row 3: Story textarea */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
                      <Sparkles size={14} className="text-neutral-400" />
                      The story
                    </label>
                    {isSpeechSupported && (
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {/* Language selector — always visible so user sets it before starting */}
                        <div className="relative flex items-center">
                          <Languages size={12} className="text-neutral-400 absolute left-2.5 pointer-events-none z-10" />
                          <select
                            value={speechLang}
                            disabled={isListening}
                            onChange={(e) => {
                              setSpeechLang(e.target.value);
                              setSpeechError(null);
                            }}
                            className="text-xs pl-7 pr-6 py-1.5 rounded-full border border-neutral-200 bg-white text-neutral-600 focus:outline-none focus:border-neutral-400 cursor-pointer appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {LANGUAGES.map(([tag, label, native]) => (
                              <option key={tag} value={tag}>
                                {label} — {native}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={10} className="text-neutral-400 absolute right-2.5 pointer-events-none" />
                        </div>

                        {/* Mic toggle */}
                        <button
                          type="button"
                          onClick={isListening ? stopListening : startListening}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            isListening
                              ? "border-red-200 bg-red-50 text-red-600"
                              : "border-neutral-200 bg-white text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                          }`}
                        >
                          {isListening ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              <MicOff size={12} />
                              Stop
                            </>
                          ) : (
                            <>
                              <Mic size={12} />
                              Dictate
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                 {/* Speech error */}
                 {speechError && (
                   <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-2">
                     <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                     <p className="text-xs text-amber-700">{speechError}</p>
                   </div>
                 )}
                 {/* Listening indicator */}
                 {isListening && (
                   <div className="flex items-center gap-2 mb-2 px-1">
                     <span className="flex gap-0.5">
                       {[0,1,2].map((i) => (
                         <span
                           key={i}
                           className="w-0.5 h-3 bg-red-400 rounded-full animate-pulse"
                           style={{ animationDelay: `${i * 0.15}s` }}
                         />
                       ))}
                     </span>
                     <span className="text-xs text-red-500 font-medium">
                       Listening in {LANGUAGES.find(([t]) => t === speechLang)?.[1] ?? speechLang}…
                     </span>
                   </div>
                 )}
                  <textarea
                    required
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    rows={10}
                    placeholder="Tell it the way you remember it..."
                    className={`${inputCls} resize-none`}
                  />
                  <div className="flex justify-end mt-1.5">
                    <span className="text-xs text-neutral-400">
                      {wordCount} {wordCount === 1 ? "word" : "words"}
                    </span>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <span className="text-red-600 text-sm">{error}</span>
                  </div>
                )}

                {/* Submit */}
                <ShadButton
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full h-11 gap-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Polishing your story…
                    </>
                  ) : (
                    <>
                      Save & clean up
                      <ArrowRight size={15} />
                    </>
                  )}
                </ShadButton>
              </form>
            </CardContent>
          </Card>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-2 space-y-6">
            {/* Tips — compact list */}
            <Card className="bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                  Tips
                </h3>
                <ul className="space-y-4">
                  {[
                    {
                      icon: Lightbulb,
                      title: "Rough is perfect",
                      desc: "Write it however you remember. AI handles grammar and flow.",
                    },
                    {
                      icon: Mic,
                      title: "Speak any language",
                      desc: "Auto-detect is on by default — just speak and the browser transcribes whatever language you use.",
                    },
                    {
                      icon: User,
                      title: "Credit the source",
                      desc: "Name who told you so the tradition is traceable.",
                    },
                  ].map((tip) => (
                    <li key={tip.title} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                        <tip.icon size={14} className="text-neutral-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800 leading-snug">
                          {tip.title}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                          {tip.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* What happens next — horizontal steps */}
            <Card className="bg-white border border-neutral-200 shadow-sm rounded-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                  What happens next
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      icon: Wand2,
                      text: "AI cleans grammar & structure",
                    },
                    {
                      icon: ImageIcon,
                      text: "Your story gets a cover image",
                    },
                    {
                      icon: BookOpen,
                      text: "Readers reimagine it as a children's book or comic",
                    },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <step.icon size={14} className="text-amber-600" />
                      </div>
                      <p className="text-sm text-neutral-600 leading-snug pt-1.5">
                        {step.text}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* ── Skeleton preview while AI processes ── */}
        {loading && (
          <div className="mt-8 bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm max-w-3xl">
            <Skeleton className="w-full aspect-[21/9] rounded-none" />
            <div className="p-6 space-y-3">
              <Skeleton className="h-6 w-2/3 rounded-lg" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-11/12 rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
