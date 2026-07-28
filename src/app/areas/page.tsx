import type { Metadata } from "next";
import Link from "next/link";
import { complexes } from "@/lib/complexes";
import { getArea, AREA_UPDATED } from "@/lib/areas";
import {
  clusters,
  clustersByArea,
  clustersByDesire,
  CLUSTER_UPDATED,
  DESIRES,
  type DesireKey,
} from "@/lib/clusters";
import ConsultLink from "@/components/ConsultLink";
import DesireBrowser from "@/components/DesireBrowser";
import StageBrowser from "@/components/StageBrowser";
import { site } from "@/lib/site";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

// 文節を inline-block で包み、スマホの改行を「、。」の区切りで自然に起こすヘルパー。
// （global の word-break:keep-all + overflow-wrap:anywhere による中途半端な改行を防ぐ）
function W({ children }: { children: React.ReactNode }) {
  return <span className="inline-block">{children}</span>;
}

// カテゴリ見出しの小アイコン
const ICONS: Record<string, React.ReactNode> = {
  impression: <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5 10.1 7.6z" />,
  hair: (<><path d="M6 20V9a6 6 0 0 1 12 0v11" /><path d="M9 20v-9M15 20v-9M12 20v-9" /></>),
  skin: <path d="M12 3s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9z" />,
  face: (<><circle cx="12" cy="12" r="8.5" /><path d="M9 10h.01M15 10h.01M9 14.5c1.8 1.4 4.2 1.4 6 0" /></>),
  "body-hair": (<><rect x="4" y="3" width="16" height="5" rx="1.5" /><path d="M12 8v13M9 11l3 2 3-2M9 15l3 2 3-2" /></>),
  mind: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
};

export const metadata: Metadata = {
  title: "His Recoveries Library — 男性の見た目の悩みを、読む",
  description:
    "男性の見た目の悩み（第一印象・清潔感・メンズメイク・薄毛・ニキビ/肌・顔の印象・髭/体毛）を、中立に解説する実践ガイド・記事・現場のプロへの取材。匿名のまま読める、出典明記のライブラリ。",
  keywords: [
    // 悩み・恥ベース（入口）
    "第一印象 改善", "メンズメイク 初心者", "清潔感 出し方", "男性 身だしなみ",
    "薄毛 原因", "ニキビ跡 原因", "老けて見える 原因", "婚活写真 服装 男",
    // 自己投資・最適化ベース（成長期の認知拡張）
    "自分磨き 男 何から", "自己投資 男", "垢抜け 方法 男", "メンズ 垢抜け",
  ],
  alternates: { canonical: `${site.url}/areas` },
  openGraph: {
    type: "website",
    url: `${site.url}/areas`,
    title: "His Recoveries Library — 男性の見た目の悩みを、読む",
    description: "男性の見た目の悩みを、中立に解説する実践ガイド・記事・取材。匿名のまま読めるライブラリ。",
  },
};

type Card = {
  href: string; badge: "ガイド" | "取材" | "解説" | "選び方"; title: string; excerpt: string;
  date: string; accent: string; accentSoft: string; category: string;
};

function badgeStyle(b: Card["badge"]) {
  if (b === "取材") return "bg-[#3d5638] text-white";
  if (b === "ガイド") return "bg-[#eef3ea] text-[#3d5638]";
  if (b === "選び方") return "bg-[#16241A] text-[#EDF1E8]";
  return "bg-[#f0f4ee] text-[#6b7a66]";
}

function ArticleCard({ c, carousel = false, starter = false }: { c: Card; carousel?: boolean; starter?: boolean }) {
  return (
    <Link
      href={c.href}
      style={{ borderLeftColor: c.accent, borderLeftWidth: 3 }}
      className={`group flex flex-col rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 p-5 hover:border-[#3d5638]/40 hover:shadow-[0_18px_38px_-24px_rgba(20,32,26,0.5)] hover:-translate-y-0.5 transition-all${carousel ? " snap-start shrink-0 w-[78%] sm:w-auto" : ""}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badgeStyle(c.badge)}`}>{c.badge}</span>
        {starter && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#16241A] text-[#EDF1E8] px-2 py-0.5 text-[11px] font-bold tracking-[0.04em]">
            <span aria-hidden>★</span>はじめの1本
          </span>
        )}
      </div>
      <h3 className="text-[15px] font-bold text-[#1f2a1d] leading-[1.55] group-hover:text-[#3d5638] transition-colors" style={HEAD}>{c.title}</h3>
      <p className="mt-2 text-[14px] text-[#4b5b47] leading-[1.85] line-clamp-2 sm:line-clamp-3 flex-1">{c.excerpt}</p>
      <span className="mt-3 text-[13.5px] font-semibold text-[#3d5638] inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">読む <span aria-hidden>→</span></span>
    </Link>
  );
}

