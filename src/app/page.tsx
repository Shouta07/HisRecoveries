import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import BriefCard from "@/components/koi/BriefCard";
import { heroSubLines } from "@/lib/koi/gate";
import { passEnabled } from "@/lib/stripe";
import TripBoard from "@/components/trip/TripBoard";
import TripLog from "@/components/trip/TripLog";
import { DEMO_LOG } from "@/lib/trip/log";
import { DEMO_BOARD, TRIP_BRIEF } from "@/lib/trip/demo";
import {
  TRIP_PASS_YEN, YEAR_PASS_YEN, YEAR_BREAK_EVEN, PASS_TAIL_DAYS,
  FREE_TRIPS, FREE_RECORDS, INCLUDED,
} from "@/lib/pass/trip";
import { advisorWord, advisorShort, advisorRule, notYetNote, FRESH_DAYS } from "@/lib/who";
import {
  HERO_A, HERO_B1, HERO_B2, NAME, FULL, DEFINITION, HERO_HOW,
  TAGLINE, TAB_TITLE, TRIAD_LINES, CITIES, NOT_OURS,
} from "@/lib/voice";
import Reveal from "@/components/brand/Reveal";
import Mark from "@/components/brand/Mark";
import Tashikame from "@/components/brand/Tashikame";
import TashikameGuide from "@/components/brand/TashikameGuide";
import MenuButton from "@/components/brand/MenuButton";

// ══════════════════════════════════════════════════════════════
// トップページ。
//
// ══════════════════════════════════════════════════════════════
// 売っているのは「決めたあと」だけ
// ══════════════════════════════════════════════════════════════
// 海外旅行には、ふたつ別の困りごとがある。
//
//   どこへ行こうか          → 答えられない。やらない
//   行くと決めたあとで迷う  → これが本題
//
// 前者に手を広げると、行き先探し・航空券比較・旅程の自動生成まで
// 付いてきて、どれも旅行メディアに勝てない。
// 看板（海外一人旅は、決めてからが勝負。）が、その線そのもの。
//
// ══════════════════════════════════════════════════════════════
// 買う人は、もう決めている人
// ══════════════════════════════════════════════════════════════
// 28歳、都市部の会社員。家族旅行と卒業旅行では行った。一人は初めて。
// バンコクか台北かソウルへ、有休と週末で3〜5日。
// ChatGPTで旅程は作った。でも「本当にこれで大丈夫？」が消えない。
//
//   空港から宿まで、どう行く
//   夜、ひとりで何をする
//   これ、ぼられてる？
//   体調を崩したらどうする
//   親に何て言う
//
// 不安なのは旅にではなく、判断と記憶に。
// だから旅行ガイドを売らない。売るのは
// 「一人旅を、ひとりで全部覚えて考えなくていい状態」。
//
// ══════════════════════════════════════════════════════════════
// 構成（スマホで上から）
// ══════════════════════════════════════════════════════════════
//    1  海外一人旅は、決めてからが勝負。（＋ いま、どうなってる）
//    2  行くって決めてから、考えることが増えていく。
//    3  話す。貼る。次が決まる。
//    4  話した1行が、こうなる。
//    5  毎回、最初から説明しなくていい。
//    6  AIで決めきれないときだけ、行った人に確カメる。
//    7  旅が終わったら、答える側にもなれる。
//    8  AIで旅を考える。迷ったら、行った人に確カメる。その続きは、タシカメが覚えてる。
//    9  タシカメは、旅の何でも屋ではありません。
//   10  旅パス
//   11  よくある質問
//   12  もう、ひとりで全部覚えなくていい。
//
// 7 が供給そのもの。聞ける人がいなければ 6 は空手形になる。
// ══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: { absolute: TAB_TITLE },
  description: `${DEFINITION}${HERO_HOW}`,
  keywords: [
    "海外一人旅 初めて", "一人旅 不安",
    ...CITIES.map((c) => `${c} 一人旅`),
    "海外旅行 準備 チェックリスト", "行った人に聞く",
  ],
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

const NAV = [
  ["#how", "使い方"],
  ["#faq", "よくある質問"],
  ["#price", "料金"],
] as const;

const CTA = "無料で始める";
const CTA_NOTE = `${FREE_TRIPS}旅・${FREE_RECORDS}記録まで無料。登録はありません。`;

/* よくある質問。7つ。
   節が答えているものは、ここに置かない。 */
