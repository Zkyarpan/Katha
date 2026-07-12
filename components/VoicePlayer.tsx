"use client";

import { useRef, useState, useEffect } from "react";
import { Mic, Play, Pause, Headphones } from "lucide-react";

interface VoicePlayerProps {
  url: string;
  tellerName: string;
}

export default function VoicePlayer({ url, tellerName }: VoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef   = useRef<number>(0);

  const [playing,  setPlaying]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [current,  setCurrent]  = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready,    setReady]    = useState(false);

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  };

  const tick = () => {
    const el = audioRef.current;
    if (!el) return;
    setCurrent(el.currentTime);
    setProgress(el.duration ? el.currentTime / el.duration : 0);
    if (!el.paused) rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onLoaded = () => { setDuration(el.duration); setReady(true); };
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

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play(); else el.pause();
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    const t = parseFloat(e.target.value) * el.duration;
    el.currentTime = t;
    setProgress(parseFloat(e.target.value));
    setCurrent(t);
  };

  return (
    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 overflow-hidden">
      <audio ref={audioRef} src={url} preload="metadata" />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-purple-100">
        <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
          <Mic size={13} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-purple-900 uppercase tracking-widest">
            Original Voice
          </p>
          <p className="text-[11px] text-purple-500 mt-0.5">
            {tellerName}
          </p>
        </div>
        <Headphones size={14} className="text-purple-300 ml-auto" />
      </div>

      {/* Player */}
      <div className="px-4 pb-4 pt-3">
        {/* Waveform-style progress track */}
        <div className="relative mb-3">
          <div className="flex items-end gap-[2px] h-8 mb-2 overflow-hidden">
            {Array.from({ length: 48 }).map((_, i) => {
              const h = 20 + Math.sin(i * 0.7) * 14 + Math.sin(i * 1.3) * 8;
              const filled = (i / 48) <= progress;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-colors duration-100"
                  style={{
                    height: `${h}px`,
                    background: filled ? "#9333ea" : "#e9d5ff",
                  }}
                />
              );
            })}
          </div>
          <input
            type="range"
            min={0} max={1} step={0.001}
            value={progress}
            onChange={seek}
            disabled={!ready}
            className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            disabled={!ready}
            className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 flex items-center justify-center text-white transition-all shadow-sm active:scale-95 flex-shrink-0"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing
              ? <Pause size={14} />
              : <Play  size={14} className="ml-0.5" />
            }
          </button>

          {/* Time */}
          <div className="flex-1 flex justify-between items-center">
            <span className="text-xs font-mono text-purple-500">{fmt(current)}</span>
            <span className="text-xs font-mono text-purple-300">{fmt(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
