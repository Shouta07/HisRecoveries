import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllFeelings } from "@/lib/feelings";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "His Recoveries — Male Conditioning",
  description:
    "His Recoveries is a quiet editorial brand about male self-consciousness — the things men search for alone: sweat and odor, acne and scars, hair loss, the impression they leave. Currently written in Japanese; an English edition is coming.",
  alternates: {
    canonical: `${site.url}/en`,
    languages: {
      ja: site.url,
      en: `${site.url}/en`,
      "x-default": site.url,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${site.url}/en`,
    siteName: site.name,
    title: "His Recoveries — Male Conditioning",
    description:
      "A quiet brand about male self-consciousness. Recover Your Presence.",
  },
};

export const dynamic = "force-static";

export default function EnglishHome() {
  const feelings = getAllFeelings();

  return (
    <div lang="en">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-6 sm:px-10 bg-navy overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/cityscape-dawn.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-90"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/70"
        />
        <div className="relative">
          <p className="logo-type italic text-[12.5px] sm:text-[13px] tracking-[0.5em] uppercase text-gold-bright drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
            {site.tagline}
          </p>
          <h1 className="mt-6 logo-type text-[2.8rem] sm:text-7xl text-cream leading-[1] drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]">
            {site.name}
          </h1>
          <div className="mt-8 flex justify-center">
            <span aria-hidden className="block w-14 sm:w-20 h-px bg-gold-bright" />
          </div>
          <p className="mt-7 font-mincho text-[1.15rem] sm:text-[1.9rem] leading-[1.4] text-cream tracking-[0.04em] drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]">
            {site.promise}
          </p>
        </div>
      </section>

      {/* Concept */}
      <section className="bg-navy text-cream">
        <div className="mx-auto max-w-[920px] px-6 sm:px-10 py-24 sm:py-40">
          <div className="space-y-12 sm:space-y-16 font-mincho">
            <p className="text-[1.4rem] sm:text-[2.2rem] leading-[1.7] tracking-[0.02em] text-cream">
              Men carry worries they cannot say out loud —
              <br className="hidden sm:inline" /> and they search for them alone.
            </p>
            <p className="text-[1.4rem] sm:text-[2.2rem] leading-[1.7] tracking-[0.02em] text-cream/85">
              His Recoveries wants to be the place
              <br className="hidden sm:inline" /> that comes after that search.
            </p>
          </div>
        </div>
      </section>

      {/* Recovery Hub — feelings */}
      <section className="bg-cream-deep border-t border-hair-line">
        <div className="mx-auto max-w-[860px] px-6 sm:px-10 py-20 sm:py-32">
          <div className="mb-12 sm:mb-16">
            <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
              Recovery Hub
            </p>
            <h2 className="mt-5 font-mincho text-2xl sm:text-[2.2rem] text-ink leading-[1.45]">
              Where are you, right now?
            </h2>
            <p className="mt-5 font-mincho text-[13.5px] sm:text-sm text-sub-gray max-w-[30rem] leading-[2]">
              Start from a feeling, not a symptom. Choose the closest one, and we
              read what lies beneath it together.
            </p>
          </div>

          <ul className="border-t border-hair-line">
            {feelings.map((f) => (
              <li key={f.slug} className="border-b border-hair-line">
                <Link
                  href={`/en/feelings/${f.slug}`}
                  className="group flex items-center gap-4 sm:gap-6 py-5 sm:py-6 hover:px-2 transition-all"
                >
                  <span
                    aria-hidden
                    className="shrink-0 w-5 h-5 border border-sub-gray/50 group-hover:border-gold group-hover:bg-gold/10 transition-colors"
                  />
                  <span className="flex-1 font-mincho text-[1.05rem] sm:text-[1.3rem] text-ink leading-[1.5] group-hover:text-gold transition-colors">
                    {f.en.statement}
                  </span>
                  <span
                    aria-hidden
                    className="text-sub-gray group-hover:text-gold group-hover:translate-x-1 transition-all text-lg shrink-0"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What this is — three things */}
      <section className="mx-auto max-w-[1100px] px-6 sm:px-10 py-20 sm:py-32">
        <div className="mb-12">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
            What this is
          </p>
          <p className="mt-5 font-mincho text-[14px] sm:text-[15px] text-sub-gray leading-[2] max-w-[34rem]">
            Not much is on offer. What you probably need right now is just these.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <div className="bg-paper border border-hair-line p-6 sm:p-7">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="font-mincho text-lg text-ink">Recovery Check</h3>
              <span className="logo-type italic text-[11px] tracking-[0.2em] uppercase text-gold">
                Free
              </span>
            </div>
            <p className="mt-3 font-mincho text-[13px] text-sub-gray leading-[2]">
              Understand where you are now. A 30-question self-observation; an
              editor replies by letter. (Currently in Japanese.)
            </p>
          </div>
          <Link
            href="/en/stories"
            className="group bg-paper border border-hair-line p-6 sm:p-7 hover:border-gold transition-colors"
          >
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="font-mincho text-lg text-ink group-hover:text-gold transition-colors">
                Recovery Stories
              </h3>
              <span className="logo-type italic text-[11px] tracking-[0.2em] uppercase text-gold">
                Free
              </span>
            </div>
            <p className="mt-3 font-mincho text-[13px] text-sub-gray leading-[2]">
              Read the records of men who carried the same thing. Anonymous is
              fine.
            </p>
          </Link>
          <a
            href={site.social.substack}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-paper border border-hair-line p-6 sm:p-7 hover:border-gold transition-colors"
          >
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="font-mincho text-lg text-ink group-hover:text-gold transition-colors">
                Recoveries Letter
              </h3>
              <span className="logo-type italic text-[11px] tracking-[0.2em] uppercase text-gold">
                ¥500 / mo
              </span>
            </div>
            <p className="mt-3 font-mincho text-[13px] text-sub-gray leading-[2]">
              A letter every Sunday, about the male body and self-consciousness —
              in a place without advertising.
            </p>
          </a>
        </div>
      </section>

      {/* Close */}
      <section className="relative bg-navy">
        <div className="absolute inset-0">
          <Image
            src="/room-morning.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center opacity-80"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/85"
        />
        <div className="relative mx-auto max-w-[1000px] px-6 sm:px-10 py-20 sm:py-36 text-center text-cream">
          <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold-bright drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
            The English edition
          </p>
          <p className="mt-7 sm:mt-10 font-mincho text-[1.5rem] sm:text-[2.2rem] leading-[1.55] max-w-[34rem] mx-auto drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)]">
            The condition is not Japanese. It is human.
          </p>
          <p className="mt-6 font-mincho text-[14.5px] text-cream/85 leading-[2.05] max-w-[30rem] mx-auto">
            His Recoveries is written in Japanese today. An English edition is
            coming. If you would like to be there when it does, follow along.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <a
              href={site.social.substack}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold justify-center"
            >
              Follow on Substack <span aria-hidden>→</span>
            </a>
            <Link
              href="/"
              className="text-sm tracking-[0.12em] text-cream border border-cream/40 hover:border-gold-bright hover:text-gold-bright transition-colors px-6 py-3.5 text-center"
            >
              日本語のサイトを見る
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