const FAQ: { q: string; a: string; safety?: boolean }[] = [
  {
    q: "ChatGPTを使っていても、必要ですか？",
    a: "そのまま使ってください。足りないのは、話したことが残らないところです。次に相談するとき、また最初から説明することになります。タシカメは、覚えておく側です。",
  },
  {
    q: "複数の旅でも使えますか？",
    a: "旅ごとに分かれて残ります。去年のソウルと、来月のバンコクが混ざることはありません。帰ってきた旅も消えないので、次に行くときに見返せます。",
  },
  {
    q: "無料では何ができますか？",
    a: `${FREE_TRIPS}旅・${FREE_RECORDS}記録まで、そのまま使えます。貼って整理して、次にやることが残るところまで。登録もお支払いもありません。`,
  },
  {
    q: `${advisorWord()}には、何を聞けますか？`,
    a: `「実際どうだったか」です。この宿のエリアは夜ひとりで歩けたか、空港からこの行き方で合っているか、この値段はどうか、初日に何に困ったか。${advisorRule()}`,
  },
  {
    q: "相談した内容は、ほかの人に知られませんか？",
    a: "知られません。名前もメールアドレスも要りません。宿名や便名が会話に出てきても、こちらに届く前に伏せ字にします。答えてくれた人とあなたが直接つながる仕組みも、作っていません。",
    safety: true,
  },
  {
    q: "女性でも安心して使えますか？",
    a: "聞く相手を同性だけに絞れます。「この宿のエリア、夜ひとりで歩けた？」は、同性に聞きたい方が多いためです。出会い目的の利用は禁止していて、答えた人と直接つながる仕組みもありません。",
  },
  {
    q: "解約は？",
    a: `旅パスは1回ごとのお支払いで、自動では続きません。帰国＋${PASS_TAIL_DAYS}日で終わります。年パスは会員ページから、こちらに連絡せずに止められます。`,
  },
];

