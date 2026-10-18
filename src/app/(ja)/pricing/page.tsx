import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { NAME } from "@/lib/voice";
import {
  PRICE_YEN, PRICE_LINE, PRICE_WHAT, MEET_LINE, UNLIMITED_LINE, WINDOW_LINE, REPLY_LINE,
  INCLUDED, NOT_INCLUDED, MEET_MINUTES, REPLY_HOURS,
} from "@/lib/service";
import { FLOW, ASK_ITEMS, FREE_UNTIL, PAID_FROM } from "@/lib/flow";
import { REFUND_OPEN } from "@/lib/legal";
import { NOT_READY_JA } from "@/lib/contact";
import LineCta from "@/components/site/LineCta";
import Mark from "@/components/brand/Mark";

/* ══════════════════════════════════════════════════
   料金とよくある質問
   ══════════════════════════════════════════════════

   ── 紹介されたときに、1枚で済む面 ────────────────
   誰かがこのサービスを人に教えるとき、
   トップを送ると、読むところが多すぎる。

   ここは「いくらで、何が入っていて、どう申し込むか」だけ。
   値段・中身・流れ・断り・よくある質問を、上から順に。

   ── 買うボタンは、置かない ──────────────────────
   決済のリンクは、LINEで対応できることを確かめてから
   個別にお送りする。

   ここに置くと、答えられない相談にも先にお金が入る。
   返すほうが手間だし、買った人にも悪い。 */

const FAQ: { q: string; a: string }[] = [
  {
    q: "オンライン相談は、どうやって行いますか？",
    a: `Google Meetを使います。URLを開くだけで、アプリを入れなくてもブラウザから参加できます。日時はLINEで調整し、決まってからURLを個別にお送りします。出発前の1回${MEET_MINUTES}分です。`,
  },
  {
    q: "旅行中もビデオ通話で相談できますか？",
    a: `できません。オンライン相談は出発前の1回${MEET_MINUTES}分です。旅行中はLINEのテキストでのご相談になります。話し放題ではありません。`,
  },
  {
    q: "何回でも質問できますか？",
    a: `LINEでのテキスト相談は、対象期間中、回数に上限はありません。ただし、お返事は${REPLY_HOURS}時間以内が目安です。すぐに返す約束ではありません。`,
  },
  {
    q: "いつからいつまで使えますか？",
    a: `${WINDOW_LINE}。`,
  },
  {
    q: "どの国・都市の相談ができますか？",
    a: "行ったことがある国・地域は決まっていますが、その国のすべてに詳しいわけではありません。相談の中身によってはお答えできないので、お申し込みの前にLINEで確かめてください。確認は無料です。",
  },
  {
    q: "支払いはどうやって行いますか？",
    a: "対応できることを確かめたあと、LINEでお支払い用のリンクをお送りします。クレジットカード（Stripe）です。このページから直接ご購入いただく形にはしていません。先に、お答えできる内容かを確かめたいからです。",
  },
  {
    q: "予約や手配もお願いできますか？",
    a: "できません。航空券・宿・現地ツアーの予約や、通訳の代行は含みません。旅程をまるごと作ることもしていません。自分で決めるための相談相手、という位置づけです。",
  },
  {
    q: "トラブルや緊急時も対応できますか？",
    a: "できません。事故・病気・盗難などの救援、現地への駆けつけ、安全の保証は提供していません。緊急のときは、現地の緊急通報、加入している保険会社、大使館・領事館にご連絡ください。",
  },
  {
    q: "日程変更やキャンセルの場合はどうなりますか？",
    a: "お申し込み前にLINEでご相談ください。条件は特定商取引法に基づく表記に記載しています。まだ定めていない条件は、そのページに「決まっていないこと」として書き出してあります。",
  },
  {
    q: "答えるのは何人ですか？",
    a: "ひとりです。複数の担当者が交代で待っているものではありません。そのぶん、出発前に話した相手が、旅行中もそのまま続けてお答えします。",
  },
];

export const metadata: Metadata = {
  title: { absolute: `料金とよくある質問 — ${NAME}` },
  description: `${PRICE_LINE}。${PRICE_WHAT}。含むもの、含まないもの、使うまでの流れ、よくある質問をまとめています。`,
  alternates: { canonical: `${site.url}/pricing` },
};

