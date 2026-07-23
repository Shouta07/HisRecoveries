// His Recoveries の特徴（Oh my teeth「〜の特徴」型の 2×2 グリッド）。
// 機能価値を4枚で。写真の代わりにブランド緑のアイコンで構成する。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

type Feature = { t: string; d: string; icon: React.ReactNode };

// 機能的価値＝「なぜ使うべきか」を4つで。情緒ではなく"何が得か"。
const FEATURES: Feature[] = [
  {
    t: "探す手間が、ゼロ。",
    d: "調べる・比べる・予約する。ぜんぶ、こちらで代行。あなたは選んで、来るだけ。",
    icon: (
      <>
        <rect x="5.5" y="4" width="13" height="17" rx="2" />
        <path d="M9 4V3h6v1" />
        <path d="M8.5 12l2.2 2.2L15.5 9.5" />
      </>
    ),
  },
  {
    t: "遠回りしない。",
    d: "現在地→理想の地図で、最短ルート。効かないものに、時間もお金も使わせない。",
    icon: (
      <>
        <path d="M4 20L17 7" />
        <path d="M11 7h6v6" />
        <circle cx="4" cy="20" r="1.4" fill="#3d5638" stroke="none" />
      </>
    ),
  },
  {
    t: "プロが、一日で仕上げる。",
    d: "メイク・服・写真の専属チームが、あなた一人のために。自分のセンスに頼らなくていい。",
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
    t: "売らないから、正直。",
    d: "紹介料0・中立。「やらない方がいい」も言える。費用は先に、予算も超えない。",
    icon: (
      <>
        <path d="M12 3v18" />
        <path d="M5 7h14" />
        <path d="M5 7l-2.5 5.5a3 3 0 0 0 5 0L5 7zM19 7l-2.5 5.5a3 3 0 0 0 5 0L19 7z" />
        <path d="M8 21h8" />
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
