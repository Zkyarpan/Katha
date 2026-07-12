"use client";

// ---------------------------------------------------------------------------
// components/VoicePlayer.tsx
//
// Plays back the original voice recording of a story.
// Displayed on the story detail page when voice_recording_url is set.
// ---------------------------------------------------------------------------

import { useRef, useState, useEffect } from "react";
import { Mic, Play, Pause, Volume2 } from "lucide-react";

interface VoicePlayerProps {
  url: string;
  tellerName: string;
}

export default function VoicePlayer({ url, tellerName }: VoicePlayerProps) {
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const rafRef    = useRef<number>(0);

  const [playing,  setPlaying]  = useState(false);
  const [progress, setProgress] = useState(0);   // 0–1
  const [current,  setCurrent]  = useState(0);   // seconds
  const [duration, setDuration] = useState(0);   // seconds
  const [ready,    setReady]    = useState(false);

  // ── helpers ──────────────────────────────────────────────────────────────

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const tick = () => {
    const el = audioRef.current;
    if (!el) return;
    setCurrent(el.currentTime);
    setProgress(el.duration ? el.currentTime / el.duration : 0);
    if (!el.paused) rafRef.current = requestAnimationFrame(tick);
  };

  // ── event wiring ─────────────────────────────────────────────────────────

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onLoaded = () => {
      setDuration(el.duration);
      setReady(true);
    };
    const onEnded  = () => { setPlaying(false); setProgress(0); setCurrent(0); };
    const onPause  = () => setPlaying(false);
    const onPlay   = () => { setPlaying(true); rafRef.current = requestAnimationFrame(tick); };

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("ended",          onEnded);
    el.addEventListener("pause",          onPause);
    el.addEventListener("play",           onPlay);

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("ended",          onEnded);
      el.removeEventListener("pause",          onPause);
      el.removeEventListener("play",           onPlay);
      cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── controls ─────────────────────────────────────────────────────────────

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) { el.play(); } else { el.pause(); }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    const t = parseFloat(e.target.value) * el.duration;
    el.currentTime = t;
    setProgress(parseFloat(e.target.value));
    setCurrent(t);
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3">
      {/* Hidden native audio element */}
      <audio ref={audioRef} src={url} preload="metadata" />

      <div className="flex items-center gap-2 mb-2.5">
        <Mic size={12} className="text-purple-500 flex-shrink-0" />
        <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
          Original Voice
        </span>
        <Volume2 size={11} className="text-purple-400 ml-auto" />
      </div>

      <p className="text-xs text-purple-600 mb-3 leading-relaxed">
        Hear {tellerName} tell this story in their own words.
      </p>

      {/* Controls row */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          disabled={!ready}
          className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 flex items-center justify-center text-white transition-colors flex-shrink-0"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing
            ? <Pause size={13} className="ml-0" />
            : <Play  size={13} className="ml-0.5" />
          }
        </button>

        {/* Scrubber */}
        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={seek}
            disabled={!ready}
            className="flex-1 h-1.5 rounded-full accent-purple-600 cursor-pointer disabled:opacity-40"
            style={{
              background: `linear-gradient(to right, #9333ea ${progress * 100}%, #e9d5ff ${progress * 100}%)`,
            }}
          />
          <span className="text-[11px] text-purple-500 tabular-nums w-[60px] text-right flex-shrink-0">
            {fmt(current)} / {fmt(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
