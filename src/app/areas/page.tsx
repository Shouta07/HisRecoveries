import type { Metadata } from "next";
import Link from "next/link";
import { complexes } from "@/lib/complexes";
import { getArea, AREA_UPDATED } from "@/lib/areas";
import { clustersByArea, CLUSTER_UPDATED } from "@/lib/clusters";
import ExperienceInvite from "@/components/ExperienceInvite";
import BookingCTA from "@/components/BookingCTA";
import { site } from "@/lib/site";

// 悩みカードのアイコン（顔出し不可でも温度を出す線アイコン）
const ICONS: Record<string, React.ReactNode> = {
  impression: <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5 10.1 7.6z" />,
  hair: (
    <>
      <path d="M6 20V9a6 6 0 0 1 12 0v11" />
      <path d="M9 20v-9M15 20v-9M12 20v-9" />
    </>
  ),
  skin: <path d="M12 3s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9z" />,
  face: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 10h.01M15 10h.01M9 14.5c1.8 1.4 4.2 1.4 6 0" />
    </>
  ),
  "body-hair": (
    <>
      <rect x="4" y="3" width="16" height="5" rx="1.5" />
      <path d="M12 8v13M9 11l3 2 3-2M9 15l3 2 3-2" />
    </>
  ),
};

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

export const metadata: Metadata = {
  title: "第一印象ライブラリ — 男性の見た目の悩みを、まず読むところから",
  description:
    "第一印象・清潔感・メンズメイク・薄毛・ニキビ/肌・顔の印象・髭/体毛。男性の見た目の悩みを、実践ガイドと中立な解説で。完全匿名で読めて、必要なら整える一日へ。出典を明記したライブラリ。",
  keywords: [
    "第一印象 改善", "メンズメイク 初心者", "清潔感 出し方", "男性 身だしなみ",
    "薄毛 原因", "ニキビ跡 原因", "老けて見える 原因", "婚活写真 服装 男",
  ],
  alternates: { canonical: `${site.url}/areas` },
  openGraph: {
    type: "website",
    url: `${site.url}/areas`,
    title: "第一印象ライブラリ — 男性の見た目の悩みを、まず読むところから",
    description: "男性の見た目の悩みを、実践ガイドと中立な解説で。完全匿名で読めて、必要なら整える一日へ。",
  },
};

type Entry = {
  href: string;
  category: string;
  accent: string;
  accentSoft: string;
  badge: "ガイド" | "取材" | null;
  title: string;
  excerpt: string;
  date: string;
};

