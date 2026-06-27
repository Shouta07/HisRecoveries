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
import { complexByTerritory } from "@/lib/complexes";
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
  const c = complexByTerritory(t.slug);
  const accent = c?.accent ?? "#18181b";
  const soft = c?.accentSoft ?? "#f4f4f5";
  const relatedFeelings = getFeelingsForTerritory(t.slug);
  const otherTerritories = getAllTerritories().filter((o) => o.slug !== t.slug);
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
    <article className="bg-[#FAF6F0] text-zinc-900">
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

      {/* Header */}
      <header className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-10 sm:pt-14 pb-10 sm:pb-14">
        <nav aria-label="breadcrumb" className="mb-7 text-[12px] text-zinc-400">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-zinc-700 transition-colors">
                ホーム
              </Link>
            </li>
            <li aria-hidden>›</li>
            <li>
              <Link href="/territories" className="hover:text-zinc-700 transition-colors">
                悩み別
              </Link>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
          <div className="order-2 lg:order-1">
            {c && (
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12.5px] font-bold"
                style={{ backgroundColor: soft, color: accent }}
              >
                {c.ja} · {c.stat}
              </span>
            )}
            <h1 className="mt-5 text-[2.1rem] sm:text-[3.2rem] font-extrabold leading-[1.25] tracking-[-0.01em] text-zinc-900">
              {t.title}は、
              <br className="hidden sm:inline" />
              なぜ起こるの？
            </h1>
            <p className="mt-5 text-[15px] sm:text-[1.05rem] text-zinc-500 leading-[1.95] max-w-[34rem]">
              {t.intro}
            </p>
          </div>
          <div className="order-1 lg:order-2 rounded-3xl overflow-hidden shadow-sm bg-white">
            <TerritoryArt slug={t.slug} aspectClass="aspect-[4/3]" />
          </div>
        </div>
      </header>

      {/* Cause analysis body — white rounded reading card */}
      <div className="mx-auto max-w-[760px] px-6 sm:px-10 pb-4">
        <div className="rounded-3xl bg-white p-7 sm:p-12 shadow-sm">
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: t.contentHtml }}
          />
          <p className="mt-12 text-[12px] text-zinc-400 leading-[2] border-t border-zinc-100 pt-6">
            ※ 本ページは一般的な情報を整理したものであり、診断・治療を目的としたものではありません。
            症状や治療の判断は、医療機関にご相談ください。
          </p>
        </div>
      </div>

      {/* FAQ */}
      {t.faq.length > 0 && (
        <section
          aria-labelledby="faq"
          className="mx-auto max-w-[760px] px-6 sm:px-10 py-12"
        >
          <h2 id="faq" className="text-[1.5rem] sm:text-[1.9rem] font-extrabold text-zinc-900 mb-7">
            よくある質問
          </h2>
          <dl className="space-y-3">
            {t.faq.map((item, i) => (
              <div key={i} className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm">
                <dt className="flex gap-3 text-zinc-900 font-bold text-[15.5px] leading-[1.7]">
                  <span
                    className="shrink-0 grid place-items-center w-6 h-6 rounded-full text-[12px] font-bold"
                    style={{ backgroundColor: soft, color: accent }}
                  >
                    Q
                  </span>
                  {item.q}
                </dt>
                <dd className="mt-3 pl-9 text-zinc-600 text-[14px] leading-[2]">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Related links */}
      <section className="mx-auto max-w-[760px] px-6 sm:px-10 py-8">
        {relatedQA.length > 0 && (
          <div className="mb-10">
            <p className="text-[12px] font-bold tracking-[0.04em] text-zinc-400 mb-4">
              この悩みに届いた問い
            </p>
            <ul className="space-y-2.5">
              {relatedQA.map((q) => (
                <li key={q.slug}>
                  <Link
                    href={`/qa/${q.slug}`}
                    className="block rounded-xl bg-white px-4 py-3 text-[14px] text-zinc-700 hover:text-zinc-900 shadow-sm transition-colors"
                  >
                    <span className="font-bold mr-2" style={{ color: accent }}>
                      Q.
                    </span>
                    {q.question}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {relatedFeelings.length > 0 && (
          <div className="mb-10">
            <p className="text-[12px] font-bold tracking-[0.04em] text-zinc-400 mb-4">
              この感覚から来た方へ
            </p>
            <ul className="flex flex-wrap gap-2.5">
              {relatedFeelings.map((f) => (
                <li key={f.slug}>
                  <Link
                    href={`/feelings/${f.slug}`}
                    className="inline-flex rounded-full bg-white px-4 py-2 text-[13px] text-zinc-700 shadow-sm hover:text-zinc-900 transition-colors"
                  >
                    {f.statement}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-[12px] font-bold tracking-[0.04em] text-zinc-400 mb-4">
            ほかの悩みも読む
          </p>
          <ul className="flex flex-wrap gap-2.5">
            {otherTerritories.map((o) => {
              const oc = complexByTerritory(o.slug);
              return (
                <li key={o.slug}>
                  <Link
                    href={`/territories/${o.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-zinc-700 shadow-sm hover:-translate-y-0.5 transition-all"
                  >
                    <span
                      aria-hidden
                      className="block w-2 h-2 rounded-full"
                      style={{ backgroundColor: oc?.accent ?? "#a1a1aa" }}
                    />
                    {o.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Next half-step */}
      <section aria-labelledby="next-step" className="px-6 sm:px-10 pb-20 pt-8">
        <div className="mx-auto max-w-[1000px]">
          <div className="text-center mb-9">
            <h2
              id="next-step"
              className="text-[1.6rem] sm:text-[2.1rem] font-extrabold text-zinc-900"
            >
              読んだあとの、次の半歩
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <NextCard
              href={`/ask?territory=${t.slug}`}
              eyebrow="Q&A"
              title="ひとつだけ、問いを置く"
              body="いまの言葉のままで構いません。編集者が読み、手紙で返事を書きます。"
              cta="問いを置く"
              accent={accent}
              soft={soft}
            />
            <NextCard
              href="/check"
              eyebrow="Check"
              title="自分の状態を整理する"
              body="30 問の自己観察に答えると、あなたの状態の地形図が返ります。β 期間は無料。"
              cta="チェックを始める"
              accent={accent}
              soft={soft}
            />
            <NextCard
              href="/recoveries"
              eyebrow="Voices"
              title="同じ悩みの人の声を読む"
              body="第一線で働く人が、悩みとどう過ごし、何を選んだか。飾らない一人称の記録です。"
              cta="インタビューを読む"
              accent={accent}
              soft={soft}
            />
          </div>
        </div>
      </section>
    </article>
  );
}

function NextCard({
  href,
  eyebrow,
  title,
  body,
  cta,
  accent,
  soft,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  accent: string;
  soft: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-3xl bg-white p-6 sm:p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
    >
      <span
        className="inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.08em] uppercase"
        style={{ backgroundColor: soft, color: accent }}
      >
        {eyebrow}
      </span>
      <h3 className="mt-4 text-[1.15rem] font-bold text-zinc-900 leading-[1.5]">
        {title}
      </h3>
      <p className="mt-3 text-[13px] text-zinc-500 leading-[1.95] flex-1">
        {body}
      </p>
      <span
        className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-bold group-hover:gap-2.5 transition-all"
        style={{ color: accent }}
      >
        {cta} <span aria-hidden>→</span>
      </span>
    </Link>
  );
}
