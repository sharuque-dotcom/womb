"use client";

import { useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { WEEKS, MIN_WEEK, MAX_WEEK, getWeek } from "@/lib/weeks";
import type { ViewMode } from "./ModeToggle";

/* Palette validated with the dataviz six-checks validator against surface #241031:
   length #e0663d · weight #149b8c — lightness band, chroma, CVD ΔE 35.3, contrast all PASS. */
const LENGTH_COLOR = "#e0663d";
const WEIGHT_COLOR = "#149b8c";

const W = 560;
const H = 120;
const PAD = { l: 40, r: 14, t: 14, b: 20 };

function scaleX(week: number) {
  return PAD.l + ((week - MIN_WEEK) / (MAX_WEEK - MIN_WEEK)) * (W - PAD.l - PAD.r);
}

function buildPath(values: number[], max: number): string {
  return values
    .map((v, i) => {
      const x = scaleX(MIN_WEEK + i);
      const y = H - PAD.b - (v / max) * (H - PAD.t - PAD.b);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function MiniChart({
  title,
  unit,
  values,
  color,
  week,
  format,
  gridValues,
  onScrub,
  band,
}: {
  title: string;
  unit: string;
  values: number[];
  color: string;
  week: number;
  format: (v: number) => string;
  gridValues: number[];
  onScrub: (week: number) => void;
  band: boolean;
}) {
  const max = Math.max(...values) * 1.08;
  const svgRef = useRef<SVGSVGElement>(null);

  const idx = week - MIN_WEEK;
  const value = values[idx];
  const mx = scaleX(week);
  const my = H - PAD.b - (value / max) * (H - PAD.t - PAD.b);

  const path = buildPath(values, max);

  // ±12% envelope shown in physician view as a stylized percentile band.
  const bandPath =
    buildPath(values.map((v) => v * 1.12), max) +
    " " +
    values
      .map((v, i) => {
        const j = values.length - 1 - i;
        const x = scaleX(MIN_WEEK + j);
        const y = H - PAD.b - ((values[j] * 0.88) / max) * (H - PAD.t - PAD.b);
        return `L ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ") +
    " Z";

  const handlePointer = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (e.buttons === 0 && e.type !== "pointerdown") return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * W;
      const wk = Math.round(
        MIN_WEEK + ((px - PAD.l) / (W - PAD.l - PAD.r)) * (MAX_WEEK - MIN_WEEK)
      );
      onScrub(Math.min(MAX_WEEK, Math.max(MIN_WEEK, wk)));
    },
    [onScrub]
  );

  // Keep the floating value label inside the plot area.
  const labelX = Math.min(Math.max(mx, PAD.l + 34), W - PAD.r - 40);
  const labelAbove = my > 38;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-white/50 uppercase">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />
          {title}
        </span>
        <span className="text-[11px] text-white/35">{unit}</span>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full cursor-crosshair touch-none select-none"
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
        role="img"
        aria-label={`${title} curve; week ${week}: ${format(value)} ${unit}`}
      >
        {/* recessive grid */}
        {gridValues.map((gv) => {
          const y = H - PAD.b - (gv / max) * (H - PAD.t - PAD.b);
          return (
            <g key={gv}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
              <text x={PAD.l - 6} y={y + 3} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.35)">
                {gv >= 1000 ? `${gv / 1000}k` : gv}
              </text>
            </g>
          );
        })}
        {[8, 16, 24, 32, 40].map((wk) => (
          <text key={wk} x={scaleX(wk)} y={H - 6} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.35)">
            {wk}w
          </text>
        ))}

        {/* percentile band (physician view) */}
        {band && <path d={bandPath} fill={color} opacity="0.13" />}

        {/* the curve */}
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* moving week marker */}
        <line x1={mx} x2={mx} y1={PAD.t} y2={H - PAD.b} stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="3 3" />
        <motion.circle
          animate={{ cx: mx, cy: my }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          r="5"
          fill={color}
          stroke="#241031"
          strokeWidth="2"
        />
        {/* direct label at the marker */}
        <motion.g
          animate={{ x: labelX, y: labelAbove ? my - 12 : my + 20 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
        >
          <rect x="-32" y="-11" width="64" height="16" rx="8" fill="rgba(22,10,30,0.85)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <text textAnchor="middle" y="1.5" fontSize="10" fontWeight="600" fill="#f7ede4">
            {format(value)}
          </text>
        </motion.g>
      </svg>
    </div>
  );
}

export default function GrowthChart({
  week,
  mode,
  onScrub,
}: {
  week: number;
  mode: ViewMode;
  onScrub: (week: number) => void;
}) {
  const lengths = WEEKS.map((w) => w.lengthCm);
  const weights = WEEKS.map((w) => w.weightG);
  const data = getWeek(week);

  return (
    <div className="space-y-4">
      <MiniChart
        title="Length"
        unit="cm"
        values={lengths}
        color={LENGTH_COLOR}
        week={data.week}
        format={(v) => `${v.toFixed(1)} cm`}
        gridValues={[10, 25, 40]}
        onScrub={onScrub}
        band={mode === "physician"}
      />
      <MiniChart
        title="Weight"
        unit="grams"
        values={weights}
        color={WEIGHT_COLOR}
        week={data.week}
        format={(v) => (v < 1000 ? `${Math.round(v)} g` : `${(v / 1000).toFixed(2)} kg`)}
        gridValues={[1000, 2000, 3000]}
        onScrub={onScrub}
        band={mode === "physician"}
      />
      {mode === "physician" && (
        <p className="text-[10px] leading-relaxed text-white/35">
          Shaded band: illustrative ±12% growth envelope around population median (demo data — not for clinical use).
        </p>
      )}
    </div>
  );
}
