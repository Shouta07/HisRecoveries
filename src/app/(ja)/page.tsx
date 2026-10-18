import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import {
  HERO_A, HERO_B, NAME, FULL, DEFINITION, HERO_HOW,
  TAB_TITLE, TRIAD_LINES,
} from "@/lib/voice";
import {
  PRICE_YEN, PRICE_LINE, PRICE_WHAT, UNLIMITED_LINE, MEET_LINE, WINDOW_LINE, REPLY_LINE,
  INCLUDED, NOT_INCLUDED, WINDOW_BEFORE_DAYS, MAX_TRIP_DAYS, REPLY_HOURS, MEET_MINUTES,
} from "@/lib/service";
import { FLOW, ASK_ITEMS, FREE_UNTIL, PAID_FROM } from "@/lib/flow";
import { BEEN, STANCE, BEEN_NOTE } from "@/lib/been";
import { lineReady, lineUrl, NOT_READY_JA, FREE_CHECK_JA, PAID_START_JA } from "@/lib/contact";
import LangSwitch from "@/components/site/LangSwitch";
import LineCta from "@/components/site/LineCta";
import Reveal from "@/components/brand/Reveal";
import Mark from "@/components/brand/Mark";
import Tashikame from "@/components/brand/Tashikame";

// ══════════════════════════════════════════════════════════════
// トップページ（日本語）。海外へ一人旅に行く日本人向け。
//
// ══════════════════════════════════════════════════════════════
// 売っているのは「聞ける相手」
// ══════════════════════════════════════════════════════════════
// 機能ではない。次の状態を買ってもらう。
//   調べても判断できなかったことを、経験者と整理できる
//   自分の旅の予定を知っている人に、旅行中も相談できる
//   小さな疑問を一人で抱え込まず、旅を楽しめる
//
// 前の版（AIに貼って記録が残る）とは、売るものが違う。
// 記録・タスク・AIの話は、1行も残さない。
//
// ══════════════════════════════════════════════════════════════
// 書けないことを、書かない
// ══════════════════════════════════════════════════════════════
// 確認できているのは、15の国・地域に行ったことがある、まで。
// 都市・時期・回数・一人旅だったか・語学力は、未確認。
// lib/been.ts が、それ以上を書こうとしたら止める。
//
// 対応するのは運営者1人。複数が待機しているように見せない。
//
// ══════════════════════════════════════════════════════════════
// 「し放題」を、単独で出さない
// ══════════════════════════════════════════════════════════════
// 回数に上限が無いのは本当だが、無条件ではない。
// 期間（出発7日前〜帰国日）と、返信（原則24時間以内）を
// 必ず一緒に出す。小さい注意書きに隠すと、買った人が最初に困る。
//
// ══════════════════════════════════════════════════════════════
// 構成（スマホで上から）
// ══════════════════════════════════════════════════════════════
//   1  初めての海外一人旅。出発前も、旅先でも、聞ける人がいる。
//   2  こんなときに聞けます
//   3  相談のやりとり（利用イメージ）
//   4  対応する人
//   5  行ったことがある国・地域
//   6  料金と、含むもの・含まないもの
//   7  使うまでの流れ
//   8  よくある質問
//   9  まず、対応できるか聞いてください
// ══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: { absolute: TAB_TITLE },
  description: `${DEFINITION}${HERO_HOW}`,
  keywords: ["海外一人旅 初めて", "一人旅 相談", "海外旅行 準備 相談", "旅 LINE 相談", "一人旅 不安"],
  alternates: { canonical: site.url },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: FULL,
    title: TAB_TITLE,
    description: `${DEFINITION}${HERO_HOW}`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: TAB_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TAB_TITLE,
    description: `${DEFINITION}${HERO_HOW}`,
    images: ["/opengraph-image"],
  },
};

const CTA = "LINEで対応できるか聞く";

/* 相談の例。出発前と旅行中に分ける。
   旅行中があることが、この商品のいちばんの形。 */
