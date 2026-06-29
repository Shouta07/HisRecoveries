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
            <h2 className="text-[1.6rem] sm:text-[2.1rem] leading-[1.45]" style={{ ...MINCHO, fontWeight: 800 }}>
              「気にするな」で、<span className="text-[#85AB8B]">終わらせたくない。</span>
            </h2>

            <div className="mt-6 space-y-4 text-[14px] text-[#C9D2C4] leading-[2] max-w-xl">
              <p>
                男性のコンプレックスは、なかなか口にできません。相談すれば「気にしすぎ」と流され、
                調べれば売り込みばかり。本当に味方になってくれる人は、どこにもいなかった。
              </p>
              <p>
                私たち自身が、当事者として同じ道を通ってきました。だから知っています。
                コンプレックスは、性格でも甘えでもなく、仕組みで説明でき、向き合えること。
                そして、一人ではなかなか続かないこと。
              </p>
              <p>
                だから、売りません。紹介手数料も取りません。匿名のまま、原因の理解から、
                必要なら提携クリニックへ、そして定着まで——ただ、あなたの側に立って伴走します。
              </p>
            </div>

            <p className="mt-7 text-[15px] sm:text-[16px] text-[#EDF1E8] font-semibold leading-[1.7]" style={MINCHO}>
              誰にも言えなかった悩みを、「変われるもの」に。
              <br className="hidden sm:block" />
              それが、His Recoveries をやる理由です。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
