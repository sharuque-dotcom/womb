/**
 * Parametric rig for the raymarched fetus.
 *
 * The body is a set of capsules (sphere = degenerate capsule) smooth-blended
 * in the shader. Joint positions are hand-tuned keyframes at reference weeks
 * and interpolated per fractional week, so the form morphs continuously from
 * a bean-shaped embryo to a curled full-term baby.
 *
 * Space: baby faces -X, +Y is up, Z is depth (near limbs at +Z).
 * The whole rig fits roughly in a unit sphere before global scale.
 */

export const MAX_PRIMS = 24;

type V3 = [number, number, number];

interface RigFrame {
  week: number;
  /** cranium / occiput / jaw: position + radius */
  cranium: [V3, number];
  occiput: [V3, number];
  jaw: [V3, number];
  /** torso chain */
  neck: V3;
  chest: [V3, number];
  belly: [V3, number];
  pelvis: [V3, number];
  /** tail (early embryo) — radius 0 disables */
  tail: [V3, number];
  /** near arm (z>0); far arm mirrored with offsets */
  shoulder: V3;
  elbow: V3;
  hand: V3;
  armR: number;
  handR: number;
  /** near leg */
  hip: V3;
  knee: V3;
  ankle: V3;
  foot: V3;
  legR: number;
  footR: number;
  /** umbilical cord: 3 points from belly outward */
  cord: [V3, V3, V3];
  cordR: number;
  /** smooth-blend factor (bigger = blobbier, for the embryo) */
  blend: number;
  /** global scale + rotation (deg, around Z) applied on top */
  scale: number;
  rot: number;
  /** where the heart sits (for the emissive glow) */
  heart: V3;
}

/* ------------------------------------------------------------------ */
/* Keyframes                                                          */
/* ------------------------------------------------------------------ */

