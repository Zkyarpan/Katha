"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [pct, setPct] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const scrollTop  = window.scrollY;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setPct(Math.min(100, Math.max(0, progress)));
      setVisible(scrollTop > 80);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className={`hidden lg:flex flex-col items-center gap-3 fixed right-6 top-1/2 -translate-y-1/2 z-40 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <span className="text-[10px] font-semibold tabular-nums text-neutral-400">
        {Math.round(pct)}%
      </span>
      <div className="relative w-[3px] h-40 rounded-full bg-neutral-200/70 overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-purple-500 to-violet-400 rounded-full transition-[height] duration-150 ease-out"
          style={{ height: `${pct}%` }}
        />
      </div>
    </div>
  );
}
