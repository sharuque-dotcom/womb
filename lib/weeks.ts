export type Trimester = 1 | 2 | 3;

/** Which hand-drawn fetus illustration to show for a given week. */
export type StageId =
  | "bud"
  | "embryo"
  | "embryo-limbs"
  | "early-fetus"
  | "fetus"
  | "active-fetus"
  | "detailed-fetus"
  | "plump-fetus"
  | "full-term";

export interface WeekData {
  week: number;
  trimester: Trimester;
  stage: StageId;
  /** Crown–rump length up to week 19, crown–heel length from week 20. */
  lengthCm: number;
  lengthLabel: "CRL" | "CHL";
  weightG: number;
  /** Fetal heart rate in bpm. 0 = heart not yet beating. */
  heartRate: number;
  fruit: { name: string; emoji: string };
  patientTitle: string;
  patientFacts: string[];
  clinicalNotes: string[];
  /** Recommended scan / clinical visit at this gestational age, if any. */
  scan?: string;
}

export const MIN_WEEK = 4;
export const MAX_WEEK = 40;

export const WEEKS: WeekData[] = [
  {
    week: 4,
    trimester: 1,
    stage: "bud",
    lengthCm: 0.1,
    lengthLabel: "CRL",
    weightG: 0.4,
    heartRate: 0,
    fruit: { name: "Poppy seed", emoji: "🌱" },
    patientTitle: "A tiny spark of life",
    patientFacts: [
      "Your baby is a tiny cluster of rapidly dividing cells, nestling into the wall of your womb.",
      "The amniotic sac and placenta — your baby's life-support system — are beginning to form.",
    ],
    clinicalNotes: [
      "Implantation complete; blastocyst differentiates into embryoblast and trophoblast.",
      "β-hCG rising; gestational sac may be visible on TVS from ~4.5 weeks.",
    ],
  },
  {
    week: 5,
    trimester: 1,
    stage: "bud",
    lengthCm: 0.2,
    lengthLabel: "CRL",
    weightG: 0.5,
    heartRate: 80,
    fruit: { name: "Sesame seed", emoji: "🌾" },
    patientTitle: "The heart begins its journey",
    patientFacts: [
      "A tiny tube — your baby's future heart — starts to flutter with its very first beats.",
      "The neural tube, which becomes the brain and spinal cord, is forming right now.",
    ],
    clinicalNotes: [
      "Cardiac tube begins contracting (~80 bpm, rising).",
      "Neural tube closure in progress; folate supplementation critical.",
    ],
  },
  {
    week: 6,
    trimester: 1,
    stage: "embryo",
    lengthCm: 0.5,
    lengthLabel: "CRL",
    weightG: 0.8,
    heartRate: 110,
    fruit: { name: "Lentil", emoji: "🫘" },
    patientTitle: "A beating heart you could hear",
    patientFacts: [
      "Your baby's heart now beats around 110 times a minute — nearly twice your own rate.",
      "Small buds appear where arms and legs will grow.",
    ],
    clinicalNotes: [
      "Cardiac activity typically detectable on TVS; FHR ~100–120 bpm.",
      "Limb buds and optic vesicles forming.",
    ],
    scan: "Viability / dating scan possible from ~6 weeks",
  },
  {
    week: 7,
    trimester: 1,
    stage: "embryo",
    lengthCm: 1.0,
    lengthLabel: "CRL",
    weightG: 1,
    heartRate: 130,
    fruit: { name: "Blueberry", emoji: "🫐" },
    patientTitle: "Growing 100 brain cells a minute",
    patientFacts: [
      "Your baby's brain is growing at an astonishing pace — about 100 new cells every minute.",
      "Tiny nostrils and the lenses of the eyes are starting to form.",
    ],
    clinicalNotes: [
      "Rapid neurogenesis; cerebral hemispheres enlarging.",
      "FHR rising steeply (~130 bpm).",
    ],
  },
  {
    week: 8,
    trimester: 1,
    stage: "embryo-limbs",
    lengthCm: 1.6,
    lengthLabel: "CRL",
    weightG: 1.5,
    heartRate: 160,
    fruit: { name: "Raspberry", emoji: "🍇" },
    patientTitle: "Fingers and toes take shape",
    patientFacts: [
      "Webbed fingers and toes are emerging on your baby's paddle-shaped hands and feet.",
      "Your baby makes its first spontaneous movements — too small for you to feel yet.",
    ],
    clinicalNotes: [
      "Digital rays visible; spontaneous embryonic movements begin.",
      "FHR peaks ~160–170 bpm around weeks 8–10.",
    ],
  },
  {
    week: 9,
    trimester: 1,
    stage: "embryo-limbs",
    lengthCm: 2.3,
    lengthLabel: "CRL",
    weightG: 2,
    heartRate: 170,
    fruit: { name: "Cherry", emoji: "🍒" },
    patientTitle: "From embryo to baby",
    patientFacts: [
      "All essential organs are now in place and starting to work together.",
      "The tail has disappeared — your baby now looks distinctly human.",
    ],
    clinicalNotes: [
      "End of embryonic period approaching; organogenesis largely complete.",
      "Physiological midgut herniation present (normal finding).",
    ],
  },
  {
    week: 10,
    trimester: 1,
    stage: "early-fetus",
    lengthCm: 3.1,
    lengthLabel: "CRL",
    weightG: 4,
    heartRate: 170,
    fruit: { name: "Strawberry", emoji: "🍓" },
    patientTitle: "Officially a fetus",
    patientFacts: [
      "Your baby graduates from embryo to fetus this week — a big milestone!",
      "Tiny tooth buds are forming under the gums, and fingernails begin to grow.",
    ],
    clinicalNotes: [
      "Fetal period begins; vital organs functioning and maturing.",
      "Consider first-trimester labs and NIPT counselling from 10 weeks.",
    ],
  },
  {
    week: 11,
    trimester: 1,
    stage: "early-fetus",
    lengthCm: 4.1,
    lengthLabel: "CRL",
    weightG: 7,
    heartRate: 165,
    fruit: { name: "Fig", emoji: "🍈" },
    patientTitle: "Little acrobat in training",
    patientFacts: [
      "Your baby can stretch, roll and even hiccup — the womb is a personal gym.",
      "The head makes up about half of your baby's length right now.",
    ],
    clinicalNotes: [
      "Fetal breathing movements and swallowing observed.",
      "Midgut herniation resolving by end of week 11.",
    ],
  },
  {
    week: 12,
    trimester: 1,
    stage: "early-fetus",
    lengthCm: 5.4,
    lengthLabel: "CRL",
    weightG: 14,
    heartRate: 160,
    fruit: { name: "Lime", emoji: "🍋" },
    patientTitle: "Reflexes switch on",
    patientFacts: [
      "Touch your bump and your baby may wriggle in response — reflexes are developing.",
      "Fingers can open and close, and toes curl.",
    ],
    clinicalNotes: [
      "Nuchal translucency measurable (CRL 45–84 mm window).",
      "Combined first-trimester screening due.",
    ],
    scan: "NT scan + combined screening (11–13⁺⁶ weeks)",
  },
  {
    week: 13,
    trimester: 1,
    stage: "early-fetus",
    lengthCm: 7.4,
    lengthLabel: "CRL",
    weightG: 23,
    heartRate: 155,
    fruit: { name: "Pea pod", emoji: "🫛" },
    patientTitle: "Unique fingerprints form",
    patientFacts: [
      "Your baby now has one-of-a-kind fingerprints on those tiny fingertips.",
      "Vocal cords are forming — practice for that first cry.",
    ],
    clinicalNotes: [
      "End of first trimester; miscarriage risk falls significantly.",
      "Fetal kidneys producing urine into amniotic fluid.",
    ],
  },
  {
    week: 14,
    trimester: 2,
    stage: "fetus",
    lengthCm: 8.7,
    lengthLabel: "CRL",
    weightG: 43,
    heartRate: 155,
    fruit: { name: "Lemon", emoji: "🍋" },
    patientTitle: "Welcome to the second trimester",
    patientFacts: [
      "Your baby can squint, frown and maybe even suck a thumb.",
      "Fine, soft hair called lanugo begins to cover the body for warmth.",
    ],
    clinicalNotes: [
      "Second trimester begins; facial muscle activity present.",
      "Lanugo formation; thyroid begins hormone production.",
    ],
  },
  {
    week: 15,
    trimester: 2,
    stage: "fetus",
    lengthCm: 10.1,
    lengthLabel: "CRL",
    weightG: 70,
    heartRate: 153,
    fruit: { name: "Apple", emoji: "🍎" },
    patientTitle: "Sensing light through closed eyes",
    patientFacts: [
      "Though the eyelids are still fused, your baby can sense bright light on your belly.",
      "All four limbs now move in a coordinated way.",
    ],
    clinicalNotes: [
      "Photosensitivity despite fused eyelids.",
      "Skeletal ossification progressing; bones visible on ultrasound.",
    ],
  },
  {
    week: 16,
    trimester: 2,
    stage: "fetus",
    lengthCm: 11.6,
    lengthLabel: "CRL",
    weightG: 100,
    heartRate: 152,
    fruit: { name: "Avocado", emoji: "🥑" },
    patientTitle: "First flutters may be near",
    patientFacts: [
      "Some mothers feel the first butterfly-like movements around now.",
      "Your baby's heart pumps about 25 litres of blood a day.",
    ],
    clinicalNotes: [
      "Quickening possible from 16–20 weeks (earlier in multiparous women).",
      "Fetal circulation robust; umbilical cord fully mature.",
    ],
  },
  {
    week: 17,
    trimester: 2,
    stage: "fetus",
    lengthCm: 13.0,
    lengthLabel: "CRL",
    weightG: 140,
    heartRate: 150,
    fruit: { name: "Pear", emoji: "🍐" },
    patientTitle: "Building baby fat",
    patientFacts: [
      "Your baby starts laying down fat stores — essential for warmth after birth.",
      "The skeleton is changing from soft cartilage to bone.",
    ],
    clinicalNotes: [
      "Adipose tissue deposition begins.",
      "Cartilage-to-bone ossification accelerating.",
    ],
  },
  {
    week: 18,
    trimester: 2,
    stage: "active-fetus",
    lengthCm: 14.2,
    lengthLabel: "CRL",
    weightG: 190,
    heartRate: 150,
    fruit: { name: "Bell pepper", emoji: "🫑" },
    patientTitle: "Your baby can hear you",
    patientFacts: [
      "Ears are now in position and working — talk and sing to your baby!",
      "Your baby may respond to loud sounds with a kick or a wriggle.",
    ],
    clinicalNotes: [
      "Auditory system functional; startle response to acoustic stimuli.",
      "Myelination of nerves beginning.",
    ],
  },
  {
    week: 19,
    trimester: 2,
    stage: "active-fetus",
    lengthCm: 15.3,
    lengthLabel: "CRL",
    weightG: 240,
    heartRate: 148,
    fruit: { name: "Mango", emoji: "🥭" },
    patientTitle: "A protective cocoon of vernix",
    patientFacts: [
      "A creamy coating called vernix now protects your baby's delicate skin.",
      "Sensory areas of the brain — touch, taste, smell, sight, hearing — are specialising.",
    ],
    clinicalNotes: [
      "Vernix caseosa forming over skin.",
      "Sensory cortex differentiation underway.",
    ],
  },
  {
    week: 20,
    trimester: 2,
    stage: "active-fetus",
    lengthCm: 25.6,
    lengthLabel: "CHL",
    weightG: 300,
    heartRate: 147,
    fruit: { name: "Banana", emoji: "🍌" },
    patientTitle: "Halfway there!",
    patientFacts: [
      "You're at the halfway point — from now on, baby is measured head to heel.",
      "Your baby swallows amniotic fluid, practising for feeding after birth.",
    ],
    clinicalNotes: [
      "Anomaly scan window: detailed anatomical survey.",
      "Measurements switch from CRL to crown–heel length.",
    ],
    scan: "Anomaly (anatomy) scan (18–22 weeks)",
  },
  {
    week: 21,
    trimester: 2,
    stage: "active-fetus",
    lengthCm: 26.7,
    lengthLabel: "CHL",
    weightG: 360,
    heartRate: 147,
    fruit: { name: "Carrot", emoji: "🥕" },
    patientTitle: "Kicks you can really feel",
    patientFacts: [
      "Those flutters are becoming proper kicks and jabs.",
      "Your baby now has a sleep–wake cycle — and it may not match yours!",
    ],
    clinicalNotes: [
      "Fetal movements clearly palpable; consider movement awareness education.",
      "Bone marrow begins producing blood cells.",
    ],
  },
  {
    week: 22,
    trimester: 2,
    stage: "active-fetus",
    lengthCm: 27.8,
    lengthLabel: "CHL",
    weightG: 430,
    heartRate: 145,
    fruit: { name: "Papaya", emoji: "🍈" },
    patientTitle: "A tiny person in every detail",
    patientFacts: [
      "Eyebrows, eyelashes and even tiny tooth buds are all in place.",
      "Your baby's grip is strong enough to clutch the umbilical cord.",
    ],
    clinicalNotes: [
      "Eyebrows/lashes present; grasp reflex developing.",
      "Inner-ear balance organs mature — baby senses orientation.",
    ],
  },
  {
    week: 23,
    trimester: 2,
    stage: "detailed-fetus",
    lengthCm: 28.9,
    lengthLabel: "CHL",
    weightG: 500,
    heartRate: 145,
    fruit: { name: "Grapefruit", emoji: "🍊" },
    patientTitle: "Listening to your heartbeat",
    patientFacts: [
      "Your baby knows your voice and your heartbeat — the most comforting sounds in the world.",
      "Skin is still translucent, but filling out day by day.",
    ],
    clinicalNotes: [
      "Threshold of viability approaching; counselling relevant if preterm risk.",
      "Alveolar development beginning in lungs.",
    ],
  },
  {
    week: 24,
    trimester: 2,
    stage: "detailed-fetus",
    lengthCm: 30.0,
    lengthLabel: "CHL",
    weightG: 600,
    heartRate: 145,
    fruit: { name: "Corn", emoji: "🌽" },
    patientTitle: "A major milestone: viability",
    patientFacts: [
      "Your baby's lungs are developing branches and cells that will make breathing possible.",
      "Taste buds are working — flavours from your meals reach the amniotic fluid.",
    ],
    clinicalNotes: [
      "Viability milestone (~24 weeks); surfactant production starting.",
      "OGTT screening for gestational diabetes typically 24–28 weeks.",
    ],
    scan: "Glucose tolerance test (24–28 weeks)",
  },
  {
    week: 25,
    trimester: 2,
    stage: "detailed-fetus",
    lengthCm: 34.6,
    lengthLabel: "CHL",
    weightG: 660,
    heartRate: 144,
    fruit: { name: "Cauliflower", emoji: "🥦" },
    patientTitle: "Responding to your voice",
    patientFacts: [
      "Your baby may wriggle or calm down when hearing familiar voices.",
      "The startle reflex appears — sudden noises can make baby jump.",
    ],
    clinicalNotes: [
      "Auditory discrimination improving.",
      "Nostrils open; fetal breathing practice continues.",
    ],
  },
  {
    week: 26,
    trimester: 2,
    stage: "detailed-fetus",
    lengthCm: 35.6,
    lengthLabel: "CHL",
    weightG: 760,
    heartRate: 143,
    fruit: { name: "Lettuce", emoji: "🥬" },
    patientTitle: "Eyes begin to open",
    patientFacts: [
      "After months sealed shut, your baby's eyes open for the first time.",
      "Your baby responds to light — shine a torch on your bump and feel a kick!",
    ],
    clinicalNotes: [
      "Eyelids un-fuse; pupillary light response developing.",
      "Brain wave activity resembles that of a newborn.",
    ],
  },
  {
    week: 27,
    trimester: 2,
    stage: "detailed-fetus",
    lengthCm: 36.6,
    lengthLabel: "CHL",
    weightG: 875,
    heartRate: 143,
    fruit: { name: "Eggplant", emoji: "🍆" },
    patientTitle: "Dreaming already?",
    patientFacts: [
      "Your baby now has REM sleep — the stage in which we dream.",
      "Hiccups are common; you'll feel them as gentle rhythmic taps.",
    ],
    clinicalNotes: [
      "REM sleep cycles established.",
      "End of second trimester.",
    ],
  },
  {
    week: 28,
    trimester: 3,
    stage: "plump-fetus",
    lengthCm: 37.6,
    lengthLabel: "CHL",
    weightG: 1000,
    heartRate: 142,
    fruit: { name: "Coconut", emoji: "🥥" },
    patientTitle: "Third trimester — 1 kilogram!",
    patientFacts: [
      "Your baby crosses the one-kilogram mark this week.",
      "Eyes can blink, and lashes are fully grown.",
    ],
    clinicalNotes: [
      "Third trimester begins; anti-D prophylaxis if RhD-negative.",
      "Begin routine fetal movement monitoring counselling.",
    ],
    scan: "Anti-D (if Rh-negative) · start kick counting",
  },
  {
    week: 29,
    trimester: 3,
    stage: "plump-fetus",
    lengthCm: 38.6,
    lengthLabel: "CHL",
    weightG: 1150,
    heartRate: 141,
    fruit: { name: "Butternut squash", emoji: "🎃" },
    patientTitle: "Growing stronger every day",
    patientFacts: [
      "Muscles and lungs continue maturing fast — kicks feel stronger now.",
      "Your baby's brain can now help regulate body temperature.",
    ],
    clinicalNotes: [
      "Thermoregulation improving via CNS maturation.",
      "Head growth accelerating with brain volume.",
    ],
  },
  {
    week: 30,
    trimester: 3,
    stage: "plump-fetus",
    lengthCm: 39.9,
    lengthLabel: "CHL",
    weightG: 1320,
    heartRate: 141,
    fruit: { name: "Cabbage", emoji: "🥬" },
    patientTitle: "A brain that's starting to wrinkle",
    patientFacts: [
      "Your baby's smooth brain is developing its characteristic folds and grooves.",
      "Baby now sleeps in longer stretches — you may notice patterns.",
    ],
    clinicalNotes: [
      "Cortical gyrification progressing.",
      "Amniotic fluid volume near peak.",
    ],
  },
  {
    week: 31,
    trimester: 3,
    stage: "plump-fetus",
    lengthCm: 41.1,
    lengthLabel: "CHL",
    weightG: 1500,
    heartRate: 140,
    fruit: { name: "Coconut", emoji: "🥥" },
    patientTitle: "All five senses online",
    patientFacts: [
      "Your baby can see, hear, taste, smell and feel touch.",
      "Movements may feel different as space gets snug — rolls instead of kicks.",
    ],
    clinicalNotes: [
      "All sensory systems functional.",
      "Fetal position becoming clinically relevant.",
    ],
  },
  {
    week: 32,
    trimester: 3,
    stage: "plump-fetus",
    lengthCm: 42.4,
    lengthLabel: "CHL",
    weightG: 1700,
    heartRate: 140,
    fruit: { name: "Jicama", emoji: "🍈" },
    patientTitle: "Practising to breathe",
    patientFacts: [
      "Your baby 'breathes' amniotic fluid, training the lungs and diaphragm.",
      "Most babies settle head-down around now, ready for birth.",
    ],
    clinicalNotes: [
      "Growth scan often performed at 32 weeks (EFW, AC, HC, FL).",
      "Assess presentation; most fetuses cephalic by 32–34 weeks.",
    ],
    scan: "Growth scan (28–32 weeks)",
  },
  {
    week: 33,
    trimester: 3,
    stage: "plump-fetus",
    lengthCm: 43.7,
    lengthLabel: "CHL",
    weightG: 1900,
    heartRate: 139,
    fruit: { name: "Pineapple", emoji: "🍍" },
    patientTitle: "Bones harden, skull stays soft",
    patientFacts: [
      "Bones are hardening, but the skull stays flexible for the journey of birth.",
      "Your baby drinks up to a pint of amniotic fluid a day.",
    ],
    clinicalNotes: [
      "Skeletal ossification advanced; cranial sutures remain open.",
      "Immune system receiving maternal antibodies.",
    ],
  },
  {
    week: 34,
    trimester: 3,
    stage: "full-term",
    lengthCm: 45.0,
    lengthLabel: "CHL",
    weightG: 2150,
    heartRate: 139,
    fruit: { name: "Cantaloupe", emoji: "🍈" },
    patientTitle: "Filling out beautifully",
    patientFacts: [
      "The vernix coating thickens, and baby fat smooths out wrinkly skin.",
      "Fingernails now reach the fingertips.",
    ],
    clinicalNotes: [
      "Lung maturity near complete; surfactant levels rising.",
      "If delivered now, excellent prognosis with minimal support.",
    ],
  },
  {
    week: 35,
    trimester: 3,
    stage: "full-term",
    lengthCm: 46.2,
    lengthLabel: "CHL",
    weightG: 2380,
    heartRate: 138,
    fruit: { name: "Honeydew melon", emoji: "🍈" },
    patientTitle: "Snug as can be",
    patientFacts: [
      "Space is tight — your baby is curled up with knees to chest.",
      "Most of the lanugo hair has shed, leaving soft newborn skin.",
    ],
    clinicalNotes: [
      "GBS screening typically 35–37 weeks.",
      "Amniotic fluid begins gradual physiological decline.",
    ],
    scan: "GBS swab (35–37 weeks)",
  },
  {
    week: 36,
    trimester: 3,
    stage: "full-term",
    lengthCm: 47.4,
    lengthLabel: "CHL",
    weightG: 2620,
    heartRate: 138,
    fruit: { name: "Romaine lettuce", emoji: "🥬" },
    patientTitle: "Early term is almost here",
    patientFacts: [
      "Your baby gains about 30 grams a day — mostly healthy fat.",
      "The digestive system is ready and waiting for that first milk feed.",
    ],
    clinicalNotes: [
      "Weekly antenatal visits usually begin.",
      "Confirm presentation; discuss ECV if breech.",
    ],
    scan: "Weekly visits begin · presentation check",
  },
  {
    week: 37,
    trimester: 3,
    stage: "full-term",
    lengthCm: 48.6,
    lengthLabel: "CHL",
    weightG: 2860,
    heartRate: 137,
    fruit: { name: "Winter melon", emoji: "🍈" },
    patientTitle: "Officially early term",
    patientFacts: [
      "Your baby is now considered early term — ready for the outside world.",
      "Baby is practising sucking, swallowing and breathing in rhythm.",
    ],
    clinicalNotes: [
      "Early term (37⁰–38⁶ weeks).",
      "Coordinated suck–swallow–breathe pattern established.",
    ],
  },
  {
    week: 38,
    trimester: 3,
    stage: "full-term",
    lengthCm: 49.8,
    lengthLabel: "CHL",
    weightG: 3080,
    heartRate: 136,
    fruit: { name: "Small pumpkin", emoji: "🎃" },
    patientTitle: "Final touches",
    patientFacts: [
      "Your baby has a firm grip and eyes that will be ready to meet yours.",
      "The brain keeps growing rapidly — it will keep doing so for years.",
    ],
    clinicalNotes: [
      "Meconium accumulating in fetal bowel.",
      "Fetal head may engage in pelvis (earlier in nulliparas).",
    ],
  },
  {
    week: 39,
    trimester: 3,
    stage: "full-term",
    lengthCm: 50.7,
    lengthLabel: "CHL",
    weightG: 3290,
    heartRate: 135,
    fruit: { name: "Mini watermelon", emoji: "🍉" },
    patientTitle: "Full term — any day now",
    patientFacts: [
      "Your baby is full term and simply gaining strength for the big day.",
      "The lungs are producing surfactant, ready for that first breath and cry.",
    ],
    clinicalNotes: [
      "Full term (39⁰–40⁶ weeks); ideal delivery window.",
      "Placental function monitoring if any risk factors.",
    ],
  },
  {
    week: 40,
    trimester: 3,
    stage: "full-term",
    lengthCm: 51.2,
    lengthLabel: "CHL",
    weightG: 3460,
    heartRate: 135,
    fruit: { name: "Watermelon", emoji: "🍉" },
    patientTitle: "Ready to meet you",
    patientFacts: [
      "Your baby is fully developed and waiting for the perfect moment.",
      "Only about 5% of babies arrive on their due date — yours will choose their own birthday.",
    ],
    clinicalNotes: [
      "Estimated due date reached; discuss membrane sweep / IOL planning if prolonged.",
      "Continue CTG/fluid surveillance if post-dates.",
    ],
    scan: "Due date · post-dates monitoring plan",
  },
];

