type Props = {
  slug: string;
  className?: string;
  aspectClass?: string;
};

export default function TerritoryArt({
  slug,
  className = "",
  aspectClass = "aspect-[4/3]",
}: Props) {
  const Pattern = patterns[slug] ?? Default;
  return (
    <div
      className={`${aspectClass} relative overflow-hidden ${className}`}
      aria-hidden
    >
      <Pattern />
    </div>
  );
}

const patterns: Record<string, () => JSX.Element> = {
  "sweat-odor": SweatOdor,
  "skin-acne": SkinAcne,
  "face-impression": FaceImpression,
  "mind-awareness": MindAwareness,
  "hair-loss": HairLoss,
  "beard-body-hair": BeardBodyHair,
};

const SVG_CLASS = "w-full h-full block";

function Bg({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1B1610" />
        <stop offset="100%" stopColor="#0E0C09" />
      </linearGradient>
      <radialGradient id={`${id}-warm`} cx="78%" cy="22%" r="65%">
        <stop offset="0%" stopColor="#3A2D1C" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#1B1610" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-dark`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#E8DCBF" stopOpacity="0" />
        <stop offset="100%" stopColor="#E8DCBF" stopOpacity="0.06" />
      </linearGradient>
    </defs>
  );
}

function SweatOdor() {
  return (
    <svg viewBox="0 0 600 450" className={SVG_CLASS} preserveAspectRatio="xMidYMid slice">
      <Bg id="sweat" />
      <rect width="600" height="450" fill="url(#sweat)" />
      <rect width="600" height="450" fill="url(#sweat-warm)" />
      <rect width="600" height="450" fill="url(#sweat-dark)" />

      {/* 3 wavy vertical threads */}
      <path
        d="M140 30 Q150 120 130 220 Q120 320 145 420"
        stroke="#E8DCBF"
        strokeOpacity="0.35"
        strokeWidth="0.7"
        fill="none"
      />
      <path
        d="M285 10 Q275 130 295 240 Q310 350 280 440"
        stroke="#D9B584"
        strokeOpacity="0.65"
        strokeWidth="0.8"
        fill="none"
      />
      <path
        d="M440 40 Q450 140 425 250 Q400 360 445 430"
        stroke="#E8DCBF"
        strokeOpacity="0.25"
        strokeWidth="0.7"
        fill="none"
      />

      {/* Horizon at golden ratio */}
      <line
        x1="0"
        y1="278"
        x2="600"
        y2="278"
        stroke="#D9B584"
        strokeOpacity="0.5"
        strokeWidth="1"
      />

      {/* A single drop */}
      <circle cx="295" cy="320" r="3" fill="#D9B584" opacity="0.7" />
      <circle cx="295" cy="320" r="9" fill="none" stroke="#D9B584" strokeOpacity="0.3" />

      {/* Roman numeral */}
      <text
        x="40"
        y="60"
        fontFamily="Cormorant Garamond, serif"
        fontSize="20"
        letterSpacing="6"
        fill="#E8DCBF"
        fillOpacity="0.5"
      >
        I.
      </text>
    </svg>
  );
}

function SkinAcne() {
  return (
    <svg viewBox="0 0 600 450" className={SVG_CLASS} preserveAspectRatio="xMidYMid slice">
      <Bg id="acne" />
      <rect width="600" height="450" fill="url(#acne)" />
      <rect width="600" height="450" fill="url(#acne-warm)" />

      {/* Nested rings, off-center */}
      <g transform="translate(360 200)">
        <circle r="180" fill="none" stroke="#E8DCBF" strokeOpacity="0.12" strokeWidth="0.7" />
        <circle r="135" fill="none" stroke="#E8DCBF" strokeOpacity="0.2" strokeWidth="0.7" />
        <circle r="90" fill="none" stroke="#D9B584" strokeOpacity="0.5" strokeWidth="0.8" />
        <circle r="46" fill="none" stroke="#D9B584" strokeOpacity="0.75" strokeWidth="0.9" />
        <circle r="10" fill="#D9B584" fillOpacity="0.85" />
      </g>

      {/* A scattered companion dot (suggesting reflection) */}
      <circle cx="160" cy="320" r="3" fill="#E8DCBF" opacity="0.4" />
      <circle cx="160" cy="320" r="14" fill="none" stroke="#E8DCBF" strokeOpacity="0.15" />

      <text
        x="40"
        y="60"
        fontFamily="Cormorant Garamond, serif"
        fontSize="20"
        letterSpacing="6"
        fill="#E8DCBF"
        fillOpacity="0.5"
      >
        II.
      </text>
    </svg>
  );
}

