"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MIN_WEEK, MAX_WEEK, TRIMESTERS, getWeek } from "@/lib/weeks";

export default function WeekScrubber({
  week,
  onChange,
  playing,
  onTogglePlay,
}: {
  week: number;
  onChange: (week: number) => void;
  playing: boolean;
  onTogglePlay: () => void;
}) {
  const data = getWeek(week);
  const fill = ((week - MIN_WEEK) / (MAX_WEEK - MIN_WEEK)) * 100;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const weekRef = useRef(week);
  weekRef.current = week;

  // Autoplay: one week per ~1.4s — slow enough to watch the morph.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const next = weekRef.current + 1;
      if (next > MAX_WEEK) {
        onTogglePlay();
      } else {
        onChangeRef.current(next);
      }
    }, 1400);
    return () => clearInterval(id);
  }, [playing, onTogglePlay]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-4">
        {/* play / pause */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onTogglePlay}
          aria-label={playing ? "Pause growth journey" : "Play growth journey"}
          className="hud-panel flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-hud-400 transition-colors hover:text-white"
        >
          {playing ? (
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <rect x="2.5" y="2" width="4" height="12" rx="1" />
              <rect x="9.5" y="2" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2.8c0-.9 1-1.5 1.8-1L13.2 7a1.2 1.2 0 0 1 0 2l-7.4 5.2c-.8.5-1.8-.1-1.8-1V2.8z" />
            </svg>
          )}
        </motion.button>

        <div className="relative flex-1 pt-1">
          <input
            type="range"
            min={MIN_WEEK}
            max={MAX_WEEK}
            step={1}
            value={week}
            onChange={(e) => onChange(Number(e.target.value))}
            className="week-slider"
            style={{ "--fill": `${fill}%` } as React.CSSProperties}
            aria-label="Pregnancy week"
          />
          {/* trimester tick labels */}
          <div className="mt-2 flex justify-between">
            {TRIMESTERS.map((t) => (
              <button
                key={t.id}
                onClick={() => onChange(t.from)}
                className={`text-[9px] font-semibold tracking-[0.2em] uppercase transition-colors ${
                  data.trimester === t.id ? "text-hud-400" : "text-white/30 hover:text-white/60"
                }`}
              >
                T{t.id}
              </button>
            ))}
            <span className="text-[9px] font-semibold tracking-[0.2em] text-white/30 uppercase">
              Birth
            </span>
          </div>
        </div>

        {/* week readout */}
        <div className="w-[72px] shrink-0 text-right tabular-nums">
          <div className="text-3xl font-light text-white sm:text-4xl">
            {String(week).padStart(2, "0")}
          </div>
          <div className="hud-label">weeks</div>
        </div>
      </div>
    </div>
  );
}
