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
  uniform vec4 uHead;       // head center (xyz, unscaled) + radius
  uniform vec3 uFaceX;      // direction the face points
  uniform vec3 uFaceY;      // head up
  uniform vec3 uFaceZ;      // toward the near ear
  uniform float uFaceDev;   // 0 smooth embryo … 1 sculpted face
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

  // smooth subtraction: carve b out of a
  float smax(float a, float b, float k) {
    float h = clamp(0.5 - 0.5 * (a + b) / k, 0.0, 1.0);
    return mix(a, -b, h) + k * h * (1.0 - h);
  }

  /* head-local coords: x = out of the face, y = up, z = toward near ear.
     All feature measurements are in units of head radius. */
  vec3 headLocal(vec3 p) {
    vec3 d = p - uHead.xyz;
    return vec3(dot(d, uFaceX), dot(d, uFaceY), dot(d, uFaceZ)) / uHead.w;
  }

  /* Sculpt eyes, nose, lips, ears into/onto the head. d is the body SDF
     (unscaled space); returns the refined distance. */
  float sculptFace(vec3 p, float d) {
    float dev = uFaceDev;
    if (dev < 0.05) return d;
    vec3 q = headLocal(p);
    // quick reject: only work near the head
    if (dot(q, q) > 3.2) return d;
    float hr = uHead.w;
    float amp = dev;

    // ---- eyes: soft lid mounds with a closed slit ----
    vec3 eN = vec3(0.74, 0.00, 0.42);   // near eye centre
    vec3 eF = vec3(0.74, 0.00, -0.42);
    float eyeR = 0.22 * amp;
    d = smin(d, (length(q - eN) - eyeR) * hr, 0.055 * hr);
    d = smin(d, (length(q - eF) - eyeR) * hr, 0.055 * hr);
    // lid creases — thin capsules carved across each mound
    vec3 cA = vec3(0.88, -0.04, 0.24);
    vec3 cB = vec3(0.92, -0.07, 0.56);
    float crease = sdCapsule(q, cA, cB, 0.030) * hr - 0.012 * hr * amp;
    d = smax(d, crease, 0.015 * hr);
    vec3 cA2 = vec3(0.88, -0.04, -0.24);
    vec3 cB2 = vec3(0.92, -0.07, -0.56);
    float crease2 = sdCapsule(q, cA2, cB2, 0.030) * hr - 0.012 * hr * amp;
    d = smax(d, crease2, 0.015 * hr);

    // ---- brow ridge, low over the eyes ----
    float brow = sdCapsule(q, vec3(0.80, 0.20, 0.38), vec3(0.80, 0.20, -0.38), 0.08 * amp);
    d = smin(d, brow * hr, 0.11 * hr);

    // ---- nose: bridge, tip and alae ----
    float bridge = sdCapsule(q, vec3(0.82, 0.20, 0.0), vec3(1.00, -0.10, 0.0), 0.085 * amp);
    d = smin(d, bridge * hr, 0.05 * hr);
    float tip = length(q - vec3(1.01, -0.14, 0.0)) - 0.105 * amp;
    d = smin(d, tip * hr, 0.045 * hr);
    float alae = length(vec3(q.x, q.y, abs(q.z)) - vec3(0.94, -0.19, 0.10)) - 0.065 * amp;
    d = smin(d, alae * hr, 0.045 * hr);

    // ---- lips with a mouth line ----
    float lipU = sdCapsule(q, vec3(0.94, -0.36, 0.13), vec3(0.94, -0.36, -0.13), 0.055 * amp);
    d = smin(d, lipU * hr, 0.04 * hr);
    float lipL = sdCapsule(q, vec3(0.90, -0.46, 0.11), vec3(0.90, -0.46, -0.11), 0.050 * amp);
    d = smin(d, lipL * hr, 0.04 * hr);
    float mouth = sdCapsule(q, vec3(0.97, -0.41, 0.12), vec3(0.97, -0.41, -0.12), 0.022) * hr
      - 0.010 * hr * amp;
    d = smax(d, mouth, 0.012 * hr);

    // ---- near ear: small disc with a crescent fold ----
    vec3 earC = vec3(-0.10, -0.04, 0.94);
    float ear = length(q - earC) - 0.21 * amp;
    d = smin(d, ear * hr, 0.05 * hr);
    float fold = (length(q - vec3(-0.06, -0.02, 1.06)) - 0.115 * amp) * hr - 0.014 * hr * amp;
    d = smax(d, fold, 0.02 * hr);

    return d;
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
    d = sculptFace(p, d);
    return d * uScale;
  }

  float map(vec3 p) {
    float d = mapBody(p);
    // organic micro-relief only near the surface (cheap when far),
    // hushed over the face so eye/lip creases stay crisp
    if (abs(d) < 0.06) {
      vec3 q = headLocal(p / uScale);
      float faceZone = uFaceDev * smoothstep(1.5, 0.9, length(q)) * smoothstep(0.1, 0.5, q.x);
      d += (vnoise(p * 18.0 + vec3(0.0, uTime * 0.05, 0.0)) - 0.5) * 0.012 * (1.0 - 0.8 * faceZone);
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

    // facial pigment details in head-local space
    {
      vec3 q = headLocal(p / uScale);
      float amp = uFaceDev;
      if (amp > 0.05 && dot(q, q) < 3.2) {
        // soft eye-socket shading
        float sockN = length(q - vec3(0.74, 0.00, 0.42));
        float sockF = length(q - vec3(0.74, 0.00, -0.42));
        albedo *= 1.0 - 0.13 * amp * exp(-sockN * sockN / 0.045);
        albedo *= 1.0 - 0.13 * amp * exp(-sockF * sockF / 0.045);
        // lash lines along the lid creases
        float lashN = sdCapsule(q, vec3(0.88, -0.04, 0.24), vec3(0.92, -0.07, 0.56), 0.0);
        float lashF = sdCapsule(q, vec3(0.88, -0.04, -0.24), vec3(0.92, -0.07, -0.56), 0.0);
        albedo *= 1.0 - 0.35 * amp * smoothstep(0.055, 0.0, lashN);
        albedo *= 1.0 - 0.35 * amp * smoothstep(0.055, 0.0, lashF);
        // rosy lips
        float lipD = sdCapsule(q, vec3(0.93, -0.41, 0.12), vec3(0.93, -0.41, -0.12), 0.0);
        float lipT = smoothstep(0.13, 0.02, lipD) * amp;
        albedo = mix(albedo, vec3(0.72, 0.26, 0.24), lipT * 0.55);
        // nostril shadows
        float nsD = length(vec3(q.x, q.y, abs(q.z)) - vec3(1.03, -0.20, 0.065));
        albedo *= 1.0 - 0.45 * amp * exp(-nsD * nsD / 0.0035);
        // warm cheek
        float cheek = length(q - vec3(0.60, -0.28, 0.55));
        albedo = mix(albedo, vec3(0.86, 0.38, 0.30), 0.25 * amp * exp(-cheek * cheek / 0.06));
      }
    }

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
      uHead: { value: new THREE.Vector4(...rig.head, rig.headR) },
      uFaceX: { value: new THREE.Vector3(...rig.faceX) },
      uFaceY: { value: new THREE.Vector3(...rig.faceY) },
      uFaceZ: { value: new THREE.Vector3(...rig.faceZ) },
      uFaceDev: { value: rig.faceDev },
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
    (u.uHead.value as THREE.Vector4).set(rig.head[0], rig.head[1], rig.head[2], rig.headR);
    (u.uFaceX.value as THREE.Vector3).set(...rig.faceX);
    (u.uFaceY.value as THREE.Vector3).set(...rig.faceY);
    (u.uFaceZ.value as THREE.Vector3).set(...rig.faceZ);
    u.uFaceDev.value = rig.faceDev;
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