function FaceImpression() {
  return (
    <svg viewBox="0 0 600 450" className={SVG_CLASS} preserveAspectRatio="xMidYMid slice">
      <Bg id="face" />
      <rect width="600" height="450" fill="url(#face)" />
      <rect width="600" height="450" fill="url(#face-warm)" />

      {/* Two arcs suggesting brow + jaw without a literal face */}
      <path
        d="M180 150 Q300 105 420 150"
        stroke="#E8DCBF"
        strokeOpacity="0.5"
        strokeWidth="0.9"
        fill="none"
      />
      <path
        d="M180 330 Q300 380 420 330"
        stroke="#D9B584"
        strokeOpacity="0.75"
        strokeWidth="0.9"
        fill="none"
      />

      {/* Vertical axis — symmetry */}
      <line x1="300" y1="80" x2="300" y2="395" stroke="#D9B584" strokeOpacity="0.35" strokeWidth="0.6" />

      {/* Small accent dot */}
      <circle cx="300" cy="240" r="2.5" fill="#E8DCBF" opacity="0.5" />

      <text
        x="40"
        y="60"
        fontFamily="Cormorant Garamond, serif"
        fontSize="20"
        letterSpacing="6"
        fill="#E8DCBF"
        fillOpacity="0.5"
      >
        III.
      </text>
    </svg>
  );
}

function MindAwareness() {
  return (
    <svg viewBox="0 0 600 450" className={SVG_CLASS} preserveAspectRatio="xMidYMid slice">
      <Bg id="mind" />
      <rect width="600" height="450" fill="url(#mind)" />
      <rect width="600" height="450" fill="url(#mind-warm)" />

      {/* A long horizontal at golden ratio + a single dot */}
      <line
        x1="100"
        y1="278"
        x2="500"
        y2="278"
        stroke="#E8DCBF"
        strokeOpacity="0.45"
        strokeWidth="0.8"
      />

      {/* A second, shorter line above */}
      <line
        x1="280"
        y1="172"
        x2="380"
        y2="172"
        stroke="#D9B584"
        strokeOpacity="0.65"
        strokeWidth="0.8"
      />

      {/* Single dot */}
      <circle cx="100" cy="278" r="4" fill="#D9B584" />

      <text
        x="40"
        y="60"
        fontFamily="Cormorant Garamond, serif"
        fontSize="20"
        letterSpacing="6"
        fill="#E8DCBF"
        fillOpacity="0.5"
      >
        IV.
      </text>
    </svg>
  );
}

function HairLoss() {
  return (
    <svg viewBox="0 0 600 450" className={SVG_CLASS} preserveAspectRatio="xMidYMid slice">
      <Bg id="hair" />
      <rect width="600" height="450" fill="url(#hair)" />
      <rect width="600" height="450" fill="url(#hair-warm)" />

      {/* Vertical strands of varying length and opacity — like a thinning field */}
      {[
        { x: 130, top: 130, opacity: 0.5 },
        { x: 175, top: 220, opacity: 0.3 },
        { x: 215, top: 110, opacity: 0.6 },
        { x: 255, top: 250, opacity: 0.25 },
        { x: 295, top: 150, opacity: 0.7 },
        { x: 340, top: 200, opacity: 0.45 },
        { x: 385, top: 90, opacity: 0.55 },
        { x: 430, top: 230, opacity: 0.3 },
        { x: 470, top: 170, opacity: 0.5 },
      ].map((s, i) => (
        <line
          key={i}
          x1={s.x}
          y1={s.top}
          x2={s.x}
          y2="350"
          stroke="#E8DCBF"
          strokeOpacity={s.opacity}
          strokeWidth="0.7"
        />
      ))}

      {/* Soil line */}
      <line x1="80" y1="350" x2="520" y2="350" stroke="#D9B584" strokeOpacity="0.6" strokeWidth="0.7" />

      <text
        x="40"
        y="60"
        fontFamily="Cormorant Garamond, serif"
        fontSize="20"
        letterSpacing="6"
        fill="#E8DCBF"
        fillOpacity="0.5"
      >
        V.
      </text>
    </svg>
  );
}

function BeardBodyHair() {
  return (
    <svg viewBox="0 0 600 450" className={SVG_CLASS} preserveAspectRatio="xMidYMid slice">
      <Bg id="beard" />
      <rect width="600" height="450" fill="url(#beard)" />
      <rect width="600" height="450" fill="url(#beard-warm)" />

      {/* Cluster of short strokes at various angles */}
      <g stroke="#E8DCBF">
        {Array.from({ length: 22 }).map((_, i) => {
          const cx = 180 + ((i * 37) % 260);
          const cy = 130 + ((i * 53) % 220);
          const angle = ((i * 31) % 180) * (Math.PI / 180);
          const len = 24 + ((i * 7) % 18);
          const x1 = cx;
          const y1 = cy;
          const x2 = cx + Math.cos(angle) * len;
          const y2 = cy + Math.sin(angle) * len;
          const opacity = 0.25 + ((i * 13) % 50) / 100;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeOpacity={opacity}
              strokeWidth="0.7"
            />
          );
        })}
      </g>

      {/* A single longer gold stroke */}
      <line
        x1="270"
        y1="270"
        x2="345"
        y2="245"
        stroke="#D9B584"
        strokeOpacity="0.8"
        strokeWidth="1"
      />

      <text
        x="40"
        y="60"
        fontFamily="Cormorant Garamond, serif"
        fontSize="20"
        letterSpacing="6"
        fill="#E8DCBF"
        fillOpacity="0.5"
      >
        VI.
      </text>
    </svg>
  );
}

function Default() {
  return (
    <svg viewBox="0 0 600 450" className={SVG_CLASS} preserveAspectRatio="xMidYMid slice">
      <Bg id="default" />
      <rect width="600" height="450" fill="url(#default)" />
    </svg>
  );
}
