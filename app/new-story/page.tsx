"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import {
  Sparkles,
  User,
  BookText,
  Mic,
  MicOff,
  MapPin,
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
  AudioLines,
  CheckCircle2,
  Globe,
  Feather,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ── Web Speech API types ────────────────────────────────────────────────────
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

// ── Language list ────────────────────────────────────────────────────────────
const LANGUAGES: [string, string, string][] = [
  ["en-US", "English",    "English"],
  ["ne-NP", "Nepali",     "नेपाली"],
  ["hi-IN", "Hindi",      "हिन्दी"],
  ["bn-BD", "Bengali",    "বাংলা"],
  ["ta-IN", "Tamil",      "தமிழ்"],
  ["te-IN", "Telugu",     "తెలుగు"],
  ["ur-PK", "Urdu",       "اردو"],
  ["es-ES", "Spanish",    "Español"],
  ["fr-FR", "French",     "Français"],
  ["pt-BR", "Portuguese", "Português"],
  ["ar-SA", "Arabic",     "العربية"],
  ["zh-CN", "Chinese",    "中文"],
  ["ja-JP", "Japanese",   "日本語"],
  ["ko-KR", "Korean",     "한국어"],
  ["de-DE", "German",     "Deutsch"],
  ["ru-RU", "Russian",    "Русский"],
  ["sw-KE", "Swahili",    "Kiswahili"],
  ["yo-NG", "Yoruba",     "Yorùbá"],
  ["ig-NG", "Igbo",       "Igbo"],
  ["ha-NG", "Hausa",      "Hausa"],
  ["id-ID", "Indonesian", "Bahasa Indonesia"],
  ["ms-MY", "Malay",      "Bahasa Melayu"],
  ["vi-VN", "Vietnamese", "Tiếng Việt"],
  ["th-TH", "Thai",       "ภาษาไทย"],
  ["tr-TR", "Turkish",    "Türkçe"],
];

const inputCls =
  "w-full border border-neutral-200 bg-neutral-50 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 focus:bg-white transition-all";

// ── Progress steps shown while loading ──────────────────────────────────────
const LOAD_STEPS = [
  { icon: Feather,    text: "Reading your story…"          },
  { icon: Wand2,      text: "Cleaning grammar & flow…"     },
  { icon: Globe,      text: "Detecting language & origin…" },
  { icon: ImageIcon,  text: "Generating cover art…"        },
  { icon: CheckCircle2, text: "Saving to the archive…"     },
];

