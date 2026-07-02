"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getWeek, MIN_WEEK, MAX_WEEK } from "@/lib/weeks";
import { StageDefs, STAGE_COMPONENTS } from "./FetusStages";

/** Floating particle ambience drawn on canvas. */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    interface P {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      hue: number;
      alpha: number;
      phase: number;
    }
    let particles: P[] = [];

    function resize() {
      if (!canvas) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(90, Math.floor((width * height) / 14000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.6 + Math.random() * 2.4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.05 - Math.random() * 0.22,
        hue: 10 + Math.random() * 30,
        alpha: 0.12 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let t = 0;
    function frame() {
      t += 0.016;
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx + Math.sin(t * 0.6 + p.phase) * 0.08;
        p.y += p.vy;
        if (p.y < -6) {
          p.y = height + 6;
          p.x = Math.random() * width;
        }
        if (p.x < -6) p.x = width + 6;
        if (p.x > width + 6) p.x = -6;
        const twinkle = 0.65 + 0.35 * Math.sin(t * 1.4 + p.phase);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${p.hue}, 85%, 78%, ${p.alpha * twinkle})`;
        ctx!.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    if (!reduceMotion) raf = requestAnimationFrame(frame);
    else {
      // draw one static frame
      t = 1;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 78%, ${p.alpha})`;
        ctx.fill();
      }
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}

export default function WombScene({ week }: { week: number }) {
  const data = getWeek(week);
  const Stage = STAGE_COMPONENTS[data.stage];

  // Gentle non-linear growth so the early embryo remains visible.
  const progress = (data.week - MIN_WEEK) / (MAX_WEEK - MIN_WEEK);
  const scale = 0.34 + 0.66 * Math.pow(progress, 0.72);

  const beatDuration = data.heartRate > 0 ? 60 / data.heartRate : 0;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* deep womb gradient backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, #542457 0%, #3a1a45 34%, #241031 62%, #160a1e 100%)",
        }}
      />
      {/* soft light rays */}
      <div
        className="absolute inset-0 opacity-50 animate-rays"
        style={{
          background:
            "conic-gradient(from 210deg at 50% 30%, transparent 0deg, rgba(255,158,125,0.10) 18deg, transparent 42deg, rgba(255,143,163,0.08) 78deg, transparent 110deg, rgba(255,158,125,0.07) 200deg, transparent 240deg)",
        }}
      />
      <ParticleField />

      {/* amniotic sac rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="rounded-full border border-rose-glow/15"
          style={{ width: "min(84vw, 62vh)", height: "min(84vw, 62vh)" }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full border border-ember-400/20"
          style={{ width: "min(70vw, 52vh)", height: "min(70vw, 52vh)" }}
          animate={{ scale: [1.02, 0.99, 1.02] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* warm halo behind baby */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "min(58vw, 44vh)",
            height: "min(58vw, 44vh)",
            background:
              "radial-gradient(circle, rgba(255,158,125,0.28) 0%, rgba(255,143,163,0.10) 55%, transparent 75%)",
          }}
          animate={
            beatDuration > 0
              ? { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }
              : { scale: [1, 1.02, 1] }
          }
          transition={{
            duration: beatDuration > 0 ? beatDuration : 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* the baby */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 1.6, 0, -1.4, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: "min(78vw, 58vh)", height: "min(78vw, 58vh)" }}
        >
          <AnimatePresence mode="popLayout">
            <motion.svg
              key={data.stage}
              viewBox="0 0 200 200"
              className="h-full w-full"
              initial={{ opacity: 0, scale: scale * 0.9, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: scale * 1.06, filter: "blur(6px)" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              role="img"
              aria-label={`Illustration of your baby at week ${data.week}`}
            >
              <StageDefs />
              <circle cx="100" cy="100" r="96" fill="url(#sac)" />
              <Stage />
            </motion.svg>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(100% 100% at 50% 45%, transparent 55%, rgba(22,10,30,0.55) 82%, rgba(22,10,30,0.92) 100%)",
        }}
      />
    </div>
  );
}
