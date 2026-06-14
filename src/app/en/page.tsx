import type { Metadata } from "next";
import Link from "next/link";
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

const THREE = [
  {
    name: "Recovery Check",
    price: "Free",
    body: "A 30-question self-observation. An editor reads it and returns a private letter — a map of where you are. Not a diagnosis; a way to hand your own words back to yourself.",
  },
  {
    name: "Recovery Stories",
    price: "Free",
    body: "The records of men who carried the same thing. Anonymous is fine. One story becomes the help for whoever worries next.",
  },
  {
    name: "Recoveries Letter",
    price: "¥500 / mo",
    body: "A letter every Sunday, about the male body and self-consciousness — in a place without advertising.",
  },
];

export default function EnglishLandingPage() {
  return (
    <div lang="en" className="mx-auto max-w-reading px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
      {/* Header */}
      <header className="mb-16 sm:mb-20">
        <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
          {site.tagline}
        </p>
        <h1 className="mt-5 logo-type text-[2.6rem] sm:text-6xl text-ink leading-[1.05]">
          {site.name}
        </h1>
        <p className="mt-6 font-mincho text-[1.3rem] sm:text-[1.7rem] text-ink leading-[1.5] tracking-[0.02em]">
          {site.promise}
        </p>
      </header>

      {/* Thesis */}
      <section className="mb-16 sm:mb-20 space-y-7">
        <p className="font-mincho text-[1.05rem] sm:text-[1.2rem] text-ink leading-[1.9]">
          Men carry worries they cannot say out loud — and they search for them
          alone. Sweat and odor. Acne and the scars it leaves. A receding
          hairline. The impression they make in a photograph, a meeting, a mirror.
        </p>
        <p className="font-mincho text-[1.05rem] sm:text-[1.2rem] text-ink/85 leading-[1.9]">
          His Recoveries is not the end of that search. It wants to be the place
          that comes after it — where the silence becomes understanding, not shame.
          The thing underneath is rarely the symptom. It is the feeling of being
          seen.
        </p>
        <p className="font-mincho text-[15px] text-sub-gray leading-[2.05]">
          We sell no solutions, push no one, and stage no urgency. We study why
          these things happen, and we keep the records of those half a step ahead.
        </p>
      </section>

      {/* The three things */}
      <section className="mb-16 sm:mb-20">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-8">
          What this is
        </p>
        <div className="space-y-px">
          {THREE.map((t) => (
            <div
              key={t.name}
              className="border-t border-hair-line py-6 grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-2 sm:gap-8"
            >
              <div>
                <h2 className="font-mincho text-lg text-ink leading-[1.4]">
                  {t.name}
                </h2>
                <p className="mt-1 logo-type italic text-[11px] tracking-[0.2em] uppercase text-gold">
                  {t.price}
                </p>
              </div>
              <p className="font-mincho text-[14px] text-ink/80 leading-[2]">
                {t.body}
              </p>
            </div>
          ))}
          <div className="border-t border-hair-line" />
        </div>
      </section>

      {/* English-edition note + CTA */}
      <section className="border border-hair-line bg-paper p-6 sm:p-8">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
          The English edition
        </p>
        <p className="font-mincho text-[15px] text-ink/85 leading-[2.05]">
          His Recoveries is written in Japanese today. The condition it describes,
          though, is not Japanese — it is human. An English edition is coming. If
          you would like to be there when it does, follow along.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <a
            href={site.social.substack}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold justify-center"
          >
            Follow on Substack <span aria-hidden>→</span>
          </a>
          <a
            href={`mailto:${site.email}`}
            className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold transition-colors px-6 py-3.5 text-center"
          >
            Write to the editor
          </a>
        </div>
      </section>

      <div className="mt-12 text-[12px] tracking-[0.06em] text-sub-gray">
        <Link
          href="/"
          className="border-b border-hair-line hover:border-ink transition-colors"
        >
          日本語のサイトを見る →
        </Link>
      </div>
    </div>
  );
}
