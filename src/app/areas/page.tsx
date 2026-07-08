import type { Metadata } from "next";
import Link from "next/link";
import { complexes } from "@/lib/complexes";
import { getArea, AREA_UPDATED } from "@/lib/areas";
import { clustersByArea, CLUSTER_UPDATED } from "@/lib/clusters";
import BookingCTA from "@/components/BookingCTA";
import { site } from "@/lib/site";

// 悩みカードのアイコン（顔出しなしで温度を出す線アイコン）
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

const WHY = [
  {
    t: "中立。売らない。",
    d: "特定の医療機関も商品も推奨しません。紹介手数料も受け取らない。だから、あなたの最適だけを。",
    icon: <path d="M7 7 3 11l4 4M17 7l4 4-4 4M3 11h18" />,
  },
  {
    t: "完全匿名・守秘。",
    d: "実名・顔写真は不要。誰にも知られず、読むだけでも、相談だけでも大丈夫です。",
    icon: (
      <>
        <path d="M12 3l7 3v6c0 4-3 7-7 8-4-1-7-4-7-8V6z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    t: "寄り添い、伴走する。",
    d: "「気にするな」で終わらせない。なぜ起きるのかの理解から、変化、定着まで、あなたの側で。",
    icon: <path d="M12 21s-6-4.35-9-8a4 4 0 0 1 6-5 4 4 0 0 1 6 0 4 4 0 0 1 6 5c-3 3.65-9 8-9 8z" />,
  },
];

const STEPS = ["印象カウンセリング", "メイク", "服選び", "撮影"];

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
  href: string; category: string; accent: string; accentSoft: string;
  badge: "ガイド" | "取材" | null; title: string; excerpt: string; date: string;
};

