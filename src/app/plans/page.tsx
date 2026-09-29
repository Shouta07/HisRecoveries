import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { openPlanIds } from "@/lib/call/gate";
import { NAME, TAGLINE } from "@/lib/voice";
import { plan as getPlan, DEFAULT_PLAN } from "@/lib/ask/plans";
import { canCharge } from "@/lib/legal";
import Tashikame from "@/components/brand/Tashikame";
import PlanCta from "@/components/brand/PlanCta";
import PlanCards from "@/components/brand/PlanCards";

// 料金。
//
// ══════════════════════════════════════════════════
// トップにも同じカードが出る
// ══════════════════════════════════════════════════
// こちらは、値段のことだけを見に来た人のための面。
// キャンセル・返金・特商法の断りは、この面が持つ。
// カードそのものは PlanCards から出すので、
// 片方だけ古い値段が残ることはない。
//
// カードの中身と形は PlanCards が持つ（トップにも同じものが出る）。
// ここが持つのは、その周りの言葉と、法定の断りだけ。

export const metadata: Metadata = {
  // 記事側のテンプレート（%s — His Recoveries）を使わない。
  title: { absolute: `プラン一覧 — ${NAME}` },
  description:
    "必要なところだけ、1回ごと。月額はありません。値段が上がるのは人数が増えるからではなく、本番に近いところまでやるからです。",
  alternates: { canonical: `${site.url}/plans` },
};

export default function PlansPage() {
  const main = getPlan(DEFAULT_PLAN);
  const paid = canCharge();

  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[860px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Tashikame size={40} />
            <span className="min-w-0">
              <span className="block truncate text-[10px] font-bold leading-[1.3] text-steel">
                {TAGLINE}
              </span>
              <span className="block truncate text-[18px] font-black leading-[1.15] text-slate">
                {NAME}
              </span>
            </span>
          </Link>
          <PlanCta
            plan={DEFAULT_PLAN}
            from="plans_header"
            className="min-h-[42px] shrink-0 rounded-pill bg-brand px-5 text-[13.5px] !text-paper shadow-card"
          >
            確かめる
          </PlanCta>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[860px] px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <Link
          href="/"
          className="inline-flex min-h-[40px] items-center text-[13px] font-bold text-steel transition-colors hover:text-brand"
        >
          ← トップにもどる
        </Link>

        <h1 className="mt-4 text-huge font-black leading-[1.3] text-slate">
          必要なところだけ、1回ごと。
        </h1>
        <p className="mt-4 max-w-[34em] text-[15px] leading-[1.85] text-steel">
          月額はありません。値段が上がるのは人数が増えるからではなく、
          本番に近いところまでやるからです。
        </p>

        <div className="mt-9">
          <PlanCards from="plans" all openIds={openPlanIds()} />
        </div>

        {/* 買えない状態を隠さない。買う場所に置く */}
        {!paid && (
          <p className="mt-6 rounded-card border border-line bg-mist px-5 py-4 text-[13px] leading-[1.85] text-slate">
            いまお支払いを受け付けていません。特定商取引法に基づく表記が整い次第、始めます。
          </p>
        )}

        <p className="mt-6 text-[12.5px] leading-[1.85] text-steel">
          税込。いま受け付けているのは「{main.name}」だけです。ほかの4つは、
          その場で会話する・動画を受け取るための手順が用意できてから開きます。
          募集を始める前ならキャンセルできます。人数が集まらなかった場合は、
          集まらなかった分をご返金します。
          <Link
            href="/legal"
            className="ml-1 font-bold text-brand underline decoration-line underline-offset-4"
          >
            特定商取引法に基づく表記
          </Link>
        </p>
      </div>
    </div>
  );
}
