import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { plan as getPlan, ENTRY_PLAN } from "@/lib/ask/plans";
import TalkWaitlist from "@/components/ask/TalkWaitlist";
import PlanCta from "@/components/brand/PlanCta";

// 人と話す。まだ受け付けていない。
//
// ── 買えないものを、買えるように見せない ──────────
// ボタンは「順番待ちに入る」。金額は目安として出す。
// 押した人が課金画面に行かないことが、押す前に分かるようにする。
//
// ── 使えるものを、先に出す ────────────────────────
// 「うまく書けない」の解き方は、いまも用意してある。
// 受付前のものだけ見せて帰す画面にしない。

export const metadata: Metadata = {
  title: "人と話す — His Recoveries",
  description:
    "まだ、うまく言葉になってなくてもいい。実在する女性と話しながら、何に迷っているのかを見つける。いまは順番待ちのみ受け付けています。",
  alternates: { canonical: `${site.url}/talk` },
};

export default function TalkPage() {
  const talk = getPlan("talk");

  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-[860px] items-center justify-between gap-4 px-5 py-3.5 sm:px-10">
          <Link href="/" className="truncate text-[15px] font-black">
            His Recoveries
          </Link>
          <PlanCta
            plan={ENTRY_PLAN}
            from="talk_page"
            className="min-h-[42px] rounded-pill bg-brand px-5 text-[13.5px] !text-paper shadow-card"
          >
            今すぐ聞く
          </PlanCta>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[720px] px-5 pb-24 pt-12 sm:px-10">
        <span className="inline-flex rounded-pill bg-mist px-3 py-1.5 text-[11.5px] font-bold text-steel">
          受付前
        </span>

        <h1 className="mt-5 text-huge font-black">
          まだ、うまく言葉に
          <br />
          なってなくてもいい。
        </h1>

        <p className="mt-6 text-[16px] leading-[1.95] text-steel">
          実在する女性と話しながら、状況をそのまま話して、相手側から聞かれて、
          自分が何に迷っているのかを見つける。そういう使い方です。
        </p>

        <ul className="mt-8 flex flex-col gap-2.5">
          {[
            "状況をそのまま話す",
            "相手側から質問してもらう",
            "もやもやを整理する",
            "自分が何に迷っているかを見つける",
          ].map((t) => (
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

        <div className="mt-10 rounded-card border border-line bg-paper p-6 shadow-card">
          <p className="text-[12.5px] font-bold text-steel">開いたときの目安</p>
          <p className="mt-2 text-[30px] font-black tabular-nums leading-none">
            ¥{talk.yen.toLocaleString()}
            <span className="ml-1 text-[16px] text-steel">〜 / 20分〜</span>
          </p>

          <p className="mt-6 text-[14px] leading-[1.9] text-steel">
            まだ受け付けていません。相手も実在の人なので、時間の決め方と、
            その場を見る体制が用意できてから開きます。
            先に売って、あとから体制を整えることはしません。
          </p>

          <TalkWaitlist />
        </div>

        {/* 受付前のものだけ見せて帰さない */}
        <div className="mt-12 rounded-card border border-brand bg-paper p-6 shadow-card">
          <p className="text-[12.5px] font-bold text-brand">いま使えること</p>
          <p className="mt-2.5 text-[17px] font-black">一緒に、質問をつくる。</p>
          <p className="mt-3 text-[14px] leading-[1.9] text-steel">
            うまく書けないときは、質問の画面で「一緒に整理する」が使えます。
            3つ聞いて、こちらで質問を組み立てます。できた文は入力欄に入るだけなので、直せます。
          </p>
          <PlanCta
            plan={ENTRY_PLAN}
            from="talk_page_assist"
            className="mt-5 min-h-[52px] w-full rounded-pill bg-brand px-6 text-[15px] !text-paper shadow-card"
          >
            質問をつくる <span aria-hidden className="ml-1.5">→</span>
          </PlanCta>
        </div>

        <p className="mt-10 text-[13px] leading-[1.9] text-steel">
          どういう仕組みで動いているかは{" "}
          <Link
            href="/how"
            className="font-bold text-brand underline decoration-line underline-offset-4"
          >
            仕組み
          </Link>{" "}
          に書いています。
        </p>
      </div>
    </div>
  );
}
