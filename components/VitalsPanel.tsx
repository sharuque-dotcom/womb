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

function Stat({
  label,
  children,
  sub,
}: {
  label: string;
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="hud-label">{label}</div>
      <div className="mt-0.5 truncate text-lg font-light text-white tabular-nums sm:text-xl">
        {children}
      </div>
      {sub && <div className="text-[10px] text-white/35">{sub}</div>}
    </div>
  );
}

export default function VitalsPanel({ week }: { week: number }) {
  const data = getWeek(week);
  const [sound, setSound] = useState(false);
  useHeartbeatAudio(data.heartRate, sound);

  const beatDuration = data.heartRate > 0 ? 60 / data.heartRate : 0;

  return (
    <div className="hud-panel grid grid-cols-4 gap-3 rounded-2xl px-4 py-3 sm:gap-5 sm:px-5">
      <Stat label={data.lengthLabel === "CRL" ? "Length · CRL" : "Length · CHL"}>
        <AnimatedNumber
          value={data.lengthCm}
          format={(v) => (v < 1 ? `${(v * 10).toFixed(0)} mm` : `${v.toFixed(1)} cm`)}
        />
      </Stat>

      <Stat label="Weight">
        <AnimatedNumber
          value={data.weightG}
          format={(v) =>
            v < 1 ? "< 1 g" : v < 1000 ? `${Math.round(v)} g` : `${(v / 1000).toFixed(2)} kg`
          }
        />
      </Stat>

      <Stat label="Size of" sub={undefined}>
        <span className="text-base sm:text-lg">{data.fruit.name}</span>
      </Stat>

      {/* heartbeat with audio toggle */}
      <button
        onClick={() => data.heartRate > 0 && setSound((s) => !s)}
        aria-pressed={sound}
        aria-label={
          data.heartRate > 0
            ? `Heartbeat ${data.heartRate} beats per minute. ${sound ? "Mute" : "Play"} heartbeat sound`
            : "Heart not yet beating"
        }
        className="group min-w-0 text-left"
      >
        <div className="hud-label flex items-center gap-1.5">
          FHR
          <span
            className={`inline-block h-1 w-1 rounded-full ${sound ? "bg-hud-400" : "bg-white/25"}`}
            aria-hidden
          />
        </div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          {data.heartRate > 0 ? (
            <>
              <motion.span
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: beatDuration, repeat: Infinity, ease: "easeOut" }}
                className="text-sm text-[#ff5b4d]"
                aria-hidden
              >
                ●
              </motion.span>
              <span className="text-lg font-light text-white tabular-nums sm:text-xl">
                <AnimatedNumber value={data.heartRate} format={(v) => `${Math.round(v)}`} />
              </span>
              <span className="text-[10px] text-white/35">bpm</span>
            </>
          ) : (
            <span className="text-sm text-white/45">forming</span>
          )}
        </div>
        {data.heartRate > 0 && (
          <div className="text-[9px] tracking-wider text-white/30 uppercase group-hover:text-hud-400/80">
            {sound ? "sound on" : "tap to listen"}
          </div>
        )}
      </button>
    </div>
  );
}
