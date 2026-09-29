import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { NAME, TAGLINE } from "@/lib/voice";
import { PLANS, plan as getPlan, DEFAULT_PLAN } from "@/lib/ask/plans";
import { canCharge } from "@/lib/legal";
import Tashikame from "@/components/brand/Tashikame";
import PlanCta from "@/components/brand/PlanCta";
import Reveal from "@/components/brand/Reveal";
import Yen from "@/components/brand/Yen";

// 料金。
//
// ══════════════════════════════════════════════════
// トップから外した理由
// ══════════════════════════════════════════════════
// 5つ全部を並べると、それだけでスマホ4画面ぶんになる。
// そのうち買えるのは1つで、残りは受付前。
// トップで先に見せると「高い／買えない」が最初の印象になる。
//
// トップは「何のサービスか」と「何が返ってくるか」まで。
// 値段を知りたくなった人だけ、ここへ来る。
//
// ══════════════════════════════════════════════════
// 値段より先に、何をするものかを出す
// ══════════════════════════════════════════════════
// 金額だけ並べると、人数で比べられる。
// 差は人数ではなく「本番にどれだけ近いか」なので、
// 段（見てもらう → 反応を見る → 会話を試す → …）を先に出す。
//
// ══════════════════════════════════════════════════
// 買えないものを、買えるように見せない
// ══════════════════════════════════════════════════
// available が false のものは、押しても課金画面に行かない。
// 順番待ちへ渡す。ここを曖昧にすると、届けられない約束を売る。

export const metadata: Metadata = {
  // 記事側のテンプレート（%s — His Recoveries）を使わない。
  title: { absolute: `プラン一覧 — ${NAME}` },
  description:
    "必要なところだけ、1回ごと。月額はありません。値段が上がるのは人数が増えるからではなく、本番に近いところまでやるからです。",
  alternates: { canonical: `${site.url}/plans` },
};

/** その商品が、恋愛のどの段に当たるか。金額の差の理由になる */
const LADDER_WHY: Record<string, string> = {
  review: "見てもらう",
  reaction: "反応を見る",
  mockchat: "会話を試す",
  session: "一人について決める",
  mockdate: "本番を再現する",
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

        <ul className="mt-9 flex flex-col gap-3.5">
          {PLANS.map((p, i) => (
            <li key={p.id}>
              <Reveal delay={i * 60}>
                <div
                  className={`flex h-full flex-col rounded-card border bg-paper p-5 shadow-card sm:p-6 ${
                    p.featured ? "border-2 border-brand" : "border-line"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold tabular-nums text-steel">
                      {LADDER_WHY[p.id]}
                    </span>
                    {p.available ? (
                      <span className="rounded-pill bg-brand-tint px-2.5 py-1 text-[10.5px] font-bold text-brand-deep">
                        いま受付中
                      </span>
                    ) : (
                      <span className="rounded-pill bg-mist px-2.5 py-1 text-[10.5px] font-bold text-steel">
                        受付前
                      </span>
                    )}
                  </div>

                  {/* 値段より先に、何をするものかを出す */}
                  <p className="mt-2 text-[18px] font-black leading-[1.5] text-slate sm:text-[20px]">
                    {p.tagline}
                  </p>
                  <p className="mt-2.5 text-[13.5px] leading-[1.8] text-steel">{p.value}</p>

                  <ul className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4">
                    {p.includes.map((x) => (
                      <li key={x} className="flex items-start gap-2 text-[12.5px] leading-[1.7]">
                        <span
                          aria-hidden
                          className="mt-[3px] shrink-0 text-[11px] font-black text-brand"
                        >
                          ✓
                        </span>
                        <span className="min-w-0 text-steel">{x}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <p className="text-[15px] font-black text-slate">
                      {p.name}
                      <span className="ml-2.5 text-[22px]">
                        <Yen yen={p.yen} from={p.from} />
                      </span>
                    </p>
                    {p.available ? (
                      <PlanCta
                        plan={p.id}
                        from="plans"
                        className="min-h-[48px] shrink-0 rounded-pill bg-brand px-6 text-[14.5px] !text-paper shadow-card"
                      >
                        この内容で確かめる <span aria-hidden className="ml-1.5">&rarr;</span>
                      </PlanCta>
                    ) : (
                      <Link
                        href="/talk"
                        className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-pill border border-line bg-paper px-6 text-[14px] font-bold text-steel"
                      >
                        順番待ちに入る <span aria-hidden className="ml-1.5">&rarr;</span>
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

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
