import type { Metadata } from "next";
import Link from "next/link";
import { complexes } from "@/lib/complexes";
import { getArea, AREA_UPDATED } from "@/lib/areas";
import { clusters, clustersByArea, CLUSTER_UPDATED } from "@/lib/clusters";
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
  title: "第一印象ライブラリ — 記事一覧（解説・実践ガイド・取材）",
  description:
    "第一印象・清潔感・メンズメイク・薄毛・ニキビ/肌・顔の印象・髭/体毛。男性の見た目の悩みを、中立に解説する実践ガイドとメカニズム記事、現場のプロへの取材を出典明記で集約するライブラリ。",
  keywords: [
    "第一印象 改善", "メンズメイク 初心者", "清潔感 出し方", "男性 身だしなみ",
    "薄毛 原因", "ニキビ跡 原因", "老けて見える 原因", "婚活写真 服装 男",
  ],
  alternates: { canonical: `${site.url}/areas` },
  openGraph: {
    type: "website",
    url: `${site.url}/areas`,
    title: "第一印象ライブラリ — 記事一覧（解説・実践ガイド・取材）",
    description:
      "男性の見た目の悩みを、中立に解説する実践ガイド・メカニズム記事・取材を、出典を明記して集約するライブラリ。",
  },
};

type Badge = "ガイド" | "取材" | null;
type Entry = {
  href: string;
  category: string;
  accent: string;
  accentSoft: string;
  badge: Badge;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
};

