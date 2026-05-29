import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recovery Stories — 回復の記録",
  description:
    "Recovery Stories。髪、肌、汗、匂い、自信。人に言いづらい男性のコンプレックスと向き合った当事者の回復体験を記録するアーカイブ。",
  alternates: { canonical: `${site.url}/stories` },
  openGraph: {
    title: `Recovery Stories — ${site.name}`,
    description: "回復の記録は、誰かの希望になる。",
  },
};

export default function StoriesPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-6 sm:px-10 pt-16 sm:pt-24 pb-24">
      <header className="text-center mb-16 sm:mb-20">
        <p className="logo-type italic text-[11px] sm:text-xs tracking-[0.4em] uppercase text-gold">
          Recovery Stories
        </p>
        <h1 className="mt-6 font-mincho text-3xl sm:text-5xl lg:text-6xl text-ink leading-[1.35]">
          回復の記録は、
          <br />
          誰かの希望になる。
        </h1>
        <p className="mt-10 font-mincho text-[15px] sm:text-base text-ink/80 leading-[2.05] max-w-[34rem] mx-auto">
          髪、肌、汗、匂い、自信。
          <br />
          人に言いづらい悩みと向き合った男性たちの
          <br />
          回復体験を記録していきます。
        </p>
        <div className="mt-12">
          <Link
            href="/submit-story"
            className="inline-flex items-center gap-3 text-sm tracking-[0.12em] text-ink border border-gold/60 hover:border-gold-bright hover:text-gold-bright transition-colors px-8 py-4"
          >
            あなたの回復体験を共有する
            <span aria-hidden>→</span>
          </Link>
        </div>
      </header>

      <section className="bg-paper border border-hair-line p-8 sm:p-12 text-center">
        <p className="logo-type italic text-[10px] tracking-[0.4em] uppercase text-gold mb-5">
          The Archive
        </p>
        <p className="font-mincho text-lg sm:text-xl text-ink leading-[1.85]">
          まだ公開されている記録はありません。
        </p>
        <p className="mt-5 font-mincho text-[14px] sm:text-[15px] text-sub-gray leading-[2.05] max-w-[28rem] mx-auto">
          最初の一通を、お待ちしています。
          匿名でも構いません。
          あなたの記録が、次に悩む誰かの助けになります。
        </p>
      </section>

      <div className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[12px] tracking-[0.06em] text-sub-gray">
        <Link
          href="/assessment"
          className="hover:text-ink transition-colors border-b border-hair-line hover:border-gold pb-0.5"
        >
          Recovery Assessment を受ける
        </Link>
        <span aria-hidden className="text-hair-line">
          ·
        </span>
        <Link
          href="/articles"
          className="hover:text-ink transition-colors border-b border-hair-line hover:border-gold pb-0.5"
        >
          Presence Journal を読む
        </Link>
      </div>
    </div>
  );
}
