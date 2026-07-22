// His Recoveries の特徴（Oh my teeth「〜の特徴」型の 2×2 グリッド）。
// 機能価値を4枚で。写真の代わりにブランド緑のアイコンで構成する。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

type Feature = { t: string; d: string; icon: React.ReactNode };

const FEATURES: Feature[] = [
  {
    t: "レベルアップが、見える。",
    d: "コンディションも印象も、数値で。上がっていくのが目に見えるから、続くのが楽しい。",
    icon: (
      <>
        <path d="M4 20h16" />
        <path d="M4.5 15.5l4-3.5 4 2 6.5-8.5" />
        <circle cx="19" cy="5.5" r="1.1" fill="#3d5638" stroke="none" />
      </>
    ),
  },
  {
    t: "点ではなく、線で。",
    d: "薄毛だけ・肌だけで終わらせない。理想への地図に沿って、まとめて最短で向かう。",
    icon: (
      <>
        <circle cx="5" cy="18.5" r="1.8" />
        <circle cx="12" cy="11" r="1.8" />
        <circle cx="19" cy="5" r="1.8" />
        <path d="M6.3 17.1 10.7 12.4M13.3 9.6 17.7 6.4" />
      </>
    ),
  },
  {
    t: "当事者が、隣で。",
    d: "同じ悩みを越えた側が伴走。煽らず、急かさず、見下さない。ひとりにしません。",
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="16.5" cy="9.2" r="2.2" />
        <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
        <path d="M15 19.5c0-2 1.1-3.5 2.9-3.7" />
      </>
    ),
  },
  {
    t: "仲間と、続ける。",
    d: "志を同じくする男たちと（任意・匿名で）。見せなくていい、でも独りでもない。",
    icon: (
      <>
        <circle cx="12" cy="7" r="2.5" />
        <circle cx="5.5" cy="10.5" r="2.1" />
        <circle cx="18.5" cy="10.5" r="2.1" />
        <path d="M8 19.5c0-2.4 1.8-4.3 4-4.3s4 1.9 4 4.3" />
        <path d="M2.8 18.5c0-1.9 1.3-3.4 3-3.4M18.2 15.1c1.7 0 3 1.5 3 3.4" />
      </>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-8">
        {/* コーナー括弧つき見出し */}
        <div className="relative mx-auto w-fit px-9 py-3 mb-8 sm:mb-10">
          <span aria-hidden className="absolute left-0 top-0 w-4 h-4 border-l-2 border-t-2 border-[#85AB8B]" />
          <span aria-hidden className="absolute right-0 top-0 w-4 h-4 border-r-2 border-t-2 border-[#85AB8B]" />
          <span aria-hidden className="absolute left-0 bottom-0 w-4 h-4 border-l-2 border-b-2 border-[#85AB8B]" />
          <span aria-hidden className="absolute right-0 bottom-0 w-4 h-4 border-r-2 border-b-2 border-[#85AB8B]" />
          <h2 className="text-[1.4rem] sm:text-[2rem] text-center leading-[1.3]" style={{ ...MINCHO, fontWeight: 800 }}>
            His Recoveries の特徴
          </h2>
        </div>

        {/* 2×2（スマホも2カラム） */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {FEATURES.map((f) => (
            <div key={f.t} className="flex flex-col items-center text-center rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 px-3 sm:px-6 py-6 sm:py-8">
              <h3 className="text-[13.5px] sm:text-[1.05rem] font-bold text-[#1f2a1d] leading-[1.45]" style={MINCHO}>{f.t}</h3>
              <span aria-hidden className="block w-8 h-px bg-[#1f2a1d]/15 my-3 sm:my-4" />
              <span aria-hidden className="grid place-items-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#eef3ea] mb-3 sm:mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3d5638" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {f.icon}
                </svg>
              </span>
              <p className="text-[11px] sm:text-[12.5px] text-[#4b5b47] leading-[1.7]">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
