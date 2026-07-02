"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { getWeek } from "@/lib/weeks";

/** Smoothly animated numeric readout. */
function AnimatedNumber({
  value,
  format,
}: {
  value: number;
  format: (v: number) => string;
}) {
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 90, damping: 20 });
  const text = useTransform(spring, (v) => format(v));
  useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}

/** Synthesized "lub-dub" fetal heartbeat via WebAudio — no audio files needed. */
function useHeartbeatAudio(bpm: number, enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled || bpm <= 0) return;

    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!ctxRef.current) ctxRef.current = new Ctx();
    const ctx = ctxRef.current;
    void ctx.resume();

    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    const thump = (time: number, freq: number, gainPeak: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.55, time + 0.12);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(gainPeak, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.2);
    };

    const beat = () => {
      if (stopped) return;
      const now = ctx.currentTime;
      thump(now, 95, 0.5); // lub
      thump(now + 0.18, 75, 0.32); // dub
      timer = setTimeout(beat, (60 / bpm) * 1000);
    };
    beat();

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [bpm, enabled]);

  useEffect(
    () => () => {
      void ctxRef.current?.close();
    },
    []
  );
}

export default function VitalsPanel({ week }: { week: number }) {
  const data = getWeek(week);
  const [sound, setSound] = useState(false);
  useHeartbeatAudio(data.heartRate, sound);

  const beatDuration = data.heartRate > 0 ? 60 / data.heartRate : 0;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
      {/* size / fruit */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 backdrop-blur-md sm:p-4">
        <div className="text-[10px] font-semibold tracking-[0.18em] text-white/40 uppercase">
          Size of a
        </div>
        <div className="mt-1 flex items-center gap-2">
          <motion.span
            key={data.fruit.emoji + data.week}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
            className="text-2xl sm:text-3xl"
            aria-hidden
          >
            {data.fruit.emoji}
          </motion.span>
          <span className="text-sm leading-tight font-medium text-ember-300 sm:text-base">
            {data.fruit.name}
          </span>
        </div>
      </div>

      {/* length */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 backdrop-blur-md sm:p-4">
        <div className="text-[10px] font-semibold tracking-[0.18em] text-white/40 uppercase">
          Length · {data.lengthLabel === "CRL" ? "head→bottom" : "head→heel"}
        </div>
        <div className="mt-1 text-xl font-semibold text-white sm:text-2xl">
          <AnimatedNumber
            value={data.lengthCm}
            format={(v) => (v < 1 ? `${(v * 10).toFixed(0)} mm` : `${v.toFixed(1)} cm`)}
          />
        </div>
      </div>

      {/* weight */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 backdrop-blur-md sm:p-4">
        <div className="text-[10px] font-semibold tracking-[0.18em] text-white/40 uppercase">
          Weight
        </div>
        <div className="mt-1 text-xl font-semibold text-white sm:text-2xl">
          <AnimatedNumber
            value={data.weightG}
            format={(v) =>
              v < 1 ? "< 1 g" : v < 1000 ? `${Math.round(v)} g` : `${(v / 1000).toFixed(2)} kg`
            }
          />
        </div>
      </div>

      {/* heartbeat */}
      <button
        onClick={() => data.heartRate > 0 && setSound((s) => !s)}
        className={`group rounded-2xl border p-3.5 text-left backdrop-blur-md transition-colors sm:p-4 ${
          sound
            ? "border-ember-500/60 bg-ember-500/15"
            : "border-white/10 bg-white/[0.05] hover:bg-white/[0.09]"
        }`}
        aria-pressed={sound}
        aria-label={
          data.heartRate > 0
            ? `Heartbeat ${data.heartRate} beats per minute. ${sound ? "Mute" : "Play"} heartbeat sound`
            : "Heart not yet beating"
        }
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-[0.18em] text-white/40 uppercase">
            Heartbeat
          </span>
          <span className="text-[10px] text-white/35">{sound ? "🔊" : "🔈"}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {data.heartRate > 0 ? (
            <>
              <motion.span
                animate={{ scale: [1, 1.35, 1] }}
                transition={{ duration: beatDuration, repeat: Infinity, ease: "easeOut" }}
                className="text-xl text-[#f25c54] sm:text-2xl"
                aria-hidden
              >
                ♥
              </motion.span>
              <span className="text-xl font-semibold text-white sm:text-2xl">
                <AnimatedNumber value={data.heartRate} format={(v) => `${Math.round(v)}`} />
              </span>
              <span className="text-[11px] text-white/40">bpm</span>
            </>
          ) : (
            <span className="text-sm text-white/50">forming…</span>
          )}
        </div>
        {data.heartRate > 0 && (
          <div className="mt-0.5 text-[10px] text-white/35 group-hover:text-ember-300/80">
            tap to {sound ? "mute" : "listen"}
          </div>
        )}
      </button>
    </div>
  );
}
