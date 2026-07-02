"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import WombScene from "@/components/WombScene";
import WeekScrubber from "@/components/WeekScrubber";
import VitalsPanel from "@/components/VitalsPanel";
import MilestonePanel from "@/components/MilestonePanel";
import GrowthChart from "@/components/GrowthChart";
import ModeToggle, { type ViewMode } from "@/components/ModeToggle";
import { getWeek, MIN_WEEK } from "@/lib/weeks";

export default function Home() {
  const [week, setWeek] = useState(12);
  const [mode, setMode] = useState<ViewMode>("patient");
  const [playing, setPlaying] = useState(false);

  const data = getWeek(week);

  const togglePlay = useCallback(() => {
    setPlaying((p) => {
      if (!p && week >= 40) setWeek(MIN_WEEK); // restart journey from the beginning
      return !p;
    });
  }, [week]);

  const scrub = useCallback((w: number) => {
    setPlaying(false);
    setWeek(w);
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-7xl flex-col lg:h-dvh lg:flex-row lg:overflow-hidden">
      {/* ---------- immersive scene ---------- */}
      <section className="relative h-[52dvh] min-h-[380px] shrink-0 lg:h-full lg:flex-1">
        <WombScene week={week} />

        {/* header overlay */}
        <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5">
          <div>
            <div className="font-display text-2xl leading-none tracking-wide text-white sm:text-3xl">
              womb<span className="text-ember-400">.</span>
            </div>
            <div className="mt-0.5 text-[10px] font-medium tracking-[0.22em] text-white/45 uppercase">
              Baby digital twin
            </div>
          </div>
          <ModeToggle mode={mode} onChange={setMode} />
        </header>

        {/* floating week caption */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
          <motion.div
            key={data.week}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full border border-white/10 bg-womb-950/55 px-4 py-1.5 text-center backdrop-blur-md"
          >
            <span className="text-xs text-white/70 sm:text-sm">
              Week {data.week} · {mode === "patient" ? data.patientTitle : `GA ${data.week} wks · T${data.trimester}`}
            </span>
          </motion.div>
        </div>
      </section>

      {/* ---------- control & insight panel ---------- */}
      <section className="relative z-10 flex-1 rounded-t-3xl border-t border-white/8 bg-womb-950/80 backdrop-blur-xl lg:h-full lg:w-[460px] lg:flex-none lg:overflow-y-auto lg:rounded-none lg:border-t-0 lg:border-l">
        <div className="space-y-6 px-4 py-5 sm:px-6 lg:py-6">
          <WeekScrubber
            week={week}
            onChange={setWeek}
            playing={playing}
            onTogglePlay={togglePlay}
          />

          <VitalsPanel week={week} />

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <MilestonePanel week={week} mode={mode} />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <div className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-white/50 uppercase">
              Growth journey
            </div>
            <GrowthChart week={week} mode={mode} onScrub={scrub} />
          </div>

          <footer className="pb-2 text-center text-[10px] leading-relaxed text-white/30">
            Concept demo · illustrative data based on published growth references ·
            not a medical device. Built for clinician–parent storytelling.
          </footer>
        </div>
      </section>
    </main>
  );
}