export default function AreasIndexPage() {
  const url = `${site.url}/areas`;

  // ---- 全記事をカード用エントリに平坦化（ピラー＋クラスタ） ----
  const entries: Entry[] = [];
  for (const c of complexes) {
    const area = getArea(c.id);
    // ピラー
    entries.push({
      href: `/areas/${c.id}`,
      category: c.ja,
      accent: c.accent,
      accentSoft: c.accentSoft,
      badge: c.guide ? "ガイド" : null,
      title: area?.titleOverride ?? `${c.ja}は、なぜ起きるのか — 原因と仕組み`,
      excerpt: area?.lead ?? "",
      tags: c.guide ? [c.ja, c.system] : [`${c.ja} 原因`, c.system],
      date: AREA_UPDATED,
    });
    // クラスタ
    for (const a of clustersByArea(c.id)) {
      entries.push({
        href: `/areas/${c.id}/${a.slug}`,
        category: c.ja,
        accent: c.accent,
        accentSoft: c.accentSoft,
        badge: a.kind === "interview" ? "取材" : a.kind === "guide" ? "ガイド" : null,
        title: a.title,
        excerpt: a.lead,
        tags: a.keywords.slice(0, 4),
        date: CLUSTER_UPDATED,
      });
    }
  }

  // 注目の記事（サイドバー）＝ ガイド／取材を優先
  const featured = entries.filter((e) => e.badge).slice(0, 6);

  // タグクラウド（キーワード → 親領域ページ）
  const tagMap = new Map<string, string>();
  for (const cl of clusters) for (const k of cl.keywords) if (!tagMap.has(k)) tagMap.set(k, cl.areaId);
  const tags = [...tagMap.entries()];

  // ---- 構造化データ（CollectionPage + ItemList + Breadcrumb） ----
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    name: "第一印象ライブラリ",
    description:
      "男性の見た目の悩みを、中立に解説する実践ガイド・メカニズム記事・取材を、出典を明記して集約するライブラリ。",
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
    dateModified: AREA_UPDATED,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: entries.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: e.title,
        url: `${site.url}${e.href}`,
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

      <div className="mx-auto max-w-[1120px] px-5 sm:px-8 pt-14 sm:pt-20 pb-24">
        {/* breadcrumb */}
        <nav aria-label="パンくず" className="text-[12px] text-[#6b7a66] mb-7">
          <Link href="/" className="hover:text-[#1f2a1d]">ホーム</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#1f2a1d]">第一印象ライブラリ</span>
        </nav>

        {/* header */}
        <header className="mb-9 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[12px] tracking-[0.16em] uppercase text-[#3d5638] font-medium">Library</span>
          </div>
          <h1 className="text-[2rem] sm:text-[2.7rem] leading-[1.26]" style={HEAD}>
            第一印象を、<span className="text-[#3d5638]">読んで、整える。</span>
          </h1>
          <p className="mt-4 text-[14.5px] text-[#4b5b47] leading-[1.95]">
            清潔感・メイク・服・写真から、髪・肌・顔・体毛まで。男性の見た目の悩みを、
            実践ガイドと中立な解説、現場のプロへの取材で。出典を明記したライブラリです。
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5 text-[11.5px]">
            <span className="inline-flex items-center rounded-full bg-[#e5f0ef] text-[#0f766e] px-3 py-1 font-bold">出典明記</span>
            <span className="inline-flex items-center rounded-full bg-[#eef3ea] text-[#3d5638] px-3 py-1 font-bold">中立・売らない</span>
            <span className="text-[#9aa79a]">最終更新: {AREA_UPDATED}</span>
          </div>
        </header>

        {/* ===== メディアレイアウト：記事一覧 ＋ サイドバー ===== */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-8 lg:gap-10 items-start">
          {/* 記事一覧 */}
          <main>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-[1.05rem] font-bold text-[#1f2a1d]" style={HEAD}>記事一覧</h2>
              <span className="text-[11.5px] text-[#9aa79a]">{entries.length}件</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {entries.map((e) => (
                <Link
                  key={e.href}
                  href={e.href}
                  className="group flex flex-col rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 p-5 hover:border-[#3d5638]/40 hover:shadow-[0_18px_38px_-24px_rgba(20,32,26,0.5)] transition-all"
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: e.accentSoft, color: e.accent }}>
                      {e.category}
                    </span>
                    {e.badge === "ガイド" && <span className="inline-flex rounded-full bg-[#eef3ea] text-[#3d5638] px-2 py-0.5 text-[9.5px] font-bold">ガイド</span>}
                    {e.badge === "取材" && <span className="inline-flex rounded-full bg-[#3d5638] text-white px-2 py-0.5 text-[9.5px] font-bold">取材</span>}
                    <span className="ml-auto text-[10.5px] text-[#9aa79a]">{e.date}</span>
                  </div>
                  <h3 className="text-[14.5px] font-bold text-[#1f2a1d] leading-[1.5] group-hover:text-[#3d5638] transition-colors" style={HEAD}>
                    {e.title}
                  </h3>
                  <p className="mt-2 text-[12px] text-[#4b5b47] leading-[1.85] line-clamp-3 flex-1">{e.excerpt}</p>
                  {e.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {e.tags.map((t) => (
                        <span key={t} className="inline-flex rounded-md bg-[#f0f4ee] text-[#6b7a66] px-1.5 py-0.5 text-[10px]">#{t}</span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* 記事 → 体験の橋渡し */}
            <ExperienceInvite context="第一印象の「なぜ」を知ったら、次は整える一日を" />

            {/* 現場のプロの方へ */}
            <div className="mt-4 rounded-[1.4rem] border border-[#1f2a1d]/10 bg-[#f0f4ee]/70 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-[1.05rem] font-bold text-[#1f2a1d] mb-1" style={HEAD}>現場のプロの方へ。</h2>
                <p className="text-[12.5px] text-[#4b5b47] leading-[1.85]">
                  取材・記事の紹介・チーム参画で、一緒に男性のウェルネスを。
                </p>
              </div>
              <Link href="/partners" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-[13px] font-semibold px-6 py-3 transition-colors">
                関わり方を見る <span aria-hidden>→</span>
              </Link>
            </div>

            <p className="mt-8 text-[11.5px] text-[#6b7a66] leading-[1.9]">
              ※ 記事は一般的に知られる情報や実践のヒントを、出典を明記して整理したものです。効果を保証するものではなく、
              診断・治療・受診勧奨を目的としたものではありません。個別の判断は医療機関にご相談ください。
            </p>
          </main>

          {/* サイドバー */}
          <aside className="lg:sticky lg:top-24 self-start space-y-8">
            {/* カテゴリー */}
            <section className="rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 p-5">
              <h2 className="text-[13.5px] font-bold text-[#1f2a1d] mb-3" style={HEAD}>カテゴリー</h2>
              <ul className="space-y-1">
                {complexes.map((c) => {
                  const count = clustersByArea(c.id).length + 1;
                  return (
                    <li key={c.id}>
                      <Link href={`/areas/${c.id}`} className="group flex items-center justify-between gap-2 py-1.5 text-[13px] text-[#3a423a] hover:text-[#3d5638] transition-colors">
                        <span className="flex items-center gap-2">
                          <span aria-hidden className="w-2 h-2 rounded-full" style={{ backgroundColor: c.accent }} />
                          {c.ja}
                        </span>
                        <span className="text-[11px] text-[#9aa79a]">{count}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* 注目の記事 */}
            {featured.length > 0 && (
              <section className="rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 p-5">
                <h2 className="text-[13.5px] font-bold text-[#1f2a1d] mb-3" style={HEAD}>注目の記事</h2>
                <ul className="space-y-3">
                  {featured.map((e) => (
                    <li key={e.href}>
                      <Link href={e.href} className="group block">
                        <span className="inline-flex rounded-full px-2 py-0.5 text-[9.5px] font-bold mb-1" style={{ backgroundColor: e.accentSoft, color: e.accent }}>{e.category}</span>
                        <span className="block text-[12.5px] font-semibold text-[#1f2a1d] leading-[1.5] group-hover:text-[#3d5638] transition-colors">{e.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* タグ */}
            <section className="rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 p-5">
              <h2 className="text-[13.5px] font-bold text-[#1f2a1d] mb-3" style={HEAD}>タグ</h2>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(([k, areaId]) => (
                  <Link key={k} href={`/areas/${areaId}`} className="inline-flex rounded-md bg-[#f0f4ee] text-[#4b5b47] px-2 py-1 text-[11px] hover:bg-[#e3ecdd] hover:text-[#1f2a1d] transition-colors">
                    {k}
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
