import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { NAME } from "@/lib/voice";
import { clusters } from "@/lib/clusters";
import {
  MEDIA, PHASES, articlesIn, others, assignedCount,
} from "@/lib/media";
import Mark from "@/components/brand/Mark";
import PlanCta from "@/components/brand/PlanCta";

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

export const metadata: Metadata = {
  title: { absolute: `${MEDIA.name}｜${MEDIA.head}` },
  description: MEDIA.lead,
  alternates: { canonical: `${site.url}/articles` },
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

  const rest = others();

  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
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
        <div className="mt-12 rounded-card border border-line bg-mist px-5 py-6 sm:px-6">
          <p className="text-[17px] font-black leading-[1.6] text-slate">
            {MEDIA.bridge}
          </p>
          <p className="mt-2 max-w-[30em] text-[13.5px] leading-[1.85] text-steel">
            一般論では決まらないところを、実在の女性が読んで、
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
