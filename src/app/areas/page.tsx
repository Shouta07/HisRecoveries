import type { Metadata } from "next";
import Link from "next/link";
import { complexes } from "@/lib/complexes";
import { getArea, AREA_UPDATED } from "@/lib/areas";
import { clustersByArea } from "@/lib/clusters";
import { fieldVoicesByArea } from "@/lib/fieldVoices";
import ExperienceInvite from "@/components/ExperienceInvite";
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
  keywords: [
    "第一印象 改善", "男性 見た目 悩み", "薄毛 原因", "ニキビ跡 原因",
    "老けて見える 原因", "体毛 濃い 原因", "メンズ 身だしなみ", "メンズメイク 初心者",
  ],
  alternates: { canonical: `${site.url}/areas` },
  openGraph: {
    type: "website",
    url: `${site.url}/areas`,
    title: "第一印象ライブラリ — 仕組みの解説と、現場のプロの言葉",
    description:
      "男性の第一印象にまつわる悩みが「なぜ起きるのか」の中立な解説と、現場のプロの言葉を、出典を明記して集約するライブラリ。",
  },
};

const READINGS = [
  { t: "仕組みの解説", d: "「なぜ起きるのか」を、中立に。出典を明記して整理します。" },
  { t: "現場の言葉（取材）", d: "第一線で働くプロに、直接聞いた一次情報。" },
  { t: "現場の声（キュレーション）", d: "プロが公開する記事を、出典明記で紹介します。" },
];

export default function AreasIndexPage() {
  const url = `${site.url}/areas`;

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    name: "第一印象ライブラリ",
    description:
      "男性の第一印象にまつわる悩みが「なぜ起きるのか」の中立な解説と、現場のプロの言葉を、出典を明記して集約するライブラリ。",
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
    dateModified: AREA_UPDATED,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: complexes.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${c.ja}は、なぜ起きるのか — 原因と仕組み`,
        url: `${site.url}/areas/${c.id}`,
      })),
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "第一印象ライブラリ", item: url },
    ],
  };

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="mx-auto max-w-[960px] px-6 sm:px-10 pt-14 sm:pt-20 pb-24">
        {/* breadcrumb */}
        <nav aria-label="パンくず" className="text-[12px] text-[#6b7a66] mb-8">
          <Link href="/" className="hover:text-[#1f2a1d]">ホーム</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#1f2a1d]">第一印象ライブラリ</span>
        </nav>

        {/* header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[12px] tracking-[0.16em] uppercase text-[#3d5638] font-medium">Library</span>
          </div>
          <h1 className="text-[2.2rem] sm:text-[3rem] leading-[1.24]" style={HEAD}>
            仕組みと、<span className="text-[#3d5638]">現場の言葉を、集める。</span>
          </h1>
          <p className="mt-5 text-[15px] text-[#4b5b47] leading-[1.95] max-w-2xl">
            髪・肌・顔・体毛——第一印象にまつわる悩みが「なぜ起きるのか」の中立な解説に、
            各業界の第一線で働くプロの記事の紹介と取材を重ねていく、出典明記のライブラリです。
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2.5 text-[11.5px]">
            <span className="inline-flex items-center rounded-full bg-[#e5f0ef] text-[#0f766e] px-3 py-1 font-bold">出典明記</span>
            <span className="inline-flex items-center rounded-full bg-[#eef3ea] text-[#3d5638] px-3 py-1 font-bold">中立・売らない</span>
            <span className="text-[#9aa79a]">最終更新: {AREA_UPDATED}</span>
          </div>
        </header>

        {/* このライブラリの3つの読みもの */}
        <div className="grid sm:grid-cols-3 gap-3 mb-10">
          {READINGS.map((r, i) => (
            <div key={r.t} className="rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 p-5">
              <div className="font-mono text-[11px] text-[#85AB8B] mb-1.5">{String(i + 1).padStart(2, "0")}</div>
              <div className="text-[13.5px] font-bold text-[#1f2a1d] mb-1" style={HEAD}>{r.t}</div>
              <p className="text-[11.5px] text-[#6b7a66] leading-[1.8]">{r.d}</p>
            </div>
          ))}
        </div>

        {/* トピックのクイックナビ */}
        <div className="flex flex-wrap gap-2 mb-10">
          {complexes.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="inline-flex items-center rounded-full border border-[#1f2a1d]/12 bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[#3a423a] hover:border-[#3d5638]/50 hover:text-[#1f2a1d] transition-colors"
            >
              {c.ja}
            </a>
          ))}
        </div>

        {/* 領域ごとのセクション */}
        <div className="space-y-5">
          {complexes.map((c, i) => {
            const area = getArea(c.id);
            const articles = clustersByArea(c.id);
            const explainers = articles.filter((a) => a.kind !== "interview");
            const interviews = articles.filter((a) => a.kind === "interview");
            const voices = fieldVoicesByArea(c.id);

            const meta: string[] = [`解説 ${explainers.length + 1}本`];
            if (interviews.length) meta.push(`取材 ${interviews.length}本`);
            if (voices.length) meta.push(`現場の声 ${voices.length}件`);

            return (
              <section
                key={c.id}
                id={c.id}
                className="scroll-mt-24 rounded-[1.5rem] bg-white border border-[#1f2a1d]/10 p-7 sm:p-8 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline gap-2.5 mb-1">
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
                  <span className="ml-auto text-[11px] text-[#9aa79a]">{meta.join("・")}</span>
                </div>

                {area && (
                  <p className="text-[13.5px] text-[#4b5b47] leading-[1.95] mt-2 mb-4">{area.lead}</p>
                )}

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

        {/* 記事 → 体験の橋渡し */}
        <ExperienceInvite context="第一印象の「なぜ」を知ったら、次は整える一日を" />

        {/* 現場のプロの方へ（三方よしの入口） */}
        <div className="mt-4 rounded-[1.4rem] border border-[#1f2a1d]/10 bg-[#f0f4ee]/70 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-[1.05rem] font-bold text-[#1f2a1d] mb-1" style={HEAD}>この領域の、現場のプロの方へ。</h2>
            <p className="text-[12.5px] text-[#4b5b47] leading-[1.85]">
              取材・記事の紹介（キュレーション）・チーム参画で、一緒に男性のウェルネスを。
            </p>
          </div>
          <Link href="/partners" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-[13px] font-semibold px-6 py-3 transition-colors">
            関わり方を見る <span aria-hidden>→</span>
          </Link>
        </div>

        <p className="mt-10 text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ メカニズムは一般的に知られる情報を、出典を明記して整理したものです。出典・参考リンクは中立な医学情報源によります。
          特定の医療機関を推奨するものではなく、診断・治療・受診勧奨を目的としたものではありません。個別の判断は医療機関にご相談ください。
        </p>
      </div>
    </div>
  );
}