export function getWeek(week: number): WeekData {
  const w = Math.min(MAX_WEEK, Math.max(MIN_WEEK, Math.round(week)));
  return WEEKS[w - MIN_WEEK];
}

/** Approximate biometry for physician view, interpolated from reference tables. */
const BPD_REF: [number, number][] = [
  [12, 21], [16, 35], [20, 49], [24, 62], [28, 73], [32, 82], [36, 89], [40, 95],
];
const FL_REF: [number, number][] = [
  [12, 8], [16, 21], [20, 33], [24, 44], [28, 53], [32, 62], [36, 69], [40, 76],
];
const HC_REF: [number, number][] = [
  [12, 70], [16, 124], [20, 175], [24, 220], [28, 262], [32, 295], [36, 322], [40, 344],
];

function interp(table: [number, number][], week: number): number | null {
  if (week < table[0][0]) return null;
  for (let i = 0; i < table.length - 1; i++) {
    const [w0, v0] = table[i];
    const [w1, v1] = table[i + 1];
    if (week <= w1) {
      return Math.round(v0 + ((week - w0) / (w1 - w0)) * (v1 - v0));
    }
  }
  return table[table.length - 1][1];
}

export interface Biometry {
  bpdMm: number | null;
  flMm: number | null;
  hcMm: number | null;
  efwG: number;
}

export function getBiometry(week: number): Biometry {
  const w = getWeek(week);
  return {
    bpdMm: interp(BPD_REF, w.week),
    flMm: interp(FL_REF, w.week),
    hcMm: interp(HC_REF, w.week),
    efwG: w.weightG,
  };
}

export const TRIMESTERS: { id: Trimester; label: string; from: number; to: number }[] = [
  { id: 1, label: "First trimester", from: 4, to: 13 },
  { id: 2, label: "Second trimester", from: 14, to: 27 },
  { id: 3, label: "Third trimester", from: 28, to: 40 },
];

export function formatLength(w: WeekData): string {
  return w.lengthCm < 1 ? `${(w.lengthCm * 10).toFixed(0)} mm` : `${w.lengthCm.toFixed(1)} cm`;
}

export function formatWeight(w: WeekData): string {
  if (w.weightG < 1) return "< 1 g";
  if (w.weightG < 1000) return `${Math.round(w.weightG)} g`;
  return `${(w.weightG / 1000).toFixed(2)} kg`;
}
