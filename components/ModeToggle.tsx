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
      className="hud-panel relative flex rounded-full p-0.5"
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
            className={`relative z-10 rounded-full px-4 py-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase transition-colors sm:px-5 ${
              active ? "text-womb-950" : "text-white/50 hover:text-white/85"
            }`}
          >
            {active && (
              <motion.span
                layoutId="mode-pill"
                className="absolute inset-0 -z-10 rounded-full bg-hud-400 shadow-[0_0_18px_rgba(111,214,203,0.45)]"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {m === "patient" ? "Parent" : "Physician"}
          </button>
        );
      })}
    </div>
  );
}
