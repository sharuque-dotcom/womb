"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { packRig, MAX_PRIMS } from "@/lib/fetusRig";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy; // ScreenQuad positions are NDC (-1..1)
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform vec3 uCamPos;
  uniform vec3 uCamRight;
  uniform vec3 uCamUp;
  uniform vec3 uCamFwd;
  uniform float uFovTan;
  uniform float uAspect;
  uniform float uTime;
  uniform float uBeat;      // 0..1 heartbeat envelope
  uniform float uScale;     // global fetus scale
  uniform vec3 uHeart;      // heart position (pre-rotated, unscaled)
  uniform vec4 uEye;        // closed-eye position (xyz, unscaled) + radius
  uniform int uCount;
  uniform vec4 uPrimA[${MAX_PRIMS}]; // xyz + radius
  uniform vec4 uPrimB[${MAX_PRIMS}]; // xyz + blend k
  uniform float uSteps;

  /* ---------- sdf ---------- */

  float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
    vec3 pa = p - a, ba = b - a;
    float bb = dot(ba, ba);
    float h = bb > 1e-6 ? clamp(dot(pa, ba) / bb, 0.0, 1.0) : 0.0;
    return length(pa - ba * h) - r;
  }

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  // cheap 3d value noise for organic surface detail
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  float mapBody(vec3 p) {
    // gentle breathing / drift so the body feels alive
    p.y += sin(uTime * 0.45) * 0.02;
    p /= uScale;
    float d = 1e5;
    for (int i = 0; i < ${MAX_PRIMS}; i++) {
      if (i >= uCount) break;
      vec4 A = uPrimA[i];
      vec4 B = uPrimB[i];
      float di = sdCapsule(p, A.xyz, B.xyz, A.w);
      d = smin(d, di, max(B.w, 1e-4));
    }
    return d * uScale;
  }

  float map(vec3 p) {
    float d = mapBody(p);
    // organic micro-relief only near the surface (cheap when far)
    if (abs(d) < 0.06) {
      d += (vnoise(p * 18.0 + vec3(0.0, uTime * 0.05, 0.0)) - 0.5) * 0.012;
    }
    return d;
  }

  vec3 calcNormal(vec3 p) {
    const float e = 0.0035;
    vec2 k = vec2(1.0, -1.0);
    return normalize(
      k.xyy * map(p + k.xyy * e) +
      k.yyx * map(p + k.yyx * e) +
      k.yxy * map(p + k.yxy * e) +
      k.xxx * map(p + k.xxx * e));
  }

  float calcAO(vec3 p, vec3 n) {
    float occ = 0.0;
    float sca = 1.0;
    for (int i = 1; i <= 4; i++) {
      float h = 0.02 + 0.05 * float(i);
      occ += (h - map(p + n * h)) * sca;
      sca *= 0.65;
    }
    return clamp(1.0 - 2.2 * occ, 0.0, 1.0);
  }

  // approximate light transmission through tissue toward the light
  float thickness(vec3 p, vec3 ldir) {
    float t = 0.0;
    float acc = 0.0;
    for (int i = 1; i <= 5; i++) {
      float h = 0.035 * float(i);
      acc += min(0.0, map(p + ldir * h)); // negative inside
    }
    return clamp(-acc * 6.0, 0.0, 1.0); // 0 thin … 1 thick
  }

  /* ---------- shading ---------- */

  void main() {
    vec3 ro = uCamPos;
    vec3 rd = normalize(uCamFwd + uCamRight * vUv.x * uAspect * uFovTan + uCamUp * vUv.y * uFovTan);

    // bounding sphere cull
    float bound = uScale * 1.35 + 0.25;
    vec3 oc = ro; // sphere at origin
    float bq = dot(oc, rd);
    float cq = dot(oc, oc) - bound * bound;
    float disc = bq * bq - cq;
    if (disc < 0.0) discard;
    float tNear = max(0.0, -bq - sqrt(disc));
    float tFar = -bq + sqrt(disc);

    float t = tNear;
    float minD = 1e5;
    bool hit = false;
    for (int i = 0; i < 128; i++) {
      if (float(i) >= uSteps || t > tFar) break;
      vec3 p = ro + rd * t;
      float d = map(p);
      minD = min(minD, d);
      if (d < 0.0012 * t + 0.0006) { hit = true; break; }
      t += d * 0.9;
    }

    if (!hit) {
      // faint amniotic aura hugging the silhouette
      float aura = exp(-minD * 26.0) * 0.22;
      if (aura < 0.004) discard;
      gl_FragColor = vec4(vec3(1.0, 0.52, 0.38) * aura, aura);
      return;
    }

    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 v = -rd;

    // lights — key raking from upper left, warm rim from behind right
    vec3 keyDir = normalize(vec3(-0.62, 0.72, 0.12));
    vec3 rimDir = normalize(vec3(0.55, 0.05, -0.83));
    vec3 fillDir = normalize(vec3(0.3, -0.5, 0.6));
    vec3 keyCol = vec3(1.0, 0.66, 0.44) * 1.35;
    vec3 rimCol = vec3(1.0, 0.34, 0.22) * 1.1;
    vec3 fillCol = vec3(0.35, 0.10, 0.16);
    vec3 ambCol = vec3(0.10, 0.025, 0.05);

    float ao = calcAO(p, n);
    float aoDeep = ao * ao;

    // skin diffuse with modest wrap
    float ndlKey = clamp((dot(n, keyDir) + 0.25) / 1.25, 0.0, 1.0);
    float ndlFill = clamp(dot(n, fillDir), 0.0, 1.0);
    // rim only on grazing silhouette edges
    float fresRim = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.5);
    float rim = clamp(dot(n, rimDir), 0.0, 1.0) * fresRim;

    // subsurface: thin parts glow through
    float thick = thickness(p, keyDir);
    float sssAmt = pow(1.0 - thick, 2.2);
    vec3 sssCol = vec3(1.0, 0.24, 0.10) * sssAmt;

    // deep vital skin tone, mottled
    float mottle = vnoise(p * 7.0) * 0.6 + vnoise(p * 21.0) * 0.4;
    vec3 albedo = mix(vec3(0.62, 0.26, 0.20), vec3(0.82, 0.44, 0.34), mottle);

    // soft shadow where the closed eye rests
    float eyeD = length(p - uEye.xyz * uScale);
    float eyeR = uEye.w * uScale;
    albedo *= 1.0 - 0.3 * exp(-(eyeD * eyeD) / max(eyeR * eyeR, 1e-5));

    // wet amniotic film
    vec3 h = normalize(keyDir + v);
    float spec = pow(clamp(dot(n, h), 0.0, 1.0), 64.0) * 0.9;

    // heartbeat — warm light from within the chest
    vec3 heartP = uHeart * uScale;
    float hd = length(p - heartP);
    float heartGlow = exp(-hd * hd / (uScale * uScale * 0.045)) * uBeat;
    vec3 heartCol = vec3(1.0, 0.20, 0.10) * heartGlow * (0.5 + sssAmt);

    // slow caustic ripples of light through fluid
    float caustic = 0.5 + 0.5 * sin(p.x * 5.0 + uTime * 0.55) * sin(p.y * 4.2 - uTime * 0.45);
    caustic = 0.8 + caustic * 0.4;

    vec3 col =
        albedo * (keyCol * ndlKey * ndlKey * caustic) * ao
      + albedo * fillCol * ndlFill * aoDeep
      + albedo * ambCol * aoDeep
      + sssCol * (0.25 + 0.75 * ndlKey) * 0.8
      + rimCol * rim * 0.9
      + keyCol * spec * (0.3 + fresRim) * ao
      + heartCol * 1.5;

    // depth fog into the womb dark
    float fog = 1.0 - exp(-(t - tNear) * 0.10);
    col = mix(col, vec3(0.05, 0.012, 0.026), fog * 0.4);

    // gentle filmic curve, keep the darks
    col = col / (col + vec3(0.55));
    col = pow(col, vec3(1.02));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function FetusRaymarch({
  week,
  heartRate,
}: {
  week: number;
  heartRate: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const smoothWeek = useRef(week);
  const { viewport } = useThree();
  const isSmall = viewport.width < 7; // world units at z — rough mobile heuristic

  const uniforms = useMemo(() => {
    const rig = packRig(week);
    return {
      uCamPos: { value: new THREE.Vector3() },
      uCamRight: { value: new THREE.Vector3() },
      uCamUp: { value: new THREE.Vector3() },
      uCamFwd: { value: new THREE.Vector3() },
      uFovTan: { value: 0.5 },
      uAspect: { value: 1 },
      uTime: { value: 0 },
      uBeat: { value: 0 },
      uScale: { value: rig.scale },
      uHeart: { value: new THREE.Vector3(...rig.heart) },
      uEye: { value: new THREE.Vector4(...rig.eye, rig.eyeR) },
      uCount: { value: rig.count },
      uPrimA: { value: Array.from({ length: MAX_PRIMS }, (_, i) => new THREE.Vector4(rig.a[i * 4], rig.a[i * 4 + 1], rig.a[i * 4 + 2], rig.a[i * 4 + 3])) },
      uPrimB: { value: Array.from({ length: MAX_PRIMS }, (_, i) => new THREE.Vector4(rig.b[i * 4], rig.b[i * 4 + 1], rig.b[i * 4 + 2], rig.b[i * 4 + 3])) },
      uSteps: { value: 96 },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(({ camera, clock, size }, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    const u = mat.uniforms;

    // ease the displayed week toward the target for buttery morphs
    const k = 1 - Math.exp(-4.5 * Math.min(0.05, delta));
    smoothWeek.current += (week - smoothWeek.current) * Math.min(1, k * 4);
    if (Math.abs(week - smoothWeek.current) < 0.002) smoothWeek.current = week;

    const rig = packRig(smoothWeek.current);
    u.uScale.value = rig.scale;
    (u.uHeart.value as THREE.Vector3).set(...rig.heart);
    (u.uEye.value as THREE.Vector4).set(rig.eye[0], rig.eye[1], rig.eye[2], rig.eyeR);
    u.uCount.value = rig.count;
    const A = u.uPrimA.value as THREE.Vector4[];
    const B = u.uPrimB.value as THREE.Vector4[];
    for (let i = 0; i < MAX_PRIMS; i++) {
      A[i].set(rig.a[i * 4], rig.a[i * 4 + 1], rig.a[i * 4 + 2], rig.a[i * 4 + 3]);
      B[i].set(rig.b[i * 4], rig.b[i * 4 + 1], rig.b[i * 4 + 2], rig.b[i * 4 + 3]);
    }

    // camera basis
    const persp = camera as THREE.PerspectiveCamera;
    camera.updateMatrixWorld();
    const e = camera.matrixWorld.elements;
    (u.uCamRight.value as THREE.Vector3).set(e[0], e[1], e[2]).normalize();
    (u.uCamUp.value as THREE.Vector3).set(e[4], e[5], e[6]).normalize();
    (u.uCamFwd.value as THREE.Vector3).set(-e[8], -e[9], -e[10]).normalize();
    (u.uCamPos.value as THREE.Vector3).copy(camera.position);
    u.uFovTan.value = Math.tan((persp.fov * Math.PI) / 360);
    u.uAspect.value = size.width / size.height;

    const t = clock.getElapsedTime();
    u.uTime.value = t;
    u.uSteps.value = isSmall ? 64 : 96;

    // heartbeat envelope: sharp lub, softer dub
    if (heartRate > 0) {
      const phase = (t * heartRate) / 60;
      const f = phase - Math.floor(phase);
      const lub = Math.exp(-Math.pow((f - 0.06) * 9.0, 2));
      const dub = Math.exp(-Math.pow((f - 0.34) * 11.0, 2)) * 0.55;
      u.uBeat.value = Math.min(1, lub + dub);
    } else {
      u.uBeat.value = 0.12 + 0.08 * Math.sin(t * 2);
    }
  });

  return (
    <mesh frustumCulled={false} renderOrder={10}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