export default function PricingPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark size={28} />
            <span className="whitespace-nowrap text-[16px] font-black">{NAME}</span>
          </Link>
          <Link href="/about" className="text-[13px] text-steel transition-colors hover:text-slate">
            答える人について
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <h1 className="text-big font-black">料金とよくある質問</h1>

        <div className="mt-8 rounded-card border-2 border-brand bg-paper p-5 shadow-card sm:p-6">
          <p className="text-[32px] font-black tabular-nums leading-none">
            ¥{PRICE_YEN.toLocaleString()}
          </p>
          <p className="mt-1.5 text-[13px] font-bold text-steel">1旅行あたり（税込）</p>
          <p className="mt-3 text-[15px] font-bold leading-[1.6]">{PRICE_WHAT}</p>
          <ul className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4 text-[13.5px] leading-[1.8] text-steel">
            <li>{MEET_LINE}</li>
            <li>{UNLIMITED_LINE}</li>
            <li>{WINDOW_LINE}</li>
            <li>{REPLY_LINE}</li>
            <li>都度払い。自動更新はありません</li>
          </ul>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[12px] font-black tracking-[0.08em] text-brand">含むもの</p>
            <ul className="mt-2.5 flex flex-col gap-2">
              {INCLUDED.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[13.5px] leading-[1.8]">
                  <span aria-hidden className="mt-[4px] shrink-0 text-[11px] font-black text-brand">
                    ✓
                  </span>
                  <span className="min-w-0">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-black tracking-[0.08em] text-steel">含まないもの</p>
            <ul className="mt-2.5 flex flex-col gap-2">
              {NOT_INCLUDED.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[13.5px] leading-[1.8] text-steel">
                  <span aria-hidden className="mt-[3px] shrink-0 text-[12px] font-black">×</span>
                  <span className="min-w-0">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="text-[19px] font-black sm:text-[21px]">使うまでの流れ</h2>
          <ol className="mt-5 flex flex-col gap-2">
            {FLOW.map((s, i) => {
              const paidStartsHere = !s.free && (FLOW[i - 1]?.free ?? false);
              return (
                <li key={s.n}>
                  {paidStartsHere && (
                    <p className="mb-2.5 flex items-center gap-3 text-[11.5px] font-black tracking-[0.08em] text-brand">
                      <span aria-hidden className="h-px flex-1 bg-brand/30" />
                      ここから有料
                      <span aria-hidden className="h-px flex-1 bg-brand/30" />
                    </p>
                  )}
                  <div className="flex items-start gap-3 rounded-card border border-line bg-paper px-4 py-3.5">
                    <span
                      aria-hidden
                      className={`mt-[1px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-black ${
                        s.free ? "bg-mist text-steel" : "bg-brand text-paper"
                      }`}
                    >
                      {s.n}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14.5px] font-black leading-[1.5]">{s.title}</span>
                      <span className="mt-1 block text-[13px] leading-[1.8] text-steel">
                        {s.body}
                      </span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* 決まっていない返金条件を、ここにも出す。
            料金の面だけ見て申し込む人がいるので、
            特商法の面にしか書かないと伝わらない */}
        {REFUND_OPEN.length > 0 && (
          <section className="mt-14 rounded-card border-2 border-slate bg-paper p-5">
            <h2 className="text-[15px] font-black">返金について、まだ決まっていないこと</h2>
            <ul className="mt-3 flex flex-col gap-2 border-l-2 border-line pl-4 text-[13.5px] leading-[1.9] text-steel">
              {REFUND_OPEN.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] leading-[1.9] text-steel">
              条件が決まるまで、お支払いの受付は開始していません。
              <Link
                href="/legal"
                className="ml-1 font-bold text-brand underline decoration-brand/40 underline-offset-[4px]"
              >
                特定商取引法に基づく表記
              </Link>
            </p>
          </section>
        )}

        <section className="mt-14">
          <h2 className="text-[19px] font-black sm:text-[21px]">よくある質問</h2>
          <div className="mt-5 overflow-hidden rounded-card border border-line bg-paper">
            {FAQ.map((f, i) => (
              <details key={f.q} className={`group ${i > 0 ? "border-t border-line" : ""}`}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-[14.5px] font-bold leading-[1.6] sm:p-5">
                  {f.q}
                  <span
                    aria-hidden
                    className="shrink-0 text-[18px] leading-none text-steel transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 text-[13.5px] leading-[1.9] text-steel sm:px-5">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-card bg-brand p-6 text-paper sm:p-8">
          <h2 className="text-[20px] font-black leading-[1.5]">
            まず、対応できるか
            <br />
            聞いてください。
          </h2>
          <ol className="mt-5 flex flex-col gap-1.5">
            {ASK_ITEMS.map((a, i) => (
              <li key={a.label} className="flex items-start gap-2 text-[13.5px] leading-[1.7]">
                <span aria-hidden className="font-black text-paper/70">{i + 1}</span>
                <span className="min-w-0 font-bold">{a.label}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 max-w-[24em]">
            <LineCta
              where="pricing"
              label="LINEで対応できるか聞く"
              notReady={NOT_READY_JA}
              className="flex min-h-[56px] w-full items-center justify-center rounded-pill bg-paper px-8 text-[16px] font-bold text-brand-deep"
              notReadyClassName="rounded-card border border-dashed border-paper/50 px-4 py-3.5 text-[13.5px] leading-[1.8] text-paper/90"
            />
            <p className="mt-2.5 text-[12px] leading-[1.75] text-paper/90">
              {FREE_UNTIL}。{PAID_FROM}。
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
