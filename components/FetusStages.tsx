import type { StageId } from "@/lib/weeks";

/**
 * Hand-drawn stylized fetus illustrations, one per developmental stage.
 * All share a 200x200 viewBox and a warm glowing-silhouette style.
 */

export function StageDefs() {
  return (
    <defs>
      <radialGradient id="skin" cx="42%" cy="38%" r="75%">
        <stop offset="0%" stopColor="#ffe7d6" />
        <stop offset="55%" stopColor="#ffc4a3" />
        <stop offset="100%" stopColor="#ee8f6e" />
      </radialGradient>
      <radialGradient id="skinDeep" cx="45%" cy="40%" r="80%">
        <stop offset="0%" stopColor="#ffd2b8" />
        <stop offset="100%" stopColor="#dd7c5f" />
      </radialGradient>
      <radialGradient id="sac" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stopColor="#ff9e7d" stopOpacity="0.16" />
        <stop offset="75%" stopColor="#ff8fa3" stopOpacity="0.07" />
        <stop offset="100%" stopColor="#ff8fa3" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="cord" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffb08e" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#e07a5f" stopOpacity="0.55" />
      </linearGradient>
      <filter id="soften" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0.6" />
      </filter>
      <filter id="fetusGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="9" result="blur" />
        <feFlood floodColor="#ff9e7d" floodOpacity="0.55" />
        <feComposite in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/** Rounded capsule used for stylized limbs. */
function Limb({
  x,
  y,
  w,
  h,
  angle,
  fill = "url(#skinDeep)",
  opacity = 1,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
  fill?: string;
  opacity?: number;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={h / 2}
      fill={fill}
      opacity={opacity}
      transform={`rotate(${angle} ${x} ${y + h / 2})`}
    />
  );
}

function ClosedEye({ cx, cy, r = 5 }: { cx: number; cy: number; r?: number }) {
  return (
    <path
      d={`M ${cx - r} ${cy} Q ${cx} ${cy + r * 0.9} ${cx + r} ${cy}`}
      stroke="#8a4a3a"
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
    />
  );
}

function Blush({ cx, cy, r = 6 }: { cx: number; cy: number; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="#ff8fa3" opacity="0.28" filter="url(#soften)" />;
}

/* ------------------------------------------------------------------ */
/* Week 4–5 · a tiny bud with its yolk sac                             */
/* ------------------------------------------------------------------ */
function Bud() {
  return (
    <g filter="url(#fetusGlow)">
      {/* yolk sac */}
      <circle cx="82" cy="132" r="14" fill="url(#skinDeep)" opacity="0.55" />
      <circle cx="82" cy="132" r="14" fill="none" stroke="#ffc4a3" strokeWidth="1" opacity="0.5" />
      {/* connecting stalk */}
      <path
        d="M 88 122 C 92 114 96 110 100 106"
        stroke="url(#cord)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      {/* the bean-shaped bud */}
      <path
        d="M 102 62
           C 126 64 136 88 128 110
           C 122 127 106 136 92 130
           C 78 124 74 102 82 86
           C 88 74 94 62 102 62 Z"
        fill="url(#skin)"
      />
      {/* inner crescent — the forming neural fold */}
      <path
        d="M 100 74 C 114 78 120 94 114 108"
        stroke="#ffe7d6"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      {/* primitive heart shimmer */}
      <circle cx="103" cy="100" r="5" fill="#f25c54" opacity="0.75" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Week 6–7 · C-shaped embryo, head fold and tail                      */
/* ------------------------------------------------------------------ */
function Embryo() {
  return (
    <g filter="url(#fetusGlow)">
      {/* body: big head bulge sweeping into a curled tail */}
      <path
        d="M 96 42
           C 126 42 142 64 140 88
           C 139 104 130 116 120 124
           C 116 138 106 150 92 152
           C 78 154 66 146 66 134
           C 66 124 74 118 82 120
           C 76 112 76 100 84 94
           C 74 84 74 60 96 42 Z"
        fill="url(#skin)"
      />
      {/* tail curl */}
      <path
        d="M 76 138 C 66 146 56 144 54 134 C 52 126 60 120 68 124"
        fill="url(#skinDeep)"
        opacity="0.9"
      />
      {/* eye spot */}
      <circle cx="106" cy="78" r="6" fill="#7c3f38" opacity="0.85" />
      <circle cx="104" cy="76" r="2" fill="#ffe7d6" opacity="0.8" />
      {/* limb buds */}
      <ellipse cx="122" cy="112" rx="9" ry="6" fill="url(#skinDeep)" transform="rotate(30 122 112)" />
      <ellipse cx="104" cy="140" rx="8" ry="5.5" fill="url(#skinDeep)" transform="rotate(15 104 140)" />
      {/* somites along the back */}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={132 - i * 7} cy={100 + i * 9} r="2.2" fill="#ffe7d6" opacity="0.4" />
      ))}
      {/* tiny beating heart bump */}
      <circle cx="112" cy="102" r="6" fill="#f25c54" opacity="0.8" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Week 8–9 · embryo with paddle limbs, tail receding                  */
/* ------------------------------------------------------------------ */
function EmbryoLimbs() {
  return (
    <g filter="url(#fetusGlow)">
      {/* umbilical cord */}
      <path
        d="M 96 128 C 84 138 74 140 66 150 C 58 160 56 172 60 182"
        stroke="url(#cord)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* head */}
      <circle cx="98" cy="72" r="34" fill="url(#skin)" />
      {/* torso curled */}
      <path
        d="M 122 92
           C 138 104 140 126 128 140
           C 118 152 98 156 86 148
           C 76 141 74 128 82 120
           C 88 114 98 114 102 120
           C 96 108 104 96 116 96 Z"
        fill="url(#skin)"
      />
      {/* paddle arm */}
      <Limb x={104} y={110} w={26} h={11} angle={38} />
      <ellipse cx="126" cy="128" rx="7" ry="5.5" fill="url(#skin)" transform="rotate(38 126 128)" />
      {/* paddle leg */}
      <Limb x={94} y={138} w={24} h={11} angle={18} />
      <ellipse cx="118" cy="146" rx="7" ry="5.5" fill="url(#skin)" transform="rotate(18 118 146)" />
      {/* eye */}
      <circle cx="86" cy="70" r="5.5" fill="#7c3f38" opacity="0.85" />
      <circle cx="84.5" cy="68.5" r="1.8" fill="#ffe7d6" opacity="0.8" />
      {/* heart glow */}
      <circle cx="106" cy="112" r="6" fill="#f25c54" opacity="0.8" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Week 10–13 · early fetus: unmistakably a baby now                   */
/* ------------------------------------------------------------------ */
function EarlyFetus() {
  return (
    <g filter="url(#fetusGlow)">
      {/* umbilical cord */}
      <path
        d="M 98 132 C 84 140 74 142 66 152 C 58 162 56 174 60 184"
        stroke="url(#cord)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* head — large, facing left */}
      <circle cx="86" cy="74" r="33" fill="url(#skin)" />
      {/* torso */}
      <path
        d="M 108 92
           C 130 100 138 122 130 140
           C 122 156 100 160 86 152
           C 74 145 72 130 80 122
           C 86 115 96 116 100 122
           C 94 110 98 96 108 92 Z"
        fill="url(#skin)"
      />
      {/* arm folded to chest */}
      <Limb x={96} y={108} w={24} h={10} angle={42} />
      <circle cx="114" cy="126" r="5.5" fill="url(#skin)" />
      {/* legs folded */}
      <Limb x={90} y={140} w={26} h={11} angle={12} />
      <Limb x={112} y={144} w={20} h={9} angle={64} />
      <circle cx="122" cy="162" r="5" fill="url(#skin)" />
      {/* face: closed eye, button nose */}
      <ClosedEye cx={72} cy={74} r={5} />
      <circle cx="60" cy="82" r="2.5" fill="#e8967a" />
      <Blush cx={68} cy={88} r={5} />
      {/* ear */}
      <circle cx="94" cy="78" r="4.5" fill="url(#skinDeep)" opacity="0.8" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Week 14–17 · proportioned fetus, thumb drifting to mouth            */
/* ------------------------------------------------------------------ */
function Fetus() {
  return (
    <g filter="url(#fetusGlow)">
      <path
        d="M 100 130 C 86 138 76 142 68 152 C 60 162 58 174 62 184"
        stroke="url(#cord)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* head */}
      <circle cx="84" cy="68" r="30" fill="url(#skin)" />
      {/* torso, gently curled */}
      <path
        d="M 104 84
           C 128 92 140 116 132 138
           C 125 158 102 164 86 156
           C 72 149 70 132 79 123
           C 86 116 96 118 100 124
           C 93 112 95 92 104 84 Z"
        fill="url(#skin)"
      />
      {/* far leg (behind) */}
      <Limb x={92} y={146} w={30} h={12} angle={10} opacity={0.75} />
      {/* near leg: thigh + shin folded */}
      <Limb x={88} y={140} w={30} h={13} angle={22} />
      <Limb x={114} y={150} w={26} h={11} angle={70} />
      <ellipse cx="128" cy="174" rx="8" ry="5" fill="url(#skin)" transform="rotate(20 128 174)" />
      {/* arm reaching toward mouth */}
      <Limb x={98} y={102} w={26} h={11} angle={150} />
      <circle cx="76" cy="94" r="6" fill="url(#skin)" />
      {/* face */}
      <ClosedEye cx={70} cy={66} r={5} />
      <circle cx="58" cy="74" r="2.5" fill="#e8967a" />
      <path d="M 60 84 Q 64 87 68 85" stroke="#c96a52" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Blush cx={68} cy={80} r={5} />
      <circle cx="92" cy="72" r="4.5" fill="url(#skinDeep)" opacity="0.8" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Week 18–22 · the acrobat: stretched leg, waving arm                 */
/* ------------------------------------------------------------------ */
function ActiveFetus() {
  return (
    <g filter="url(#fetusGlow)">
      <path
        d="M 96 128 C 82 136 72 138 64 148 C 56 158 54 170 58 180"
        stroke="url(#cord)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* waving arm behind */}
      <Limb x={108} y={64} w={30} h={12} angle={-42} />
      <circle cx="132" cy="46" r="7" fill="url(#skin)" />
      {/* head */}
      <circle cx="86" cy="66" r="29" fill="url(#skin)" />
      {/* torso */}
      <path
        d="M 106 80
           C 130 88 140 112 132 134
           C 125 154 102 160 86 152
           C 72 145 70 128 79 119
           C 86 112 96 114 100 120
           C 93 108 97 88 106 80 Z"
        fill="url(#skin)"
      />
      {/* kicking leg — extended */}
      <Limb x={100} y={138} w={38} h={13} angle={28} />
      <Limb x={134} y={156} w={26} h={11} angle={-8} />
      <ellipse cx="162" cy="160" rx="8" ry="5.5" fill="url(#skin)" transform="rotate(-8 162 160)" />
      {/* folded leg */}
      <Limb x={88} y={142} w={26} h={12} angle={48} />
      {/* near arm resting on belly */}
      <Limb x={100} y={104} w={26} h={11} angle={30} />
      <circle cx="122" cy="122" r="6" fill="url(#skin)" />
      {/* face — a hint of a smile */}
      <ClosedEye cx={72} cy={64} r={5} />
      <circle cx="60" cy="72" r="2.5" fill="#e8967a" />
      <path d="M 62 82 Q 67 86 72 83" stroke="#c96a52" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <Blush cx={70} cy={78} r={5} />
      <circle cx="94" cy="70" r="4.5" fill="url(#skinDeep)" opacity="0.8" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Week 23–27 · finer features: lashes, hair wisp, thumb to mouth      */
/* ------------------------------------------------------------------ */
function DetailedFetus() {
  return (
    <g filter="url(#fetusGlow)">
      <path
        d="M 98 132 C 84 140 74 142 66 152 C 58 162 56 174 60 184"
        stroke="url(#cord)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* head */}
      <circle cx="86" cy="66" r="30" fill="url(#skin)" />
      {/* hair wisps */}
      <path
        d="M 66 46 Q 76 36 90 38 M 78 40 Q 88 32 100 36"
        stroke="#c96a52"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      {/* torso */}
      <path
        d="M 106 82
           C 130 90 142 114 134 138
           C 126 158 102 164 86 156
           C 72 149 70 132 79 123
           C 86 116 96 118 100 124
           C 93 112 97 90 106 82 Z"
        fill="url(#skin)"
      />
      {/* legs curled */}
      <Limb x={90} y={142} w={32} h={13} angle={18} />
      <Limb x={118} y={152} w={26} h={11} angle={72} />
      <ellipse cx="132" cy="178" rx="8" ry="5.5" fill="url(#skin)" transform="rotate(30 132 178)" />
      <Limb x={94} y={148} w={26} h={12} angle={38} opacity={0.8} />
      {/* thumb to mouth */}
      <Limb x={100} y={100} w={28} h={11} angle={152} />
      <circle cx="74" cy="90" r="6" fill="url(#skin)" />
      {/* face with lashes */}
      <ClosedEye cx={72} cy={62} r={5.5} />
      <path d="M 66 60 L 63.5 57 M 71 59 L 70 55.5 M 76 60 L 78 56.5" stroke="#8a4a3a" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="59" cy="72" r="2.6" fill="#e8967a" />
      <path d="M 62 82 Q 66 85 70 83" stroke="#c96a52" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <Blush cx={70} cy={76} r={5.5} />
      <circle cx="95" cy="70" r="4.5" fill="url(#skinDeep)" opacity="0.8" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Week 28–33 · plump baby, chubby cheeks and folded limbs             */
/* ------------------------------------------------------------------ */
function PlumpFetus() {
  return (
    <g filter="url(#fetusGlow)">
      <path
        d="M 96 134 C 82 142 72 144 64 154 C 56 164 54 176 58 186"
        stroke="url(#cord)"
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* head — rounder */}
      <circle cx="86" cy="66" r="32" fill="url(#skin)" />
      {/* hair */}
      <path
        d="M 62 48 Q 72 34 90 36 M 72 40 Q 84 30 100 36 M 84 34 Q 96 30 106 40"
        stroke="#b85c47"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      {/* chubby torso */}
      <path
        d="M 108 84
           C 134 92 148 118 138 142
           C 129 162 102 168 84 158
           C 70 150 68 132 78 123
           C 86 116 97 118 101 124
           C 94 112 99 92 108 84 Z"
        fill="url(#skin)"
      />
      {/* plump legs */}
      <Limb x={90} y={144} w={34} h={15} angle={16} />
      <Limb x={120} y={154} w={28} h={13} angle={70} />
      <ellipse cx="136" cy="182" rx="9" ry="6" fill="url(#skin)" transform="rotate(28 136 182)" />
      <Limb x={94} y={150} w={28} h={14} angle={36} opacity={0.8} />
      {/* arm hugging belly */}
      <Limb x={102} y={104} w={30} h={13} angle={32} />
      <circle cx="128" cy="124" r="7" fill="url(#skin)" />
      {/* face — full cheeks */}
      <ClosedEye cx={72} cy={62} r={5.5} />
      <path d="M 66 60 L 63.5 57 M 71 59 L 70 55.5 M 76 60 L 78 56.5" stroke="#8a4a3a" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="58" cy="72" r="2.8" fill="#e8967a" />
      <path d="M 61 83 Q 66 87 71 84" stroke="#c96a52" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      <Blush cx={70} cy={78} r={7} />
      <circle cx="96" cy="70" r="5" fill="url(#skinDeep)" opacity="0.8" />
      {/* double chin fold */}
      <path d="M 66 92 Q 76 97 86 94" stroke="#dd7c5f" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Week 34–40 · full term, head-down and ready                         */
/* ------------------------------------------------------------------ */
function FullTerm() {
  return (
    <g filter="url(#fetusGlow)">
      {/* the whole baby is rotated head-down */}
      <g transform="rotate(148 100 100)">
        <path
          d="M 96 136 C 82 144 72 146 64 156 C 56 166 54 178 58 188"
          stroke="url(#cord)"
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* head */}
        <circle cx="86" cy="64" r="33" fill="url(#skin)" />
        {/* hair */}
        <path
          d="M 60 48 Q 72 32 92 34 M 70 38 Q 84 28 102 34 M 84 32 Q 98 28 108 40"
          stroke="#a8503c"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
        {/* full torso */}
        <path
          d="M 110 84
             C 138 92 152 120 142 146
             C 132 168 102 174 82 162
             C 68 153 66 134 77 124
             C 86 116 98 118 102 125
             C 95 112 100 92 110 84 Z"
          fill="url(#skin)"
        />
        {/* tucked legs */}
        <Limb x={92} y={148} w={36} h={16} angle={14} />
        <Limb x={124} y={158} w={30} h={14} angle={66} />
        <ellipse cx="142" cy="188" rx="10" ry="6.5" fill="url(#skin)" transform="rotate(26 142 188)" />
        <Limb x={96} y={154} w={30} h={15} angle={34} opacity={0.8} />
        {/* arms crossed snugly */}
        <Limb x={100} y={102} w={32} h={14} angle={34} />
        <circle cx="128" cy="124" r="7.5" fill="url(#skin)" />
        <Limb x={94} y={108} w={26} h={12} angle={56} opacity={0.85} />
        {/* face — peaceful, counter-rotated so it reads upright-ish */}
        <g>
          <ClosedEye cx={72} cy={60} r={5.5} />
          <path d="M 66 58 L 63.5 55 M 71 57 L 70 53.5 M 76 58 L 78 54.5" stroke="#8a4a3a" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="58" cy="70" r="2.8" fill="#e8967a" />
          <path d="M 61 81 Q 66 85 71 82" stroke="#c96a52" strokeWidth="1.7" strokeLinecap="round" fill="none" />
          <Blush cx={70} cy={76} r={7} />
          <circle cx="96" cy="68" r="5" fill="url(#skinDeep)" opacity="0.8" />
        </g>
      </g>
    </g>
  );
}

export const STAGE_COMPONENTS: Record<StageId, () => React.ReactElement> = {
  bud: Bud,
  embryo: Embryo,
  "embryo-limbs": EmbryoLimbs,
  "early-fetus": EarlyFetus,
  fetus: Fetus,
  "active-fetus": ActiveFetus,
  "detailed-fetus": DetailedFetus,
  "plump-fetus": PlumpFetus,
  "full-term": FullTerm,
};
