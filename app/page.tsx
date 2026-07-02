"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import WombScene from "@/components/WombScene";
import WeekScrubber from "@/components/WeekScrubber";
import VitalsPanel from "@/components/VitalsPanel";
import MilestonePanel from "@/components/MilestonePanel";
import GrowthChart from "@/components/GrowthChart";
import ModeToggle, { type ViewMode } from "@/components/ModeToggle";
import { getWeek, MIN_WEEK } from "@/lib/weeks";

const WombCanvas = dynamic(() => import("@/components/three/WombCanvas"), {
  ssr: false,
});

function useWebGL(): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setOk(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

export default function Home() {
  const [week, setWeek] = useState(12);
  const [mode, setMode] = useState<ViewMode>("patient");
  const [playing, setPlaying] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const webgl = useWebGL();

  const data = getWeek(week);

  const togglePlay = useCallback(() => {
    setPlaying((p) => {
      if (!p && week >= 40) setWeek(MIN_WEEK);
      return !p;
    });
  }, [week]);

  const scrub = useCallback((w: number) => {
    setPlaying(false);
    setWeek(w);
  }, []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-womb-950">
      {/* ---------- the scene ---------- */}
      <div className="absolute inset-0">
        {webgl === false ? (
          <WombScene week={week} />
        ) : webgl === true ? (
          <WombCanvas week={week} heartRate={data.heartRate} />
        ) : null}
      </div>

      {/* ---------- physician scan overlay ---------- */}
      {mode === "physician" && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
          <div className="scan-sweep" />
          {/* biometry measurement callout */}
          <div className="absolute top-[26%] bottom-[34%] left-[63%] hidden lg:block">
            <div className="h-full w-px border-l border-dashed border-hud-400/50" />
            <div className="absolute -top-px left-1/2 h-px w-3 -translate-x-1/2 bg-hud-400/60" />
            <div className="absolute -bottom-px left-1/2 h-px w-3 -translate-x-1/2 bg-hud-400/60" />
            <div className="hud-panel absolute top-1/2 left-3 -translate-y-1/2 rounded-lg px-2.5 py-1.5 whitespace-nowrap">
              <span className="text-[9px] font-semibold tracking-[0.18em] text-hud-300 uppercase">
                {data.lengthLabel}
              </span>
              <span className="ml-2 text-xs font-semibold text-white tabular-nums">
                {data.lengthCm.toFixed(1)} cm
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ---------- header ---------- */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4 sm:p-6">
        <div>
          <div className="text-sm font-light tracking-[0.42em] text-white/90 uppercase">
            Womb
          </div>
          <div className="hud-label mt-1">Prenatal digital twin</div>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <ModeToggle mode={mode} onChange={setMode} />
        </div>
      </header>

      {/* ---------- gestational age readout (left edge) ---------- */}
      <div className="pointer-events-none absolute top-1/2 left-4 z-10 hidden -translate-y-1/2 lg:block">
        <div className="hud-label">Gestational age</div>
        <div className="mt-1 text-6xl font-extralight text-white tabular-nums">
          {String(data.week).padStart(2, "0")}
          <span className="ml-2 text-lg text-white/40">wk</span>
        </div>
        <div className="mt-2 h-px w-24 bg-gradient-to-r from-hud-400/70 to-transparent" />
        <div
          key={data.week}
          className="anim-rise mt-2 max-w-[200px] font-display text-xl text-ember-300/90 italic"
        >
          {data.patientTitle}
        </div>
      </div>

      {/* ---------- insight drawer (right, desktop) ---------- */}
      <aside className="hud-scroll absolute top-20 right-4 bottom-36 z-20 hidden w-[360px] flex-col gap-3 overflow-y-auto lg:flex">
        <div className="hud-panel rounded-2xl p-5">
          <MilestonePanel week={week} mode={mode} />
        </div>
        <div className="hud-panel rounded-2xl p-5">
          <div className="hud-label mb-3">Growth journey</div>
          <GrowthChart week={week} mode={mode} onScrub={scrub} />
        </div>
        <p className="px-2 text-[9px] leading-relaxed text-white/25">
          Concept demo · illustrative data from published growth references · not a medical
          device.
        </p>
      </aside>

      {/* ---------- mobile insight sheet ---------- */}
      <div className="absolute inset-x-0 bottom-0 z-20 lg:hidden">
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              className="hud-panel hud-scroll mx-3 mb-2 max-h-[46dvh] overflow-y-auto rounded-2xl p-4"
            >
              <MilestonePanel week={week} mode={mode} />
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="hud-label mb-3">Growth journey</div>
                <GrowthChart week={week} mode={mode} onScrub={scrub} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2 px-3 pb-3">
          <div className="flex items-end justify-between gap-2">
            {/* mobile week headline */}
            <div
              key={`${data.week}-${mode}`}
              className="anim-rise min-w-0 pl-1 font-display text-lg text-ember-300/90 italic"
            >
              {mode === "patient" ? data.patientTitle : `GA ${data.week} wks · T${data.trimester}`}
            </div>
            <button
              onClick={() => setDrawerOpen((o) => !o)}
              className="hud-panel shrink-0 rounded-full px-4 py-2 text-[10px] font-semibold tracking-[0.18em] text-hud-400 uppercase"
              aria-expanded={drawerOpen}
            >
              {drawerOpen ? "Close" : "Details"}
            </button>
          </div>
          <VitalsPanel week={week} />
          <div className="hud-panel rounded-2xl px-4 py-3">
            <WeekScrubber week={week} onChange={scrub} playing={playing} onTogglePlay={togglePlay} />
          </div>
        </div>
      </div>

      {/* ---------- desktop bottom bar ---------- */}
      <div className="absolute inset-x-0 bottom-0 z-10 hidden p-6 lg:block">
        <div className="mx-auto flex max-w-4xl flex-col gap-3">
          <VitalsPanel week={week} />
          <div className="hud-panel rounded-2xl px-5 py-4">
            <WeekScrubber week={week} onChange={scrub} playing={playing} onTogglePlay={togglePlay} />
          </div>
        </div>
      </div>
    </main>
  );
}
