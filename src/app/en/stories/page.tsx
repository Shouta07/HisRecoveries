import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recovery Stories",
  description:
    "Recovery Stories — the records of men who faced the complexes that are hard to say out loud: hair, skin, sweat, odor, confidence. An archive that becomes the help for whoever worries next.",
  alternates: {
    canonical: `${site.url}/en/stories`,
    languages: {
      ja: `${site.url}/stories`,
      en: `${site.url}/en/stories`,
      "x-default": `${site.url}/stories`,
    },
  },
  openGraph: {
    locale: "en_US",
    title: `Recovery Stories — ${site.name}`,
    description: "A record of recovery becomes someone's hope.",
  },
};

export default function EnStoriesPage() {
  return (
    <div lang="en" className="mx-auto max-w-[1000px] px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
      <header className="text-center mb-16 sm:mb-20">
        <p className="logo-type italic text-[11px] sm:text-xs tracking-[0.4em] uppercase text-gold">
          Recovery Stories
        </p>
        <h1 className="mt-6 font-mincho text-3xl sm:text-5xl lg:text-6xl text-ink leading-[1.35]">
          A record of recovery
          <br />
          becomes someone&apos;s hope.
        </h1>
        <p className="mt-10 font-mincho text-[15px] sm:text-base text-ink/80 leading-[2.05] max-w-[34rem] mx-auto">
          Hair, skin, sweat, odor, confidence. We keep the recovery records of men
          who faced what is hard to say out loud.
        </p>
      </header>

      <section className="bg-paper border border-hair-line p-8 sm:p-12 text-center">
        <p className="logo-type italic text-[10px] tracking-[0.4em] uppercase text-gold mb-5">
          The Archive
        </p>
        <p className="font-mincho text-lg sm:text-xl text-ink leading-[1.85]">
          The English archive is being prepared.
        </p>
        <p className="mt-5 font-mincho text-[14px] sm:text-[15px] text-sub-gray leading-[2.05] max-w-[28rem] mx-auto">
          His Recoveries is written in Japanese today. An English edition is
          coming. To be there when it does, follow the Recoveries Letter.
        </p>
        <div className="mt-8">
          <a
            href={site.social.substack}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-sm tracking-[0.12em] text-ink border border-gold/60 hover:border-gold-bright hover:text-gold-bright transition-colors px-8 py-4"
          >
            Follow on Substack
            <span aria-hidden>→</span>
          </a>
        </div>
      </section>

      <div className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[12px] tracking-[0.06em] text-sub-gray">
        <Link
          href="/en/territories"
          className="hover:text-ink transition-colors border-b border-hair-line hover:border-gold pb-0.5"
        >
          Read the causes
        </Link>
        <span aria-hidden className="text-hair-line">·</span>
        <Link
          href="/en"
          className="hover:text-ink transition-colors border-b border-hair-line hover:border-gold pb-0.5"
        >
          Overview
        </Link>
      </div>
    </div>
  );
}