export default function LibraryPage({
  searchParams,
}: {
  searchParams?: { desire?: string };
}) {
  const url = `${site.url}/areas`;

  // 目的（desire）での絞り込み。?desire=<key> が有効なら該当記事を上部に出す。
  const rawDesire = searchParams?.desire;
  const activeDesire: DesireKey | undefined =
    rawDesire && rawDesire in DESIRES ? (rawDesire as DesireKey) : undefined;
  const desireCards: Card[] = activeDesire
    ? clustersByDesire(activeDesire).map((a) => {
        const cx = complexes.find((x) => x.id === a.areaId);
        return {
          href: `/areas/${a.areaId}/${a.slug}`,
          badge: a.kind === "guide" ? "ガイド" : a.kind === "choose" ? "選び方" : "解説",
          title: a.title,
          excerpt: a.lead,
          date: CLUSTER_UPDATED,
          accent: cx?.accent ?? "#3d5638",
          accentSoft: cx?.accentSoft ?? "#eef3ea",
          category: cx?.ja ?? "",
        };
      })
    : [];

  // カテゴリ別に整理（ピラー＋クラスタ）。取材は横断で別カテゴリに集約。
  const categories = complexes.map((c) => {
    const area = getArea(c.id);
    const cards: Card[] = [
      {
        href: `/areas/${c.id}`, badge: c.guide ? "ガイド" : "解説",
        title: area?.titleOverride ?? `${c.ja}は、なぜ起きるのか — 原因と仕組み`,
        excerpt: area?.lead ?? "", date: AREA_UPDATED, accent: c.accent, accentSoft: c.accentSoft, category: c.ja,
      },
      ...clustersByArea(c.id)
        .filter((a) => a.kind !== "interview")
        .map((a): Card => ({
          href: `/areas/${c.id}/${a.slug}`, badge: a.kind === "guide" ? "ガイド" : a.kind === "choose" ? "選び方" : "解説",
          title: a.title, excerpt: a.lead, date: CLUSTER_UPDATED, accent: c.accent, accentSoft: c.accentSoft, category: c.ja,
        })),
    ];
    return { id: c.id, ja: c.ja, worry: c.worry, accent: c.accent, accentSoft: c.accentSoft, cards };
  });

  const interviews: Card[] = clusters
    .filter((a) => a.kind === "interview")
    .map((a) => {
      const c = complexes.find((x) => x.id === a.areaId)!;
      return { href: `/areas/${a.areaId}/${a.slug}`, badge: "取材", title: a.title, excerpt: a.lead, date: CLUSTER_UPDATED, accent: c.accent, accentSoft: c.accentSoft, category: c.ja };
    });

  const allCards = [...categories.flatMap((c) => c.cards), ...interviews];

  const collectionLd = {
    "@context": "https://schema.org", "@type": "CollectionPage", "@id": url,
    name: "His Recoveries Library",
    description: "男性の見た目の悩みを、中立に解説する実践ガイド・記事・取材を集約するライブラリ。",
    inLanguage: "ja", isPartOf: { "@id": `${site.url}/#website` }, dateModified: AREA_UPDATED,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: allCards.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.title, url: `${site.url}${e.href}` })),
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "記事", item: url },
    ],
  };

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="mx-auto max-w-[1080px] px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
        {/* パンくず */}
        <nav aria-label="パンくず" className="text-[13.5px] text-[#6b7a66] mb-7">
          <Link href="/" className="hover:text-[#1f2a1d]">ホーム</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#1f2a1d]">記事</span>
        </nav>

        {/* ヘッダー — 読みものサイトの顔。簡潔に。 */}
        <header className="mb-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[12.5px] tracking-[0.18em] uppercase text-[#3d5638] font-medium">His Recoveries Library</span>
          </div>
          <h1 className="text-[1.9rem] sm:text-[2.5rem] leading-[1.26]" style={HEAD}>
            <W>男の「<span className="text-[#3d5638]">よくなる</span>」を、</W><W>まとめています。</W>
          </h1>
          <p className="mt-4 text-[15px] sm:text-[15px] text-[#4b5b47] leading-[1.9]">
            <W>清潔感・薄毛・肌・顔・体毛・第一印象。</W><W>ぜんぶまとめて調べられます。</W>{" "}
            <W>何も売らないから、広告ぬきの答えだけ。</W><W>匿名で、読むだけ。</W>
          </p>
        </header>

        {/* ライフステージから探す — 悩みの名前を知らなくても、年代なら迷わない */}
        <div className="mb-12">
          <StageBrowser compact />
        </div>

        {/* 目的から探す（あなたは、何を叶えたい？）— 悩み名がわからなくても探せる入口 */}
        <div className="mb-12">
          <DesireBrowser activeDesire={activeDesire} />

          {activeDesire && (
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-[1.05rem] font-bold text-[#1f2a1d]" style={HEAD}>
                  「{DESIRES[activeDesire].label}」に効く記事
                  <span className="ml-2 text-[13.5px] font-normal text-[#6b7a66]">
                    {desireCards.length}本
                  </span>
                </h3>
                <Link
                  href="/areas#mokuteki"
                  className="ml-auto text-[13.5px] font-semibold text-[#3d5638] hover:opacity-70 transition-opacity whitespace-nowrap"
                >
                  × 絞り込みを解除
                </Link>
              </div>
              {desireCards.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {desireCards.map((card) => (
                    <ArticleCard key={card.href} c={card} />
                  ))}
                </div>
              ) : (
                <p className="text-[14.5px] text-[#4b5b47]">この目的の記事は準備中です。</p>
              )}
            </div>
          )}
        </div>

        {/* カテゴリのクイックナビ — モバイルは横スクロール、スクロール時は上部に固定。
            相談CTAはヘッダーが常時出しているので、ここはチップだけに絞る。 */}
        <div className="sticky top-[62px] sm:top-[72px] z-30 -mx-5 sm:mx-0 mb-11 border-b border-[#1f2a1d]/10 bg-[#f4f6f2]/92 backdrop-blur-sm">
          <div className="flex sm:flex-wrap gap-2 overflow-x-auto sm:overflow-visible px-5 sm:px-0 py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((c) => (
              <a key={c.id} href={`#cat-${c.id}`} className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#1f2a1d]/12 bg-white px-3.5 py-1.5 text-[14px] font-medium text-[#3a423a] hover:border-[#3d5638]/50 hover:text-[#1f2a1d] transition-colors">
                {c.ja}
              </a>
            ))}
            <a href="/areas/confidence" className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#1f2a1d]/12 bg-white px-3.5 py-1.5 text-[14px] font-medium text-[#3a423a] hover:border-[#3d5638]/50 hover:text-[#1f2a1d] transition-colors">
              自信・パートナーシップ
            </a>
            <a href="#cat-interview" className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#3d5638]/25 bg-white px-3.5 py-1.5 text-[14px] font-medium text-[#3d5638] hover:border-[#3d5638] transition-colors">
              インタビュー
            </a>
          </div>
        </div>

        {/* カテゴリ別・記事一覧（読みもの本体） */}
        <div className="space-y-12">
          {categories.map((c) => (
            <section key={c.id} id={`cat-${c.id}`} className="scroll-mt-[128px]">
              <div className="flex items-center gap-2.5 mb-5">
                <span aria-hidden className="grid place-items-center w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: c.accentSoft }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {ICONS[c.id] ?? <circle cx="12" cy="12" r="6" />}
                  </svg>
                </span>
                <h2 className="text-[1.25rem] font-bold text-[#1f2a1d]" style={HEAD}>{c.ja}</h2>
                <Link href={`/areas/${c.id}`} className="ml-auto text-[13.5px] font-semibold text-[#3d5638] hover:opacity-70 transition-opacity whitespace-nowrap">
                  まとめて見る →
                </Link>
              </div>
              <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 -mx-5 px-5 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scroll-pl-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {c.cards.map((card, i) => <ArticleCard key={card.href} c={card} carousel starter={i === 0} />)}
              </div>
              {c.cards.length > 1 && (
                <p className="sm:hidden mt-2.5 text-[12px] text-[#9aa79a]">← 横にスクロール（{c.cards.length}件）</p>
              )}

              {/* 最大カテゴリの直後に、静かな相談バンドを1つだけ（中間CVRポイント） */}
              {c.id === "impression" && (
                <div className="mt-8 rounded-[1.3rem] bg-[#16241a] text-[#EDF1E8] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[15.5px] font-bold leading-[1.6]"><W>調べ続けるより、</W><W>10分の相談が早いこともあります。</W></p>
                    <p className="mt-1 text-[14px] text-[#C9D2C4] leading-[1.8]"><W>何から始めるか、いくらかかるか。</W><W>無料・完全守秘で。</W></p>
                  </div>
                  <ConsultLink className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-[#EDF1E8] hover:bg-white text-[#16241A] text-[14.5px] font-bold px-6 py-3 transition-colors">
                    無料で相談する（無料） <span aria-hidden>→</span>
                  </ConsultLink>
                </div>
              )}
            </section>
          ))}

          {/* インタビュー */}
          <section id="cat-interview" className="scroll-mt-[128px]">
            <div className="flex items-center gap-3 mb-2">
              <span aria-hidden className="grid place-items-center w-9 h-9 rounded-full shrink-0 bg-[#3d5638]/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3d5638" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.5 8.5 0 0 1-11.7 7.9L4 21l1.6-5.3A8.5 8.5 0 1 1 21 11.5z" />
                </svg>
              </span>
              <h2 className="text-[1.3rem] font-bold text-[#1f2a1d]" style={HEAD}>インタビュー</h2>
            </div>
            <p className="text-[14px] text-[#6b7a66] leading-[1.9] mb-5">
              <W>現場の第一線で働くプロ</W><W>（メイク・スタイリスト・撮影ほか）に、</W><W>His Recoveries が直接聞く一次情報。</W>
            </p>
            {interviews.length > 0 ? (
              <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 -mx-5 px-5 sm:mx-0 sm:px-0 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scroll-pl-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {interviews.map((card) => <ArticleCard key={card.href} c={card} carousel />)}
              </div>
            ) : (
              <div className="rounded-[1.3rem] border border-dashed border-[#1f2a1d]/15 bg-white/50 p-8 text-center">
                <p className="text-[14.5px] text-[#6b7a66] leading-[1.9]">
                  取材記事を、これから掲載していきます。
                </p>
              </div>
            )}
          </section>
        </div>

        {/* 読み終わりの受け皿：相談（無料・匿名）を主導線に、サービスは従 */}
        <div className="mt-16 rounded-[1.3rem] border border-[#1f2a1d]/10 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-[14.5px] text-[#4b5b47] leading-[1.85] flex-1">
            <W>読むだけでも大丈夫。</W><W>聞きたくなったら、無料で相談できます（完全守秘）。</W>
          </p>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <ConsultLink className="inline-flex items-center gap-2 rounded-full bg-[#16241A] hover:bg-[#1c2e21] text-white text-[14.5px] font-bold px-6 py-3 transition-colors">
              無料で相談する（無料） <span aria-hidden>→</span>
            </ConsultLink>
            <Link href="/plan" className="inline-flex items-center gap-2 rounded-full border border-[#1f2a1d]/20 hover:border-[#1f2a1d] text-[#1f2a1d] text-[14.5px] font-semibold px-6 py-3 transition-colors">
              プランを見る
            </Link>
          </div>
        </div>

        <p className="mt-8 text-[12.5px] text-[#6b7a66] leading-[1.9]">
          ※ 記事は一般的に知られる情報や実践のヒントを、出典を明記して整理したものです。効果を保証するものではなく、
          診断・治療・受診勧奨を目的としたものではありません。「選び方・向き合い方」の記事も、選ぶときの観点を中立に整理したもので、
          特定の医療機関・製品・施術を推奨するものではありません。「今はやらない」も含め、選ぶのはあなたです。個別の判断は専門家にご相談ください。
        </p>
      </div>
    </div>
  );
}
