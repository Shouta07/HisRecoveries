import type { Metadata } from "next";
import Link from "next/link";
import { site, ogImage } from "@/lib/site";
import { NAME } from "@/lib/voice";
import { clusters } from "@/lib/clusters";
import { publishedAt } from "@/lib/articleDates";
import {
  MEDIA, PHASES, articlesIn, others, assignedCount,
} from "@/lib/media";
import Mark from "@/components/brand/Mark";
import PlanCta from "@/components/brand/PlanCta";
import Slot from "@/components/brand/Slot";
import { advisorWord } from "@/lib/who";

// たしかメディア。
//
// ══════════════════════════════════════════════════
// 記事の一覧サイトにしない
// ══════════════════════════════════════════════════
// 「分野・状況・年代からさがす」索引だった。
// それは、記事が目的の人のための形。
//
// ここに来るのは、検索から来て困っている人。
// 目的は記事ではなく、自分の場面をどうするか。
// だから恋愛のどの段で迷っているかで並べる。
//
// ══════════════════════════════════════════════════
// 記事は減らしていない
// ══════════════════════════════════════════════════
// 55本のうち、マッチングアプリに近いのは9本。
// 残りは前の商売のもの（AGA・肌・体毛・健康）。
//
// 消すのは簡単だが、戻せない。
// どれだけ読まれていて、どこからリンクされているかを
// こちらは知らない。並べ方だけ変えて、下にまとめた。
//
// ══════════════════════════════════════════════════
// 読んだあと、そのまま自分の場面へ
// ══════════════════════════════════════════════════
// 一般論を読んで終わりにしない。
// 「で、俺の場合は？」に進める場所を、必ず置く。

