import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllFeelingSlugs,
  getFeeling,
  TERRITORY_LABEL,
} from "@/lib/feelings";
import { site } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllFeelingSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const f = getFeeling(params.slug);
  if (!f) return {};
  const url = `${site.url}/feelings/${f.slug}`;
  const title = `「${f.statement}」と感じるとき`;
  return {
    title,
    description: f.why.slice(0, 120),
    alternates: { canonical: url },
    openGraph: { type: "article", title, description: f.why.slice(0, 120), url },
    twitter: {
      card: "summary_large_image",
      title,
      description: f.why.slice(0, 120),
    },
  };
}

export default function FeelingPage({ params }: { params: Params }) {
  const f = getFeeling(params.slug);
  if (!f) notFound();

  const url = `${site.url}/feelings/${f.slug}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: f.statement, item: url },
    ],
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Header */}
      <header className="mx-auto max-w-reading px-6 sm:px-10 pt-14 sm:pt-24 pb-10">
        <nav
          aria-label="breadcrumb"
          className="mb-8 text-[11px] tracking-widest text-sub-gray"
        >
          <Link href="/" className="hover:text-ink transition-colors uppercase">
            Home
          </Link>
        </nav>
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          A Feeling
        </p>
        <h1 className="mt-5 font-mincho text-[1.9rem] sm:text-[2.8rem] text-ink leading-[1.4]">
          {f.statement}
        </h1>
      </header>

      {/* なぜ気になるのか */}
      <section className="mx-auto max-w-reading px-6 sm:px-10 py-8">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          なぜ気になるのか
        </p>
        <p className="font-mincho text-[15px] sm:text-base text-ink/90 leading-[2.1]">
          {f.why}
        </p>
      </section>

      {/* どんな人が */}
      <section className="mx-auto max-w-reading px-6 sm:px-10 py-8">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          どんな人が、こう感じるか
        </p>
        <p className="font-mincho text-[15px] text-ink/85 leading-[2.1]">{f.who}</p>
      </section>

      {/* 悩み票 — life-pain vignettes */}
      <section className="bg-cream-deep border-y border-hair-line">
        <div className="mx-auto max-w-reading px-6 sm:px-10 py-14 sm:py-20">
          <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-6">
            悩み票 — 生活のなかの、小さな痛み
          </p>
          <ul className="space-y-px">
            {f.vignettes.map((v) => (
              <li
                key={v}
                className="border-t border-hair-line py-5 flex items-baseline gap-4"
              >
                <span
                  aria-hidden
                  className="logo-type italic text-gold text-[13px] shrink-0"
                >
                  —
                </span>
                <p className="font-mincho text-[15px] sm:text-[16px] text-ink leading-[1.9]">
                  {v}
                </p>
              </li>
            ))}
            <li className="border-t border-hair-line" />
          </ul>
        </div>
      </section>

      {/* 原因候補 → cause-analysis territories */}
      <section className="mx-auto max-w-[1000px] px-6 sm:px-10 py-16 sm:py-24">
        <div className="mb-10">
          <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
            原因候補 — 理解する
          </p>
          <h2 className="font-mincho text-2xl sm:text-[2rem] text-ink leading-[1.45]">
            この感覚の奥には、何があるのか
          </h2>
          <p className="mt-4 font-mincho text-[13.5px] text-sub-gray leading-[2] max-w-[34rem]">
            考えられる原因を、押し付けずに並べます。気になるものから、
            「なぜそれが起こるのか」を読みほどいてください。
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {f.causes.map((c) => (
            <li key={c.territory}>
              <Link
                href={`/territories/${c.territory}`}
                className="group block h-full bg-paper border border-hair-line p-6 sm:p-7 hover:border-gold transition-colors card-lift"
              >
                <p className="logo-type italic text-[10px] tracking-[0.25em] uppercase text-gold">
                  {TERRITORY_LABEL[c.territory] ?? c.territory}
                </p>
                <h3 className="mt-3 font-mincho text-base sm:text-lg text-ink leading-[1.5] group-hover:text-gold transition-colors">
                  {c.cause}
                </h3>
                <span className="mt-4 inline-flex text-[13px] tracking-[0.1em] text-sub-gray group-hover:text-gold transition-colors">
                  なぜ起こるのかを読む
                  <span aria-hidden> →</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 次の一歩 */}
      <section
        aria-labelledby="next-step"
        className="border-t border-hair-line bg-navy text-cream"
      >
        <div className="mx-auto max-w-[1000px] px-6 sm:px-10 py-16 sm:py-24 text-center">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold-bright">
            A Next Half-Step
          </p>
          <h2
            id="next-step"
            className="mt-5 font-mincho text-2xl sm:text-[2rem] leading-[1.5]"
          >
            理解したあとの、次の一歩
          </h2>
          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Link href="/check" className="btn-gold justify-center">
              Recovery Check を始める <span aria-hidden>→</span>
            </Link>
            <Link
              href="/membership"
              className="text-sm tracking-[0.12em] text-cream border border-cream/40 hover:border-gold-bright hover:text-gold-bright transition-colors px-6 py-3.5 text-center"
            >
              日曜日の手紙を受け取る
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