const KF: RigFrame[] = [
  // ---- week 4 · a tiny bean bud ----
  {
    week: 4,
    cranium: [[-0.1, 0.32, 0], 0.3],
    occiput: [[0.1, 0.34, 0], 0.28],
    jaw: [[-0.2, 0.14, 0], 0.14],
    neck: [0.05, 0.12, 0],
    chest: [[0.16, -0.04, 0], 0.24],
    belly: [[0.14, -0.22, 0], 0.2],
    pelvis: [[0.0, -0.36, 0], 0.14],
    tail: [[-0.18, -0.4, 0], 0.08],
    shoulder: [0.0, 0.05, 0.1],
    elbow: [-0.05, -0.02, 0.12],
    hand: [-0.1, -0.06, 0.12],
    armR: 0.0,
    handR: 0.0,
    hip: [0.02, -0.3, 0.1],
    knee: [-0.04, -0.34, 0.12],
    ankle: [-0.1, -0.36, 0.12],
    foot: [-0.12, -0.37, 0.12],
    legR: 0.0,
    footR: 0.0,
    cord: [
      [-0.02, -0.3, 0.06],
      [-0.3, -0.5, 0.1],
      [-0.55, -0.75, 0.05],
    ],
    cordR: 0.035,
    blend: 0.22,
    scale: 0.3,
    rot: -14,
    heart: [0.0, -0.02, 0.05],
  },
  // ---- week 6 · C-shaped embryo with tail ----
  {
    week: 6,
    cranium: [[-0.16, 0.4, 0], 0.32],
    occiput: [[0.08, 0.46, 0], 0.3],
    jaw: [[-0.3, 0.2, 0], 0.13],
    neck: [0.02, 0.2, 0],
    chest: [[0.18, 0.04, 0], 0.24],
    belly: [[0.22, -0.2, 0], 0.21],
    pelvis: [[0.08, -0.4, 0], 0.13],
    tail: [[-0.22, -0.52, 0], 0.06],
    shoulder: [0.0, 0.1, 0.12],
    elbow: [-0.1, 0.02, 0.16],
    hand: [-0.16, -0.02, 0.16],
    armR: 0.045,
    handR: 0.05,
    hip: [0.06, -0.34, 0.11],
    knee: [-0.06, -0.4, 0.15],
    ankle: [-0.14, -0.42, 0.15],
    foot: [-0.17, -0.43, 0.15],
    legR: 0.04,
    footR: 0.045,
    cord: [
      [0.0, -0.32, 0.08],
      [-0.28, -0.55, 0.12],
      [-0.5, -0.85, 0.06],
    ],
    cordR: 0.04,
    blend: 0.16,
    scale: 0.38,
    rot: -12,
    heart: [0.02, 0.0, 0.06],
  },
  // ---- week 9 · embryo → fetus, limbs real, tail gone ----
  {
    week: 9,
    cranium: [[-0.22, 0.46, 0], 0.33],
    occiput: [[0.04, 0.54, 0], 0.3],
    jaw: [[-0.38, 0.26, 0], 0.13],
    neck: [-0.04, 0.26, 0],
    chest: [[0.14, 0.12, 0], 0.25],
    belly: [[0.24, -0.14, 0], 0.24],
    pelvis: [[0.1, -0.38, 0], 0.16],
    tail: [[-0.05, -0.48, 0], 0.0],
    shoulder: [-0.02, 0.16, 0.14],
    elbow: [-0.16, 0.0, 0.18],
    hand: [-0.3, 0.08, 0.18],
    armR: 0.06,
    handR: 0.065,
    hip: [0.1, -0.36, 0.12],
    knee: [-0.12, -0.24, 0.17],
    ankle: [-0.16, -0.46, 0.17],
    foot: [-0.28, -0.5, 0.17],
    legR: 0.06,
    footR: 0.06,
    cord: [
      [0.0, -0.3, 0.1],
      [-0.3, -0.5, 0.16],
      [-0.55, -0.8, 0.08],
    ],
    cordR: 0.045,
    blend: 0.12,
    scale: 0.48,
    rot: -10,
    heart: [0.0, 0.04, 0.07],
  },
  // ---- week 13 · unmistakably a baby ----
  {
    week: 13,
    cranium: [[-0.26, 0.5, 0], 0.32],
    occiput: [[-0.02, 0.58, 0], 0.29],
    jaw: [[-0.4, 0.3, 0], 0.14],
    neck: [-0.08, 0.28, 0],
    chest: [[0.1, 0.16, 0], 0.25],
    belly: [[0.22, -0.12, 0], 0.26],
    pelvis: [[0.1, -0.38, 0], 0.18],
    tail: [[0.0, -0.46, 0], 0.0],
    shoulder: [-0.04, 0.2, 0.15],
    elbow: [-0.2, -0.02, 0.19],
    hand: [-0.38, 0.14, 0.18],
    armR: 0.07,
    handR: 0.07,
    hip: [0.1, -0.36, 0.13],
    knee: [-0.16, -0.16, 0.19],
    ankle: [-0.2, -0.44, 0.19],
    foot: [-0.34, -0.48, 0.19],
    legR: 0.075,
    footR: 0.065,
    cord: [
      [-0.02, -0.28, 0.11],
      [-0.32, -0.5, 0.18],
      [-0.6, -0.78, 0.1],
    ],
    cordR: 0.05,
    blend: 0.09,
    scale: 0.6,
    rot: -8,
    heart: [-0.02, 0.06, 0.08],
  },
  // ---- week 20 · classic curled fetus ----
  {
    week: 20,
    cranium: [[-0.28, 0.5, 0], 0.31],
    occiput: [[-0.04, 0.58, 0], 0.28],
    jaw: [[-0.42, 0.3, 0], 0.15],
    neck: [-0.1, 0.28, 0],
    chest: [[0.1, 0.16, 0], 0.26],
    belly: [[0.22, -0.12, 0], 0.27],
    pelvis: [[0.1, -0.4, 0], 0.2],
    tail: [[0.0, -0.46, 0], 0.0],
    shoulder: [-0.04, 0.2, 0.16],
    elbow: [-0.18, -0.04, 0.21],
    hand: [-0.4, 0.12, 0.19],
    armR: 0.08,
    handR: 0.075,
    hip: [0.1, -0.38, 0.14],
    knee: [-0.2, -0.14, 0.21],
    ankle: [-0.22, -0.46, 0.21],
    foot: [-0.38, -0.5, 0.2],
    legR: 0.09,
    footR: 0.07,
    cord: [
      [-0.04, -0.28, 0.12],
      [-0.36, -0.48, 0.2],
      [-0.66, -0.74, 0.12],
    ],
    cordR: 0.055,
    blend: 0.075,
    scale: 0.78,
    rot: -6,
    heart: [-0.03, 0.07, 0.09],
  },
  // ---- week 28 · filling out ----
  {
    week: 28,
    cranium: [[-0.28, 0.48, 0], 0.32],
    occiput: [[-0.05, 0.56, 0], 0.29],
    jaw: [[-0.42, 0.28, 0], 0.16],
    neck: [-0.1, 0.26, 0],
    chest: [[0.1, 0.14, 0], 0.28],
    belly: [[0.22, -0.14, 0], 0.3],
    pelvis: [[0.1, -0.42, 0], 0.22],
    tail: [[0.0, -0.46, 0], 0.0],
    shoulder: [-0.04, 0.18, 0.17],
    elbow: [-0.2, -0.06, 0.23],
    hand: [-0.42, 0.1, 0.2],
    armR: 0.095,
    handR: 0.085,
    hip: [0.1, -0.4, 0.15],
    knee: [-0.22, -0.14, 0.23],
    ankle: [-0.24, -0.48, 0.23],
    foot: [-0.4, -0.52, 0.21],
    legR: 0.11,
    footR: 0.08,
    cord: [
      [-0.05, -0.3, 0.14],
      [-0.38, -0.5, 0.22],
      [-0.7, -0.72, 0.14],
    ],
    cordR: 0.06,
    blend: 0.065,
    scale: 0.94,
    rot: -4,
    heart: [-0.03, 0.06, 0.1],
  },
  // ---- week 34 · plump, turning head-down ----
  {
    week: 34,
    cranium: [[-0.28, 0.46, 0], 0.33],
    occiput: [[-0.06, 0.54, 0], 0.3],
    jaw: [[-0.42, 0.26, 0], 0.17],
    neck: [-0.1, 0.24, 0],
    chest: [[0.1, 0.12, 0], 0.3],
    belly: [[0.22, -0.16, 0], 0.32],
    pelvis: [[0.1, -0.44, 0], 0.24],
    tail: [[0.0, -0.46, 0], 0.0],
    shoulder: [-0.04, 0.16, 0.18],
    elbow: [-0.22, -0.08, 0.24],
    hand: [-0.44, 0.08, 0.21],
    armR: 0.105,
    handR: 0.09,
    hip: [0.1, -0.42, 0.16],
    knee: [-0.24, -0.16, 0.24],
    ankle: [-0.26, -0.5, 0.24],
    foot: [-0.42, -0.54, 0.22],
    legR: 0.12,
    footR: 0.085,
    cord: [
      [-0.06, -0.32, 0.15],
      [-0.4, -0.52, 0.24],
      [-0.72, -0.7, 0.15],
    ],
    cordR: 0.06,
    blend: 0.06,
    scale: 1.04,
    rot: 86,
    heart: [-0.03, 0.05, 0.11],
  },
  // ---- week 40 · full term, head-down, snug ----
  {
    week: 40,
    cranium: [[-0.27, 0.44, 0], 0.34],
    occiput: [[-0.05, 0.52, 0], 0.31],
    jaw: [[-0.41, 0.24, 0], 0.18],
    neck: [-0.1, 0.22, 0],
    chest: [[0.1, 0.1, 0], 0.32],
    belly: [[0.22, -0.18, 0], 0.34],
    pelvis: [[0.1, -0.46, 0], 0.26],
    tail: [[0.0, -0.46, 0], 0.0],
    shoulder: [-0.04, 0.14, 0.19],
    elbow: [-0.24, -0.1, 0.25],
    hand: [-0.45, 0.06, 0.22],
    armR: 0.115,
    handR: 0.095,
    hip: [0.1, -0.44, 0.17],
    knee: [-0.26, -0.18, 0.25],
    ankle: [-0.28, -0.52, 0.25],
    foot: [-0.44, -0.55, 0.23],
    legR: 0.13,
    footR: 0.09,
    cord: [
      [-0.07, -0.34, 0.16],
      [-0.42, -0.54, 0.25],
      [-0.74, -0.68, 0.16],
    ],
    cordR: 0.06,
    blend: 0.055,
    scale: 1.12,
    rot: 96,
    heart: [-0.03, 0.04, 0.12],
  },
];