const BEFORE = [
  "持ち物、通信手段、支払いの準備",
  "空港から宿までの行き方で、迷っているところ",
  "自分で考えた予定で、気になっているところ",
  "一人での食事や、過ごし方",
  "行った人が実際に困ったこと、準備してよかったこと",
];

const DURING = [
  "疲れ具合に合わせて、予定を見直したい",
  "明日からの過ごし方を相談したい",
  "一人旅ならではの、小さな迷い",
  "旅先であった出来事を、誰かに話したい",
];

/* 流れは lib/flow.ts が持つ。ここに書き写すと、英語・中国語とずれる。 */


const FAQ: { q: string; a: string }[] = [
  {
    q: "どんな人に向いていますか？",
    a: "初めて海外へ一人で行く方です。行き先が決まっている、または航空券を買ってある方を想定しています。調べてはいるけれど、自分の予定に当てはめると決めきれない、というときに使ってください。",
  },
  {
    q: "どの国・都市の相談ができますか？",
    a: `下に挙げた${BEEN.length}の国・地域です。ただし、その国のすべてに詳しいわけではありません。都市と相談したいことによってはお答えできないので、買う前にLINEで教えてください。`,
  },
  {
    q: "何回でも質問できますか？",
    a: `LINEでのテキスト相談は、対象期間中、回数に上限はありません。ただし、お返事は${REPLY_HOURS}時間以内が目安です。すぐに返す約束ではありません。オンライン相談（Google Meet）は、出発前の1回${MEET_MINUTES}分です。`,
  },
  {
    q: "いつからいつまで使えますか？",
    a: `出発の${WINDOW_BEFORE_DAYS}日前から、帰国日までです。旅行期間は最大${MAX_TRIP_DAYS}日間を対象にしています。`,
  },
  {
    q: "すぐに返信してもらえますか？",
    a: `原則${REPLY_HOURS}時間以内にお返事します。主に日本時間の夜に対応しているため、時差のある場所からだと、お返事が翌日になることがあります。急いで答えが要る場面には向きません。`,
  },
  {
    q: "旅行中も相談できますか？",
    a: "できます。出発前と同じトークで続きます。予定を見直したいとき、翌日の過ごし方に迷ったときに使ってください。",
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
    q: "オンライン相談は、どうやって行いますか？",
    a: `Google Meetを使います。URLを開くだけで、アプリを入れなくてもブラウザで参加できます。日時はLINEで調整し、決まってからURLを個別にお送りします。出発前の1回${MEET_MINUTES}分です。`,
  },
  {
    q: "旅行中もビデオ通話で相談できますか？",
    a: `できません。オンライン相談は出発前の1回${MEET_MINUTES}分です。旅行中はLINEのテキストでのご相談になります。話し放題ではありません。`,
  },
  {
    q: "オンライン相談の前に、何か準備は要りますか？",
    a: "お申し込みの前にLINEでお送りいただいた、行き先・日程・気になっていることに、こちらで目を通しておきます。あらためて資料を作っていただく必要はありません。気になることを箇条書きで足していただけると、その分だけ話が進みます。",
  },
  {
    q: "日程変更やキャンセルの場合はどうなりますか？",
    a: "お申し込み前にLINEでご相談ください。キャンセル・返金の条件は、特定商取引法に基づく表記に記載しています。まだ定めていない条件については、そのページに「決まっていないこと」として書き出しています。",
  },
  {
    q: "支払いはどうやって行いますか？",
    a: "対応できることを確かめたあと、LINEでお支払い用のリンクをお送りします。クレジットカード（Stripe）です。このページから直接ご購入いただく形にはしていません。先に、お答えできる内容かどうかを確かめたいからです。",
  },
];

function Wrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[720px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function Block({ children, tint = false, id }: { children: React.ReactNode; tint?: boolean; id?: string }) {
  return (
    <section id={id} className={`scroll-mt-20 ${tint ? "bg-mist" : "bg-paper"}`}>
      <Wrap className="py-10 sm:py-14">{children}</Wrap>
    </section>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <Reveal>
      <h2 className="text-huge font-black text-slate">{children}</h2>
    </Reveal>
  );
}

/** 買う前の確認へ行くボタン。URLが無いときは、押せる形にしない */
function AskCta({ where, small = false }: { where: string; small?: boolean }) {
  return (
    <LineCta
      where={where}
      label={CTA}
      notReady={NOT_READY_JA}
      className={
        small
          ? "inline-flex min-h-[46px] items-center justify-center rounded-pill bg-brand px-5 text-[14px] font-bold text-paper shadow-card"
          : "flex min-h-[56px] w-full items-center justify-center rounded-pill bg-brand px-8 text-[16.5px] font-bold text-paper shadow-card"
      }
      notReadyClassName="rounded-card border border-dashed border-line bg-mist px-4 py-3.5 text-[13.5px] leading-[1.8] text-steel"
    />
  );
}

/** 無料と有料の境目。CTA のそばに必ず置く */
function FreePaidNote() {
  return (
    <p className="mt-2 text-[12px] leading-[1.75] text-steel">
      {FREE_CHECK_JA}。{PAID_START_JA}。
    </p>
  );
}

/* ══════════════════════════════════════════════════
   LINE で送ってもらう4つ
   ══════════════════════════════════════════════════
   ボタンを押す前に、必ず見える場所へ置く。

   いちばん落ちるのはここ。
   追加して、何を書けばいいか分からなくて、そのまま閉じる。

   「友だち追加はこちら」で終わらせない。
   追加したあと何をするのかまで、押す前に見せる。 */
function AskItems() {
  return (
    <div className="mt-6 rounded-card border border-line bg-paper p-5">
      <p className="text-[13.5px] font-black text-slate">LINEで、この4つを送ってください</p>
      <ol className="mt-3 flex flex-col gap-2.5">
        {ASK_ITEMS.map((a, i) => (
          <li key={a.label} className="flex items-start gap-2.5">
            <span
              aria-hidden
              className="mt-[2px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-brand-tint text-[10.5px] font-black text-brand-deep"
            >
              {i + 1}
            </span>
            <span className="min-w-0 text-[13.5px] leading-[1.7] text-slate">
              <span className="font-bold">{a.label}</span>
              <span className="mt-0.5 block text-[12px] leading-[1.65] text-steel">{a.hint}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-4 border-t border-line pt-3 text-[12px] leading-[1.8] text-steel">
        航空券の番号や旅程表は要りません。{FREE_UNTIL}。{PAID_FROM}。
      </p>
    </div>
  );
}

export default function HomePage() {
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

      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <Wrap className="flex items-center justify-between gap-3 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <Mark size={34} />
            {/* 名前の上に標語を置いていたが、言語切替と並ぶと
                幅が足りず「はじめての海外一...」と切れていた。
                切れた標語は、読めないうえに雑に見える。

                すぐ下の見出しが同じことを言っている
                （一人旅に、聞ける人がいる。）ので、ここは名前だけにする。 */}
            <span className="block truncate text-[17.5px] font-black leading-[1.15] text-slate min-[360px]:text-[20px]">
              {NAME}
            </span>
          </Link>
          <LangSwitch current="ja" />
        </Wrap>
      </header>

      {/* ══ 1. ファーストビュー ══ */}
      <section className="bg-sky">
        <Wrap className="pb-10 pt-6 sm:pt-10">
          <h1 className="text-mega font-black text-slate">
            {HERO_A}
            <br />
            <span className="relative inline-block">
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-[0.06em] h-[0.4em] rounded-[2px] bg-brand/25"
              />
              <span className="relative">{HERO_B}</span>
            </span>
          </h1>

          <p className="mt-4 max-w-[30em] text-[16px] font-bold leading-[1.8] text-slate sm:text-[17.5px]">
            {HERO_HOW}
          </p>

          {/* 値段と条件は、ここでまとめて出す。
              「し放題」だけを大きく出すと、買った人が最初に困る。

              し放題なのは LINE のテキストだけ。
              通話は1回30分。だから値段のすぐ下に両方を書く */}
          <div className="mt-6 rounded-card border border-line bg-paper p-5 shadow-card">
            <p className="text-[22px] font-black tabular-nums leading-none text-slate sm:text-[26px]">
              {PRICE_LINE}
            </p>
            <p className="mt-2 text-[14px] font-bold leading-[1.6] text-slate">{PRICE_WHAT}</p>
            <ul className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3 text-[13.5px] leading-[1.8] text-steel">
              <li>{MEET_LINE}</li>
              <li>{UNLIMITED_LINE}</li>
              <li>{WINDOW_LINE}</li>
              <li>{REPLY_LINE}</li>
            </ul>
          </div>

          <div className="mt-6 max-w-[24em]">
            <AskCta where="hero" />
            <FreePaidNote />
          </div>
        </Wrap>
      </section>

      {/* ══ 1.5 誰向けか ══ */}
      {/* 「旅行者全員」に見せない。
          広げると、答えられない人を呼ぶ。
          自分のことだと分かった人だけが進めばいい */}
      <Block>
        <H>こういう方に使ってもらっています。</H>
        <ul className="mt-6 flex flex-col gap-2.5">
          {[
            "友人との海外旅行は経験があるけれど、一人では初めて",
            "航空券は買ったが、準備や到着日の動きに不安がある",
            "調べた情報を、自分の予定に当てはめて確かめたい",
            "身近に、その旅先へ行った人がいない",
          ].map((t) => (
            <li
              key={t}
              className="flex items-start gap-2.5 rounded-card border border-line bg-paper px-4 py-3.5"
            >
              <span aria-hidden className="mt-[5px] h-[6px] w-[6px] shrink-0 rounded-full bg-brand" />
              <span className="min-w-0 text-[14.5px] leading-[1.75] text-slate">{t}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 max-w-[32em] text-[13.5px] leading-[1.9] text-steel">
          行き先と日程が決まっている方を想定しています。どこへ行くかを一緒に選ぶサービスではありません。
        </p>
      </Block>

      {/* ══ 2. こんなときに聞けます ══ */}
      <Block>
        <H>こんなときに、聞けます。</H>
        <div className="mt-7 flex flex-col gap-7">
          {[
            ["出発前", BEFORE],
            ["旅行中", DURING],
          ].map(([title, items]) => (
            <div key={title as string}>
              <p className="text-[11.5px] font-black tracking-[0.1em] text-brand">
                {title as string}
              </p>
              <ul className="mt-2.5 flex flex-col gap-2">
                {(items as string[]).map((t) => (
                  <li
                    key={t}
                    className="rounded-card rounded-bl-[4px] bg-mist px-4 py-3 text-[14.5px] leading-[1.75] text-slate"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-[32em] text-[13.5px] leading-[1.9] text-steel">
          実際に行ったときの話と、いまの公式の案内を確かめたほうがよいことは、分けてお伝えします。
        </p>
      </Block>

      {/* ══ 3. 相談のやりとり ══ */}
      {/* 「利用イメージ」と明記する。
          実際の顧客のやりとりだと誤解させない */}
      <Block tint>
        <H>相談すると、こうなります。</H>
        <p className="mt-3 text-[12px] font-bold text-steel">利用イメージです</p>

        <div className="mt-6 flex max-w-[28em] flex-col gap-3">
          {[
            ["me", "バンコク4日間、初めて一人で行きます。深夜1時に空港着の便を取ってしまって、宿までどう行けばいいか決められていません。"],
            ["you", "深夜着だと選べる手段が限られます。配車アプリか、空港の正規タクシーのどちらかになることが多いです。宿はどのあたりですか？"],
            ["me", "スクンビットです。"],
            ["you", "その時間なら配車アプリを入れておくと、値段の交渉が要らないぶん楽でした。到着階で待ち合わせ場所を指定できます。料金の目安はいまの公式の案内を一緒に確かめましょう。"],
            ["me", "助かります。それで行きます。"],
          ].map(([who, say], i) => (
            <p
              key={i}
              className={`max-w-[88%] rounded-card px-4 py-3 text-[13.5px] leading-[1.8] ${
                who === "me"
                  ? "self-end rounded-br-[4px] bg-brand text-paper"
                  : "self-start rounded-bl-[4px] border border-line bg-paper text-slate"
              }`}
            >
              {say}
            </p>
          ))}
        </div>

        <p className="mt-6 max-w-[32em] text-[14px] font-bold leading-[1.85] text-slate">
          調べても決めきれなかったことが、自分の予定に当てはめて決まります。
        </p>
      </Block>

      {/* ══ 4. 対応する人 ══ */}
      <Block>
        <H>対応するのは、ひとりです。</H>
        <p className="mt-4 max-w-[32em] text-[14.5px] leading-[1.9] text-steel">{STANCE}</p>
        <p className="mt-3 max-w-[32em] text-[14.5px] leading-[1.9] text-steel">
          ひとりで受けています。だからこそ、あなたの旅の予定を覚えたまま、出発前から帰国まで同じトークで話せます。
        </p>

        <p className="mt-6 max-w-[32em] text-[15.5px] font-black leading-[1.8] text-slate">
          {TRIAD_LINES.join("")}
        </p>
      </Block>

      {/* ══ 5. 行ったことがある国・地域 ══ */}
      {/* 事実として使えるのは、国・地域の名前だけ。
          都市・時期・回数・語学力は未確認（lib/been.ts が止める） */}
      <Block tint id="been">
        <H>行ったことがある国・地域。</H>
        <ul className="mt-6 flex flex-wrap gap-2">
          {BEEN.map((b) => (
            <li
              key={b}
              className="rounded-pill border border-line bg-paper px-3.5 py-2 text-[13.5px] font-bold text-slate"
            >
              {b}
            </li>
          ))}
        </ul>
        <p className="mt-5 max-w-[32em] text-[13.5px] leading-[1.9] text-steel">{BEEN_NOTE}</p>
        <div className="max-w-[26em]">
          <AskItems />
          <div className="mt-5">
            <AskCta where="been" small />
          </div>
        </div>
      </Block>

      {/* ══ 6. 料金 ══ */}
      <Block id="price">
        <H>料金。</H>
        <div className="mt-6 rounded-card border-2 border-brand bg-paper p-5 shadow-card sm:p-6">
          <p className="text-[32px] font-black tabular-nums leading-none text-slate">
            ¥{PRICE_YEN.toLocaleString()}
          </p>
          <p className="mt-1.5 text-[13px] font-bold text-steel">1旅行あたり（税込）</p>
          <p className="mt-2 text-[14px] font-bold leading-[1.6] text-slate">{PRICE_WHAT}</p>
          <ul className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4 text-[13.5px] leading-[1.8] text-steel">
            <li>{MEET_LINE}</li>
            <li>{UNLIMITED_LINE}</li>
            <li>{WINDOW_LINE}</li>
            <li>{REPLY_LINE}</li>
            <li>都度払い。自動更新はありません</li>
          </ul>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[12px] font-black tracking-[0.08em] text-brand">含むもの</p>
            <ul className="mt-2.5 flex flex-col gap-2">
              {INCLUDED.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[13.5px] leading-[1.8] text-slate">
                  <span aria-hidden className="mt-[4px] shrink-0 text-[11px] font-black text-brand">✓</span>
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
                  <span aria-hidden className="mt-[3px] shrink-0 text-[12px] font-black text-steel">×</span>
                  <span className="min-w-0">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 max-w-[32em] text-[13.5px] leading-[1.9] text-steel">
          緊急のときは、現地の緊急通報、加入している保険会社、大使館・領事館へご連絡ください。こちらは、自分で決めるための相談相手です。
        </p>
        <p className="mt-3 text-[12.5px] leading-[1.85] text-steel">
          <Link href="/legal" className="font-bold text-brand underline decoration-line underline-offset-4">
            キャンセル・返金について
          </Link>
        </p>
      </Block>

      {/* ══ 7. 使うまでの流れ ══ */}
      {/* ══ 7. 使うまでの流れ ══ */}
      {/* 無料と有料の境目を、線で見せる。
          文章で「ここから有料です」と書くより、
          並びのどこで切り替わるかが見えたほうが早い。
          中身は lib/flow.ts が1つ持つ（英語・中国語も同じものを使う） */}
      <Block tint id="how">
        <H>使うまでの流れ。</H>
        <ol className="mt-7 flex flex-col gap-2.5">
          {FLOW.map((s, i) => {
            const paidStartsHere = !s.free && (FLOW[i - 1]?.free ?? false);
            return (
              <li key={s.n}>
                {paidStartsHere && (
                  <p className="mb-3 flex items-center gap-3 text-[11.5px] font-black tracking-[0.08em] text-brand">
                    <span aria-hidden className="h-px flex-1 bg-brand/30" />
                    ここから有料
                    <span aria-hidden className="h-px flex-1 bg-brand/30" />
                  </p>
                )}
                <div className="flex items-start gap-3 rounded-card border border-line bg-paper px-4 py-4 shadow-card">
                  <span
                    aria-hidden
                    className={`mt-[1px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-black ${
                      s.free ? "bg-mist text-steel" : "bg-brand text-paper"
                    }`}
                  >
                    {s.n}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-black leading-[1.5] text-slate">
                      {s.title}
                    </span>
                    <span className="mt-1 block text-[13px] leading-[1.8] text-steel">{s.body}</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </Block>

      {/* ══ 8. よくある質問 ══ */}
      <Block id="faq">
        <H>よくある質問。</H>
        <div className="mt-7 overflow-hidden rounded-card border border-line bg-paper shadow-card">
          {FAQ.map((f, i) => (
            <details key={f.q} className={`group ${i > 0 ? "border-t border-line" : ""}`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-[14.5px] font-bold leading-[1.6] text-slate sm:p-5">
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
      </Block>

      {/* ══ 9. 最後 ══ */}
      <section className="bg-paper">
        <Wrap className="pb-12 pt-4 sm:pb-16">
          <div className="relative overflow-hidden rounded-card bg-brand p-7 text-paper shadow-card sm:p-10">
            <Tashikame
              size={96}
              className="pointer-events-none absolute -bottom-3 -right-3 sm:!h-[150px] sm:!w-[150px]"
            />
            <p className="relative text-big font-black leading-[1.5]">
              まず、対応できるか
              <br />
              聞いてください。
            </p>
            <p className="relative mt-4 max-w-[26em] text-[14.5px] leading-[1.9]">
              LINEで4つ送っていただければ、お答えできるかと、対象になる期間をお伝えします。
            </p>

            {/* 最後のCTAにも、送る4つを置く。
                ここまで読んだ人は、上の4つを忘れている */}
            <ol className="relative mt-5 flex flex-col gap-1.5">
              {ASK_ITEMS.map((a, i) => (
                <li key={a.label} className="flex items-start gap-2 text-[13.5px] leading-[1.7]">
                  <span aria-hidden className="font-black text-paper/70">
                    {i + 1}
                  </span>
                  <span className="min-w-0 font-bold">{a.label}</span>
                </li>
              ))}
            </ol>

            <div className="relative mt-6 max-w-[24em]">
              <LineCta
                where="final"
                label={CTA}
                notReady={NOT_READY_JA}
                className="flex min-h-[56px] w-full items-center justify-center rounded-pill bg-paper px-8 text-[16px] font-bold text-brand-deep"
                notReadyClassName="rounded-card border border-dashed border-paper/50 px-4 py-3.5 text-[13.5px] leading-[1.8] text-paper/90"
              />
              <p className="mt-2.5 text-[12px] leading-[1.75] text-paper/90">
                {FREE_CHECK_JA}。{PAID_START_JA}。
              </p>
            </div>
          </div>
        </Wrap>
      </section>

      <footer className="border-t border-line bg-paper">
        <Wrap className="py-7">
          <LangSwitch current="ja" />
          <div className="mt-4 flex flex-col gap-2.5 text-[11.5px] leading-[1.7] text-steel sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0">{site.company.name}</p>
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {[
                ["/legal", "特定商取引法に基づく表記"],
                ["/terms", "利用規約"],
                ["/privacy", "プライバシー"],
                [`mailto:${site.company.email}`, "お問い合わせ"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-brand">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Wrap>
      </footer>
    </div>
  );
}
