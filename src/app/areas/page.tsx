import type { Metadata } from "next";
import Link from "next/link";
import { complexes } from "@/lib/complexes";
import { getArea, AREA_UPDATED } from "@/lib/areas";
import { clusters, clustersByArea, CLUSTER_UPDATED } from "@/lib/clusters";
import { fieldVoicesByArea } from "@/lib/fieldVoices";
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

        {/* header — B2C：当事者の内心から入る（あたたかいヒーロー面） */}
        <header className="mb-10 rounded-[2rem] border border-[#1f2a1d]/8 p-7 sm:p-11 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#eef3ea 0%,#f4f6f2 45%,#e6efe3 100%)" }}>
          <div aria-hidden className="absolute -top-16 -right-10 w-72 h-72 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.22)" }} />
          <div className="relative max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
              <span className="font-mono text-[12px] tracking-[0.16em] uppercase text-[#3d5638] font-medium">Library</span>
            </div>
            <h1 className="text-[2.1rem] sm:text-[3rem] leading-[1.24]" style={HEAD}>
              見た目の悩みは、<br className="hidden sm:block" />
              <span className="text-[#3d5638]">ひとりで抱えなくていい。</span>
            </h1>
            <p className="mt-5 text-[14.5px] sm:text-[15.5px] text-[#4b5b47] leading-[2] max-w-[34rem]">
              清潔感・メイク・服・写真から、髪・肌・顔まで。「なぜそうなるのか」を、
              まず読むところから。<span className="font-semibold text-[#1f2a1d]">完全匿名で読めて</span>、必要なら整える一日へ。
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5 text-[11.5px]">
              <span className="inline-flex items-center rounded-full bg-white/70 text-[#3d5638] px-3 py-1 font-bold">読むだけでも、OK</span>
              <span className="inline-flex items-center rounded-full bg-white/70 text-[#0f766e] px-3 py-1 font-bold">出典明記・中立</span>
              <span className="text-[#7f8f7a]">最終更新: {AREA_UPDATED}</span>
            </div>
          </div>
        </header>

        {/* 悩みから探す — B2Cの主入口（"それ、俺だ"から） */}
        <section className="mb-10">
          <h2 className="text-[1.1rem] font-bold text-[#1f2a1d] mb-4" style={HEAD}>
            悩みから、<span className="text-[#3d5638]">探す。</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {complexes.map((c) => (
              <Link
                key={c.id}
                href={`/areas/${c.id}`}
                className="group relative flex flex-col justify-between rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 p-5 min-h-[132px] hover:border-[#3d5638]/40 hover:shadow-[0_18px_38px_-24px_rgba(20,32,26,0.5)] hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <span aria-hidden className="grid place-items-center w-9 h-9 rounded-full shrink-0" style={{ backgroundColor: c.accentSoft }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      {ICONS[c.id] ?? <circle cx="12" cy="12" r="6" />}
                    </svg>
                  </span>
                  <span className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: c.accentSoft, color: c.accent }}>
                    {c.ja}
                  </span>
                </div>
                <p className="text-[14.5px] font-bold text-[#1f2a1d] leading-[1.55]" style={HEAD}>
                  「{c.worry}」
                </p>
                <span className="mt-3 text-[12px] font-semibold text-[#3d5638] inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">
                  なぜ？を読む <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

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
          <aside className="lg:sticky lg:top-24 self-start space-y-6">
            {/* 相談パネル（B2C・匿名の安心を前面に） */}
            <section className="rounded-[1.4rem] bg-[#16241a] text-[#EDF1E8] p-6 overflow-hidden relative">
              <div aria-hidden className="absolute -top-12 -right-8 w-48 h-48 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.2)" }} />
              <div className="relative">
                <h2 className="text-[1.05rem] font-bold text-[#EDF1E8] leading-[1.5] mb-2" style={HEAD}>
                  誰にも言えない悩みも、<span className="text-[#85AB8B]">匿名で。</span>
                </h2>
                <p className="text-[12px] text-[#C9D2C4] leading-[1.85] mb-4">
                  読むだけでも大丈夫。整えたくなったら、実名・顔写真なしで相談できます。
                </p>
                <BookingCTA className="w-full text-center bg-[#EDF1E8] hover:bg-white text-[#16241a] text-[13px] font-semibold px-5 py-3 rounded-full transition-colors">
                  匿名で相談する
                </BookingCTA>
              </div>
            </section>

            {/* カテゴリー */}
            <section className="rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 p-5">
              <h2 className="text-[13.5px] font-bold text-[#1f2a1d] mb-3" style={HEAD}>テーマ別に読む</h2>
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
                <h2 className="text-[13.5px] font-bold text-[#1f2a1d] mb-3" style={HEAD}>はじめて読むなら</h2>
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

            {/* タグ（B2Cでは主張させず、折りたたみ。内部リンクはDOMに保持しSEO維持） */}
            <details className="rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 p-5 group">
              <summary className="text-[13.5px] font-bold text-[#1f2a1d] cursor-pointer list-none flex items-center justify-between" style={HEAD}>
                よく検索される言葉
                <span aria-hidden className="text-[#85AB8B] text-[12px] group-open:rotate-90 transition-transform">›</span>
              </summary>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map(([k, areaId]) => (
                  <Link key={k} href={`/areas/${areaId}`} className="inline-flex rounded-md bg-[#f0f4ee] text-[#4b5b47] px-2 py-1 text-[11px] hover:bg-[#e3ecdd] hover:text-[#1f2a1d] transition-colors">
                    {k}
                  </Link>
                ))}
              </div>
            </details>
          </aside>
        </div>
      </div>
    </div>
  );
}
