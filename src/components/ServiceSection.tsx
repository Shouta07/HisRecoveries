// Service — 一本の線を1セクションに集約。
// Step 01 現在地を知る（外側=印象診断¥22,000 / 内側=血液・準備中）
// CTA はすべて既存の匿名相談導線（/apply）。
import Link from "next/link";
import { visibleExperiences } from "@/lib/experiences";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function ServiceSection() {
  return (
    <section id="service" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-8 sm:pt-16 pb-6">

        {/* Step 01 — 現在地を知る */}
        <div className="on-media max-w-2xl mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">Service — できること</span>
          </div>
          <h2 className="text-[1.4rem] sm:text-[1.8rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
            いま動きたい人にも、そろそろの人にも。
          </h2>
          <p className="mt-3 text-[#4b5b47] text-[13px] sm:text-[14.5px] leading-[1.95]">
            「何から始めればいいか分からない」も、「今は困ってないけど、そろそろ」も。
            <br className="hidden sm:block" />
            外側（見た目）と内側（コンディション）から、あなたに合う一歩を。どの体験も、悩みを聞く匿名相談から始まります。
          </p>
        </div>

        {/* 体験モジュール（experiences レジストリから描画。拡張は配列に1件足すだけ） */}
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
          {visibleExperiences.map((e) => (
            <Link key={e.id} href={e.href} className="group rounded-[1.4rem] bg-white border border-[#1f2a1d]/12 p-5 sm:p-7 hover:border-[#3d5638]/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] tracking-[0.18em] text-[#3d5638] font-semibold">{e.axisLabel}</span>
                <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${e.status === "available" ? "bg-[#16241A] text-[#EDF1E8]" : "bg-[#eef3ea] text-[#3d5638]"}`}>{e.statusLabel}</span>
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-[1.05rem] font-bold text-[#1f2a1d]" style={MINCHO}>{e.name}</span>
                {e.price && <span className="text-[13px] font-bold text-[#3d5638]">{e.price}</span>}
              </div>
              {e.hook && <p className="mt-1.5 text-[12px] font-semibold text-[#3d5638] leading-[1.7]">{e.hook}</p>}
              <p className="mt-1.5 text-[12px] text-[#4b5b47] leading-[1.85]">{e.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#3d5638] group-hover:gap-2.5 transition-all">{e.cta} <span aria-hidden>→</span></span>
            </Link>
          ))}
        </div>

        {/* 気になることは、いくつでも（複数選択して始められる） */}
        <div className="on-media mb-8 rounded-[1.4rem] border border-[#1f2a1d]/10 bg-white/60 p-5 sm:p-7">
          <div className="text-[13.5px] font-bold text-[#1f2a1d] mb-3" style={MINCHO}>気になることは、いくつでも。</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {["薄毛", "ニキビ・肌", "疲れて見える", "清潔感", "写真が苦手", "自信・パートナーシップ", "そのほか"].map((t) => (
              <span key={t} className="rounded-full border border-[#3d5638]/25 bg-[#eef3ea] px-3.5 py-1.5 text-[12px] font-medium text-[#3d5638]">
                {t}
              </span>
            ))}
          </div>
          <p className="text-[12.5px] text-[#4b5b47] leading-[1.9]">
            ひとつに絞らなくて大丈夫。<span className="text-[#1f2a1d] font-medium">複数の悩みをまとめて、ひとつの窓口で</span>始められます。何から手をつけるかは、一緒に決めます。
          </p>
        </div>

      </div>
    </section>
  );
}
