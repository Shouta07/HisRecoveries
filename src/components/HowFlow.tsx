// "改善の進め方" as one swipeable diagram: the app (phone mock) and the
// 5 steps merged into a single horizontal rail you swipe through with a finger.
// CSS scroll-snap only — native touch / trackpad swipe, no JS needed.
import { PhoneFrame, DashboardScreen, MemberScreen } from "@/components/HowShowcase";

const STEPS = [
  {
    n: "01",
    t: "原因を特定する",
    d: "自己観察と連携専門家の診断で、何が・なぜ起きているかを言葉に。",
    icon: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="M20 20l-3.5-3.5" />
      </>
    ),
  },
  {
    n: "02",
    t: "現状を分析する",
    d: "期間・費用・リスクを中立に並べる。「何もしない」も含めて。",
    icon: (
      <>
        <path d="M4 19V5M4 19h16" />
        <path d="M8 16l3-4 3 2 4-6" />
      </>
    ),
  },
  {
    n: "03",
    t: "パッケージを選ぶ",
    d: "悩みに合った体験パッケージを、押し付けずに一緒に選ぶ。",
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
    t: "実行し、伴走する",
    d: "専属担当がオンライン・対面で並走。必要な段階なら、紹介手数料ゼロで医療機関へ。",
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
    t: "定着したら卒業",
    d: "自分で再現できる状態がゴール。終わりを設計に含めます。",
    icon: (
      <>
        <path d="M20 6L9 17l-5-5" />
      </>
    ),
  },
];

// Where the Web app shows up along the journey — kept as a quiet touchpoint,
// not the headline (the app supports the change, it isn't the product).
const APP_TOUCH: Record<string, string> = {
  "02": "現在地を整理",
  "04": "記録する",
  "05": "振り返る",
};

function Arrow() {
  return (
    <div aria-hidden className="shrink-0 self-center hidden sm:flex items-center px-1 text-[#85AB8B]">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}

export default function HowFlow() {
  return (
    <div className="relative">
      {/* swipe hint */}
      <div className="on-media flex items-center gap-2 mb-3 text-[#6b7a66] text-[12px]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M5 12l5-5M5 12l5 5M19 12l-5-5M19 12l-5 5" />
        </svg>
        <span>横にスワイプ — 5つのステップ</span>
      </div>

      {/* horizontal swipe rail */}
      <div className="-mx-5 sm:-mx-8 px-5 sm:px-8 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-px-5 sm:scroll-px-8 overscroll-x-contain">
        <div className="flex items-stretch gap-4 sm:gap-3 pb-5 w-max">
          {/* step cards */}
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-stretch">
              <article className="snap-start shrink-0 w-[230px] sm:w-[244px] rounded-[1.6rem] bg-white border border-[#1f2a1d]/10 shadow-sm p-6 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <span className="grid place-items-center w-11 h-11 rounded-full bg-[#16241a] text-[#EDF1E8] font-mono text-[13px] font-bold">
                    {s.n}
                  </span>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#85AB8B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {s.icon}
                  </svg>
                </div>
                <h4 className="text-[15px] text-[#1f2a1d] font-semibold mb-2">{s.t}</h4>
                <p className="text-[12.5px] text-[#4b5b47] leading-[1.85]">{s.d}</p>
                {APP_TOUCH[s.n] && (
                  <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-[#16241a]/[0.06] text-[#16241a] px-2.5 py-1 text-[11px] font-medium">
                    <span aria-hidden>📱</span> {APP_TOUCH[s.n]}
                  </span>
                )}
                {s.n === "03" ? (
                  <a href="#packages" className="mt-auto pt-4 text-[12px] font-semibold text-[#3d5638] inline-flex items-center gap-1 hover:gap-1.5 transition-all">
                    パッケージを見る <span aria-hidden>↓</span>
                  </a>
                ) : (
                  <span aria-hidden className="mt-auto pt-4 text-[10.5px] tracking-[0.14em] uppercase font-mono text-[#a7b3a2]">
                    Step {s.n}
                  </span>
                )}
              </article>
              {i < STEPS.length - 1 && <Arrow />}
            </div>
          ))}
        </div>
      </div>

      {/* The Web app is end-to-end infrastructure — it accompanies all of
          ①〜⑤, so it sits across the flow (not as a step before ①). */}
      <div className="mt-5 rounded-[1.6rem] bg-[#16241a] text-[#EDF1E8] overflow-hidden grid md:grid-cols-[1.25fr_1fr] items-center">
        <div className="p-7 md:p-9">
          <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#85AB8B] mb-2">
            改善を支える仕組み
          </div>
          <h4 className="text-[1.3rem] md:text-[1.5rem] font-bold text-[#EDF1E8] mb-2" style={{ fontFamily: "var(--font-shippori), serif" }}>
            改善を、一人で終わらせない。
          </h4>
          <p className="text-[13px] text-[#C9D2C4] leading-[1.95]">
            改善は、一度頑張ることではありません。
            <span className="text-[#85AB8B] font-medium">状態を記録し、変化を見える化し、専属担当と共有</span>
            しながら進めます。
          </p>
        </div>
        <div className="relative flex items-end justify-center overflow-hidden pt-6 md:pt-8" style={{ perspective: "1200px" }}>
          <div className="scale-[0.8] sm:scale-90 flex items-end -mb-8 md:-mb-10">
            <PhoneFrame className="z-10" style={{ transform: "rotate(-5deg) translateY(8px)" }}>
              <DashboardScreen />
            </PhoneFrame>
            <PhoneFrame className="z-20 -ml-10" style={{ transform: "rotate(4deg) translateY(-10px) scale(1.02)" }}>
              <MemberScreen />
            </PhoneFrame>
          </div>
        </div>
      </div>
    </div>
  );
}
