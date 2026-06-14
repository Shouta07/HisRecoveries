import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import TerritoryArt from "@/components/TerritoryArt";
import {
  getAllTerritories,
  getAllTerritorySlugs,
  getTerritory,
} from "@/lib/territories";
import { getFeelingsForTerritory } from "@/lib/feelings";
import { getQAForTerritory } from "@/lib/qa";
import { site } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllTerritorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const t = await getTerritory(params.slug);
  if (!t) return {};
  const url = `${site.url}/territories/${t.slug}`;
  const title = `${t.title}は、なぜ起こるのか — 原因と選択肢`;
  return {
    title,
    description: t.intro,
    alternates: {
      canonical: url,
      languages: {
        ja: url,
        en: `${site.url}/en/territories/${t.slug}`,
        "x-default": url,
      },
    },
    openGraph: {
      type: "article",
      title,
      description: t.intro,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t.intro,
    },
  };
}

export default async function TerritoryPage({
  params,
}: {
  params: Params;
}) {
  const t = await getTerritory(params.slug);
  if (!t) notFound();

  const url = `${site.url}/territories/${t.slug}`;
  const relatedFeelings = getFeelingsForTerritory(t.slug);
  const otherTerritories = getAllTerritories().filter(
    (o) => o.slug !== t.slug
  );
  const relatedQA = getQAForTerritory(t.slug).slice(0, 4);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "原因を読む",
        item: `${site.url}/territories`,
      },
      { "@type": "ListItem", position: 3, name: t.title, item: url },
    ],
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: `${t.title}は、なぜ起こるのか`,
    description: t.intro,
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
    publisher: { "@id": `${site.url}/#publisher` },
    mainEntityOfPage: url,
  };

  const faqLd =
    t.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${url}#faq`,
          mainEntity: t.faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }
      : null;

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      <header className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-12 sm:pt-16 pb-12 sm:pb-16">
        <nav
          aria-label="breadcrumb"
          className="mb-8 text-[11px] tracking-widest text-sub-gray"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/"
                className="hover:text-ink transition-colors uppercase"
              >
                Home
              </Link>
            </li>
            <li aria-hidden>—</li>
            <li>
              <Link
                href="/territories"
                className="hover:text-ink transition-colors"
              >
                原因を読む
              </Link>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-start">
          <div className="order-2 lg:order-1">
            <h1 className="text-3xl sm:text-5xl font-bold leading-[1.4] text-ink">
              {t.title}は、なぜ起こるのか
            </h1>
            <p className="mt-6 font-mincho text-sub-gray text-base sm:text-lg leading-[2]">
              — {t.subtitle} —
            </p>
            <p className="mt-8 text-[1rem] leading-[2.1] text-ink max-w-[34rem]">
              {t.intro}
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <TerritoryArt slug={t.slug} aspectClass="aspect-[4/3]" />
          </div>
        </div>
      </header>

      {/* Cause analysis — the in-site content. SEO/GEO oriented. */}
      <div className="mx-auto max-w-reading px-6 sm:px-10 pb-8">
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: t.contentHtml }}
        />
        <p className="mt-12 text-[12px] text-sub-gray leading-[2] border-t border-hair-line pt-6">
          ※ 本ページは一般的な情報を整理したものであり、診断・治療を目的としたものではありません。
          症状や治療の判断は、医療機関にご相談ください。
        </p>
      </div>

      {/* FAQ — also emitted as FAQPage structured data above. */}
      {t.faq.length > 0 && (
        <section
          aria-labelledby="faq"
          className="mx-auto max-w-reading px-6 sm:px-10 py-12"
        >
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold mb-8">
            Questions — よくある問い
          </p>
          <h2 id="faq" className="sr-only">
            {t.title}についてよくある質問
          </h2>
          <dl className="space-y-7">
            {t.faq.map((item, i) => (
              <div key={i}>
                <dt className="text-ink font-mincho text-[1.0625rem] leading-[1.8]">
                  <span className="logo-type text-gold mr-2">Q.</span>
                  {item.q}
                </dt>
                <dd className="mt-3 font-mincho text-sub-gray text-[15px] leading-[2.05]">
                  <span className="logo-type text-gold mr-2">A.</span>
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Internal links — related feelings (entry) + Q&A + other causes */}
      <section className="mx-auto max-w-reading px-6 sm:px-10 py-12 border-t border-hair-line">
        {relatedQA.length > 0 && (
          <div className="mb-10">
            <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
              この領域に届いた問い
            </p>
            <ul className="space-y-3">
              {relatedQA.map((q) => (
                <li key={q.slug}>
                  <Link
                    href={`/qa/${q.slug}`}
                    className="block font-mincho text-[14.5px] text-ink hover:text-gold transition-colors"
                  >
                    <span className="text-gold mr-2">Q.</span>
                    {q.question}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {relatedFeelings.length > 0 && (
          <div className="mb-10">
            <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
              この感覚から、来た方へ
            </p>
            <ul className="flex flex-wrap gap-2.5">
              {relatedFeelings.map((f) => (
                <li key={f.slug}>
                  <Link
                    href={`/feelings/${f.slug}`}
                    className="inline-flex border border-hair-line bg-paper px-4 py-2 text-[13px] text-ink hover:border-gold hover:text-gold transition-colors"
                  >
                    {f.statement}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
            ほかの原因も読む
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13.5px]">
            {otherTerritories.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/territories/${o.slug}`}
                  className="text-ink border-b border-hair-line hover:border-gold hover:text-gold transition-colors pb-0.5"
                >
                  {o.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 次の半歩 — connects 悩み選択 → 診断 / 行動 */}
      <section
        aria-labelledby="next-step"
        className="border-t border-hair-line bg-cream-deep"
      >
        <div className="mx-auto max-w-[1000px] px-6 sm:px-10 py-16 sm:py-24">
          <div className="text-center mb-10 sm:mb-12">
            <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
              A Next Half-Step
            </p>
            <h2
              id="next-step"
              className="mt-5 font-mincho text-2xl sm:text-[2rem] text-ink leading-[1.45]"
            >
              読んだあとの、次の半歩
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <Link
              href={`/ask?territory=${t.slug}`}
              className="group block bg-paper border border-hair-line p-6 sm:p-8 hover:border-gold transition-colors card-lift"
            >
              <p className="logo-type italic text-[11px] tracking-[0.25em] uppercase text-gold">
                Recovery Q&A
              </p>
              <h3 className="mt-3 font-mincho text-lg text-ink leading-[1.5] group-hover:text-gold transition-colors">
                ひとつだけ、問いを置く
              </h3>
              <p className="mt-3 font-mincho text-[13px] text-sub-gray leading-[2]">
                いまの言葉のままで構いません。編集者が読み、手紙で返事を書きます。
              </p>
              <span className="mt-5 inline-flex text-sm tracking-[0.12em] text-ink border-b border-gold pb-1 group-hover:text-gold transition-colors">
                問いを置く
                <span aria-hidden> →</span>
              </span>
            </Link>

            <Link
              href="/check"
              className="group block bg-paper border border-hair-line p-6 sm:p-8 hover:border-gold transition-colors card-lift"
            >
              <p className="logo-type italic text-[11px] tracking-[0.25em] uppercase text-gold">
                Recovery Check
              </p>
              <h3 className="mt-3 font-mincho text-lg text-ink leading-[1.5] group-hover:text-gold transition-colors">
                自分の状態を、編集者と整理する
              </h3>
              <p className="mt-3 font-mincho text-[13px] text-sub-gray leading-[2]">
                30 問の自己観察に答えると、編集者が読んで「あなたの状態の地形図」を返します。β 期間中は無料。
              </p>
              <span className="mt-5 inline-flex text-sm tracking-[0.12em] text-ink border-b border-gold pb-1 group-hover:text-gold transition-colors">
                Recovery Check を始める
                <span aria-hidden> →</span>
              </span>
            </Link>

            <Link
              href="/membership"
              className="group block bg-paper border border-hair-line p-6 sm:p-8 hover:border-gold transition-colors card-lift"
            >
              <p className="logo-type italic text-[11px] tracking-[0.25em] uppercase text-gold">
                Recoveries Letter
              </p>
              <h3 className="mt-3 font-mincho text-lg text-ink leading-[1.5] group-hover:text-gold transition-colors">
                毎週日曜日、続きを受け取る
              </h3>
              <p className="mt-3 font-mincho text-[13px] text-sub-gray leading-[2]">
                公開記事には書けない、半歩先からの覚え書きと当事者の記録を、週に一度 Substack で。
              </p>
              <span className="mt-5 inline-flex text-sm tracking-[0.12em] text-ink border-b border-gold pb-1 group-hover:text-gold transition-colors">
                日曜日の手紙を受け取る
                <span aria-hidden> →</span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
