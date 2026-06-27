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
    <div className="bg-[#FAF6F0] text-zinc-900">
      <div className="mx-auto max-w-[820px] px-6 sm:px-10 pt-16 sm:pt-24 pb-24 text-center">
        <p className="text-[12px] font-bold tracking-[0.1em] uppercase text-zinc-400">
          編集方針
        </p>

        <h1 className="mt-5 text-[2.1rem] sm:text-[3.2rem] font-extrabold text-zinc-900 leading-[1.3] tracking-[-0.01em]">
          売らないから、
          <br />
          ほんとうのことが書ける。
        </h1>

        <p className="mt-6 text-[14.5px] sm:text-base text-zinc-500 leading-[2] max-w-[34rem] mx-auto">
          商品も施術も売らず、紹介手数料も受け取らない。
          だからこのメディアは、悩みの仕組みをそのまま書けます。
          わたしたちが大切にしている 7 つの原則です。
        </p>

        <ol className="mt-14 space-y-4 text-left max-w-[640px] mx-auto">
          {principles.map((p, i) => (
            <li
              key={i}
              className="flex items-start gap-4 rounded-2xl bg-white p-5 sm:p-6 shadow-sm"
            >
              <span className="shrink-0 grid place-items-center w-8 h-8 rounded-full bg-zinc-900 text-white text-[13px] font-bold tabular-nums">
                {i + 1}
              </span>
              <div>
                <p className="text-[1.05rem] sm:text-[1.2rem] font-bold leading-[1.55] text-zinc-900">
                  {p.ja}
                </p>
                <p className="mt-2 text-[12.5px] italic tracking-[0.04em] text-zinc-400 leading-[1.7]">
                  {p.en}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 rounded-3xl bg-zinc-900 text-white px-8 py-14">
          <p className="text-[1.4rem] sm:text-[1.8rem] font-extrabold leading-[1.5]">
            これが、{site.name} の約束です。
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/territories"
              className="inline-flex items-center gap-2 rounded-full bg-white text-zinc-900 text-[14px] font-bold px-6 py-3.5 hover:bg-zinc-200 transition-colors"
            >
              悩みから読む <span aria-hidden>→</span>
            </Link>
            <Link
              href="/recoveries"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-600 text-white text-[14px] font-bold px-6 py-3.5 hover:border-zinc-400 transition-colors"
            >
              インタビューを読む <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
