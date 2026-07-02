# womb. — Prenatal Digital Twin

A cinematic, real-time 3D digital twin of a baby's journey in the womb — from a
pea-sized embryo at week 4 to a full-term baby at week 40. Built for
clinician–parent storytelling: the physician drives the experience in clinic,
and the parent can relive it on their phone.

## Experience

- **Real-time 3D fetus** — no downloaded models: the baby is a raymarched
  signed-distance body (`components/three/FetusRaymarch.tsx`) sculpted from
  ~24 smooth-blended primitives, shaded with subsurface scattering, amniotic
  specular film, caustic light ripples and SDF ambient occlusion.
- **Continuous morphing** — a parameter rig (`lib/fetusRig.ts`) with hand-tuned
  keyframes at 8 reference weeks interpolates every joint, radius and pose per
  fractional week, so scrubbing the timeline morphs the body continuously:
  embryonic tail → limb buds → curled fetus → plump full-term baby.
- **Living womb** — FBM-noise nebula backdrop, GPU particle motes, slow camera
  drift with pointer parallax, bloom/vignette/grain post-processing.
- **Heartbeat** — the chest glows from within at the true fetal heart rate for
  each week, with a synthesized WebAudio "lub-dub" (tap FHR to listen).
- **Parent / Physician dual view** — warm storytelling for parents; for
  clinicians: gestational-age framing, biometry (CRL/CHL, EFW, BPD, HC, FL),
  scan reminders, an ultrasound-style scan sweep and an on-scene measurement
  callout.
- **Growth charts** — length and weight curves with a moving marker (drag to
  scrub), percentile-style envelope in physician view.
- **Timeline** — weeks 4–40 scrubber with trimester jumps and a cinematic
  autoplay of the entire pregnancy.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · three.js +
react-three-fiber + postprocessing · Framer Motion. All visuals are procedural
(GLSL/canvas) — zero external assets. Week data lives in `lib/weeks.ts`.
A 2D fallback scene renders when WebGL is unavailable.

## Run locally

```bash
npm install
npm run dev
```

## Disclaimer

Concept demo with illustrative data based on published growth references.
Not a medical device; not for clinical use.
