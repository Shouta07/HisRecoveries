// Why — なぜ His Recoveries がこれをやるのか（存在理由）。
// 当事者視点で、煽らず・断定せず・効果に言及せず。
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function WhySection() {
  return (
    <section id="why" className="relative z-10 scroll-mt-24">
      <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-6">
        <div className="rounded-[2rem] bg-[#16241a] text-[#EDF1E8] p-8 sm:p-12 overflow-hidden relative">
          <div aria-hidden className="absolute -top-20 -right-12 w-80 h-80 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.16)" }} />
          <div className="relative">
            <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#85AB8B] mb-4">Why — なぜ、やるのか</div>
            <h2 className="text-[1.4rem] sm:text-[2rem] leading-[1.5]" style={{ ...MINCHO, fontWeight: 800, lineBreak: "strict" }}>
              「気にするな」で、<br />
              <span className="text-[#85AB8B]">終わらせたくない。</span>
            </h2>

            <div className="mt-7 space-y-6 text-[14px] sm:text-[15.5px] text-[#C9D2C4] leading-[2.1] max-w-[34rem]" style={{ lineBreak: "strict" }}>
              <p>
                男性のコンプレックスは、なかなか口にできない。
                相談すれば「気にしすぎ」と流され、調べれば売り込みばかり。
                <br className="hidden sm:block" />
                <span className="text-[#EDF1E8] font-medium">本当の味方は、どこにもいなかった。</span>
              </p>
              <p>
                私たちも、当事者として同じ道を通ってきました。だから知っています。
                <br className="hidden sm:block" />
                コンプレックスは、性格でも甘えでもなく、<span className="text-[#EDF1E8] font-medium">仕組みで向き合えること</span>。
                そして、<span className="text-[#EDF1E8] font-medium">一人では、続かないこと</span>。
              </p>
              <p>
                だから、<span className="text-[#85AB8B] font-semibold">何も、売りません</span>。
                匿名のまま、理解から、必要なら提携クリニックへ、定着まで。
                <br className="hidden sm:block" />
                ただ、<span className="text-[#EDF1E8] font-medium">あなたの側に立って伴走します</span>。
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-[1.05rem] sm:text-[1.25rem] text-[#EDF1E8] leading-[1.7]" style={{ ...MINCHO, fontWeight: 800 }}>
                誰にも言えなかった悩みを、「<span className="text-[#85AB8B]">変われるもの</span>」に。
              </p>
              <p className="mt-2 text-[12.5px] text-[#9FB0A0]">— それが、His Recoveries をやる理由です。</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
