import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { site } from "@/lib/site";
import { NAME } from "@/lib/voice";
import { PRICE_LINE, PRICE_WHAT } from "@/lib/service";
import { STORIES, storyBySlug } from "@/lib/stories";
import { cityBySlug } from "@/lib/cities";
import Mark from "@/components/brand/Mark";

/* ══════════════════════════════════════════════════
   実体験の記事
   ══════════════════════════════════════════════════

   ── いまは、1本も出ない ─────────────────────────
   lib/stories.ts の STORIES が空。
   運営者が実際に書いたものしか置かない。

   検索のために言い換えた一般論を並べることはできる。
   できるが、同じものがすでに何千本もある。
   そこへ足しても読まれないし、読まれても買う理由にならない。

   買う理由になるのは「この人は実際に行っている」の1点だけ。

   ── 記事を、単体で終わらせない ──────────────────
   読み終わった人が、相談のページへ進めること。
   記事は必ず都市を持つ（stories.ts が、都市の無い記事を止める）。

   下に出すのは、その都市の相談ページへの入口1つだけ。
   記事の途中に売り込みを挟まない。読み終わってからでいい。 */

export const dynamicParams = false;

export function generateStaticParams() {
  return STORIES.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const s = storyBySlug(params.slug);
  if (!s) return {};
  return {
    title: { absolute: `${s.title} — ${NAME}` },
    description: s.summary,
    alternates: { canonical: `${site.url}/stories/${s.slug}` },
    openGraph: {
      type: "article",
      url: `${site.url}/stories/${s.slug}`,
      title: s.title,
      description: s.summary,
      publishedTime: s.date,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: s.title }],
    },
  };
}

export default function StoryPage({ params }: { params: { slug: string } }) {
  const s = storyBySlug(params.slug);
  if (!s) notFound();
  const city = cityBySlug(s.city);

  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark size={28} />
            <span className="whitespace-nowrap text-[16px] font-black">{NAME}</span>
          </Link>
          {city && (
            <Link
              href={`/cities/${city.slug}`}
              className="text-[13px] text-steel transition-colors hover:text-slate"
            >
              {city.name}の相談
            </Link>
          )}
        </div>
      </header>

      <article className="mx-auto w-full max-w-[680px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        {city && <p className="text-[12px] font-black tracking-[0.08em] text-brand">{city.name}</p>}
        <h1 className="mt-2 text-big font-black leading-[1.45]">{s.title}</h1>
        <p className="mt-3 text-[12.5px] tabular-nums text-steel">{s.date}</p>

        <p className="mt-6 max-w-[34em] text-[15px] font-bold leading-[1.9]">{s.summary}</p>

        <div className="mt-8 flex flex-col gap-5">
          {s.body.map((p, i) => (
            <p key={i} className="max-w-[34em] text-[15px] leading-[2.0] text-slate">
              {p}
            </p>
          ))}
        </div>

        {/* 写真は運営者が撮ったものだけ。
            置き場所も /img/stories/ に限ってある（stories.ts が見る）。
            素材サイトの写真が、本人の旅の写真として混ざらないように */}
        {s.photos.length > 0 && (
          <div className="mt-9 flex flex-col gap-5">
            {s.photos.map((ph) => (
              <figure key={ph.src}>
                <Image
                  src={ph.src}
                  alt={ph.alt}
                  width={1200}
                  height={900}
                  className="h-auto w-full rounded-card border border-line"
                />
                <figcaption className="mt-2 text-[12.5px] leading-[1.8] text-steel">
                  {ph.alt}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        {city && (
          <aside className="mt-14 rounded-card border border-line bg-mist p-5 sm:p-6">
            <p className="text-[15px] font-black leading-[1.6]">
              {city.name}へ、初めて一人で行く方へ。
            </p>
            <p className="mt-3 max-w-[32em] text-[13.5px] leading-[1.9] text-steel">
              出発前はGoogle Meetで、旅行中はLINEで相談できます。{PRICE_LINE}。{PRICE_WHAT}。
            </p>
            <Link
              href={`/cities/${city.slug}`}
              className="mt-5 inline-flex min-h-[46px] items-center justify-center rounded-pill bg-brand px-6 text-[14px] font-bold text-paper"
            >
              {city.name}の相談ページを見る
            </Link>
          </aside>
        )}
      </article>
    </div>
  );
}
