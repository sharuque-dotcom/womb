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

  // Autoplay: advance one week every ~1.1s.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const weekRef = useRef(week);
  weekRef.current = week;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const next = weekRef.current + 1;
      if (next > MAX_WEEK) {
        onTogglePlay();
      } else {
        onChangeRef.current(next);
      }
    }, 1100);
    return () => clearInterval(id);
  }, [playing, onTogglePlay]);

  return (
    <div className="w-full">
      {/* trimester chips */}
      <div className="mb-3 flex items-center justify-center gap-2">
        {TRIMESTERS.map((t) => {
          const active = data.trimester === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.from)}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-medium tracking-wide uppercase transition-all sm:text-xs ${
                active
                  ? "bg-ember-500 text-white shadow-[0_0_18px_rgba(242,112,89,0.55)]"
                  : "bg-white/8 text-white/55 hover:bg-white/15 hover:text-white/80"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* play / pause the growth journey */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onTogglePlay}
          aria-label={playing ? "Pause growth journey" : "Play growth journey"}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ember-400 to-ember-500 text-white shadow-[0_0_24px_rgba(242,112,89,0.6)] transition-transform hover:scale-105"
        >
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="2.5" y="2" width="4" height="12" rx="1.2" />
              <rect x="9.5" y="2" width="4" height="12" rx="1.2" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2.8c0-.9 1-1.5 1.8-1L13.2 7a1.2 1.2 0 0 1 0 2l-7.4 5.2c-.8.5-1.8-.1-1.8-1V2.8z" />
            </svg>
          )}
        </motion.button>

        <div className="relative flex-1">
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
          <div className="mt-1.5 flex justify-between text-[10px] font-medium tracking-wider text-white/35">
            <span>WK {MIN_WEEK}</span>
            <span>WK 13</span>
            <span>WK 27</span>
            <span>WK {MAX_WEEK}</span>
          </div>
        </div>

        {/* big week readout */}
        <div className="w-[76px] shrink-0 text-center sm:w-[88px]">
          <div className="font-display text-4xl leading-none text-ember-300 sm:text-5xl">
            {week}
          </div>
          <div className="text-[10px] font-semibold tracking-[0.2em] text-white/45 uppercase">
            weeks
          </div>
        </div>
      </div>
    </div>
  );
}
