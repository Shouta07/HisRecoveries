import type { Metadata } from "next";
import { NAME } from "@/lib/voice";
import Link from "next/link";
import { site } from "@/lib/site";
import { PLANS, FLOW, ENTRY_PLAN, plan as getPlan } from "@/lib/ask/plans";

// 見出しの人数は、実際に売っている人数から引く。
// 手で「5人」と書くと、商品を組み直した日に古い数字が残る。
const entryAnswers = getPlan(ENTRY_PLAN).answers;
import Mark from "@/components/brand/Mark";
import Tashikame from "@/components/brand/Tashikame";
import PlanCta from "@/components/brand/PlanCta";
import Yen from "@/components/brand/Yen";

// 仕組み。
//
// ── トップから降ろしたものの行き先 ────────────────
// 「誰と誰をつないでいるか」「答えてくれる女性はどう選ばれるか」
// 「AIは何に使っているか」。
// これらはトップに置くと、何のサービスかを理解する前に
// 仕組みの話を読ませることになる。
//
// ただし消さない。人にお金を払ってもらう以上、
// 「誰が、どうやって答えるのか」は、探せば必ず出てくる場所に要る。

export const metadata: Metadata = {
  // 記事側のテンプレート（%s — His Recoveries）を使わない。
  // プロダクトの名乗りはタシカメなので、ここで完結させる。
  title: { absolute: "仕組み — タシカメ" },
  description:
    "誰が答えるのか。どうやって届くのか。AIは何に使っているのか。His Recoveries の裏側をまとめています。",
  alternates: { canonical: `${site.url}/how` },
};

const AI_USES = [
  "書かれた質問を、答えてくれる女性が読みやすい形に整える",
  "個人を特定できる情報を、保存する前に伏せる",
  "条件に合う答えてくれる女性を探す手助けをする",
  "回答の中身が規約に反していないか確かめる",
  "複数の回答に共通していた点を取り出す",
  "直しどころと、直した案を組み立てる",
];

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-9">
      <h2 className="text-big font-black text-slate">{title}</h2>
      <div className="mt-5 flex flex-col gap-4 text-[15px] leading-[1.95] text-steel">
        {children}
      </div>
    </section>
  );
}

