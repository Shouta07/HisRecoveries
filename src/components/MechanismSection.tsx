// 取り扱う領域 — concern cards as a CURATION: a short medical-supervised
// mechanism, then short excerpts quoted from each clinic's own articles
// (always attributed + linked out, never endorsed).
import Link from "next/link";
import { complexes } from "@/lib/complexes";
import { citationsByComplex } from "@/lib/citations";

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
              Areas We Work With
            </span>
          </div>
          <h2 className="text-[1.9rem] md:text-[2.4rem] leading-[1.3] text-[#1f2a1d]" style={{ ...MINCHO, fontWeight: 800 }}>
            取り扱う<span className="text-[#3d5638]">領域。</span>
          </h2>
          <p className="mt-4 text-[#4b5b47] text-[14.5px] leading-[1.95]">
            中立な医学情報源を参考に、出典を明記してキュレーションします。
          </p>
        </div>

        {/* concern cards — parallel grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {complexes.map((c, i) => {
            const cites = citationsByComplex[c.id] ?? [];
            return (
              <article
                key={c.id}
                id={c.id}
                className="scroll-mt-24 flex flex-col rounded-[1.5rem] bg-white border border-[#1f2a1d]/10 p-6 shadow-sm"
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

                {/* reference preview + link to the full article */}
                <div className="mt-4 pt-4 border-t border-[#1f2a1d]/8">
                  <div className="text-[11px] font-medium text-[#3d5638] mb-2">出典・参考</div>
                  {cites.length > 0 ? (
                    <p className="text-[12px] text-[#4b5b47] leading-[1.7]">
                      {cites[0].quote ? `「${cites[0].quote}」— ` : ""}
                      {Array.from(new Set(cites.map((c) => c.source))).join(" ・ ")}
                    </p>
                  ) : (
                    <p className="text-[12px] text-[#9aa79a] leading-[1.8]">出典は順次追加。</p>
                  )}
                </div>

                <Link
                  href={`/areas/${c.id}`}
                  className="mt-auto pt-5 text-[12.5px] font-semibold text-[#3d5638] inline-flex items-center gap-1 hover:gap-1.5 transition-all"
                >
                  解説を読む <span aria-hidden>→</span>
                </Link>
              </article>
            );
          })}
        </div>

        <p className="on-media mt-8 text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ メカニズムは医師監修のもと、一般的に知られる情報を整理したものです。出典・参考リンクは中立な医学情報源によります。
          特定の医療機関を推奨するものではなく、診断・治療・受診勧奨を目的としたものではありません。個別の判断は医療機関にご相談ください。
        </p>
      </div>
    </section>
  );
}
