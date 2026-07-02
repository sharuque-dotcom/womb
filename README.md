# womb. — Baby Digital Twin

An immersive digital twin of a baby's journey in the womb — from a pea-sized
bud at week 4 to a full-term baby at week 40. Built as a high-visual concept
demo for clinician–parent storytelling: the physician drives the experience in
clinic, and the parent can relive it on their phone.

## Experience

- **Immersive womb scene** — ambient particles, amniotic sac, light rays, and
  nine hand-drawn stages of fetal development that morph as you scrub weeks.
- **Live heartbeat** — the halo and heart icon pulse at the true fetal heart
  rate for each week, with a synthesized "lub-dub" sound (WebAudio, tap the
  heartbeat card).
- **Week scrubber + growth journey autoplay** — drag through weeks 4–40 or
  press play for a cinematic run through the whole pregnancy.
- **Vitals** — animated length, weight, heart rate, and the classic
  fruit-size comparison.
- **Parent / Physician dual view** — warm week-by-week storytelling for
  parents; gestational-age framing, biometry (CRL/CHL, EFW, BPD, HC, FL),
  clinical notes, scan reminders, and a growth-envelope band for clinicians.
- **Growth charts** — length and weight curves with a moving marker; drag on
  the chart itself to scrub.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion.
All visuals are inline SVG and canvas — no external assets. All week data
lives in `lib/weeks.ts`.

## Run locally

```bash
npm install
npm run dev
```

## Disclaimer

Concept demo with illustrative data based on published growth references.
Not a medical device; not for clinical use.
