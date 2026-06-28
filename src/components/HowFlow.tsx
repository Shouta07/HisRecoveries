// Recovery Journey as a CYCLE (循環), not a line: step 05「つながり続ける」
// loops back to 01, so the five steps sit around a ring (desktop) / a vertical
// loop with a return arrow (mobile). CSS only, no JS.

const STEPS = [
  {
    n: "01",
    t: "理解する",
    d: "なぜ起きるのか、原因から。",
    icon: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="M20 20l-3.5-3.5" />
      </>
    ),
  },
  {
    n: "02",
    t: "整理する",
    d: "期間・費用・リスクを、中立に。",
    icon: (
      <>
        <path d="M4 19V5M4 19h16" />
        <path d="M8 16l3-4 3 2 4-6" />
      </>
    ),
  },
  {
    n: "03",
    t: "選ぶ",
    d: "自分に合った改善を、一緒に。",
    icon: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
      </>
    ),
  },
  {
    n: "04",
    t: "伴走する",
    d: "専属が、オンライン・対面で並走。",
    icon: (
      <>
        <circle cx="8" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 20c0-3 2.5-5 5-5s5 2 5 5M14 20c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5" />
      </>
    ),
  },
  {
    n: "05",
    t: "つながり続ける",
    d: "終わりではなく、次の人を支える側へ。",
    icon: (
      <>
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        <path d="M3 21v-5h5" />
      </>
    ),
  },
];

// Where the Web app shows up along the journey — quiet touchpoints.
const APP_TOUCH: Record<string, string> = {
  "02": "現在地を整理",
  "04": "記録する",
  "05": "つながる",
};

// Node positions around the ring (5 points, 72° apart, starting at top).
const POS = [
  { left: "50%", top: "6%" },
  { left: "89%", top: "37%" },
  { left: "74%", top: "85%" },
  { left: "26%", top: "85%" },
  { left: "11%", top: "37%" },
];

function CycleIcon({ className = "", size = 22 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

export default function HowFlow() {
  return (
    <div className="relative">
      {/* ===== Desktop / tablet: circular diagram ===== */}
      <div className="hidden md:block">
        <div className="relative mx-auto aspect-square w-full max-w-[560px] overflow-visible">
          {/* cycle path */}
          <div aria-hidden className="absolute inset-[9%] rounded-full border border-dashed border-[#1f2a1d]/20" />

          {/* center hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[36%] aspect-square rounded-full bg-white/85 backdrop-blur-sm border border-[#1f2a1d]/10 grid place-items-center text-center p-4 shadow-sm">
            <div>
              <CycleIcon className="mx-auto text-[#85AB8B]" size={24} />
              <div className="font-mono text-[9.5px] tracking-[0.2em] uppercase text-[#3d5638] mt-1.5">Recovery Journey</div>
              <div className="text-[12.5px] font-bold text-[#1f2a1d] mt-1" style={{ fontFamily: "var(--font-shippori), serif" }}>
                理解 → 自信 → つながり
              </div>
            </div>
          </div>

          {/* nodes */}
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className="absolute w-[150px] -translate-x-1/2 -translate-y-1/2 text-center"
              style={POS[i]}
            >
              <div className="relative mx-auto mb-2 grid place-items-center w-12 h-12 rounded-full bg-[#16241a] text-[#EDF1E8] font-mono text-[13px] font-bold ring-4 ring-white/70">
                {s.n}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#85AB8B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="absolute -right-2 -bottom-1 bg-white rounded-full p-px" aria-hidden>
                  {s.icon}
                </svg>
              </div>
              <h4 className="text-[14px] font-semibold text-[#1f2a1d]">{s.t}</h4>
              <p className="text-[11px] text-[#4b5b47] leading-[1.6] mt-0.5">{s.d}</p>
              {APP_TOUCH[s.n] && (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#16241a]/[0.06] text-[#16241a] px-2 py-0.5 text-[10.5px] font-medium">
                  <span aria-hidden>📱</span> {APP_TOUCH[s.n]}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== Mobile: vertical loop with a return arrow ===== */}
      <div className="md:hidden">
        <ol className="relative">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative flex gap-4 pb-6 last:pb-0">
              <div className="flex flex-col items-center">
                <span className="relative z-10 grid place-items-center w-11 h-11 rounded-full bg-[#16241a] text-[#EDF1E8] font-mono text-[13px] font-bold shrink-0">
                  {s.n}
                </span>
                {i < STEPS.length - 1 && <span aria-hidden className="w-px flex-1 bg-[#1f2a1d]/15 mt-1" />}
              </div>
              <div className="pt-1.5">
                <h4 className="text-[15px] font-semibold text-[#1f2a1d]">{s.t}</h4>
                <p className="text-[12.5px] text-[#4b5b47] leading-[1.8] mt-1">{s.d}</p>
                {APP_TOUCH[s.n] && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#16241a]/[0.06] text-[#16241a] px-2.5 py-1 text-[11px] font-medium">
                    <span aria-hidden>📱</span> {APP_TOUCH[s.n]}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
        {/* loop-back */}
        <div className="mt-5 flex items-center gap-2 rounded-full bg-[#e7ede4] text-[#3d5638] px-4 py-2 w-fit text-[12px] font-semibold">
          <CycleIcon size={16} />
          つながり、また理解へ。循環する。
        </div>
      </div>
    </div>
  );
}
