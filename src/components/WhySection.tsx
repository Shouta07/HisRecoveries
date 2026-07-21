// Why — なぜ His Recoveries がこれをやるのか。ホーム上部(Step 01の上)に置く、
// 思想(manifesto)からの引用をシンプルにまとめた版。煽らず・断定せず。
import Link from "next/link";
const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function WhySection() {
  return (
    <section id="why" className="relative z-10 scroll-mt-24">
      <div className="max-w-[860px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-6">
        <div className="rounded-[2rem] bg-[#16241a] text-[#EDF1E8] p-8 sm:p-12 overflow-hidden relative">
          <div aria-hidden className="absolute -top-20 -right-12 w-80 h-80 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.16)" }} />
          <div className="relative">
            <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#85AB8B] mb-4">Why — なぜ、やるのか</div>
            <h2 className="text-[#EDF1E8] text-[1.4rem] sm:text-[2rem] leading-[1.5]" style={{ ...MINCHO, fontWeight: 800, lineBreak: "strict" }}>
              「気にするな」で、<br />
              <span className="text-[#85AB8B]">終わらせたくない。</span>
            </h2>

            <div className="mt-6 space-y-4 text-[14px] sm:text-[15.5px] text-[#C9D2C4] leading-[2.05] max-w-[34rem]" style={{ lineBreak: "strict" }}>
              <p>
                相談すれば「気にしすぎ」。調べれば、売り込みばかり。
                <span className="text-[#EDF1E8] font-medium">本当の味方は、どこにもいなかった。</span>
              </p>
              <p>
                だから、<span className="text-[#85AB8B] font-semibold">モノや施術は、売りません</span>。
                あなたの側に立って、一本の線として伴走します。
              </p>
            </div>

            <Link href="/manifesto" className="mt-7 inline-flex items-center gap-2 text-[12.5px] font-semibold text-[#85AB8B] hover:text-[#EDF1E8] transition-colors">
              この続きを、思想として読む <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
