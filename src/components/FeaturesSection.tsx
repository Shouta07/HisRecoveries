// His Recoveries の特徴（Oh my teeth「〜の特徴」型の 2×2 グリッド）。
// 機能価値を4枚で。写真の代わりにブランド緑のアイコンで構成する。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

type Feature = { t: string; d: string; icon: React.ReactNode };

// 体験の流れ＝「使うと、どう進むか」。機能の羅列（他社も言える）ではなく、
// 迷わない→逆算→終わらせる→迎える、という当日までの進み方そのものを見せる。
const FEATURES: Feature[] = [
  {
    t: "何をすればいいか、迷わない。",
    d: "調べる・比べる・選ぶを、こちらで引き受ける。あなたは、目の前の一つに集中するだけ。",
    icon: (
      <>
        <rect x="5.5" y="4" width="13" height="17" rx="2" />
        <path d="M9 4V3h6v1" />
        <path d="M8.5 12l2.2 2.2L15.5 9.5" />
      </>
    ),
  },
  {
    t: "期限から、逆算する。",
    d: "迎えたい日を決めれば、順番は決まる。いつ何をやるかが、その日から逆算で並びます。",
    icon: (
      <>
        <path d="M4 20L17 7" />
        <path d="M11 7h6v6" />
        <circle cx="4" cy="20" r="1.4" fill="#3d5638" stroke="none" />
      </>
    ),
  },
  {
    t: "一つずつ、終わらせる。",
    d: "全部を一度にやらない。今週の一つを終えて、チェックを付ける。それだけで進みます。",
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
    t: "理想の日を、迎える。",
    d: "当日、自信を持って立てること。そこがゴール。同じ悩みを知る人間が、最後まで伴走します。",
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
            当日までの、進み方
          </h2>
        </div>
        <p className="text-center text-[13px] sm:text-[14px] text-[#4b5b47] leading-[1.9] max-w-[30rem] mx-auto mb-8 sm:mb-10 -mt-3 sm:-mt-4">
          機能ではなく、体験で。迎えたい日まで、この4つを繰り返すだけです。
        </p>

        {/* 体験の流れ（→ でつなぐ）。機能の羅列ではなく、順番そのものを見せる。 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {FEATURES.map((f, i) => (
            <div key={f.t} className="relative flex flex-col items-center text-center rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 px-3 sm:px-6 py-6 sm:py-8">
              <span className="font-mono text-[10.5px] tracking-[0.2em] text-[#85AB8B] mb-2">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[13.5px] sm:text-[1.05rem] font-bold text-[#1f2a1d] leading-[1.45]" style={MINCHO}>{f.t}</h3>
              <span aria-hidden className="block w-8 h-px bg-[#1f2a1d]/15 my-3 sm:my-4" />
              <span aria-hidden className="grid place-items-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#eef3ea] mb-3 sm:mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3d5638" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {f.icon}
                </svg>
              </span>
              <p className="text-[11px] sm:text-[12.5px] text-[#4b5b47] leading-[1.7]">{f.d}</p>
              {i < FEATURES.length - 1 && (
                <span aria-hidden className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-[#85AB8B] text-[15px]">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
