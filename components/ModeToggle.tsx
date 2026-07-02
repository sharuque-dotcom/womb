"use client";

import { motion } from "framer-motion";

export type ViewMode = "patient" | "physician";

export default function ModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div
      className="relative flex rounded-full border border-white/12 bg-white/[0.06] p-1 backdrop-blur-md"
      role="tablist"
      aria-label="View mode"
    >
      {(["patient", "physician"] as const).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(m)}
            className={`relative z-10 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide capitalize transition-colors sm:px-4 ${
              active ? "text-womb-950" : "text-white/55 hover:text-white/85"
            }`}
          >
            {active && (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 -z-10 rounded-full bg-ember-300 shadow-[0_0_16px_rgba(255,201,168,0.5)]"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {m === "patient" ? "💗 Parent" : "🩺 Physician"}
          </button>
        );
      })}
    </div>
  );
}
