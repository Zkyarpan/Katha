"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { Sparkles, User, BookText, PenLine, Mic, MicOff } from "lucide-react";

// Minimal types for the Web Speech API (not yet in every TS lib.dom.d.ts).
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
  onerror: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export default function NewStoryPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [teller, setTeller] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  // Tracks the committed (final) text added so far during this session,
  // so interim results don't double-append already-confirmed words.
  const committedRef = useRef("");

  // Check browser support only on the client — SpeechRecognition doesn't
  // exist server-side, so this must live inside useEffect.
  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setIsSpeechSupported(!!SR);
  }, []);

  const startListening = () => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // Snapshot of story text before this recording session begins,
    // so we can safely append without clobbering existing content.
    const storyAtStart = story;
    committedRef.current = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      // Accumulate confirmed words for this session.
      committedRef.current += finalTranscript;

      // Show committed + in-progress interim text appended to the original.
      setStory(storyAtStart + committedRef.current + interimTranscript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/clean-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tellerName: teller, rawText: story, locationName: location }),
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
    <div className="min-h-screen">
      <Header />

      <section className="px-6 md:px-12 pb-24 pt-4 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 text-katha-gold text-sm font-medium bg-katha-gold/10 border border-katha-gold/20 px-4 py-1.5 rounded-full mb-5">
            <PenLine size={14} />
            New Story
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-katha-cream glow-text">
            Save a Fading Story
          </h1>
          <p className="text-katha-muted mt-3">
            Don&apos;t worry about making it perfect — rough is okay. AI will
            help clean it up.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-katha-indigoLight/40 border border-katha-plum/40 rounded-2xl p-6 md:p-8 space-y-6"
        >
          {/* Story Title */}
          <div>
            <label className="flex items-center gap-2 text-katha-cream font-medium mb-2">
              <BookText size={16} className="text-katha-gold" />
              Story Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Mountain Spirit of Taplejung"
              className="w-full bg-katha-indigo/60 border border-katha-plum/50 rounded-xl px-4 py-3 text-katha-cream placeholder:text-katha-muted/60 focus:outline-none focus:border-katha-gold/60 transition-colors"
            />
          </div>

          {/* Where is it from */}
          <div>
            <label className="flex items-center gap-2 text-katha-cream font-medium mb-2">
              <PenLine size={16} className="text-katha-gold" />
              Where is this story from?
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Taplejung, Nepal"
              className="w-full bg-katha-indigo/60 border border-katha-plum/50 rounded-xl px-4 py-3 text-katha-cream placeholder:text-katha-muted/60 focus:outline-none focus:border-katha-gold/60 transition-colors"
            />
          </div>

          {/* Who told it */}
          <div>
            <label className="flex items-center gap-2 text-katha-cream font-medium mb-2">
              <User size={16} className="text-katha-gold" />
              Who told you this story?
            </label>
            <input
              type="text"
              required
              value={teller}
              onChange={(e) => setTeller(e.target.value)}
              placeholder="e.g. My Grandmother, Taplejung"
              className="w-full bg-katha-indigo/60 border border-katha-plum/50 rounded-xl px-4 py-3 text-katha-cream placeholder:text-katha-muted/60 focus:outline-none focus:border-katha-gold/60 transition-colors"
            />
          </div>

          {/* The story */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-katha-cream font-medium">
                <Sparkles size={16} className="text-katha-gold" />
                Write the story (rough is okay!)
              </label>

              {/* Mic button — only rendered when SpeechRecognition is available */}
              {isSpeechSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    isListening
                      ? "border-red-400/60 text-red-400 hover:bg-red-400/10"
                      : "border-katha-plum/50 text-katha-muted hover:text-katha-gold hover:border-katha-gold/50"
                  }`}
                >
                  {isListening ? (
                    <>
                      {/* Pulsing red dot while listening */}
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      <MicOff size={14} />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic size={14} />
                      Dictate
                    </>
                  )}
                </button>
              )}
            </div>
            <textarea
              required
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={8}
              placeholder="Tell it the way you remember it..."
              className="w-full bg-katha-indigo/60 border border-katha-plum/50 rounded-xl px-4 py-3 text-katha-cream placeholder:text-katha-muted/60 focus:outline-none focus:border-katha-gold/60 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            icon={<Sparkles size={18} />}
            className="w-full"
          >
            {loading ? "Polishing your story..." : "Save & Clean Up"}
          </Button>
        </form>
      </section>
    </div>
  );
}