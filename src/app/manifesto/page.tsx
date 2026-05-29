import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "The Recovery Manifesto — 男性の回復について",
  description:
    "His Recoveries の宣言。男性は強くなるのではなく、整うのだ。Male Conditioning ブランドが信じる 7 つの原則。",
  alternates: { canonical: `${site.url}/manifesto` },
  openGraph: {
    title: `The Recovery Manifesto — ${site.name}`,
    description: "男性は、強くなるのではなく、整うのだ。",
  },
};

const principles = [
  {
    en: "We do not cure. We arrange.",
    ja: "治すのではなく、整える。",
  },
  {
    en: "We do not promise strength. We restore presence.",
    ja: "強さではなく、プレゼンスを取り戻す。",
  },
  {
    en: "We observe. We do not prescribe.",
    ja: "観察し、処方はしない。",
  },
  {
    en: "We write from a half-step ahead. Not from above.",
    ja: "半歩先から書く。教壇からではなく。",
  },
  {
    en: "We speak in a low voice. We do not shout.",
    ja: "低い声で語る。叫ばない。",
  },
  {
    en: "We respect the silence of those still in it.",
    ja: "まだその中にいる人の沈黙を、尊重する。",
  },
  {
    en: "We are not for everyone. We are for the right few.",
    ja: "万人ではなく、必要な少数のために存在する。",
  },
];

export default function ManifestoPage() {
  return (
    <div className="mx-auto max-w-[900px] px-6 sm:px-10 pt-20 sm:pt-32 pb-32 text-center">
      <p className="logo-type italic text-[11px] sm:text-xs tracking-[0.4em] uppercase text-gold">
        The Recovery Manifesto
      </p>

      <h1 className="mt-10 font-mincho text-[2.25rem] sm:text-5xl lg:text-[3.5rem] text-ink leading-[1.4] tracking-[0.04em]">
        男性は、
        <br />
        強くなるのではなく、
        <br />
        整うのだ。
      </h1>

      <p className="mt-10 font-mincho italic text-[13px] sm:text-sm tracking-[0.15em] text-sub-gray leading-[1.95]">
        Men are not meant to become stronger.
        <br />
        They are meant to become more aligned.
      </p>

      <div className="mt-16 flex justify-center">
        <span aria-hidden className="block w-16 h-px bg-gold" />
      </div>

      <ol className="mt-16 sm:mt-20 space-y-12 sm:space-y-14 text-left max-w-[640px] mx-auto">
        {principles.map((p, i) => (
          <li
            key={i}
            className="grid grid-cols-[3.5rem_1fr] sm:grid-cols-[4.5rem_1fr] gap-5 sm:gap-7"
          >
            <span className="logo-type italic text-[13px] sm:text-sm tracking-[0.2em] text-gold pt-2">
              {romanize(i + 1)}.
            </span>
            <div>
              <p className="font-mincho text-xl sm:text-2xl lg:text-[1.625rem] font-medium leading-[1.55] text-ink">
                {p.ja}
              </p>
              <p className="mt-3 font-mincho italic text-[12px] sm:text-[13px] tracking-[0.1em] text-sub-gray leading-[1.85]">
                {p.en}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-24 sm:mt-32 pt-16 border-t border-hair-line/60">
        <p className="logo-type italic tracking-[0.3em] text-sm sm:text-base text-gold">
          Recover Your Presence —
        </p>
        <p className="mt-6 font-mincho text-xl sm:text-2xl text-ink leading-[1.7]">
          これが、His Recoveries の約束です。
        </p>

        <div className="mt-12 flex items-center justify-center gap-4">
          <span aria-hidden className="block w-12 h-px bg-gold" />
          <span className="logo-type tracking-[0.2em] text-sm text-ink">
            {site.name}
          </span>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[12px] tracking-[0.06em] text-sub-gray">
          <Link
            href="/founder"
            className="hover:text-ink transition-colors border-b border-hair-line hover:border-gold pb-0.5"
          >
            Founder&apos;s Note を読む
          </Link>
          <span aria-hidden className="text-hair-line">
            ·
          </span>
          <Link
            href="/about"
            className="hover:text-ink transition-colors border-b border-hair-line hover:border-gold pb-0.5"
          >
            About
          </Link>
          <span aria-hidden className="text-hair-line">
            ·
          </span>
          <Link
            href="/assessment"
            className="hover:text-ink transition-colors border-b border-hair-line hover:border-gold pb-0.5"
          >
            回復を始める
          </Link>
        </div>
      </div>
    </div>
  );
}

function romanize(n: number): string {
  return ["I", "II", "III", "IV", "V", "VI", "VII"][n - 1] ?? `${n}`;
}