export default function AreasIndexPage() {
  const url = `${site.url}/areas`;

  const entries: Entry[] = [];
  for (const c of complexes) {
    const area = getArea(c.id);
    entries.push({
      href: `/areas/${c.id}`, category: c.ja, accent: c.accent, accentSoft: c.accentSoft,
      badge: c.guide ? "ガイド" : null,
      title: area?.titleOverride ?? `${c.ja}は、なぜ起きるのか — 原因と仕組み`,
      excerpt: area?.lead ?? "", date: AREA_UPDATED,
    });
    for (const a of clustersByArea(c.id)) {
      entries.push({
        href: `/areas/${c.id}/${a.slug}`, category: c.ja, accent: c.accent, accentSoft: c.accentSoft,
        badge: a.kind === "interview" ? "取材" : a.kind === "guide" ? "ガイド" : null,
        title: a.title, excerpt: a.lead, date: CLUSTER_UPDATED,
      });
    }
  }
  const featured = entries.filter((e) => e.badge).slice(0, 6);

  const collectionLd = {
    "@context": "https://schema.org", "@type": "CollectionPage", "@id": url,
    name: "第一印象ライブラリ",
    description: "男性の見た目の悩みを、実践ガイドと中立な解説で集約するライブラリ。",
    inLanguage: "ja", isPartOf: { "@id": `${site.url}/#website` }, dateModified: AREA_UPDATED,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: entries.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.title, url: `${site.url}${e.href}` })),
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "第一印象ライブラリ", item: url },
    ],
  };

  return (
    <div className="text-[#1f2a1d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ===== 1. HERO（フルブリード・ダーク） ===== */}
      <section className="relative bg-[#16241a] text-[#EDF1E8] overflow-hidden">
        <div aria-hidden className="absolute -top-24 -right-16 w-[30rem] h-[30rem] rounded-full blur-[120px]" style={{ background: "rgba(133,171,139,0.22)" }} />
        <div aria-hidden className="absolute -bottom-32 -left-24 w-[26rem] h-[26rem] rounded-full blur-[120px]" style={{ background: "rgba(61,86,56,0.5)" }} />
        <div className="relative mx-auto max-w-[1040px] px-6 sm:px-10 pt-16 sm:pt-24 pb-16 sm:pb-24">
          <nav aria-label="パンくず" className="text-[12px] text-[#9FB0A0] mb-8">
            <Link href="/" className="hover:text-[#EDF1E8]">ホーム</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#EDF1E8]">第一印象ライブラリ</span>
          </nav>
          <div className="flex items-center gap-3 mb-5">
            <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
            <span className="font-mono text-[11.5px] tracking-[0.2em] uppercase text-[#85AB8B] font-medium">Library — 男性の見た目の悩み</span>
          </div>
          <h1 className="text-[2.5rem] sm:text-[4rem] leading-[1.14] max-w-[18ch]" style={HEAD}>
            見た目の悩みは、<br />
            <span className="text-[#85AB8B]">ひとりで抱えなくていい。</span>
          </h1>
          <p className="mt-7 text-[15px] sm:text-[17px] text-[#C9D2C4] leading-[1.95] max-w-[38rem]">
            「気にするな」で流されてきた悩みを、私たちは軽く扱いません。なぜそうなるのかを、あなたの側から、中立に。
            <br className="hidden sm:block" />
            口に出さないだけで、同じ悩みを抱える人は、あなたが思うより、ずっと多い。
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <BookingCTA className="bg-[#EDF1E8] hover:bg-white text-[#16241a] text-sm font-semibold px-8 py-4 rounded-full transition-colors">
              匿名で、相談する
            </BookingCTA>
            <a href="#worries" className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:border-white/60 text-[#EDF1E8] text-sm font-semibold px-8 py-4 transition-colors">
              悩みから読む <span aria-hidden>↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* ===== 2. 悩みから探す（ライト） ===== */}
      <section id="worries" className="bg-[#f4f6f2] scroll-mt-4">
        <div className="mx-auto max-w-[1040px] px-6 sm:px-10 py-16 sm:py-20">
          <h2 className="text-[1.7rem] sm:text-[2.3rem] leading-[1.3] mb-2" style={HEAD}>
            あなたの悩みは、<span className="text-[#3d5638]">どれ？</span>
          </h2>
          <p className="text-[13.5px] text-[#6b7a66] leading-[1.85] mb-8">気になるところから。「なぜそうなるのか」を、中立に解説します。</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {complexes.map((c) => (
              <Link
                key={c.id}
                href={`/areas/${c.id}`}
                className="group flex items-center gap-5 rounded-[1.5rem] bg-white border border-[#1f2a1d]/10 p-5 sm:p-6 hover:border-[#3d5638]/40 hover:shadow-[0_22px_44px_-26px_rgba(20,32,26,0.55)] hover:-translate-y-0.5 transition-all"
              >
                <span aria-hidden className="grid place-items-center w-14 h-14 rounded-2xl shrink-0" style={{ backgroundColor: c.accentSoft }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {ICONS[c.id] ?? <circle cx="12" cy="12" r="6" />}
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10.5px] font-bold mb-1" style={{ color: c.accent }}>{c.ja}</span>
                  <span className="block text-[15px] sm:text-[16px] font-bold text-[#1f2a1d] leading-[1.5] group-hover:text-[#3d5638] transition-colors" style={HEAD}>
                    「{c.worry}」
                  </span>
                </span>
                <span aria-hidden className="text-[#3d5638] shrink-0 group-hover:translate-x-0.5 transition-transform text-lg">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. なぜ私たちか（ホワイト・信頼） ===== */}
      <section className="bg-white border-y border-[#1f2a1d]/8">
        <div className="mx-auto max-w-[1040px] px-6 sm:px-10 py-16 sm:py-20">
          <h2 className="text-[1.7rem] sm:text-[2.3rem] leading-[1.3] mb-3" style={HEAD}>
            なぜ、<span className="text-[#3d5638]">His Recoveries</span> なのか。
          </h2>
          <p className="text-[13.5px] text-[#6b7a66] leading-[1.9] max-w-[36rem] mb-10">
            調べれば売り込みばかり。相談すれば「気にしすぎ」。——そのどちらでもない場所を、つくりました。
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {WHY.map((w) => (
              <div key={w.t} className="rounded-[1.5rem] bg-[#f4f6f2] border border-[#1f2a1d]/8 p-6">
                <span aria-hidden className="grid place-items-center w-12 h-12 rounded-full bg-[#eef3ea] mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3d5638" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{w.icon}</svg>
                </span>
                <h3 className="text-[1.1rem] font-bold text-[#1f2a1d] mb-2" style={HEAD}>{w.t}</h3>
                <p className="text-[12.5px] text-[#4b5b47] leading-[1.9]">{w.d}</p>
              </div>
            ))}
          </div>
          <Link href="/manifesto" className="mt-8 inline-flex items-center gap-2 text-[13px] font-semibold text-[#3d5638] hover:opacity-70 transition-opacity">
            私たちの思想を読む <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* ===== 4. 読む（ライト） ===== */}
      <section className="bg-[#f4f6f2]">
        <div className="mx-auto max-w-[1040px] px-6 sm:px-10 py-16 sm:py-20">
          <h2 className="text-[1.7rem] sm:text-[2.3rem] leading-[1.3] mb-2" style={HEAD}>
            まず、<span className="text-[#3d5638]">読んでみる。</span>
          </h2>
          <p className="text-[13.5px] text-[#6b7a66] leading-[1.85] mb-8">完全匿名で読めます。読むだけでも、大丈夫。</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className="group flex flex-col rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 p-5 hover:border-[#3d5638]/40 hover:shadow-[0_18px_38px_-24px_rgba(20,32,26,0.5)] hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: e.accentSoft, color: e.accent }}>{e.category}</span>
                  {e.badge === "ガイド" && <span className="inline-flex rounded-full bg-[#eef3ea] text-[#3d5638] px-2 py-0.5 text-[9.5px] font-bold">ガイド</span>}
                  {e.badge === "取材" && <span className="inline-flex rounded-full bg-[#3d5638] text-white px-2 py-0.5 text-[9.5px] font-bold">取材</span>}
                </div>
                <h3 className="text-[14.5px] font-bold text-[#1f2a1d] leading-[1.5] group-hover:text-[#3d5638] transition-colors" style={HEAD}>{e.title}</h3>
                <p className="mt-2 text-[12px] text-[#4b5b47] leading-[1.8] line-clamp-2">{e.excerpt}</p>
                <span className="mt-3 text-[12px] font-semibold text-[#3d5638] inline-flex items-center gap-1 group-hover:gap-1.5 transition-all">読む <span aria-hidden>→</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. 体験へ（フルブリード・ダークCTA） ===== */}
      <section className="relative bg-[#16241a] text-[#EDF1E8] overflow-hidden">
        <div aria-hidden className="absolute -top-20 -right-16 w-[26rem] h-[26rem] rounded-full blur-[120px]" style={{ background: "rgba(133,171,139,0.2)" }} />
        <div className="relative mx-auto max-w-[1040px] px-6 sm:px-10 py-16 sm:py-24">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#85AB8B] mb-3">Experience</div>
          <h2 className="text-[2rem] sm:text-[2.8rem] leading-[1.25] max-w-[16ch]" style={HEAD}>
            ひとりで抱えず、<br /><span className="text-[#85AB8B]">プロと一日で。</span>
          </h2>
          <p className="mt-6 text-[14px] sm:text-[15px] text-[#C9D2C4] leading-[1.95] max-w-[34rem]">
            読んで分かっても、自分に合う形にするのは難しいもの。メイク・服・写真まで、専属チームがあなたに合わせて一日で整えます。はじめてでも、完全匿名で。
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {STEPS.map((s, i) => (
              <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] border border-white/10 px-3.5 py-1.5 text-[12px] text-[#D7DED2]">
                <span className="text-[#85AB8B] font-mono text-[10px]">{String(i + 1).padStart(2, "0")}</span>{s}
              </span>
            ))}
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <BookingCTA className="bg-[#EDF1E8] hover:bg-white text-[#16241a] text-sm font-semibold px-8 py-4 rounded-full transition-colors">
              まずは、そっと相談する
            </BookingCTA>
            <Link href="/packages/first-impression" className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:border-white/60 text-[#EDF1E8] text-sm font-semibold px-7 py-4 transition-colors">
              パッケージを見る <span aria-hidden>→</span>
            </Link>
          </div>
          <p className="mt-5 text-[11.5px] text-[#9FB0A0] leading-[1.8]">
            はじめの相談は無料・完全匿名。実名・顔写真は不要です。整えるかどうかは、読んでから決めて大丈夫。
          </p>
        </div>
      </section>

      {/* ===== 6. フッター行（ライト） ===== */}
      <section className="bg-[#f4f6f2]">
        <div className="mx-auto max-w-[1040px] px-6 sm:px-10 py-10">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px]">
            <Link href="/partners" className="text-[#3d5638] font-semibold hover:opacity-70 transition-opacity inline-flex items-center gap-1">
              現場のプロの方へ <span aria-hidden>→</span>
            </Link>
            <span className="text-[#9aa79a]">最終更新: {AREA_UPDATED}・出典明記・中立</span>
          </div>
          <p className="mt-4 text-[11.5px] text-[#6b7a66] leading-[1.9] max-w-[40rem]">
            ※ 記事は一般的に知られる情報や実践のヒントを、出典を明記して整理したものです。効果を保証するものではなく、
            診断・治療・受診勧奨を目的としたものではありません。個別の判断は医療機関にご相談ください。
          </p>
        </div>
      </section>
    </div>
  );
}
