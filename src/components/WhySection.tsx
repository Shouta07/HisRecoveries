// Why — なぜ His Recoveries がこれをやるのか（存在理由）。
// 当事者視点で、煽らず・断定せず・効果に言及せず。
import Link from "next/link";
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
            <h2 className="text-[#EDF1E8] text-[1.4rem] sm:text-[2rem] leading-[1.5]" style={{ ...MINCHO, fontWeight: 800, lineBreak: "strict" }}>
              「気にするな」で、<br />
              <span className="text-[#85AB8B]">終わらせたくない。</span>
            </h2>

            <div className="mt-7 space-y-5 text-[14px] sm:text-[15.5px] text-[#C9D2C4] leading-[2.05] max-w-[34rem]" style={{ lineBreak: "strict" }}>
              <p>
                相談すれば「気にしすぎ」。調べれば、売り込みばかり。
                <br className="hidden sm:block" />
                <span className="text-[#EDF1E8] font-medium">本当の味方は、どこにもいなかった。</span>
              </p>
              <p>
                見た目の話だと思われがちだけれど、本当はもっと奥のこと——<span className="text-[#EDF1E8] font-medium">自信や、誰かとの関係のこと</span>だと、私たちは知っています。
              </p>
              <p>
                口に出さないだけで、同じ悩みを抱える人は、思うよりずっと多い。
                私たちも、その一人でした。だから、<span className="text-[#EDF1E8] font-medium">自分が欲しかったものを作りました</span>。
              </p>
              <p>
                <span className="text-[#85AB8B] font-semibold">モノや施術は、売りません</span>。
                要らないものは、要らないと。<span className="text-[#EDF1E8] font-medium">紹介料を受け取りません。</span>
                <br className="hidden sm:block" />
                匿名のまま、あなたの側に立って、一本の線として伴走します。
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-[1.05rem] sm:text-[1.25rem] text-[#EDF1E8] leading-[1.7]" style={{ ...MINCHO, fontWeight: 800 }}>
                誰にも言えなかった悩みを、「<span className="text-[#85AB8B]">変われるもの</span>」に。
              </p>
              <p className="mt-2 text-[12.5px] text-[#9FB0A0]">— それが、His Recoveries をやる理由です。</p>
              <Link href="/manifesto" className="mt-4 inline-flex items-center gap-2 text-[12.5px] font-semibold text-[#85AB8B] hover:text-[#EDF1E8] transition-colors">
                この続きを、思想として読む・仲間を募っています <span aria-hidden>→</span>
              </Link>
              <p className="mt-2.5 text-[12px] text-[#9FB0A0]">
                現場で働くプロの方へ——
                <Link href="/partners" className="ml-1 underline underline-offset-2 hover:text-[#EDF1E8] transition-colors">この線を、一緒につくりませんか</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