export default function NewStoryPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [title,    setTitle]    = useState("");
  const [location, setLocation] = useState("");
  const [teller,   setTeller]   = useState("");
  const [story,    setStory]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [loadStep, setLoadStep] = useState(0);

  const [locatingUser, setLocatingUser] = useState(false);

  const [isListening,      setIsListening]      = useState(false);
  const [isSpeechSupported,setIsSpeechSupported] = useState(false);
  const [speechLang,       setSpeechLang]       = useState("ne-NP");
  const [speechError,      setSpeechError]      = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const committedRef   = useRef("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef   = useRef<Blob[]>([]);
  const [audioBlob,      setAudioBlob]      = useState<Blob | null>(null);
  const [audioMime,      setAudioMime]      = useState("audio/webm");
  const [recordingReady, setRecordingReady] = useState(false);

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setIsSpeechSupported(!!SR);
  }, []);

  // Animate through load steps while the AI is working
  useEffect(() => {
    if (!loading) { setLoadStep(0); return; }
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(i + 1, LOAD_STEPS.length - 1);
      setLoadStep(i);
    }, 2200);
    return () => clearInterval(id);
  }, [loading]);

  const wordCount = story.trim().split(/\s+/).filter(Boolean).length;

  // ── Location ─────────────────────────────────────────────────────────────
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
          );
          const data = await res.json();
          const addr = data.address ?? {};
          const city    = addr.city ?? addr.town ?? addr.village ?? addr.county ?? "";
          const state   = addr.state   ?? "";
          const country = addr.country ?? "";
          setLocation([city, state, country].filter(Boolean).join(", "));
        } catch {
          setLocation(`${position.coords.latitude.toFixed(2)}°, ${position.coords.longitude.toFixed(2)}°`);
        } finally {
          setLocatingUser(false);
        }
      },
      () => setLocatingUser(false),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  // ── Audio recording ───────────────────────────────────────────────────────
  const startMediaRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = [
        "audio/webm;codecs=opus", "audio/webm",
        "audio/ogg;codecs=opus",  "audio/mp4",
      ].find((m) => MediaRecorder.isTypeSupported(m)) ?? "audio/webm";
      setAudioMime(mime.split(";")[0]);
      audioChunksRef.current = [];
      setAudioBlob(null);
      setRecordingReady(false);
      const mr = new MediaRecorder(stream, { mimeType: mime });
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        setAudioBlob(new Blob(audioChunksRef.current, { type: mime.split(";")[0] }));
        setRecordingReady(true);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start(250);
      mediaRecorderRef.current = mr;
    } catch { /* mic unavailable — silent */ }
  }, []);

  const stopMediaRecorder = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
  }, []);

  // ── Speech recognition ────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;
    setSpeechError(null);
    const recognition = new SR();
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = speechLang;
    const storyAtStart = story;
    committedRef.current = "";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "", final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) final += r[0].transcript + " ";
        else           interim += r[0].transcript;
      }
      committedRef.current += final;
      setStory(storyAtStart + committedRef.current + interim);
    };
    recognition.onend   = () => setIsListening(false);
    recognition.onerror = (event: Event) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const code: string = (event as any)?.error ?? "unknown";
      if      (code === "language-not-supported") setSpeechError(`"${LANGUAGES.find(([t]) => t === speechLang)?.[1] ?? speechLang}" is not supported by your browser. Try Chrome on desktop.`);
      else if (code === "not-allowed")             setSpeechError("Microphone access was denied. Allow it in your browser settings.");
      else if (code !== "aborted")                 setSpeechError(`Speech error: ${code}`);
      setIsListening(false);
    };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    startMediaRecorder();
  }, [speechLang, story, startMediaRecorder]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    stopMediaRecorder();
  }, [stopMediaRecorder]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) stopListening();
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const langLabel = LANGUAGES.find(([tag]) => tag === speechLang)?.[1] ?? null;
      const res  = await fetch("/api/clean-story", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title, tellerName: teller, rawText: story, locationName: location, language: langLabel, userId: user?.id ?? null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      const storyId: string = data.id;
      if (audioBlob && audioBlob.size > 0) {
        try {
          const form = new FormData();
          form.append("audio", audioBlob, `voice.${audioMime.split("/")[1] ?? "webm"}`);
          form.append("storyId", storyId);
          await fetch("/api/upload-recording", { method: "POST", body: form });
        } catch { /* non-fatal */ }
      }
      router.push(`/story/${storyId}`);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">

      {/* ── Hero band ── */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 transition-colors group mb-6"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <Sparkles size={11} />
                Preserve a story
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 leading-tight">
                Save a fading story
              </h1>
              <p className="text-neutral-500 text-sm mt-2 max-w-md leading-relaxed">
                Tell it rough — exactly as you remember it.
                AI will clean it up while keeping your voice intact.
              </p>
            </div>

            {/* Live stats pill */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              {[
                { icon: BookOpen, label: "Preserved" },
                { icon: Mic,      label: "Voice-first" },
                { icon: Globe,    label: "Any language" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <Icon size={15} className="text-neutral-500" />
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* ══════════════ FORM ══════════════ */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-0">
              <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">

                {/* ── Section 1: Story identity ── */}
                <div className="p-6 sm:p-7 space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-md bg-purple-100 flex items-center justify-center">
                      <BookText size={11} className="text-purple-600" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Story details
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Story title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. The Tiger and the Clever Hare"
                      className={inputCls}
                    />
                  </div>

                  {/* Teller + Location row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Who told this story? <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={teller}
                          onChange={(e) => setTeller(e.target.value)}
                          placeholder="My grandmother"
                          className={`${inputCls} pl-9`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Where is it from?
                      </label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Taplejung, Nepal"
                          className={`${inputCls} pl-9 pr-10`}
                        />
                        <button
                          type="button"
                          onClick={handleUseMyLocation}
                          disabled={locatingUser}
                          title="Detect my location"
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-purple-600 hover:bg-purple-50 transition-all disabled:opacity-40"
                        >
                          {locatingUser
                            ? <Loader2 size={13} className="animate-spin" />
                            : <LocateFixed size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Divider with label ── */}
                <div className="flex items-center gap-3 px-6 sm:px-7">
                  <div className="flex-1 h-px bg-neutral-100" />
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
                    <Feather size={10} />
                    The story
                  </div>
                  <div className="flex-1 h-px bg-neutral-100" />
                </div>

                {/* ── Section 2: Story body ── */}
                <div className="p-6 sm:p-7 pt-5 space-y-3">

                  {/* Voice controls row */}
                  {isSpeechSupported && (
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      {/* Language selector */}
                      <div className="relative flex items-center">
                        <Languages size={12} className="absolute left-3 text-neutral-400 pointer-events-none z-10" />
                        <select
                          value={speechLang}
                          disabled={isListening}
                          onChange={(e) => { setSpeechLang(e.target.value); setSpeechError(null); }}
                          className="text-xs pl-8 pr-7 py-2 rounded-lg border border-neutral-200 bg-white text-neutral-600 focus:outline-none focus:border-purple-300 cursor-pointer appearance-none disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          {LANGUAGES.map(([tag, label, native]) => (
                            <option key={tag} value={tag}>{label} — {native}</option>
                          ))}
                        </select>
                        <ChevronDown size={10} className="absolute right-2.5 text-neutral-400 pointer-events-none" />
                      </div>

                      {/* Mic button */}
                      <button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer ${
                          isListening
                            ? "bg-red-600 border-red-600 text-white shadow-sm shadow-red-200"
                            : "bg-white border-neutral-200 text-neutral-600 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50"
                        }`}
                      >
                        {isListening ? (
                          <>
                            <span className="flex gap-[2px]">
                              {[0,1,2,3].map((i) => (
                                <span key={i} className="w-0.5 rounded-full bg-white animate-pulse" style={{ height: 10 + i * 2, animationDelay: `${i * 0.1}s` }} />
                              ))}
                            </span>
                            <MicOff size={12} />
                            Stop recording
                          </>
                        ) : (
                          <>
                            <Mic size={12} />
                            Dictate story
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Speech error */}
                  {speechError && (
                    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3">
                      <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700 leading-relaxed">{speechError}</p>
                    </div>
                  )}

                  {/* Live listening indicator */}
                  {isListening && (
                    <div className="flex items-center justify-between gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex gap-0.5 items-end h-4">
                          {[3,5,4,6,3,5].map((h, i) => (
                            <span
                              key={i}
                              className="w-0.5 rounded-full bg-red-400 animate-pulse"
                              style={{ height: h * 2, animationDelay: `${i * 0.1}s` }}
                            />
                          ))}
                        </span>
                        <span className="text-xs font-medium text-red-600">
                          Listening in {LANGUAGES.find(([t]) => t === speechLang)?.[1] ?? speechLang}…
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-purple-500 font-medium">
                        <AudioLines size={12} className="animate-pulse" />
                        Saving voice
                      </div>
                    </div>
                  )}

                  {/* Recording ready badge */}
                  {!isListening && recordingReady && audioBlob && (
                    <div className="flex items-center gap-2.5 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5">
                      <CheckCircle2 size={14} className="text-purple-500 flex-shrink-0" />
                      <span className="text-xs text-purple-700 font-medium flex-1">
                        Voice recording saved — will be attached to your story
                      </span>
                      <button
                        type="button"
                        onClick={() => { setAudioBlob(null); setRecordingReady(false); }}
                        className="text-purple-300 hover:text-purple-600 text-xs transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Textarea */}
                  <div className="relative">
                    <textarea
                      required
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      rows={12}
                      placeholder={`Tell it the way you remember it — rough is perfectly fine.\n\n"Long ago in the hills above our village, there was a tiger who…"`}
                      className={`${inputCls} resize-none leading-relaxed`}
                    />
                    {/* Word count */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                      {wordCount > 0 && (
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          wordCount < 50
                            ? "bg-amber-50 text-amber-500"
                            : "bg-green-50 text-green-600"
                        }`}>
                          {wordCount} {wordCount === 1 ? "word" : "words"}
                        </span>
                      )}
                    </div>
                  </div>
                  {wordCount > 0 && wordCount < 50 && (
                    <p className="text-[11px] text-amber-500">
                      A little more detail helps the AI preserve the story faithfully — aim for 50+ words.
                    </p>
                  )}
                </div>

                {/* ── Error ── */}
                {error && (
                  <div className="mx-6 sm:mx-7 mb-5 flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-600">{error}</span>
                  </div>
                )}

                {/* ── Submit ── */}
                <div className="px-6 sm:px-7 pb-6 sm:pb-7">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2.5 h-12 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.99] shadow-sm hover:shadow-md cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin flex-shrink-0" />
                        <span className="truncate">{LOAD_STEPS[loadStep].text}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        Preserve this story
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>

                  {/* Loading progress bar */}
                  {loading && (
                    <div className="mt-3 h-1 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-700"
                        style={{ width: `${((loadStep + 1) / LOAD_STEPS.length) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* ══════════════ SIDEBAR ══════════════ */}
          <aside className="lg:col-span-2 space-y-5 lg:sticky lg:top-20">

            {/* What happens card */}
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500" />
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                  What happens next
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Wand2,         color: "bg-purple-50 text-purple-600", text: "AI preserves your exact voice while fixing grammar and structure" },
                    { icon: Globe,         color: "bg-blue-50   text-blue-600",   text: "Story is geo-tagged and placed on the world map" },
                    { icon: ImageIcon,     color: "bg-amber-50  text-amber-600",  text: "A unique cover illustration is generated for your story" },
                    { icon: BookOpen,      color: "bg-green-50  text-green-600",  text: "Readers can reimagine it as a children's book or comic" },
                    { icon: AudioLines,    color: "bg-red-50    text-red-600",    text: "Your voice recording is preserved alongside the written story" },
                  ].map(({ icon: Icon, color, text }, i) => (
                    <div key={i} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                        <Icon size={14} />
                      </div>
                      <p className="text-sm text-neutral-600 leading-snug pt-1">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips card */}
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                Tips for a great submission
              </p>
              <ul className="space-y-3">
                {[
                  { tip: "Rough is perfect",     detail: "Write it exactly as you remember it. Don't edit yourself." },
                  { tip: "Name the teller",       detail: "Even just 'my grandmother' makes the story traceable." },
                  { tip: "Include place names",   detail: "Rivers, mountains, village names anchor the story in reality." },
                  { tip: "Use your own language", detail: "Speak or write in any language — AI handles the rest." },
                ].map(({ tip, detail }) => (
                  <li key={tip} className="flex gap-2.5">
                    <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{tip}</p>
                      <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Privacy note */}
            <p className="text-[11px] text-neutral-400 text-center leading-relaxed px-2">
              Stories are preserved publicly in the Katha archive.
              Voice recordings are stored securely and attributed to the teller.
            </p>
          </aside>
        </div>

        {/* ── AI processing skeleton ── */}
        {loading && (
          <div className="mt-8 bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm max-w-3xl">
            <Skeleton className="w-full aspect-[16/7] rounded-none" />
            <div className="p-6 space-y-3">
              <Skeleton className="h-7 w-2/3 rounded-lg" />
              <Skeleton className="h-3.5 w-full rounded-lg" />
              <Skeleton className="h-3.5 w-11/12 rounded-lg" />
              <Skeleton className="h-3.5 w-4/5 rounded-lg" />
              <div className="pt-2 flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