/** 安心・安全。「知られませんか？」の中で開く */
function Safety() {
  return (
    <div className="px-4 pb-5 sm:px-5">
      <ul className="grid gap-2 sm:grid-cols-2">
        {[
          "匿名で使えます。名前もメールアドレスも要りません",
          "宿名・便名・予約番号は、送る前に自動で伏せます",
          `答えてくれた${advisorShort()}と直接つながる仕組みはありません`,
          "答える側は、年齢と本人確認が済んだ方だけです",
          "出会い目的の利用は禁止しています",
          "同性にだけ聞く、を選べます",
        ].map((t) => (
          <li
            key={t}
            className="flex items-start gap-2.5 rounded-soft bg-mist px-3.5 py-3 text-[12.5px] leading-[1.75] text-steel"
          >
            <span aria-hidden className="mt-[3px] text-[12.5px] font-black text-ok-text">
              ✓
            </span>
            <span className="min-w-0">{t}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/terms"
        className="mt-4 inline-flex min-h-[44px] items-center text-[13px] font-bold text-brand underline decoration-line underline-offset-4"
      >
        禁止していることも含めて、詳しく
      </Link>
    </div>
  );
}

function Wrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1120px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function Block({
  children,
  tint = false,
  dark = false,
  id,
}: {
  children: React.ReactNode;
  tint?: boolean;
  /** 暗い面は1か所だけ。2か所にすると、どちらも芯に見えなくなる */
  dark?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 ${dark ? "bg-slate" : tint ? "bg-mist" : "bg-paper"}`}
    >
      <Wrap className="py-10 sm:py-14 lg:py-16">{children}</Wrap>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11.5px] font-bold tracking-[0.14em] text-steel">{children}</p>;
}

function H({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <Reveal>
      <h2 className={`text-huge font-black ${dark ? "text-paper" : "text-slate"}`}>{children}</h2>
    </Reveal>
  );
}

/** 整理されたあとのカード。Before → After の After 側 */
function AfterCard() {
  return (
    <div className="rounded-card border border-line bg-paper p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-[17px] font-black text-slate">バンコク</span>
        <span className="text-[12.5px] font-bold tabular-nums text-steel">11/14〜11/17</span>
        <span className="ml-auto rounded-pill bg-mist px-2 py-0.5 text-[10.5px] font-bold text-steel">
          準備中
        </span>
      </div>

      <div className="mt-3 flex items-start gap-2">
        <span aria-hidden className="mt-[3px] shrink-0 text-[11px] font-black text-ok-text">
          済
        </span>
        <span className="min-w-0 flex-1 text-[13px] leading-[1.6] text-steel">
          宿確定（スクンビット）
        </span>
      </div>

      <div className="mt-3.5 flex items-start gap-2 border-t border-line pt-3.5">
        <span
          aria-hidden
          className="mt-[2px] shrink-0 text-[10px] font-black tracking-wide text-brand"
        >
          NEXT
        </span>
        <span className="min-w-0 flex-1 text-[15px] font-bold leading-[1.6] text-slate">
          空港→宿の移動手段を決める
        </span>
      </div>

      <dl className="mt-3 flex flex-col gap-1.5 text-[12.5px] leading-[1.7]">
        <div className="flex gap-3">
          <dt className="w-[4.5em] shrink-0 text-steel">状態</dt>
          <dd className="min-w-0 font-bold text-slate">自分から動く</dd>
        </div>
      </dl>
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

      {/* ══ ヘッダー ══ */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <Wrap className="flex items-center justify-between gap-4 py-3">
          {/* 上から「はじめての海外一人旅に、／タシカメ」と読ませる。
              2行で1つの文になるので、標語の側に名前は入れない。 */}
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <Mark size={36} className="sm:!h-11 sm:!w-11" />
            <span className="min-w-0">
              <span className="hidden truncate text-[9px] font-bold leading-[1.3] text-steel min-[360px]:block sm:text-[10.5px]">
                {TAGLINE}
              </span>
              <span className="block truncate text-[17.5px] font-black leading-[1.15] text-slate min-[360px]:text-[21px] min-[360px]:tracking-[0.02em]">
                {NAME}
              </span>
            </span>
          </Link>
          <nav aria-label="サイト" className="flex shrink-0 items-center gap-3 sm:gap-5">
            <ul className="hidden items-center gap-6 lg:flex">
              {NAV.map(([href, l]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="whitespace-nowrap text-[13.5px] font-bold text-steel transition-colors hover:text-brand"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/koi"
              className="inline-flex min-h-[42px] shrink-0 items-center justify-center whitespace-nowrap rounded-pill bg-brand px-3.5 text-[13px] font-bold text-paper shadow-card sm:px-5 sm:text-[13.5px]"
            >
              {CTA}
            </Link>
            <MenuButton />
          </nav>
        </Wrap>
      </header>

      {/* ══ 1. ファーストビュー ══ */}
      {/* 最初の1行で、どこを取る製品かを言う。
          これは読む人の不安ではなく、こちらの立場。
          行き先探しも予約比較もやらない、と同時に言っている。 */}
      <section className="relative overflow-hidden bg-sky">
        <Wrap className="pb-2 pt-4 sm:pt-7">
          <h1 className="text-mega font-black text-slate">
            {HERO_A}
            <br />
            {HERO_B1}
            <br />
            {/* 下線は最後の行だけ。帯を先に描いて、文字を上に載せる
                （負の z-index は節の背景より後ろへ回り込む） */}
            <span className="relative inline-block">
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-[0.06em] h-[0.4em] rounded-[2px] bg-brand/25"
              />
              <span className="relative">{HERO_B2}</span>
            </span>
          </h1>

          <p className="mt-3 text-[18px] font-black leading-[1.5] text-brand sm:text-[20px]">
            {heroSubLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>

          <p className="mt-3 max-w-[26em] text-[16px] font-bold leading-[1.7] text-slate sm:max-w-[38em] sm:text-[18px]">
            AIに話した内容を貼るだけで、どこへ／何が終わって／次に何するか、が残る。
          </p>
          <p className="mt-2 max-w-[26em] text-[14px] leading-[1.85] text-steel sm:max-w-[38em]">
            迷ったら、{advisorWord()}にも確カメられます。
          </p>

          <div className="mt-6 max-w-[22em]">
            <Link
              href="/koi"
              className="flex min-h-[56px] w-full items-center justify-center rounded-pill bg-brand px-8 text-[16.5px] font-bold text-paper shadow-card"
            >
              {CTA} <span aria-hidden className="ml-2">&rarr;</span>
            </Link>
            <p className="mt-2 text-[12px] leading-[1.7] text-steel">{CTA_NOTE}</p>

            {/* ══════════════════════════════════════════
                対応都市を、1画面目で出す
                ══════════════════════════════════════════
                3つだけ。来てから「自分の行き先が無い」と
                分かるのでは遅い。

                増やさない。「行ったばかりの人に聞ける」が売りなので、
                都市を増やすと、その都市の答える人を集められなくなる。
                1都市あたり何人いるかが、品質そのもの。 */}
            <div className="mt-5">
              <p className="text-[11.5px] font-bold text-steel">対応している都市</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                {CITIES.map((c) => (
                  <span
                    key={c}
                    className="rounded-pill border border-line bg-paper px-2.5 py-1 text-[12px] font-bold text-slate"
                  >
                    {c}
                  </span>
                ))}
                <span className="text-[11.5px] text-steel">いまはこの3つだけです</span>
              </div>
            </div>
          </div>
        </Wrap>

        {/* 説明より先に、使った状態を見せる。
            3つの段階（準備中・旅行中・帰国後）を1枚ずつ。
            全部が準備中だと、使ったあとどうなるかが見えない。 */}
        <div className="mt-7 pb-10 sm:pb-14">
          <div className="mx-auto w-full max-w-[22em] px-5 sm:px-0">
            <div className="rounded-[26px] border border-line bg-mist p-3 shadow-card">
              <div className="flex items-center justify-between px-1.5 pb-3 pt-1">
                <span className="text-[12px] font-black text-slate">いま、どうなってる</span>
                <span aria-hidden className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-line" />
                  <span className="h-1.5 w-1.5 rounded-full bg-line" />
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                </span>
              </div>
              <TripBoard cards={DEMO_BOARD} />
            </div>
            <p className="mt-2.5 text-center text-[11.5px] leading-[1.7] text-steel">
              ※ 画面の見本です。特定の利用者の記録ではありません。
            </p>
          </div>
        </div>
      </section>

      {/* ══ 2. 共感 ══ */}
      {/* 口に出る形だけを、テンポよく並べる。
          説明は足さない。足した時点で、他人の話になる。 */}
      <Block>
        <H>
          行くって決めてから、
          <br className="sm:hidden" />
          考えることが増えていく。
        </H>

        <ul className="mt-8 flex max-w-[26em] flex-col gap-2">
          {[
            "空港から宿まで、どう行く？",
            "夜、ひとりで何してた？",
            "これ、ぼられてる？",
            "ChatGPTにまた最初から説明する？",
          ].map((t) => (
            <li
              key={t}
              className="rounded-card rounded-bl-[4px] bg-mist px-4 py-3 text-[15px] font-bold leading-[1.7] text-slate"
            >
              {t}
            </li>
          ))}
        </ul>

        <p className="mt-7 max-w-[30em] text-[15px] font-bold leading-[2.05] text-steel">
          地図を開く。
          <br />
          翻訳を開く。
          <br />
          ChatGPTを開く。
          <br />
          <span className="text-slate">また最初から説明する。</span>
        </p>

        <p className="mt-9 max-w-[30em] text-[19px] font-black leading-[1.75] text-slate sm:text-[22px]">
          旅が不安というより、
          <br />
          判断と記憶に疲れてる。
        </p>
        <p className="mt-3 max-w-[30em] text-[14.5px] leading-[1.9] text-steel">
          頭の中だけで、全部覚えておかなくていい。
        </p>
      </Block>

      {/* ══ 3. HOW IT WORKS ══ */}
      <Block tint id="how">
        <p className="text-[17px] font-black leading-[1.75] text-brand sm:text-[19px]">
          だから、旅の準備を
          <br className="sm:hidden" />
          頭の中だけで管理しない。
        </p>

        <div className="mt-7">
          <Eyebrow>HOW IT WORKS</Eyebrow>
        </div>
        <div className="mt-1.5">
          <H>
            話す。貼る。
            <br className="sm:hidden" />
            次が決まる。
          </H>
        </div>

        <ol className="mt-7 flex flex-col gap-2.5">
          {[
            ["1", "AIに話す", "ChatGPT Voice がおすすめ。文章でも、Claude や Gemini でも大丈夫です。"],
            ["2", "タシカメに貼る", "相談の結果を、そのまま貼るだけ。入力フォームはありません。"],
            ["3", "次が残る", "どこへ／何が終わって／次に何するか、が旅ごとに整理されます。"],
          ].map(([n, head, sub]) => (
            <li
              key={n}
              className="flex items-start gap-3 rounded-card border border-line bg-paper px-4 py-4 shadow-card"
            >
              <span
                aria-hidden
                className="mt-[1px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[13px] font-black text-paper"
              >
                {n}
              </span>
              <span className="min-w-0">
                <span className="block text-[15.5px] font-black leading-[1.5] text-slate">
                  {head}
                </span>
                <span className="mt-1 block text-[13px] leading-[1.8] text-steel">{sub}</span>
              </span>
            </li>
          ))}
        </ol>
      </Block>

      {/* ══ 4. Before → After ══ */}
      <Block>
        <H>
          話した1行が、
          <br className="sm:hidden" />
          こうなる。
        </H>

        <div className="mt-7 max-w-[28em]">
          <p className="text-[11.5px] font-bold tracking-[0.08em] text-steel">BEFORE</p>
          <p className="mt-2 rounded-card rounded-bl-[4px] bg-brand px-4 py-3.5 text-[14.5px] font-bold leading-[1.8] text-paper">
            来月バンコク4日間、一人で初めて。宿はスクンビットに取った。空港からどう行くか決めてない
          </p>

          <p aria-hidden className="py-4 text-center text-[22px] font-black text-brand">
            ↓
          </p>

          <p className="mb-2 text-[11.5px] font-bold tracking-[0.08em] text-steel">AFTER</p>
          <AfterCard />
        </div>

        <p className="mt-5 text-[12px] leading-[1.8] text-steel">
          ※ 画面の見本です。特定の利用者の記録ではありません。
        </p>
      </Block>

      {/* ══ 4.5 記録が積み上がる ══ */}
      {/* ══════════════════════════════════════════════
          準備の画面は、放っておくと未完了リストになる
          ══════════════════════════════════════════════
          パスポート、保険、eSIM、両替、配車アプリ、空港からの行き方。
          並べるほど、行くのが面倒になる。

          逆にする。済んだことを、時間の順に積む。
          「ここまで来た」が見えるから、残りが怖くなくなる。

          残りの数は数えない。数えると、そこが宿題になる。
          出すのは、済んだ数と、次の1つだけ。

          帰国後の行を必ず入れる。半年後の自分への手紙になるし、
          行ったばかりの人として答えるときの元にもなる。 */}
      <Block>
        <H>
          ここまで来た、が
          <br className="sm:hidden" />
          残っていく。
        </H>
        <p className="mt-4 max-w-[30em] text-[14.5px] leading-[1.9] text-steel">
          やることを並べるのではなく、済んだことを積みます。準備から帰国まで、1本の線でつながります。
        </p>

        <div className="mt-7 max-w-[28em]">
          <TripLog log={DEMO_LOG} />
        </div>

        <p className="mt-5 max-w-[30em] text-[14px] leading-[1.9] text-steel">
          帰ってきてからの1行は、半年後の自分と、次に行く人のために残ります。
        </p>
        <p className="mt-4 text-[12px] leading-[1.8] text-steel">
          ※ 画面の見本です。特定の利用者の記録ではありません。
        </p>
      </Block>

      {/* ══ 5. 続きから ══ */}
      <Block tint>
        <H>
          毎回、最初から
          <br className="sm:hidden" />
          説明しなくていい。
        </H>
        <p className="mt-4 max-w-[30em] text-[14.5px] leading-[1.9] text-steel">
          前回までの流れをタシカメが覚えているので、次は「バンコクのことなんやけど」から始められます。
          ボタンを押せば、AIに渡す文章のほうを作ります。
        </p>

        <div className="mt-7 max-w-[28em]">
          <BriefCard text={TRIP_BRIEF} demo />
          <div className="mt-3 flex min-h-[52px] items-center justify-center gap-2 rounded-pill bg-brand px-6 text-[15px] font-bold text-paper shadow-card">
            この旅についてAIに相談する
          </div>
          <p className="mt-2.5 text-[12px] leading-[1.8] text-steel">
            旅がいくつあっても、それぞれ別に覚えています。
          </p>
        </div>
      </Block>

      {/* ══ 6. 確カメる ══ */}
      {/* 聞けるのは「行ったばかりの人」。在住者でもプロでもない。
          在住者は慣れているので「普通に歩けるよ」と言う。
          それは本当だが、初めて一人で来た人が感じる怖さとは別の話。 */}
      <Block>
        <H>
          AIで決めきれないときだけ、
          <br className="sm:hidden" />
          行った人に確カメる。
        </H>

        <ul className="mt-7 flex max-w-[30em] flex-col gap-2.5">
          {[
            "この宿のエリア、夜ひとりで歩けた？",
            "空港からこの行き方で合ってる？いくらだった？",
            "この値段、どう思う？",
            "初日に一番困ったことって何だった？",
          ].map((t) => (
            <li
              key={t}
              className="rounded-card rounded-br-[4px] border border-line bg-paper px-4 py-3.5 text-[14.5px] font-bold leading-[1.75] text-slate shadow-card"
            >
              {t}
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-[30em] text-[14px] leading-[1.9] text-steel">
          正解をもらうためではなく、判断の材料を1つ増やすためです。返ってくるのは「実際どうだったか」だけ。
        </p>

        {/* 誰が答えるのかを、ここで言い切る。
            「経験者」だと、在住者もプロも入ってしまう */}
        <div className="mt-5 max-w-[30em] rounded-soft bg-mist px-4 py-3.5">
          <p className="text-[12px] font-black text-steel">聞ける相手</p>
          <p className="mt-1.5 text-[13.5px] font-bold leading-[1.8] text-slate">{advisorRule()}</p>
          <p className="mt-2.5 text-[12px] leading-[1.8] text-steel">
            絞り込み：都市 ／ 帰国から{FRESH_DAYS}日以内 ／ 同性にだけ聞く
          </p>
        </div>

        {notYetNote() && (
          <p className="mt-4 max-w-[30em] text-[12.5px] leading-[1.85] text-steel">{notYetNote()}</p>
        )}
      </Block>

      {/* ══ 7. 答える側にもなれる ══ */}
      {/* ここが供給そのもの。
          聞ける人がいなければ、6節は空手形になる。
          旅が終わった人が、次の人の答えになる。 */}
      <Block tint>
        <H>
          旅が終わったら、
          <br className="sm:hidden" />
          答える側にもなれる。
        </H>
        <p className="mt-4 max-w-[30em] text-[14.5px] leading-[1.9] text-steel">
          帰ってきてから{FRESH_DAYS}日のあいだ、同じ都市へ行く人の質問に答えられます。匿名のまま、任意です。
        </p>

        <ul className="mt-6 flex max-w-[30em] flex-col gap-2">
          {[
            "答えると、次の旅パスが安くなります（換金はできません）",
            "答えた回数と都市は「旅歴」として残ります",
            "名前も連絡先も渡しません。直接つながる仕組みもありません",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2.5 text-[14px] leading-[1.85] text-steel">
              <span aria-hidden className="mt-[3px] shrink-0 text-[11px] font-black text-brand">
                ＋
              </span>
              <span className="min-w-0">{t}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/answerers"
          className="mt-6 inline-flex min-h-[50px] items-center justify-center rounded-pill border border-brand bg-paper px-6 text-[14.5px] font-bold text-brand"
        >
          答える側について <span aria-hidden className="ml-1.5">&rarr;</span>
        </Link>
      </Block>

      {/* ══ 8. 3つの持ち場 ══ */}
      {/* このページで唯一、暗い面にしている節。
          考え方そのものなので、ここが芯だと分かる場所にする。 */}
      <Block dark>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          {[
            { who: "AI", can: "考える" },
            { who: advisorWord(), can: "確カメる" },
            { who: NAME, can: "その続き全部を覚えておく", ours: true },
          ].map((x) => (
            <div
              key={x.who}
              className={`flex-1 rounded-card p-5 ${
                x.ours ? "bg-paper" : "border border-paper/20 bg-paper/5"
              }`}
            >
              <p className={`text-[12px] font-black ${x.ours ? "text-brand" : "text-brand-tint"}`}>
                {x.who}
              </p>
              <p
                className={`mt-1.5 text-[17px] font-black leading-[1.45] ${
                  x.ours ? "text-slate" : "text-paper"
                }`}
              >
                {x.can}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-huge font-black text-paper">
          {TRIAD_LINES.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </Block>

      {/* ══ 9. やらないこと ══ */}
      <Block>
        <H>
          {NAME}は、
          <br className="sm:hidden" />
          旅の何でも屋
          <br className="sm:hidden" />
          ではありません。
        </H>

        {/* 言葉そのものは voice.ts が持つ（NOT_OURS）。
            ここに直書きすると、「格安」を探している判定が捕まえる。
            否定の文なのかどうかは、機械には見分けられない。 */}
        <ul className="mt-6 flex flex-wrap gap-2">
          {NOT_OURS.map(
            (t) => (
              <li
                key={t}
                className="flex items-center gap-1.5 rounded-pill border border-line bg-paper px-3.5 py-2 text-[13px] font-bold text-steel"
              >
                <span aria-hidden className="text-[12px]">
                  ×
                </span>
                {t}
              </li>
            ),
          )}
        </ul>

        <p className="mt-7 max-w-[30em] text-[16px] font-black leading-[1.85] text-slate">
          行くと決めたあとの、記憶・判断・次の行動。
          <br className="sm:hidden" />
          そこに集中します。
        </p>
      </Block>

      {/* ══ 10. 料金 ══ */}
      {/* 旅パスをいちばん上に。月額をやめた理由は lib/pass/trip.ts。
          旅は終わるものなので、終わる値段を付ける。 */}
      <Block tint id="price">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <H>旅パス</H>
          {!passEnabled && (
            <span className="rounded-pill bg-paper px-2.5 py-1 text-[10.5px] font-bold text-steel">
              受付前
            </span>
          )}
        </div>
        <p className="mt-2 text-[19px] font-black leading-[1.55] text-slate sm:text-[21px]">
          旅1回ぶん。終わったら、終わる。
        </p>

        <div className="mt-7 max-w-[30em] rounded-card border-2 border-brand bg-paper p-5 shadow-card sm:p-6">
          <p className="text-[13px] font-black text-steel">1つの旅</p>
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

        <div className="mt-6 max-w-[22em]">
          <Link
            href="/koi"
            className="flex min-h-[56px] w-full items-center justify-center rounded-pill bg-brand px-8 text-[16.5px] font-bold text-paper shadow-card"
          >
            {CTA} <span aria-hidden className="ml-2">&rarr;</span>
          </Link>
          <p className="mt-2 text-[12px] leading-[1.7] text-steel">{CTA_NOTE}</p>
        </div>

        {/* 年パス。無理に推さない。
            年に4回も海外へ一人で行く人は、もうこの製品の対象ではない */}
        <div className="mt-7 max-w-[30em] rounded-soft border border-line bg-paper px-4 py-3.5">
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

        <p className="mt-5 text-[12px] leading-[1.85] text-steel">
          税込。
          <Link
            href="/plans"
            className="ml-1 font-bold text-brand underline decoration-line underline-offset-4"
          >
            都度のお支払いと、キャンセル・返金について
          </Link>
        </p>
        {notYetNote() && <p className="mt-2 text-[12px] leading-[1.85] text-steel">{notYetNote()}</p>}
      </Block>

      {/* ══ 11. よくある質問 ══ */}
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
              {f.safety && <Safety />}
            </details>
          ))}
        </div>
      </Block>

      {/* ══ 12. 最後 ══ */}
      <section className="bg-paper">
        <Wrap className="pb-12 pt-4 sm:pb-20">
          <div className="relative overflow-hidden rounded-card bg-brand p-7 text-paper shadow-card sm:p-12">
            <Tashikame
              size={104}
              className="pointer-events-none absolute -bottom-3 -right-3 sm:!h-[168px] sm:!w-[168px]"
            />
            <p className="relative text-big font-black leading-[1.5]">
              もう、ひとりで
              <br />
              全部覚えなくていい。
            </p>
            <p className="relative mt-4 max-w-[26em] text-[15.5px] font-bold leading-[1.9]">
              {TRIAD_LINES.join("")}
            </p>
            <div className="mt-7">
              <Link
                href="/koi"
                className="flex min-h-[60px] w-full items-center justify-center rounded-pill bg-paper px-9 text-[16.5px] font-bold text-brand-deep sm:w-auto"
              >
                {CTA} <span aria-hidden className="ml-2">→</span>
              </Link>
              <p className="mt-2.5 text-[12.5px] leading-[1.7] text-paper/90">{CTA_NOTE}</p>
            </div>
          </div>
        </Wrap>
      </section>

      <TashikameGuide />

      {/* ══ フッター ══ */}
      <footer className="border-t border-line bg-paper">
        <Wrap className="py-7 sm:py-8">
          <div className="flex flex-col gap-2.5 text-[11.5px] leading-[1.7] text-steel sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p className="min-w-0">{site.company.name}</p>
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {[
                ["/legal", "特定商取引法に基づく表記"],
                ["/terms", "利用規約"],
                ["/privacy", "プライバシー"],
                ["/articles", "たしかメディア"],
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