/* ------------------------------------------------------------------ */
/* Interpolation                                                      */
/* ------------------------------------------------------------------ */

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function lerp3(a: V3, b: V3, t: number): V3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}
function lerpPR(a: [V3, number], b: [V3, number], t: number): [V3, number] {
  return [lerp3(a[0], b[0], t), lerp(a[1], b[1], t)];
}

function frameAt(week: number): RigFrame {
  const w = Math.min(40, Math.max(4, week));
  let i = 0;
  while (i < KF.length - 2 && KF[i + 1].week <= w) i++;
  const a = KF[i];
  const b = KF[i + 1];
  const raw = (w - a.week) / (b.week - a.week);
  const t = Math.min(1, Math.max(0, raw));
  // smootherstep for organic easing between keyframes
  const s = t * t * (3 - 2 * t);
  return {
    week: w,
    cranium: lerpPR(a.cranium, b.cranium, s),
    occiput: lerpPR(a.occiput, b.occiput, s),
    jaw: lerpPR(a.jaw, b.jaw, s),
    neck: lerp3(a.neck, b.neck, s),
    chest: lerpPR(a.chest, b.chest, s),
    belly: lerpPR(a.belly, b.belly, s),
    pelvis: lerpPR(a.pelvis, b.pelvis, s),
    tail: lerpPR(a.tail, b.tail, s),
    shoulder: lerp3(a.shoulder, b.shoulder, s),
    elbow: lerp3(a.elbow, b.elbow, s),
    hand: lerp3(a.hand, b.hand, s),
    armR: lerp(a.armR, b.armR, s),
    handR: lerp(a.handR, b.handR, s),
    hip: lerp3(a.hip, b.hip, s),
    knee: lerp3(a.knee, b.knee, s),
    ankle: lerp3(a.ankle, b.ankle, s),
    foot: lerp3(a.foot, b.foot, s),
    legR: lerp(a.legR, b.legR, s),
    footR: lerp(a.footR, b.footR, s),
    cord: [
      lerp3(a.cord[0], b.cord[0], s),
      lerp3(a.cord[1], b.cord[1], s),
      lerp3(a.cord[2], b.cord[2], s),
    ],
    cordR: lerp(a.cordR, b.cordR, s),
    blend: lerp(a.blend, b.blend, s),
    scale: lerp(a.scale, b.scale, s),
    rot: lerp(a.rot, b.rot, s),
    heart: lerp3(a.heart, b.heart, s),
  };
}