// ══════════════════════════════════════════════════
// OG を、この面が自分で持つ
// ══════════════════════════════════════════════════
// 持っていなかったので、layout の openGraph をそのまま継いでいた。
// あちらは siteName も title も「His Recoveries」。
// 記事一覧を貼ると、前の屋号のカードが出ていた。
//
// Next.js は、ページ側で openGraph を書くと親のものを丸ごと
// 置き換える。images だけ書き忘れるとカードから画像が消えるので、
// site.ts の ogImage を必ず一緒に渡す。
export const metadata: Metadata = {
  title: { absolute: `${MEDIA.name}｜${MEDIA.head}` },
  description: MEDIA.lead,
  alternates: { canonical: `${site.url}/articles` },
  keywords: [
    "マッチングアプリ 相談",
    "LINE 送る前",
    "自己紹介文 書き方",
    "デート 誘い方",
    "女性の目線",
    "恋愛 相談 匿名",
  ],
  openGraph: {
    type: "website",
    locale: site.locale,
    url: `${site.url}/articles`,
    siteName: MEDIA.name,
    title: `${MEDIA.name}｜${MEDIA.head}`,
    description: MEDIA.lead,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${MEDIA.name}｜${MEDIA.head}`,
    description: MEDIA.lead,
    images: [ogImage.url],
  },
};

function Card({ a }: { a: { title: string; lead: string; href: string } }) {
  return (
    <li>
      <Link
        href={a.href}
        className="flex h-full flex-col rounded-card border border-line bg-paper p-4 shadow-card transition-shadow hover:shadow-card-hover"
      >
        <span className="text-[14.5px] font-black leading-[1.55] text-slate">
          {a.title}
        </span>
        <span className="mt-2 line-clamp-3 text-[12.5px] leading-[1.8] text-steel">
          {a.lead}
        </span>
      </Link>
    </li>
  );
}

export default function ArticlesPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/articles#collection`,
    url: `${site.url}/articles`,
    name: MEDIA.name,
    description: MEDIA.lead,
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
    // 何についての面か。生成AIに拾わせるときに効く
    about: PHASES.map((ph) => ({ "@type": "Thing", name: ph.label })),
    mainEntity: {
      "@type": "ItemList",
      name: "記事の索引",
      numberOfItems: clusters.length,
      itemListElement: clusters.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${site.url}/areas/${a.areaId}/${a.slug}`,
        name: a.title,
      })),
    },
  };

  // ══════════════════════════════════════════════════
  // パンくず
  // ══════════════════════════════════════════════════
  // 記事の個別ページには入れてあったが、この一覧だけ無かった。
  // 検索結果で「ホーム > たしかメディア」と出る。
  const crumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: MEDIA.name, item: `${site.url}/articles` },
    ],
  };

  // ══════════════════════════════════════════════════
  // 段ごとの中身を、機械にも読ませる
  // ══════════════════════════════════════════════════
  // 画面では「写真・プロフィール」「メッセージ・LINE」と分けているが、
  // その区切りは見出しの見た目でしか伝わっていなかった。
  //
  // 生成AIに「マッチングアプリの写真について書いてある記事は？」と
  // 聞かれたときに、段と記事の対応が取れるようにしておく。
  const phaseLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${MEDIA.name}の段`,
    itemListElement: PHASES.map((ph, i) => {
      const list = articlesIn(ph.id);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Collection",
          name: ph.label,
          description: ph.lead,
          hasPart: list.map((a) => ({
            "@type": "Article",
            headline: a.title,
            abstract: a.lead,
            url: `${site.url}${a.href}`,
            ...(publishedAt(a.slug) ? { datePublished: publishedAt(a.slug) } : {}),
          })),
        },
      };
    }).filter((x) => (x.item.hasPart as unknown[]).length > 0),
  };

  const rest = others();

  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(phaseLd) }}
      />

      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <Mark size={30} />
            <span className="min-w-0">
              <span className="block truncate text-[15.5px] font-black leading-[1.2] text-slate">
                {MEDIA.name}
              </span>
              <span className="block text-[10px] font-bold leading-[1.3] text-steel">
                by {NAME}
              </span>
            </span>
          </Link>
          <Link
            href="/ask"
            className="shrink-0 rounded-pill bg-brand px-4 py-2.5 text-[13px] font-bold text-paper shadow-card"
          >
            確かめる
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] px-5 pb-20 pt-8 sm:px-8">
        <h1 className="text-huge font-black leading-[1.35] text-slate">{MEDIA.head}</h1>
        <p className="mt-4 max-w-[34em] text-[14.5px] leading-[1.9] text-steel sm:text-[15px]">
          {MEDIA.lead}
        </p>

        {/* 段で探す。カテゴリではなく、いまどこで止まっているか */}
        <p className="mt-9 text-[13px] font-black text-steel">今、どこで迷ってる？</p>
        <div className="mt-8 flex flex-col gap-9">
          {PHASES.map((ph) => {
            const list = articlesIn(ph.id);
            return (
              <section key={ph.id}>
                <h2 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[19px] font-black leading-[1.4] text-slate">
                    {ph.label}
                  </span>
                  <span className="text-[12.5px] text-steel">{ph.lead}</span>
                </h2>

                {list.length > 0 ? (
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((a) => (
                      <Card key={a.slug} a={a} />
                    ))}
                  </ul>
                ) : (
                  // 無いものを、あるように見せない。
                  // 空の段を消すと、書くべき穴も見えなくなる
                  <p className="mt-3 rounded-card bg-mist px-4 py-3 text-[12.5px] leading-[1.8] text-steel">
                    この段の記事は、まだありません。
                    <Link
                      href="/ask"
                      className="ml-1 font-bold text-brand underline decoration-line underline-offset-4"
                    >
                      自分の場面を確かめる
                    </Link>
                  </p>
                )}
              </section>
            );
          })}
        </div>

        {/* 読んだあと、そのまま自分の場面へ */}
        {/* ══════════════════════════════════════════════
            ここだけ、人の顔を出す
            ══════════════════════════════════════════════
            記事の面は文字ばかりで、読み終わったあとに
            「で、誰に聞けるのか」が絵で入ってこない。

            出すのは、相談する側と答える側の2つだけ。
            記事のカードに顔を付けると、記事が誰かの体験談に見える。
            置くのは、ここ（商品へ渡すところ）に限る。

            ── 写真は素材 ──────────────────────────
            審査を通った回答者はまだ0人なので、
            年齢も職業も名前も付けない。付けた時点で名簿になる。
            「写真はイメージ」の断りを、絵のすぐ下に必ず置く。

            素材は 202×198 しかないので、大きくしない。 */}
        <div className="mt-12 rounded-card border border-line bg-mist px-5 py-6 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Slot
              name="hero"
              rounded="rounded-card"
              position="center 16%"
              className="h-[64px] w-[64px] shrink-0 sm:h-[76px] sm:w-[76px]"
            />
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0 text-brand sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            <ul className="flex shrink-0 items-center -space-x-2">
              {(["w1", "w3", "w5"] as const).map((n) => (
                <li key={n}>
                  <Slot
                    name={n}
                    rounded="rounded-full"
                    className="h-[56px] w-[56px] ring-2 ring-mist sm:h-[68px] sm:w-[68px]"
                  />
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-[17px] font-black leading-[1.6] text-slate">
            {MEDIA.bridge}
          </p>
          <p className="mt-2 max-w-[30em] text-[13.5px] leading-[1.85] text-steel">
            一般論では決まらないところを、実在する{advisorWord()}が読んで、
            実際にどう受け取ったかを返します。文章でも、画像でも。
          </p>
          <div className="mt-5 max-w-[24em]">
            <PlanCta
              plan="review"
              from="media"
              className="min-h-[56px] w-full rounded-pill bg-brand px-8 text-[16px] !text-paper shadow-card"
            >
              自分の場合を確かめる <span aria-hidden className="ml-2">&rarr;</span>
            </PlanCta>
          </div>
          {/* 絵のすぐ下に置く。離すと、絵だけ切り取られたときに残らない */}
          <p className="mt-3 text-[10.5px] leading-[1.7] text-steel">
            ※ 写真はイメージです。実在の回答者の一覧ではありません。
          </p>
        </div>

        {/* 残り。消していない。畳んでおく */}
        {rest.length > 0 && (
          <details className="group mt-12">
            <summary className="flex min-h-[48px] cursor-pointer list-none items-center gap-2 text-[13.5px] font-bold text-brand">
              そのほかの記事（{rest.length}本）
              <span
                aria-hidden
                className="text-[16px] leading-none text-steel transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-2 max-w-[34em] text-[12.5px] leading-[1.85] text-steel">
              見た目・体・習慣についての記事です。恋愛の場面に直接は結びつきませんが、
              土台のところを整えたい人向けに残しています。
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => (
                <Card key={a.slug} a={a} />
              ))}
            </ul>
          </details>
        )}

        <p className="mt-10 text-[11.5px] leading-[1.8] text-steel">
          全{clusters.length}本。うち{assignedCount()}本を、恋愛の段に並べています。
        </p>
      </main>
    </div>
  );
}
