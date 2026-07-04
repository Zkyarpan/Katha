"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

// ---------------------------------------------------------------------------
// ReadAloudButton
// Uses the browser's built-in Web Speech API (SpeechSynthesis).
// Safe against SSR — speechSynthesis is only accessed inside event handlers
// and a cleanup effect, never at module load time.
// ---------------------------------------------------------------------------

interface ReadAloudButtonProps {
  text: string;
}

export default function ReadAloudButton({ text }: ReadAloudButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cancel any in-progress speech if the component unmounts (e.g. navigation).
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleClick = () => {
    // Guard: Web Speech API is not available in all environments.
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isSpeaking) {
      // Already speaking — stop.
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Sync state back to false when speech ends naturally or is cancelled.
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 text-katha-muted hover:text-katha-gold text-sm transition-colors"
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
  );
}