export default function AreasIndexPage() {
  const url = `${site.url}/areas`;

  // 全記事を平坦化（JSON-LD と 注目記事に使用）
  const entries: Entry[] = [];
  for (const c of complexes) {
    const area = getArea(c.id);
    entries.push({
      href: `/areas/${c.id}`,
      category: c.ja,
      accent: c.accent,
      accentSoft: c.accentSoft,
      badge: c.guide ? "ガイド" : null,
      title: area?.titleOverride ?? `${c.ja}は、なぜ起きるのか — 原因と仕組み`,
      excerpt: area?.lead ?? "",
      date: AREA_UPDATED,
    });
    for (const a of clustersByArea(c.id)) {
      entries.push({
        href: `/areas/${c.id}/${a.slug}`,
        category: c.ja,
        accent: c.accent,
        accentSoft: c.accentSoft,
        badge: a.kind === "interview" ? "取材" : a.kind === "guide" ? "ガイド" : null,
        title: a.title,
        excerpt: a.lead,
        date: CLUSTER_UPDATED,
      });
    }
  }
  // 注目＝ガイド／取材（実践的で読みたくなるもの）を数本だけ
  const featured = entries.filter((e) => e.badge).slice(0, 6);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    name: "第一印象ライブラリ",
    description: "男性の見た目の悩みを、実践ガイドと中立な解説で集約するライブラリ。",
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

      <div className="mx-auto max-w-[860px] px-5 sm:px-8 pt-12 sm:pt-16 pb-20">
        {/* breadcrumb */}
        <nav aria-label="パンくず" className="text-[12px] text-[#6b7a66] mb-6">
          <Link href="/" className="hover:text-[#1f2a1d]">ホーム</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#1f2a1d]">第一印象ライブラリ</span>
        </nav>

        {/* hero — コンパクトに */}
        <header className="mb-8">
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[#3d5638] font-medium">Library</span>
          <h1 className="mt-2 text-[1.6rem] sm:text-[2rem] leading-[1.32]" style={HEAD}>
            見た目の悩みは、<span className="text-[#3d5638]">ひとりで抱えなくていい。</span>
          </h1>
          <p className="mt-3 text-[13.5px] text-[#4b5b47] leading-[1.9] max-w-[32rem]">
            「気にするな」で流されてきた悩みを、私たちは軽く扱いません。
            なぜそうなるのかを、<span className="font-semibold text-[#1f2a1d]">あなたの側から、中立に</span>。
          </p>
          <Link href="/manifesto" className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[#3d5638] hover:opacity-70 transition-opacity">
            なぜ、私たちがこれを書くのか <span aria-hidden>→</span>
          </Link>
        </header>

        {/* 悩みから探す — B2Cの主入口 */}
        <section className="mb-11">
          <h2 className="text-[1.1rem] font-bold text-[#1f2a1d] mb-4" style={HEAD}>
            悩みから、<span className="text-[#3d5638]">探す。</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {complexes.map((c) => (
              <Link
                key={c.id}
                href={`/areas/${c.id}`}
                className="group flex items-center gap-4 rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 p-4 sm:p-5 hover:border-[#3d5638]/40 hover:shadow-[0_16px_34px_-24px_rgba(20,32,26,0.5)] hover:-translate-y-0.5 transition-all"
              >
                <span aria-hidden className="grid place-items-center w-11 h-11 rounded-full shrink-0" style={{ backgroundColor: c.accentSoft }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {ICONS[c.id] ?? <circle cx="12" cy="12" r="6" />}
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold mb-0.5" style={{ color: c.accent }}>{c.ja}</span>
                  <span className="block text-[13.5px] sm:text-[14px] font-bold text-[#1f2a1d] leading-[1.5] group-hover:text-[#3d5638] transition-colors" style={HEAD}>
                    「{c.worry}」
                  </span>
                </span>
                <span aria-hidden className="ml-auto text-[#3d5638] shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* まず読んでみる — 数を絞って、読みたくなる範囲に */}
        <section className="mb-10">
          <h2 className="text-[1.1rem] font-bold text-[#1f2a1d] mb-4" style={HEAD}>
            まず、<span className="text-[#3d5638]">読んでみる。</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {featured.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="group flex flex-col rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 p-5 hover:border-[#3d5638]/40 hover:shadow-[0_16px_34px_-24px_rgba(20,32,26,0.5)] hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: e.accentSoft, color: e.accent }}>{e.category}</span>
                  {e.badge === "ガイド" && <span className="inline-flex rounded-full bg-[#eef3ea] text-[#3d5638] px-2 py-0.5 text-[9.5px] font-bold">ガイド</span>}
                  {e.badge === "取材" && <span className="inline-flex rounded-full bg-[#3d5638] text-white px-2 py-0.5 text-[9.5px] font-bold">取材</span>}
                </div>
                <h3 className="text-[14.5px] font-bold text-[#1f2a1d] leading-[1.5] group-hover:text-[#3d5638] transition-colors" style={HEAD}>
                  {e.title}
                </h3>
                <p className="mt-2 text-[12px] text-[#4b5b47] leading-[1.8] line-clamp-2">{e.excerpt}</p>
                <span className="mt-3 text-[12px] font-semibold text-[#3d5638] inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">読む <span aria-hidden>→</span></span>
              </Link>
            ))}
          </div>
        </section>

        {/* 体験の橋渡し */}
        <ExperienceInvite context="第一印象の「なぜ」を知ったら、次は整える一日を" />

        {/* 匿名相談（フル幅） */}
        <section className="mt-4 rounded-[1.6rem] bg-[#16241a] text-[#EDF1E8] p-7 sm:p-9 overflow-hidden relative">
          <div aria-hidden className="absolute -top-14 -right-8 w-56 h-56 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.2)" }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1">
              <h2 className="text-[1.25rem] font-bold text-[#EDF1E8] leading-[1.5] mb-1.5" style={HEAD}>
                「気にするな」で、<span className="text-[#85AB8B]">終わらせたくない。</span>
              </h2>
              <p className="text-[12.5px] text-[#C9D2C4] leading-[1.85]">
                あなたの悩みに、中立に、そっと伴走します。読むだけでも大丈夫。相談は、実名・顔写真なしで。
              </p>
            </div>
            <BookingCTA className="shrink-0 text-center bg-[#EDF1E8] hover:bg-white text-[#16241a] text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">
              そっと相談する
            </BookingCTA>
          </div>
        </section>

        {/* フッター行 */}
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
          <Link href="/partners" className="text-[#3d5638] font-semibold hover:opacity-70 transition-opacity inline-flex items-center gap-1">
            現場のプロの方へ <span aria-hidden>→</span>
          </Link>
          <span className="text-[#9aa79a]">最終更新: {AREA_UPDATED}・出典明記・中立</span>
        </div>
        <p className="mt-4 text-[11.5px] text-[#6b7a66] leading-[1.9]">
          ※ 記事は一般的に知られる情報や実践のヒントを、出典を明記して整理したものです。効果を保証するものではなく、
          診断・治療・受診勧奨を目的としたものではありません。個別の判断は医療機関にご相談ください。
        </p>
      </div>
    </div>
  );
}
