// His Recoveries の特徴（Oh my teeth「〜の特徴」型の 2×2 グリッド）。
// 機能価値を4枚で。写真の代わりにブランド緑のアイコンで構成する。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

type Feature = { t: string; d: string; icon: React.ReactNode };

const FEATURES: Feature[] = [
  {
    t: "専属チーム貸切、一日で。",
    d: "メイク・服・写真のプロが、あなた一人のために。自分で3業者を探し回る必要はありません。",
    icon: (
      <>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 20c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5" />
        <path d="M16.5 5.2a3 3 0 0 1 0 5.8M17 14.6c2.4.4 3.8 2.4 3.8 5.4" />
      </>
    ),
  },
  {
    t: "売らない、送客しない。",
    d: "モノも施術も売らず、紹介料も受け取らない。「やらない方がいい」も正直に言える中立。",
    icon: (
      <>
        <path d="M12 3v18" />
        <path d="M5 7h14" />
        <path d="M5 7l-2.5 5.5a3 3 0 0 0 5 0L5 7zM19 7l-2.5 5.5a3 3 0 0 0 5 0L19 7z" />
        <path d="M8 21h8" />
      </>
    ),
  },
  {
    t: "当事者が、つくっている。",
    d: "同じ悩みを抱えた側から始めました。煽らず、急かさず、見下さない。",
    icon: (
      <path d="M12 20s-6.6-4.3-9-8.6C1.1 7.9 3 4.4 6.3 4.4c2 0 3.2 1.2 3.7 2.2.5-1 1.7-2.2 3.7-2.2 3.3 0 5.2 3.5 3.3 7C18.6 15.7 12 20 12 20z" />
    ),
  },
  {
    t: "その日で、終わらせない。",
    d: "自分で再現できるレッスンと、あなたのものとして残る記録（LINE）。一度きりにしない。",
    icon: (
      <>
        <path d="M20.5 11.5A8.5 8.5 0 0 0 5.5 6M4 3.5V7h3.5" />
        <path d="M3.5 12.5A8.5 8.5 0 0 0 18.5 18M20 20.5V17h-3.5" />
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
