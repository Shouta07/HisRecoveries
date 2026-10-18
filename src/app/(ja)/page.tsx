import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";
import {
  HERO_A, HERO_B, NAME, FULL, DEFINITION, HERO_HOW, TAGLINE, TAB_TITLE,
} from "@/lib/voice";
import {
  PRICE_YEN, PRICE_LINE, PRICE_WHAT, UNLIMITED_LINE, MEET_LINE, WINDOW_LINE, REPLY_LINE,
  INCLUDED, NOT_INCLUDED, WINDOW_BEFORE_DAYS, MAX_TRIP_DAYS, REPLY_HOURS, MEET_MINUTES,
} from "@/lib/service";
import { FLOW, ASK_ITEMS, FREE_UNTIL, PAID_FROM } from "@/lib/flow";
import { BEEN, STANCE, BEEN_NOTE } from "@/lib/been";
import { TRIP_PHOTOS } from "@/lib/operator";
import { NOT_READY_JA, FREE_CHECK_JA, PAID_START_JA } from "@/lib/contact";
import LangSwitch from "@/components/site/LangSwitch";
import LineCta from "@/components/site/LineCta";
import Mark from "@/components/brand/Mark";
import WorldDots from "@/components/art/WorldDots";
import {
  ArtPlanning, ArtCrossroads, ArtEvening, ArtMeet, ArtChat, Underline,
} from "@/components/art/Line";

/* ══════════════════════════════════════════════════════════════
   トップページ（日本語）
   ══════════════════════════════════════════════════════════════

   ── 見本に合わせて組み直した ────────────────────────────
   クリームの紙に、深い緑。見出しの下に金の線。
   写真の代わりに線画。色は tailwind.config.ts で入れ替えてある。

   並びも見本どおり。
     1  1画面目（見出し・値段・LINEの口）
     2  自分のペースで。迷ったときだけ、誰かに。
     3  出発前に話した人へ、旅先からも聞けます。
     4  実際に旅した経験を、あなたの旅に。
     5  料金（淡い緑の帯）
     6  ご利用の流れ
     7  よくある質問
     8  次の一人旅に、聞ける人を。

   ── 見本と変えたところ ──────────────────────────────────
   写真を入れなかった。

   見本では「実際に旅した経験を、あなたの旅に」の下に
   ピラミッドと九份の写真が並んでいた。

   手元にあるのは素材サイトの写真だけで、それを
   「行ったところ」として置くと、読む人には
   本人が撮ったものと区別がつかない。
   行った証拠として見せているのに、行っていない写真になる。

   運営者が実物を入れたら出る（lib/operator.ts の TRIP_PHOTOS）。
   入るまでは、線画と地図で持たせる。

   ── 流れを3つに縮めなかった ──────────────────────────
   見本の「ご利用の流れ」は3段だった。実際は8段ある。

   3段に縮めると、どこから有料になるかが消える。
   8段のまま、無料と有料のあいだに線を引いた。
   縮めるなら消してよいのは手順であって、境目ではない。 */

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

const CTA = "LINEで相談できるか聞く";

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
    a: "行ったことがある国・地域は下に並べています。ただし、その国のすべてに詳しいわけではありません。相談の中身によってはお答えできないので、お申し込みの前にLINEで確かめてください。確認は無料です。",
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
    q: "何回でも質問できますか？",
    a: `LINEでのテキスト相談は、対象期間中、回数に上限はありません。ただし、お返事は${REPLY_HOURS}時間以内が目安です。すぐに返す約束ではありません。`,
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
    q: "予約や手配もお願いできますか？",
    a: "できません。航空券・宿・現地ツアーの予約や、通訳の代行は含みません。旅程をまるごと作ることもしていません。自分で決めるための相談相手、という位置づけです。",
  },
  {
    q: "トラブルや緊急時も対応できますか？",
    a: "できません。事故・病気・盗難などの救援、現地への駆けつけ、安全の保証は提供していません。緊急のときは、現地の緊急通報、加入している保険会社、大使館・領事館にご連絡ください。",
  },
  {
    q: "支払いはどうやって行いますか？",
    a: "対応できることを確かめたあと、LINEでお支払い用のリンクをお送りします。クレジットカード（Stripe）です。このページから直接ご購入いただく形にはしていません。先に、お答えできる内容かを確かめたいからです。",
  },
  {
    q: "答えるのは何人ですか？",
    a: "ひとりです。複数の担当者が交代で待っているものではありません。そのぶん、出発前に話した相手が、旅行中もそのまま続けてお答えします。",
  },
  {
    q: "日程変更やキャンセルの場合はどうなりますか？",
    a: "お申し込み前にLINEでご相談ください。キャンセル・返金の条件は、特定商取引法に基づく表記に記載しています。まだ定めていない条件は、そのページに「決まっていないこと」として書き出しています。",
  },
];

function Wrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[1080px] px-5 sm:px-8 ${className}`}>{children}</div>
  );
}

/** 節の見出し。下に金の線を引く（見本と同じ） */
/* 節の見出し。下に金の線を引く（見本と同じ）。

   ── 色は、明示する ────────────────────────────────
   globals.css に h1..h4 { color: var(--ink) } がある。
   親から継承させようとしても、この規則が勝つ。
   濃い面の上に置いた見出しが、濃い色のまま沈んだ。

   ── 折り返しを均す ────────────────────────────────
   狭い段に text-huge を置くと「実際に旅した経験を、あな／
   たの旅に。」のように、変なところで折れる。
   text-balance が、行の長さをならしてくれる。 */
function H({
  children,
  center = false,
  onDark = false,
}: {
  children: React.ReactNode;
  center?: boolean;
  onDark?: boolean;
}) {
  return (
    <div className={center ? "flex flex-col items-center text-center" : ""}>
      <h2
        className={`text-balance text-huge font-black leading-[1.45] ${
          onDark ? "text-paper" : "text-slate"
        }`}
      >
        {children}
      </h2>
      <Underline className="mt-3" />
    </div>
  );
}

function AskCta({ where, onBrand = false }: { where: string; onBrand?: boolean }) {
  return (
    <LineCta
      where={where}
      label={CTA}
      notReady={NOT_READY_JA}
      className={
        onBrand
          ? "flex min-h-[60px] w-full items-center justify-center rounded-pill bg-paper px-8 text-[16.5px] font-bold text-brand-deep"
          : "flex min-h-[60px] w-full items-center justify-center rounded-pill bg-brand px-8 text-[16.5px] font-bold text-paper shadow-card transition-colors hover:bg-brand-deep"
      }
      notReadyClassName={
        onBrand
          ? "rounded-card border border-dashed border-paper/50 px-4 py-3.5 text-[13.5px] leading-[1.8] text-paper/90"
          : "rounded-card border border-dashed border-line bg-mist px-4 py-3.5 text-[13.5px] leading-[1.8] text-steel"
      }
    />
  );
}

/** LINEで送ってもらう4つ。押す前に必ず見える場所へ置く */
function AskItems({ onBrand = false }: { onBrand?: boolean }) {
  return (
    <div
      className={
        onBrand
          ? ""
          : "rounded-card border border-line bg-paper p-5"
      }
    >
      <p className={`text-[13.5px] font-black ${onBrand ? "text-paper" : "text-slate"}`}>
        LINEで、この4つを送ってください
      </p>
      <ol className="mt-3 flex flex-col gap-2.5">
        {ASK_ITEMS.map((a, i) => (
          <li key={a.label} className="flex items-start gap-2.5">
            <span
              aria-hidden
              className={`mt-[2px] flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full text-[10.5px] font-black ${
                onBrand ? "bg-paper/20 text-paper" : "bg-brand-tint text-brand-deep"
              }`}
            >
              {i + 1}
            </span>
            <span className="min-w-0 text-[13.5px] leading-[1.7]">
              <span className={`font-bold ${onBrand ? "text-paper" : "text-slate"}`}>
                {a.label}
              </span>
              <span
                className={`mt-0.5 block text-[12px] leading-[1.65] ${
                  onBrand ? "text-paper/80" : "text-steel"
                }`}
              >
                {a.hint}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <p
        className={`mt-4 border-t pt-3 text-[12px] leading-[1.8] ${
          onBrand ? "border-paper/25 text-paper/85" : "border-line text-steel"
        }`}
      >
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
    <div data-brand className="min-h-screen bg-sky text-slate">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* ══ ヘッダー ══ */}
      <header className="sticky top-0 z-40 border-b border-line bg-sky/95 backdrop-blur">
        <Wrap className="flex items-center justify-between gap-4 py-3">
          <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2">
            <Mark size={32} />
            <span className="truncate text-[18px] font-black leading-none text-slate sm:text-[20px]">
              {NAME}
            </span>
          </Link>

          {/* 節へ飛ぶ。携帯では場所が無いので隠す（下へ送れば同じ順で出る） */}
          <nav className="hidden items-center gap-6 text-[13.5px] font-bold text-steel lg:flex">
            {[
              ["#what", "相談できること"],
              ["#price", "料金"],
              ["#faq", "よくある質問"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="transition-colors hover:text-brand">
                {label}
              </a>
            ))}
          </nav>

          <LangSwitch current="ja" />
        </Wrap>
      </header>

      {/* ══ 1. 1画面目 ══ */}
      <section className="border-b border-line bg-sky">
        <Wrap className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-center lg:gap-14 lg:py-16">
          <div>
            <p className="text-[13px] font-black tracking-[0.04em] text-brand">{TAGLINE}</p>

            <h1 className="mt-3 text-balance text-mega font-black leading-[1.3] text-slate">
              {HERO_A}
              <br />
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-[0.08em] h-[0.34em] rounded-[2px] bg-gold/40"
                />
                <span className="relative">{HERO_B}</span>
              </span>
            </h1>

            <p className="mt-5 max-w-[32em] text-[15.5px] leading-[1.95] text-steel sm:text-[16.5px]">
              {HERO_HOW}
            </p>

            <div className="mt-7 max-w-[25em]">
              <AskCta where="hero" />
            </div>

            {/* 値段。1画面目では、中身の1行と注意だけに絞る
                （条件の全部は、下の料金の帯で出す） */}
            <div className="mt-6 max-w-[25em]">
              <p className="text-[20px] font-black tabular-nums leading-none text-slate sm:text-[22px]">
                {PRICE_LINE}
              </p>
              <p className="mt-2 text-[14px] font-bold leading-[1.6] text-slate">{PRICE_WHAT}</p>
              <p className="mt-2.5 text-[12.5px] leading-[1.8] text-steel">
                {FREE_CHECK_JA}。{PAID_START_JA}。
              </p>
              <p className="mt-1 text-[12.5px] leading-[1.8] text-steel">
                原則{REPLY_HOURS}時間以内に返信。緊急時の対応は含みません。
              </p>
            </div>
          </div>

          {/* 右。写真が入ったらここへ。いまはやりとりの見本だけ */}
          <div className="relative">
            {TRIP_PHOTOS[0] ? (
              <Image
                src={TRIP_PHOTOS[0].src}
                alt={TRIP_PHOTOS[0].alt}
                width={880}
                height={1100}
                priority
                className="h-[320px] w-full rounded-card object-cover sm:h-[420px]"
              />
            ) : (
              <div
                aria-hidden
                className="flex items-center justify-center rounded-card border border-line bg-brand-tint px-6 py-8 text-brand"
              >
                <ArtCrossroads size={300} className="w-full max-w-[300px]" />
              </div>
            )}

            {/* やりとりの見本。「相談のイメージ」と必ず書く */}
            <div
              className={`rounded-card border border-line bg-paper p-4 shadow-card ${
                TRIP_PHOTOS[0]
                  ? "absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6"
                  : "mt-4"
              }`}
            >
              <p className="text-[11px] font-black tracking-[0.06em] text-steel">相談のイメージ</p>
              <div className="mt-3 flex flex-col gap-2.5">
                <p className="max-w-[90%] self-start rounded-card rounded-bl-[4px] bg-mist px-3.5 py-2.5 text-[12.5px] leading-[1.75] text-slate">
                  深夜1時に空港着の便を取ってしまって、宿までどう行けばいいか決められていません。
                </p>
                <p className="max-w-[90%] self-end rounded-card rounded-br-[4px] bg-brand px-3.5 py-2.5 text-[12.5px] leading-[1.75] text-paper">
                  その時間だと選べる手段が限られます。宿はどのあたりですか？料金の目安は、いまの公式の案内を一緒に確かめましょう。
                </p>
              </div>
            </div>
          </div>
        </Wrap>
      </section>

      {/* ══ 2. 自分のペースで ══ */}
      <section id="what" className="scroll-mt-20 border-b border-line bg-paper">
        <Wrap className="py-14 sm:py-20">
          <H center>
            自分のペースで。
            <br className="sm:hidden" />
            迷ったときだけ、誰かに。
          </H>

          <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {[
              {
                art: <ArtPlanning size={150} />,
                title: "出発前の「これで大丈夫？」",
                body: "持ち物、移動手段、現地での過ごし方。調べたことを自分の予定に当てはめて、ひとつずつ確かめられます。",
              },
              {
                art: <ArtCrossroads size={150} />,
                title: "旅先の「ちょっと聞きたい」",
                body: "その場で迷ったこと、予定の立て直し。小さな疑問も、同じトークでそのまま聞けます。",
              },
              {
                art: <ArtEvening size={150} />,
                title: "今日あったことも、話せる",
                body: "うれしかったこと、困ったこと。一人旅の出来事を、行ったことのある相手に話せます。",
              },
            ].map((c) => (
              <div key={c.title} className="flex flex-col items-center text-center">
                <div className="text-brand">{c.art}</div>
                <h3 className="mt-5 text-[16.5px] font-black leading-[1.6] text-slate">
                  {c.title}
                </h3>
                <p className="mt-3 max-w-[22em] text-[13.5px] leading-[1.95] text-steel">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </Wrap>
      </section>

      {/* ══ 3. 出発前に話した人へ、旅先からも ══ */}
      <section className="border-b border-line bg-mist">
        <Wrap className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-14">
          <div>
            <H>
              出発前に話した人へ、
              <br />
              旅先からも聞けます。
            </H>
            <p className="mt-5 max-w-[26em] text-[14.5px] leading-[1.95] text-steel">
              出発前にオンラインで一度しっかり整理して、旅のあいだはLINEで気軽に。
              相手が変わらないので、予定を説明し直す必要がありません。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch sm:gap-3">
            {[
              {
                tag: "出発前",
                head: `Google Meetで${MEET_MINUTES}分`,
                art: <ArtMeet size={150} />,
                body: "旅の予定や気になることを上から見ながら、気になるところで止まります。日時はLINEで調整します。",
              },
              null,
              {
                tag: "旅行中",
                head: "LINEで何度でも",
                art: <ArtChat size={150} />,
                body: "旅先での疑問や、ちょっとした相談を、同じトークでやりとりできます。回数に上限はありません。",
              },
            ].map((c, i) =>
              c === null ? (
                <div
                  key="arrow"
                  aria-hidden
                  className="flex items-center justify-center text-steel"
                >
                  <span className="rotate-90 text-[20px] sm:rotate-0">→</span>
                </div>
              ) : (
                <div
                  key={c.head}
                  className="flex flex-col rounded-card border border-line bg-paper p-5 shadow-card"
                >
                  <p className="flex flex-wrap items-center gap-2 text-[12px] font-black">
                    <span className="rounded-soft bg-brand px-2 py-1 text-paper">{c.tag}</span>
                    <span className="text-slate">{c.head}</span>
                  </p>
                  <div className="mt-4 flex justify-center text-brand">{c.art}</div>
                  <p className="mt-4 text-[13px] leading-[1.9] text-steel">{c.body}</p>
                </div>
              ),
            )}
          </div>
        </Wrap>
      </section>

      {/* ══ 4. 実際に旅した経験を ══ */}
      {/* 写真は運営者が撮ったものだけ。
          無いうちは、地図と一覧で持たせる（lib/operator.ts に経緯） */}
      <section id="been" className="scroll-mt-20 border-b border-line bg-paper">
        <Wrap className="grid gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className={TRIP_PHOTOS.length > 0 ? "" : "lg:order-2"}>
            {TRIP_PHOTOS.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {TRIP_PHOTOS.slice(0, 2).map((ph) => (
                  <Image
                    key={ph.src}
                    src={ph.src}
                    alt={ph.alt}
                    width={600}
                    height={800}
                    className="h-[220px] w-full rounded-card object-cover sm:h-[300px]"
                  />
                ))}
              </div>
            ) : (
              <div className="text-brand/35">
                <WorldDots className="w-full" />
              </div>
            )}
          </div>

          <div className={TRIP_PHOTOS.length > 0 ? "" : "lg:order-1"}>
            <H>実際に旅した経験を、あなたの旅に。</H>
            <p className="mt-5 max-w-[28em] text-[14.5px] leading-[1.95] text-steel">
              行ったことがあるのは、次の15の国・地域です。
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {BEEN.map((b) => (
                <li
                  key={b}
                  className="rounded-pill border border-line bg-mist px-3.5 py-1.5 text-[13px] font-bold text-slate"
                >
                  {b}
                </li>
              ))}
            </ul>

            <p className="mt-5 max-w-[30em] text-[13px] leading-[1.95] text-steel">{BEEN_NOTE}</p>

            <p className="mt-5 max-w-[30em] text-[13.5px] leading-[1.95] text-steel">{STANCE}</p>
            <p className="mt-3 text-[13px] leading-[1.9]">
              <Link
                href="/about"
                className="font-bold text-brand underline decoration-brand/40 underline-offset-[4px] hover:decoration-brand"
              >
                何を確認していて、何を確認していないか
              </Link>
            </p>
          </div>
        </Wrap>
      </section>

      {/* ══ 5. 料金 ══ */}
      <section id="price" className="scroll-mt-20 border-b border-line bg-band">
        <Wrap className="py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-start lg:gap-12">
            <div>
              <p className="text-[17px] font-black text-slate">一人旅の相談パス</p>
              <p className="mt-2 text-[52px] font-black tabular-nums leading-none text-brand">
                {PRICE_YEN.toLocaleString()}
                <span className="ml-1 text-[22px]">円</span>
              </p>
              <p className="mt-3 text-[13px] font-bold text-steel">
                税込・1旅行・自動更新なし
              </p>
            </div>

            {/* 条件は4つまとめて出す。
                「し放題」だけを大きく出すと、買った人が最初に困る。
                組は lib/service.ts が持つ（UNLIMITED_SET） */}
            <div className="grid gap-5 sm:grid-cols-3">
              {[
                [`Google Meet相談 ${MEET_MINUTES}分`, MEET_LINE],
                ["LINE相談 回数の上限なし", UNLIMITED_LINE],
                ["出発7日前〜帰国日まで", WINDOW_LINE],
              ].map(([head, body]) => (
                <div key={head} className="border-t border-line pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                  <p className="text-[13.5px] font-black leading-[1.6] text-slate">{head}</p>
                  <p className="mt-2 text-[12.5px] leading-[1.9] text-steel">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 border-t border-line pt-6 text-[13px] leading-[1.95] text-steel">
            {REPLY_LINE}。
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[12px] font-black tracking-[0.08em] text-brand">含むもの</p>
              <ul className="mt-3 flex flex-col gap-2">
                {INCLUDED.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[13.5px] leading-[1.85] text-slate">
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
              <ul className="mt-3 flex flex-col gap-2">
                {NOT_INCLUDED.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[13.5px] leading-[1.85] text-steel">
                    <span aria-hidden className="mt-[3px] shrink-0 text-[12px] font-black">×</span>
                    <span className="min-w-0">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-7 max-w-[40em] text-[13px] leading-[1.95] text-steel">
            緊急のときは、現地の緊急通報、加入している保険会社、大使館・領事館へご連絡ください。
            こちらは、自分で決めるための相談相手です。
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,320px)] sm:items-end">
            <p className="text-[13px] leading-[1.95] text-steel">
              <Link
                href="/pricing"
                className="font-bold text-brand underline decoration-brand/40 underline-offset-[4px] hover:decoration-brand"
              >
                料金とよくある質問をまとめて見る
              </Link>
              <span className="mx-2 text-line">／</span>
              <Link
                href="/legal"
                className="font-bold text-brand underline decoration-brand/40 underline-offset-[4px] hover:decoration-brand"
              >
                キャンセル・返金について
              </Link>
            </p>
            <AskCta where="price" />
          </div>
        </Wrap>
      </section>

      {/* ══ 6. ご利用の流れ ══ */}
      <section className="border-b border-line bg-paper">
        <Wrap className="py-14 sm:py-20">
          <H>ご利用の流れ。</H>

          {/* ── 境目を、行いっぱいに引く ──────────────────
              はじめは段の中に線を入れていたが、4列の1列目にしか
              かからず、短い線が段の途中に浮いていた。

              無料と有料の境目は、この節でいちばん大事な一本なので、
              行をまたぐ要素として独立させる。 */}
          <ol className="mt-10 grid gap-x-3 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((s, i) => {
              const paidStartsHere = !s.free && (FLOW[i - 1]?.free ?? false);
              return (
                <Fragment key={s.n}>
                  {paidStartsHere && (
                    <li
                      aria-hidden
                      className="mt-4 flex items-center gap-3 text-[11.5px] font-black tracking-[0.08em] text-brand sm:col-span-2 lg:col-span-4"
                    >
                      <span className="h-px w-6 bg-brand/40" />
                      ここから有料
                      <span className="h-px flex-1 bg-brand/40" />
                    </li>
                  )}
                  <li className="h-full">
                    <div
                      className={`flex h-full flex-col rounded-card border p-4 ${
                        s.free ? "border-line bg-mist" : "border-line bg-paper shadow-card"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-black ${
                          s.free ? "bg-paper text-steel" : "bg-brand text-paper"
                        }`}
                      >
                        {s.n}
                      </span>
                      <span className="mt-3 block text-[14.5px] font-black leading-[1.55] text-slate">
                        {s.title}
                      </span>
                      <span className="mt-2 block text-[12.5px] leading-[1.85] text-steel">
                        {s.body}
                      </span>
                    </div>
                  </li>
                </Fragment>
              );
            })}
          </ol>

          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-center">
            <AskItems />
            <div className="max-w-[25em]">
              <AskCta where="flow" />
            </div>
          </div>
        </Wrap>
      </section>

      {/* ══ 7. よくある質問 ══ */}
      <section id="faq" className="scroll-mt-20 border-b border-line bg-mist">
        <Wrap className="py-14 sm:py-20">
          <H>よくある質問。</H>
          <div className="mt-10 overflow-hidden rounded-card border border-line bg-paper">
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
                <p className="px-4 pb-4 text-[13.5px] leading-[1.95] text-steel sm:px-5">{f.a}</p>
              </details>
            ))}
          </div>
        </Wrap>
      </section>

      {/* ══ 8. 最後 ══ */}
      <section className="bg-brand text-paper">
        <Wrap className="py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-14">
            <div>
              <H onDark>
                次の一人旅に、
                <br />
                聞ける人を。
              </H>
              <p className="mt-5 max-w-[26em] text-[14.5px] leading-[1.95] text-paper/90">
                まず、お答えできる内容かを確かめさせてください。
                行ったことがある国でも、相談の中身によってはお答えできないことがあります。
              </p>
              <div className="mt-7 max-w-[25em]">
                <AskCta where="final" onBrand />
              </div>
            </div>
            <AskItems onBrand />
          </div>
        </Wrap>
      </section>

      <footer className="bg-brand-deep text-paper">
        <Wrap className="py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <Mark size={26} />
              <span className="text-[15px] font-black">{NAME}</span>
              <span className="text-[11.5px] text-paper/70">{site.company.name}</span>
            </div>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-paper/85">
              {[
                ["/terms", "利用規約"],
                ["/privacy", "プライバシーポリシー"],
                ["/legal", "特定商取引法に基づく表記"],
                [`mailto:${site.company.email}`, "お問い合わせ"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-paper">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-5 border-t border-line-dark pt-5">
            <LangSwitch current="ja" onDark />
          </div>
        </Wrap>
      </footer>
    </div>
  );
}
