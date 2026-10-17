import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { NAME, FULL } from "@/lib/voice";
import {
  TRIP_PASS_YEN, YEAR_PASS_YEN, YEAR_BREAK_EVEN, PASS_TAIL_DAYS,
  FREE_TRIPS, FREE_RECORDS, INCLUDED,
} from "@/lib/pass/trip";
import { passEnabled } from "@/lib/stripe";
import { notYetNote } from "@/lib/who";
import Mark from "@/components/brand/Mark";

/* 料金。
 *
 * ── 単発を全部消した ────────────────────────────
 * マチアプ版は、文章で確カメる・声で確カメる・5回パスなど
 * 商品が7つ並んでいた。旅版は2つだけ。
 *
 *   旅パス  旅1回ごと
 *   年パス  年4回以上行く人だけ
 *
 * 並べる数を増やすと、どれを買えばいいか分からなくなる。
 * 初めて一人で行く人に、商品を選ばせる画面を見せない。
 *
 * ── 値段はここで直書きしない ────────────────────
 * lib/pass/trip.ts が1か所で持つ。判定が採算を見ている。 */

export const metadata: Metadata = {
  title: { absolute: `料金 — ${FULL}` },
  description: `旅パスは1つの旅ごとに ¥${TRIP_PASS_YEN.toLocaleString()}（税込）。帰国＋${PASS_TAIL_DAYS}日まで。自動では続きません。${FREE_TRIPS}旅・${FREE_RECORDS}記録までは無料です。`,
  alternates: { canonical: `${site.url}/plans` },
};

export default function PlansPage() {
  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-[640px] items-center gap-2.5 px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Mark size={32} />
            <span className="text-[17px] font-black text-slate">{NAME}</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[640px] px-5 pb-20 pt-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-huge font-black text-slate">料金</h1>
          {!passEnabled && (
            <span className="rounded-pill bg-mist px-2.5 py-1 text-[10.5px] font-bold text-steel">
              受付前
            </span>
          )}
        </div>

        <div className="mt-7 rounded-card border-2 border-brand bg-paper p-5 shadow-card sm:p-6">
          <p className="text-[13px] font-black text-steel">旅パス｜1つの旅</p>
          <p className="mt-1 text-[32px] font-black leading-none tabular-nums text-slate">
            ¥{TRIP_PASS_YEN.toLocaleString()}
          </p>
          <p className="mt-2 text-[12.5px] leading-[1.8] text-steel">
            出発日を入れた時点で買えます。帰国＋{PASS_TAIL_DAYS}日まで。自動では続きません。
          </p>
          <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
            {INCLUDED.map((x) => (
              <li key={x} className="flex items-start gap-2.5 text-[14px] leading-[1.75]">
                <span aria-hidden className="mt-[4px] shrink-0 text-[11px] font-black text-brand">
                  ✓
                </span>
                <span className="min-w-0 text-slate">{x}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 rounded-soft border border-line bg-paper px-4 py-3.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-[13px] font-black text-slate">年パス</p>
            <p className="text-[15px] font-black tabular-nums text-slate">
              ¥{YEAR_PASS_YEN.toLocaleString()}
            </p>
          </div>
          <p className="mt-1.5 text-[12.5px] leading-[1.8] text-steel">
            旅が年{YEAR_BREAK_EVEN}回以上なら、こちらが安くなります。
            {YEAR_BREAK_EVEN - 1}回までは旅パスのほうが安いです。
          </p>
        </div>

        <div className="mt-5 rounded-soft bg-mist px-4 py-3.5">
          <p className="text-[13px] font-black text-slate">無料でできること</p>
          <p className="mt-1.5 text-[12.5px] leading-[1.8] text-steel">
            {FREE_TRIPS}旅・{FREE_RECORDS}記録まで。登録もお支払いもありません。
          </p>
        </div>

        {/* ── 解約とキャンセル ──────────────────────
            旅パスは1回ごとなので、止める操作がそもそも無い。
            そこを先に書く。「解約できますか」を探させない。 */}
        <section className="mt-9">
          <h2 className="text-[15px] font-black text-slate">解約・キャンセル・返金</h2>
          <ul className="mt-3 flex flex-col gap-2 text-[13.5px] leading-[1.9] text-steel">
            <li>旅パスは1回ごとのお支払いです。自動では続かないので、解約の操作はありません。</li>
            <li>年パスは会員ページから、こちらに連絡せずに止められます。</li>
            <li>
              お支払い後、まだ1件も記録していない場合は、全額お返しします。
              <Link
                href="/legal"
                className="ml-1 font-bold text-brand underline decoration-line underline-offset-4"
              >
                特定商取引法に基づく表記
              </Link>
            </li>
          </ul>
          <p className="mt-4 text-[12px] leading-[1.85] text-steel">税込。</p>
          {notYetNote() && (
            <p className="mt-2 text-[12px] leading-[1.85] text-steel">{notYetNote()}</p>
          )}
        </section>

        <Link
          href="/"
          className="mt-9 inline-flex min-h-[50px] items-center justify-center rounded-pill bg-brand px-6 text-[14.5px] font-bold text-paper shadow-card"
        >
          無料で始める <span aria-hidden className="ml-1.5">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
