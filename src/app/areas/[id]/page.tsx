import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { complexes, complexById } from "@/lib/complexes";
import { getArea } from "@/lib/areas";
import { citationsByComplex } from "@/lib/citations";
import { site } from "@/lib/site";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

export function generateStaticParams() {
  return complexes.map((c) => ({ id: c.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const c = complexById(params.id);
  const area = getArea(params.id);
  if (!c || !area) return {};
  return {
    title: `${c.ja} — なぜ起きるのか（取り扱う領域）`,
    description: area.lead,
    alternates: { canonical: `${site.url}/areas/${c.id}` },
  };
}

export default function AreaPage({ params }: { params: { id: string } }) {
  const c = complexById(params.id);
  const area = getArea(params.id);
  if (!c || !area) notFound();

  const cites = citationsByComplex[c.id] ?? [];

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <div className="mx-auto max-w-[760px] px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
        <Link href="/#mechanism" className="text-[12px] text-[#3d5638] font-semibold hover:opacity-70 transition-opacity">
          ← 取り扱う領域
        </Link>

        <header className="mt-6 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span
              className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold"
              style={{ backgroundColor: c.accentSoft, color: c.accent }}
            >
              {c.system}
            </span>
          </div>
          <h1 className="text-[2rem] sm:text-[2.6rem] leading-[1.3]" style={HEAD}>
            {c.ja}は、<span className="text-[#3d5638]">なぜ起きるのか。</span>
          </h1>
          <p className="mt-5 text-[15px] text-[#4b5b47] leading-[2]">{area.lead}</p>
          <div className="mt-4 inline-flex items-center rounded-full bg-[#e5f0ef] text-[#0f766e] px-3 py-1 text-[11px] font-bold">
            医師監修
          </div>
        </header>

        {/* 原文（主） */}
        <div className="space-y-8">
          {area.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-[1.15rem] font-bold text-[#1f2a1d] mb-2" style={HEAD}>
                {s.h}
              </h2>
              <p className="text-[14px] text-[#3a423a] leading-[2]">{s.body}</p>
            </section>
          ))}

          <section className="rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 p-6">
            <h2 className="text-[1.05rem] font-bold text-[#1f2a1d] mb-2" style={HEAD}>
              受診の目安
            </h2>
            <p className="text-[13.5px] text-[#4b5b47] leading-[1.95]">{area.whenToSee}</p>
          </section>
        </div>

        {/* 引用（従） */}
        <section className="mt-12">
          <h2 className="text-[1.05rem] font-bold text-[#1f2a1d] mb-4" style={HEAD}>
            クリニックの解説より（引用）
          </h2>
          {cites.length > 0 ? (
            <div className="space-y-4">
              {cites.map((q, i) => (
                <blockquote key={i} className="border-l-2 border-[#85AB8B] pl-4 py-1">
                  <p className="text-[13.5px] text-[#1f2a1d] leading-[1.95]">「{q.quote}」</p>
                  <footer className="mt-2 text-[12px] text-[#6b7a66]">
                    — {q.source}
                    {q.url && (
                      <a
                        href={q.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="ml-2 text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-2 hover:decoration-[#3d5638]"
                      >
                        解説を読む↗
                      </a>
                    )}
                  </footer>
                </blockquote>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#9aa79a] leading-[1.9]">
              各クリニックの解説から、順次キュレーションします。
            </p>
          )}
        </section>

        <p className="mt-12 text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ 本記事は医師監修のもと、一般的に知られる情報を整理したものです。引用は各クリニックの解説により、出典を明記します。
          特定の医療機関を推奨するものではなく、診断・治療・受診勧奨を目的としたものではありません。個別の判断は医療機関にご相談ください。
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/#mechanism" className="inline-flex items-center gap-2 rounded-full border border-[#1f2a1d]/20 hover:border-[#1f2a1d] text-[#1f2a1d] text-sm font-semibold px-7 py-3.5 transition-colors">
            ほかの領域を見る <span aria-hidden>→</span>
          </Link>
          <Link href="/apply" className="inline-flex items-center gap-2 rounded-full bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 transition-colors">
            予約登録する <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
