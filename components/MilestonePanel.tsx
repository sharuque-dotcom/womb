"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getWeek, getBiometry } from "@/lib/weeks";
import type { ViewMode } from "./ModeToggle";

export default function MilestonePanel({
  week,
  mode,
}: {
  week: number;
  mode: ViewMode;
}) {
  const data = getWeek(week);
  const bio = getBiometry(week);

  return (
    <div className="relative min-h-[150px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${data.week}-${mode}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {mode === "patient" ? (
            <>
              <h2 className="font-display text-2xl text-ember-300 italic sm:text-3xl">
                {data.patientTitle}
              </h2>
              <ul className="mt-3 space-y-2.5">
                {data.patientFacts.map((fact, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.12 }}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-white/75 sm:text-[15px]"
                  >
                    <span className="mt-0.5 text-ember-400" aria-hidden>
                      ✦
                    </span>
                    {fact}
                  </motion.li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-lg font-semibold text-white sm:text-xl">
                  GA {data.week}⁺⁰ weeks
                </h2>
                <span className="text-xs text-white/45">
                  Trimester {data.trimester}
                </span>
              </div>

              {/* biometry chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip label={data.lengthLabel} value={`${data.lengthCm.toFixed(1)} cm`} />
                <Chip label="EFW" value={bio.efwG < 1000 ? `${bio.efwG} g` : `${(bio.efwG / 1000).toFixed(2)} kg`} />
                {bio.bpdMm !== null && <Chip label="BPD" value={`${bio.bpdMm} mm`} />}
                {bio.hcMm !== null && <Chip label="HC" value={`${bio.hcMm} mm`} />}
                {bio.flMm !== null && <Chip label="FL" value={`${bio.flMm} mm`} />}
                {data.heartRate > 0 && <Chip label="FHR" value={`${data.heartRate} bpm`} />}
              </div>

              <ul className="mt-3.5 space-y-2">
                {data.clinicalNotes.map((note, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.12 }}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-white/75"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400/80" aria-hidden />
                    {note}
                  </motion.li>
                ))}
              </ul>

              {data.scan && (
                <div className="mt-3.5 inline-flex items-center gap-2 rounded-xl border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-xs font-medium text-sky-200">
                  <span aria-hidden>🩺</span> {data.scan}
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-2.5 py-1.5">
      <span className="text-[10px] font-semibold tracking-wider text-white/45 uppercase">
        {label}
      </span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </span>
  );
}
