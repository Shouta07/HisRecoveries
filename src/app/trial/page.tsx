import type { Metadata } from "next";
import Link from "next/link";
import { NAME } from "@/lib/voice";
import { site } from "@/lib/site";
import { advisorWord, notYetNote } from "@/lib/who";
import { readyToSell } from "@/lib/ready";
import { Eyebrow } from "@/components/brand/kit";
import TrialForm from "@/components/trial/TrialForm";
import Yen from "@/components/brand/Yen";
import {
  trialOpen, TRIAL_H1, TRIAL_LEAD, TRIAL_MONEY, TRIAL_WHEN, TRIAL_FALLBACK,
  TRIAL_INCLUDES, TRIAL_NEXT, TOPIC_MAX,
} from "@/lib/trial";

// 体験のお申し込み。
//
// ══════════════════════════════════════════════════
// 何のための面か
// ══════════════════════════════════════════════════
// 決済の口が開くまで、相談する人の道は /ask で止まる。
// その手前に置く、いま実際に届けられるものの入口。
//
// 広告から最初に来る面になるので、
//   何が返ってくるか
//   お金がかかるか
//   いつ返ってくるか
// の3つを、スクロールせずに読み終われる位置に置く。
//
// ══════════════════════════════════════════════════
// 設定は実行時に読む
// ══════════════════════════════════════════════════
// 決済が開いたかどうかで、下の案内が変わる。
// ビルド時に固定すると、鍵を入れても画面が変わらない。

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // 記事側のテンプレート（%s — His Recoveries）を使わない。
  // プロダクトの名乗りはタシカメなので、ここで完結させる。
  title: { absolute: "体験してみる — タシカメ" },
  description:
    `送ろうとしている文や、迷っている場面を1つ。実在する${advisorWord()}が読んで、` +
    `どう受け取ったかをそのまま返します。${TRIAL_MONEY}`,
  alternates: { canonical: `${site.url}/trial` },
};

export default function TrialPage() {
  const note = notYetNote();
  // 決済が開いているときだけ、続ける方法を金額付きで出す。
  // 開いていないのに金額を出すと、押せないものの値段を見せることになる。
  const canBuyNext = readyToSell();

  if (!trialOpen) {
    return (
      <div data-brand className="min-h-screen bg-paper text-slate">
        <div className="mx-auto w-full max-w-[34em] px-5 py-16 sm:px-8">
          <h1 className="text-[22px] font-black leading-[1.5]">
            いま、体験のお申し込みを受け付けていません。
          </h1>
          <p className="mt-4 text-[14.5px] leading-[1.9] text-steel">
            受け入れの体制が整い次第、ここから申し込めるようになります。
          </p>
          <Link
            href="/"
            className="mt-8 flex min-h-[48px] items-center justify-center text-[13.5px] font-bold text-steel"
          >
            トップへ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-4 px-5 py-3.5 sm:px-10">
          <Link href="/" className="truncate text-[16px] font-black">
            {NAME}
          </Link>
          <span className="shrink-0 text-[12px] font-bold text-steel">体験</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[720px] px-5 pb-24 pt-10 sm:px-10 sm:pt-14">
        <Eyebrow>はじめての1件</Eyebrow>

        <h1 className="mt-4 text-huge font-black leading-[1.4]">{TRIAL_H1}</h1>

        <p className="mt-6 text-[16px] leading-[1.95] text-steel">{TRIAL_LEAD}</p>

        {/* 何が返ってくるか。売っている入口商品から引く（plans.ts） */}
        <ul className="mt-8 flex flex-col gap-2.5">
          {TRIAL_INCLUDES.map((t) => (
            <li
              key={t}
              className="flex items-start gap-3 rounded-soft bg-mist px-4 py-3.5 text-[14px] leading-[1.8] text-steel"
            >
              <span aria-hidden className="mt-[3px] text-[12px] font-black text-brand">
                ✓
              </span>
              <span className="min-w-0">{t}</span>
            </li>
          ))}
        </ul>

        {/* お金といつ。見出しではなくここで言う */}
        <div className="mt-8 rounded-card border border-line bg-paper p-5 shadow-card sm:p-6">
          <p className="text-[14.5px] font-bold leading-[1.85]">{TRIAL_MONEY}</p>
          <p className="mt-2.5 text-[13.5px] leading-[1.9] text-steel">{TRIAL_WHEN}</p>
        </div>

        {/* 回答者が揃っていない向きがあるなら、申し込む前に書く */}
        {note && (
          <p className="mt-5 rounded-soft border border-line bg-mist px-5 py-4 text-[13px] leading-[1.9] text-steel">
            {note}
            <br />
            そちらの向きの方も、このまま申し込んでいただけます。順番待ちでお預かりします。
          </p>
        )}

        <div className="mt-10">
          <TrialForm
            to={site.company.email}
            topicMax={TOPIC_MAX}
            fallbackNote={TRIAL_FALLBACK}
          />
        </div>

        {/* 体験のあと。決済が開いているときだけ金額を出す */}
        <div className="mt-14 border-t border-line pt-8">
          <p className="text-[12.5px] font-bold text-steel">体験のあと</p>
          {canBuyNext ? (
            <>
              <p className="mt-2.5 text-[15px] leading-[1.9]">
                同じ形で続けるなら
                <span className="mx-1.5 font-black">
                  {TRIAL_NEXT.name} <Yen yen={TRIAL_NEXT.yen} from={TRIAL_NEXT.from} />
                </span>
                です。
              </p>
              <p className="mt-2 text-[13px] leading-[1.9] text-steel">
                体験したあとに決めていただけます。続けないという選択で、何も起きません。
              </p>
              <Link
                href="/plans"
                className="mt-4 inline-flex text-[13.5px] font-bold text-brand underline decoration-line underline-offset-4"
              >
                ほかの続け方を見る
              </Link>
            </>
          ) : (
            <p className="mt-2.5 text-[14px] leading-[1.9] text-steel">
              続ける方法は、お返事のときにご案内します。
              いまこの画面からお支払いの手続きはできません。
            </p>
          )}
        </div>

        <p className="mt-10 text-[13px] leading-[1.9] text-steel">
          誰が読むのか、AIを何に使っているかは{" "}
          <Link
            href="/"
            className="font-bold text-brand underline decoration-line underline-offset-4"
          >
            トップ
          </Link>
          {" "}と{" "}
          <Link
            href="/disclosure"
            className="font-bold text-brand underline decoration-line underline-offset-4"
          >
            できないこと
          </Link>{" "}
          に書いています。
        </p>
      </div>
    </div>
  );
}
