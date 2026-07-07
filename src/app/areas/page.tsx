import type { Metadata } from "next";
import Link from "next/link";
import { complexes } from "@/lib/complexes";
import { getArea } from "@/lib/areas";
import { clustersByArea } from "@/lib/clusters";
import { site } from "@/lib/site";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

export const metadata: Metadata = {
  title: "第一印象ライブラリ — 仕組みの解説と、現場のプロの言葉",
  description:
    "薄毛・ニキビ/肌・顔の印象・髭/体毛。第一印象にまつわる男性の悩みが「なぜ起きるのか」の中立な解説と、各業界の第一線で働くプロの記事・取材を、出典を明記して集約するライブラリ。",
  alternates: { canonical: `${site.url}/areas` },
};

export default function AreasIndexPage() {
  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <div className="mx-auto max-w-[920px] px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[12px] tracking-[0.16em] uppercase text-[#3d5638] font-medium">
              Mechanism Library
            </span>
          </div>
          <h1 className="text-[2.2rem] sm:text-[3rem] leading-[1.25]" style={HEAD}>
            仕組みと、<span className="text-[#3d5638]">現場の言葉を、集める。</span>
          </h1>
          <p className="mt-5 text-[15px] text-[#4b5b47] leading-[1.95] max-w-2xl">
            髪・肌・顔・体毛——第一印象にまつわる悩みが「なぜ起きるのか」の中立な解説に、
            各業界の第一線で働くプロの記事の紹介と取材を重ねていく、出典明記のライブラリです。
          </p>
        </header>

        <div className="space-y-5">
          {complexes.map((c, i) => {
            const area = getArea(c.id);
            const articles = clustersByArea(c.id);
            return (
              <section
                key={c.id}
                className="rounded-[1.5rem] bg-white border border-[#1f2a1d]/10 p-7 sm:p-8 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline gap-2.5 mb-2">
                  <span className="font-mono text-[12px] text-[#85AB8B]">{String(i + 1).padStart(2, "0")}</span>
                  <Link href={`/areas/${c.id}`} className="text-[1.35rem] font-bold text-[#1f2a1d] hover:text-[#3d5638] transition-colors" style={HEAD}>
                    {c.ja}
                  </Link>
                  <span
                    className="inline-flex rounded-full px-2.5 py-0.5 text-[10.5px] font-bold"
                    style={{ backgroundColor: c.accentSoft, color: c.accent }}
                  >
                    {c.system}
                  </span>
                </div>

                {area && (
                  <p className="text-[13.5px] text-[#4b5b47] leading-[1.95] mb-4">{area.lead}</p>
                )}

                {/* 記事一覧 */}
                <ul className="border-t border-[#1f2a1d]/8 divide-y divide-[#1f2a1d]/8">
                  <li>
                    <Link
                      href={`/areas/${c.id}`}
                      className="group flex items-center justify-between gap-3 py-3 text-[13.5px] font-semibold text-[#1f2a1d] hover:text-[#3d5638] transition-colors"
                    >
                      {c.ja}は、なぜ起きるのか — 原因と仕組み
                      <span aria-hidden className="text-[#3d5638] shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
                    </Link>
                  </li>
                  {articles.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/areas/${c.id}/${a.slug}`}
                        className="group flex items-center justify-between gap-3 py-3 text-[13px] text-[#4b5b47] hover:text-[#1f2a1d] transition-colors"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          {a.kind === "interview" && (
                            <span className="inline-flex shrink-0 rounded-full bg-[#3d5638] text-white px-2 py-0.5 text-[9.5px] font-bold">取材</span>
                          )}
                          <span className="truncate">{a.title}</span>
                        </span>
                        <span aria-hidden className="text-[#85AB8B] shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <p className="mt-10 text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ メカニズムは一般的に知られる情報を、出典を明記して整理したものです。出典・参考リンクは中立な医学情報源によります。
          特定の医療機関を推奨するものではなく、診断・治療・受診勧奨を目的としたものではありません。個別の判断は医療機関にご相談ください。
        </p>
      </div>
    </div>
  );
}
