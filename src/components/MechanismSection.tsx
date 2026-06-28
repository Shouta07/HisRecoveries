// ② 理解する — "なぜ変われるのか。まずは、仕組みを知る。"
// Concern cards in parallel; each links into the existing articles (SEO).
import Link from "next/link";
import { complexes } from "@/lib/complexes";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function MechanismSection() {
  return (
    <section id="mechanism" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-20 md:pb-28">
        <div className="on-media max-w-2xl mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">
              The Mechanism
            </span>
          </div>
          <h2 className="text-[1.9rem] md:text-[2.4rem] leading-[1.35] text-[#1f2a1d]" style={{ ...MINCHO, fontWeight: 800 }}>
            あなたの悩みは、<br className="hidden sm:block" />
            <span className="text-[#3d5638]">仕組みから理解できます。</span>
          </h2>
          <p className="mt-4 text-[#4b5b47] text-[14.5px] leading-[1.95]">
            コンプレックスの多くは、性格ではなく、身体や心理の仕組みから説明できます。
            医師監修のもと、原因から。カードから、そのまま記事へ。
          </p>
        </div>

        {/* concern cards — parallel grid, each links to the articles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {complexes.map((c, i) => (
            <Link
              key={c.id}
              id={c.id}
              href={`/articles/category/${c.categories[0]}`}
              className="group scroll-mt-24 flex flex-col rounded-[1.5rem] bg-white border border-[#1f2a1d]/10 p-6 shadow-sm hover:shadow-[0_20px_40px_-22px_rgba(20,32,26,0.45)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-baseline gap-2.5 mb-3">
                <span className="font-mono text-[12px] text-[#85AB8B]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[1.25rem] font-bold text-[#1f2a1d]" style={MINCHO}>
                  {c.ja}
                </h3>
              </div>
              <span
                className="inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold"
                style={{ backgroundColor: c.accentSoft, color: c.accent }}
              >
                {c.system}
              </span>

              <p className="mt-4 text-[13px] italic text-[#6b7a66] leading-[1.8]">「{c.worry}」</p>

              <div className="mt-4 pt-4 border-t border-[#1f2a1d]/8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center rounded-full bg-[#e5f0ef] text-[#0f766e] px-2.5 py-0.5 text-[10.5px] font-bold">
                    医師監修
                  </span>
                  <span className="text-[11px] text-[#6b7a66]">メカニズム</span>
                </div>
                <p className="text-[12.5px] text-[#3a423a] leading-[1.95] line-clamp-5">{c.why}</p>
              </div>

              <span className="mt-auto pt-5 text-[12.5px] font-semibold text-[#3d5638] inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                記事を読む <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>

        <p className="on-media mt-8 text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ メカニズムは医師監修のもと、一般的に知られる情報を整理したものです。診断・治療・受診勧奨を目的としたものではありません。
          個別の判断は医療機関にご相談ください。
        </p>
      </div>
    </section>
  );
}