export default function HowPage() {
  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-[860px] items-center justify-between gap-4 px-5 py-3.5 sm:px-10">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Mark size={26} />
            <span className="truncate text-[16px] font-black">{NAME}</span>
          </Link>
          <PlanCta
            plan={ENTRY_PLAN}
            from="how"
            className="min-h-[42px] rounded-pill bg-brand px-5 text-[13.5px] !text-paper shadow-card"
          >
            女性{entryAnswers}人に確かめる
          </PlanCta>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[860px] px-5 pb-24 pt-12 sm:px-10">
        <h1 className="text-huge font-black">仕組み。</h1>
        <p className="mt-6 max-w-[32em] text-[16px] leading-[1.95] text-steel">
          出す前に、相手に近い女性の目を通すサービスです。
          誰が読むのか、どうやって届くのか、AIを何に使っているのかをまとめています。
        </p>

        <div className="mt-14 flex flex-col gap-12">
          <Sec title="何をしているサービスか">
            <p>
              出す直前のものを預かって、条件に合う女性に読んでもらい、
              その感想をまとめてお返ししています。
              相談に乗るサービスではありません。答えを出すサービスでもありません。
              出すのは、相手側に近い女性がどう受け取ったかだけです。
            </p>
            <p>
              判断はあなたがします。こちらは「こうすべき」とは書きません。
            </p>
          </Sec>

          <Sec title="流れ">
            <ol className="flex flex-col gap-3">
              {FLOW.map((f, i) => (
                <li
                  key={f.tag}
                  className="flex gap-4 rounded-card border border-line bg-paper p-5 shadow-card"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[13px] font-black tabular-nums text-brand-deep">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15.5px] font-bold text-slate">{f.label}</span>
                    <span className="mt-1.5 block text-[13.5px] leading-[1.8] text-steel">
                      {f.note}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <p>
              どこまで進めるかは、選んだ内容によります。
              一度確かめるだけで終えることも、直してもう一度確かめることもできます。
            </p>
          </Sec>

          <Sec title="誰が読むのか">
            <p>
              読むのは女性です。研究者でもカウンセラーでもありません。
              ただし、登録すれば読めるようにはしていません。
              年齢と立場を確認し、通った方にだけお願いしています。
            </p>
            <p>
              なぜ女性でなければならないか。相手本人には聞けないからです。
              友達の女性は、あなたを知っているぶん気を使います。AIは女性ではありません。
              相手と同じ側に立っていて、あなたを知らない。その両方が要ります。
            </p>
            <p>
              年齢・経験・いまの立場・感じ方そのものが、判断の材料になります。
              だからこそ、誰が読むのかを選べることに意味があります。
            </p>
            <p>
              登録しただけでは相談は届きません。確認が済んだ方にだけお送りしています。
              回答の質は、回答までの時間・役に立ったと言われた割合・通報の有無で記録しています。
              順位を公開して競わせることはしません。
            </p>
            <p>
              答えてくれる女性の連絡先は、お願いするためだけに使います。
              相談した人に渡す仕組みを作っていません。逆もありません。
            </p>
          </Sec>

          <Sec title="AIは何に使っているか">
            <p>裏側では使っています。使っているのは、次のところです。</p>
            <ul className="flex flex-col gap-2">
              {AI_USES.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 rounded-soft bg-mist px-4 py-3 text-[14px] leading-[1.8]"
                >
                  <span aria-hidden className="mt-[3px] text-[11px] font-black text-ok-text">
                    ✓
                  </span>
                  <span className="min-w-0">{t}</span>
                </li>
              ))}
            </ul>
            <p>
              ただし、お渡ししているのはAIの意見ではありません。
              実際の人がどう感じたかです。そこだけは、人が書いたものをそのままお見せします。
            </p>
          </Sec>

          <Sec title="料金の考え方">
            <p>
              人数では分けていません。どこまで仕上げるかで分けています。
              試すだけにするか、直すところまでやるか、直したものをもう一度確かめるか。
            </p>
            <ul className="flex flex-col gap-2">
              {PLANS.map((p) => (
                <li
                  key={p.id}
                  className="flex items-baseline justify-between gap-4 border-b border-line py-3"
                >
                  <span className="min-w-0 text-[14.5px] text-slate">
                    {p.name}
                    {!p.available && (
                      <span className="ml-2 text-[12px] text-steel">受付前</span>
                    )}
                  </span>
                  <span className="shrink-0 text-[14.5px] font-bold tabular-nums text-slate">
                    <Yen yen={p.yen} />
                    {p.from && "〜"}
                  </span>
                </li>
              ))}
            </ul>
            <p>
              月額も入会金もありません。必要なときだけ、1件ごとにお支払いいただきます。
              条件は{" "}
              <Link
                href="/legal"
                className="font-bold text-brand underline decoration-line underline-offset-4"
              >
                特定商取引法に基づく表記
              </Link>{" "}
              に書いています。
            </p>
          </Sec>

          <Sec title="お金の流れ">
            <p>
              お支払いは Stripe が扱います。カード番号はこちらに残りません。
              お支払いが確認できてから、答えてくれる女性への募集を始めます。
              確認できる前に配ることはありません。
            </p>
            <p>
              答えてくれる女性には、1件ごとに謝礼をお渡ししています。
              金額と方法は、登録後に個別にご相談しています。
              決まっていないものを、決まったように書かないことにしています。
            </p>
          </Sec>

          <Sec title="できないこと">
            <p>
              相手本人に聞くことはできません。相手を特定することもできません。
              相手の名前・写真・連絡先・やりとりの全文は保存しません。
              晒す目的、追跡する目的、18歳未満に関するものはお受けしていません。
            </p>
            <p>
              詳しくは{" "}
              <Link
                href="/safety"
                className="font-bold text-brand underline decoration-line underline-offset-4"
              >
                安心・安全
              </Link>{" "}
              に書いています。
            </p>
          </Sec>
        </div>

        <div className="mt-16">
          <PlanCta
            plan={ENTRY_PLAN}
            from="how_bottom"
            className="min-h-[56px] w-full rounded-pill bg-brand px-8 text-[15.5px] !text-paper shadow-card"
          >
            女性{entryAnswers}人に確かめる
          </PlanCta>
        </div>
      </div>
    </div>
  );
}