/* ------------------------------------------------------------------ */
/* Primitive packing for the shader                                   */
/* ------------------------------------------------------------------ */

export interface PackedRig {
  count: number;
  /** vec4: capsule end A (xyz) + radius */
  a: Float32Array;
  /** vec4: capsule end B (xyz) + smooth-blend k */
  b: Float32Array;
  scale: number;
  heart: V3;
  /** head local frame for shader-side face sculpting */
  head: V3;
  headR: number;
  /** direction the face points / head-up / toward the near ear (rotated) */
  faceX: V3;
  faceY: V3;
  faceZ: V3;
  /** facial feature maturity 0..1 (smooth embryo → sculpted face) */
  faceDev: number;
}

function rotZ(p: V3, deg: number): V3 {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
}

/** Turn the whole body slightly toward the camera (+Z). */
function rotY(p: V3, deg: number): V3 {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}

const FACE_TURN = 42; // degrees toward camera

export function packRig(week: number): PackedRig {
  const f = frameAt(week);
  const a = new Float32Array(MAX_PRIMS * 4);
  const b = new Float32Array(MAX_PRIMS * 4);
  let n = 0;

  // tighter global blend keeps limbs/head sculpted instead of blobby
  const K = f.blend * 0.72;
  const xf = (p: V3): V3 => rotY(rotZ(p, f.rot), FACE_TURN);
  const push = (pa: V3, pb: V3, r: number, k = K) => {
    if (n >= MAX_PRIMS || r <= 0.001) return;
    const ra = xf(pa);
    const rb = xf(pb);
    a.set([ra[0], ra[1], ra[2], r], n * 4);
    b.set([rb[0], rb[1], rb[2], k], n * 4);
    n++;
  };
  const sphere = (pr: [V3, number], k = K) => push(pr[0], pr[0], pr[1], k);

  // head — occiput pulled toward the cranium for one smooth skull
  const occPos: V3 = [
    f.occiput[0][0] + (f.cranium[0][0] - f.occiput[0][0]) * 0.3,
    f.occiput[0][1] + (f.cranium[0][1] - f.occiput[0][1]) * 0.3,
    f.occiput[0][2],
  ];
  sphere(f.cranium, K * 1.5);
  push(occPos, occPos, f.occiput[1], K * 1.5);
  sphere(f.jaw, K * 1.5);
  // chin keeps the jawline in the silhouette; finer features (eyes, nose,
  // lips, ears) are sculpted analytically in the shader from the head frame
  const cr = f.cranium[1];
  const cx = f.cranium[0][0];
  const cy = f.cranium[0][1];
  const cz = f.cranium[0][2];
  if (f.armR > 0.05) {
    const chin: V3 = [cx - cr * 0.76, cy - cr * 0.64, cz + cr * 0.04];
    push(chin, chin, cr * 0.13, 0.09);
  }

  // torso chain
  push(f.neck, f.chest[0], f.chest[1]);
  push(f.chest[0], f.belly[0], (f.chest[1] + f.belly[1]) / 2);
  push(f.belly[0], f.pelvis[0], f.pelvis[1]);
  // embryonic tail
  push(f.pelvis[0], f.tail[0], f.tail[1], K * 1.5);

  // limbs pushed a touch outward in depth so they read against the torso
  const out = (p: V3, m: number): V3 => [p[0], p[1], p[2] * m];
  const mirror = (p: V3, squeeze = 1.0): V3 => [p[0], p[1], -p[2] * squeeze];
  const armR = f.armR * 1.22;
  const legR = f.legR * 1.22;

  // near arm + hand
  push(out(f.shoulder, 1.35), out(f.elbow, 1.35), armR);
  push(out(f.elbow, 1.35), out(f.hand, 1.35), armR * 0.85);
  push(out(f.hand, 1.35), out(f.hand, 1.35), f.handR * 1.15);
  // far arm (slimmer, tucked)
  push(mirror(f.shoulder), mirror(f.elbow), armR * 0.85);
  push(mirror(f.elbow), mirror(f.hand), armR * 0.7);
  push(mirror(f.hand), mirror(f.hand), f.handR);
  // near leg
  push(out(f.hip, 1.35), out(f.knee, 1.35), legR);
  push(out(f.knee, 1.35), out(f.ankle, 1.35), legR * 0.78);
  push(out(f.ankle, 1.35), out(f.foot, 1.35), f.footR * 1.1);
  // far leg
  push(mirror(f.hip), mirror(f.knee), legR * 0.85);
  push(mirror(f.knee), mirror(f.ankle), legR * 0.66);
  push(mirror(f.ankle), mirror(f.foot), f.footR * 0.95);

  // umbilical cord — drifts behind the body so it never upstages it
  const cordZ = (p: V3, z: number): V3 => [p[0], p[1], z];
  push(cordZ(f.cord[0], 0.02), cordZ(f.cord[1], -0.16), f.cordR * 0.8, 0.05);
  push(cordZ(f.cord[1], -0.16), cordZ(f.cord[2], -0.34), f.cordR * 0.72, 0.05);

  const heart = xf(f.heart);

  // head local frame (rotation only — directions, not points)
  const rot = (v: V3): V3 => rotY(rotZ(v, f.rot), FACE_TURN);
  const head = xf([cx, cy, cz]);
  const faceX = rot([-1, 0, 0]);
  const faceY = rot([0, 1, 0]);
  const faceZ = rot([0, 0, 1]);
  // features emerge between weeks ~9 and 22
  const dt = Math.min(1, Math.max(0, (f.week - 9) / 13));
  const faceDev = dt * dt * (3 - 2 * dt);

  return {
    count: n,
    a,
    b,
    scale: f.scale,
    heart,
    head,
    headR: cr,
    faceX,
    faceY,
    faceZ,
    faceDev,
  };
}
