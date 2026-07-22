// His Recoveries の特徴（Oh my teeth「〜の特徴」型の 2×2 グリッド）。
// 機能価値を4枚で。写真の代わりにブランド緑のアイコンで構成する。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

type Feature = { t: string; d: string; icon: React.ReactNode };

const FEATURES: Feature[] = [
  {
    t: "中立で、忖度なし",
    d: "モノも施術も売らない。紹介料も受け取らない。だから、あなたに本当に合うものだけを。",
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
    t: "まとめて、ひとつの窓口",
    d: "髪・肌・体・心。探して・比べて・説明して…の手間を、こちらが引き受けます。",
    icon: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  {
    t: "LINEで、相談も記録も",
    d: "友だち追加から。相談も変化も、LINEに続く。記録はあなたのもの——いつでも見返せ、消せます。",
    icon: (
      <>
        <path d="M21 11.5a8.5 8.5 0 0 1-11.7 7.9L4 21l1.6-5.3A8.5 8.5 0 1 1 21 11.5z" />
        <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
      </>
    ),
  },
  {
    t: "費用は、先に・予算内",
    d: "総額の目安と内訳を、契約の前に必ず。合意した予算を超える提案はしません。",
    icon: (
      <>
        <path d="M6 3h9l4 4v14a0 0 0 0 1 0 0H6a0 0 0 0 1 0 0V3z" />
        <path d="M14 3v4h4" />
        <path d="M9 12h6M9 15.5h6M10.5 10v7.5" />
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
