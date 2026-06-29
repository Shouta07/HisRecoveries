"use client";

import Link from "next/link";
import TrackedCTA from "./TrackedCTA";
import { site } from "@/lib/site";

type Props = {
  articleSlug: string;
  /** the cause-analysis territory this article belongs to, if any */
  territory?: { slug: string; label: string } | null;
};

/**
 * End-of-article conversion block. One funnel only:
 * Recovery Check (free — the data engine) with a contextual link to the
 * relevant cause analysis, then the Recoveries Letter (Substack).
 */
export default function ArticleConversion({ articleSlug, territory }: Props) {
  return (
    <section className="mt-20 border-t border-hair-line pt-12">
      {/* Primary — Recovery Check */}
      <div className="bg-paper border border-hair-line p-6 sm:p-8">
        <p className="logo-type italic text-[10px] tracking-[0.4em] uppercase text-gold">
          Recovery Check · 無料
        </p>
        <h2 className="mt-3 font-mincho text-xl sm:text-2xl font-medium leading-[1.5] text-ink">
          自分の状態を、言葉にしてみませんか。
        </h2>
        <p className="mt-4 text-sm leading-[1.95] text-ink/80 max-w-[34rem]">
          30 問の自己観察に静かに答えると、編集者が読んで、24 時間以内に
          「あなたの状態の地形図」を手紙で返します。診断ではなく、自分の言葉を
          もう一度自分に渡すための時間です。完全無料です。
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <TrackedCTA
            href="/check"
            event="article_cta_click"
            eventProps={{ target: "check", from_article: articleSlug }}
            className="btn-gold !py-3 !px-6 text-xs"
          >
            Recovery Check を始める
            <span aria-hidden>→</span>
          </TrackedCTA>
          {territory && (
            <Link
              href="/#complexes"
              className="text-sm text-ink border-b border-gold/60 pb-1 hover:text-gold transition-colors"
            >
              {territory.label}は、なぜ起こるのか →
            </Link>
          )}
        </div>
      </div>

      {/* Secondary — Recoveries Letter (Substack) */}
      <p className="mt-12 text-[10px] tracking-[0.3em] text-sub-gray uppercase mb-4">
        Recoveries Letter
      </p>
      <p className="font-mincho text-[0.9375rem] leading-[2] text-ink max-w-[30rem]">
        毎週日曜日、男性の身体と自意識についての手紙を、広告のない場所でお送りしています。
        読まない日曜日は、読まないでください。
      </p>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
        <TrackedCTA
          href={`${site.social.substack}/subscribe`}
          event="membership_subscribe_click"
          eventProps={{ location: "article_end", from_article: articleSlug }}
          className="border-b border-gold/60 pb-0.5 text-ink hover:text-gold transition-colors"
        >
          日曜日の手紙を受け取る
        </TrackedCTA>
        <Link
          href="/areas"
          className="border-b border-hair-line hover:border-ink transition-colors"
        >
          仕組みを知る
        </Link>
      </div>
    </section>
  );
}
