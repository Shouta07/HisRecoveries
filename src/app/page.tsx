import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { openPlanIds } from "@/lib/call/gate";
import { ENTRY_PLAN } from "@/lib/ask/plans";
import FamilyCards from "@/components/brand/FamilyCards";
import KoiFace from "@/components/koi/KoiFace";
import BriefCard from "@/components/koi/BriefCard";
import { DEMO_BRIEF } from "@/lib/koi/briefDemo";
import { heroSubLines } from "@/lib/koi/gate";
import { passEnabled } from "@/lib/stripe";
import { INCLUDED, HUMAN_PER_MONTH } from "@/lib/pass/entitle";
import PriceChooser from "@/components/pass/PriceChooser";
import { PERIODS, perMonth, perksFor } from "@/lib/pass/periods";
import { FREE_PEOPLE, FREE_RECORDS } from "@/lib/pass/free";
import { PAYWALL_NAME, PAYWALL_HEAD, MANAGE_NOTE } from "@/lib/pass/copy";
import { advisorWord, notYetNote } from "@/lib/who";
import { HERO_A, HERO_B1, HERO_B2, NAME, DEFINITION, HERO_HOW, TAGLINE, TAB_TITLE, TRIAD, TRIAD_LINES } from "@/lib/voice";
import Reveal from "@/components/brand/Reveal";
import PlanCta from "@/components/brand/PlanCta";
import Mark from "@/components/brand/Mark";
import Tashikame from "@/components/brand/Tashikame";
import TashikameGuide from "@/components/brand/TashikameGuide";
import MenuButton from "@/components/brand/MenuButton";
import Slot from "@/components/brand/Slot";
import { KNOWN_APPS } from "@/lib/koi/board";
import HeroDashboard from "@/components/koi/HeroDashboard";

// ══════════════════════════════════════════════════════════════
// トップページ。
//
// ══════════════════════════════════════════════════════════════
// 売っているのは「マッチした後」だけ
// ══════════════════════════════════════════════════════════════
// マッチングアプリには、ふたつ別の困りごとがある。
//
//   マッチしない          → 答えられない。やらない
//   マッチした後で止まる  → これが本題
//
// 前者に手を広げると、いいね攻略・足あと・プロフ添削・アプリ選びまで
// 付いてきて、どれも中途半端になる。
// 看板（マチアプは、マッチしてからが勝負。）が、その線そのもの。
//
// ══════════════════════════════════════════════════════════════
// 買う人は、できている人
// ══════════════════════════════════════════════════════════════
// マッチも、メッセージも、LINE交換も、電話も、デートもできる人。
// 足りないのは能力ではなく、同時に3人4人を抱えたときの置き場。
//
//   Aさんに何送ったっけ
//   Bさんとは電話した？
//   Cさん、次いつ会う？
//   ChatGPTに前回何相談した？
//
// 疲れているのは恋愛にではなく、判断と記憶に。
// だから「恋愛相談」を売らない。売るのは
// 「マッチ後を、ひとりで全部覚えて考えなくていい状態」。
//
// ══════════════════════════════════════════════════════════════
// 読めば分かる、ではなく、見れば分かる
// ══════════════════════════════════════════════════════════════
// 前のトップは、同じ価値を言い換えて何度も説明していた。
//   話したら1枚になって返る／相談して終わりじゃない／
//   AIと人とタシカメの役割／友達との違い
// どれも中身は1つ。「覚えておく場所がある」。
//
// 1節1メッセージにして、説明の代わりに画面そのものを出す。
// 文章を足したくなったら、たぶんその節は要らない。
//
// ══════════════════════════════════════════════════════════════
// 構成（スマホで上から）
// ══════════════════════════════════════════════════════════════
//    1  マチアプは、マッチしてからが勝負。（＋ 実際の画面）
//    2  マッチした瞬間から、考えることが増えていく。（ひとりの話）
//    3  話す。貼る。次が決まる。
//    4  話した1行が、こうなる。
//    5  毎回、最初から説明しなくていい。
//    6  AIで決めきれないときだけ、人に確カメる。
//    7  AIで考える。迷ったら、人に確カメる。その続きは、タシカメが覚えてる。
//    8  タシカメは、恋愛の何でも屋ではありません。
//    9  Tashikame Pass
//   10  よくある質問
//   11  もう、ひとりで全部覚えなくていい。
//
// 2 は箇条書きではなく、ひとりの男性の話にしてある。
// 「これ俺やん」と思わなかった人は、この製品を買わない。
// そこがこのページでいちばん大事な節。
//
// 料金は後ろに置く。何が残るのかを見る前に金額が出ると、
// 「高い／安い」の話から始まってしまう。
// ══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  // タブに出るのは店名。住所（tashikame.app）とは別
  title: { absolute: TAB_TITLE },
  /* 検索結果に出る説明。
     DEFINITION（何をする場所か）＋ HERO_HOW（何を渡すと何が返るか）。 */
  description: `${DEFINITION}${HERO_HOW}`,
  alternates: { canonical: site.url },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: NAME,
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
  ["#price", "料金とプラン"],
] as const;

/* 押す場所の文言。ページ全部でこれ1つ。
   場所ごとに言い方が変わると、同じ所に着くことが分からない。

   「無料で整理する」から変えた。
   整理は、まだ使っていない人には何をされるのか分からない動詞。
   最初の一歩の重さだけを言う。 */
const CTA = "無料で始める";
const CTA_NOTE = `${FREE_PEOPLE}人・${FREE_RECORDS}記録まで無料。登録はありません。`;

/* よくある質問。
   前は9つあった。6つに絞る。

   外したのは、ほかの節が答えているもの。
     どうやって進みますか        → 3（AIで話す。貼る。次が決まる。）
     何人まで登録できますか      → 9（無料とPassの区切り）
     友達と何が違いますか        → 友達の節ごと畳んだ

   残すのは、節では答えていない6つ。 */
const FAQ: { q: string; a: string; safety?: boolean }[] = [
  {
    q: "ChatGPTを使っていても、必要ですか？",
    a: "ChatGPTはそのまま使ってください。倒しにいっていません。足りないのは、話したことが残らないところです。次に相談するとき、また最初から説明することになります。タシカメは、相手ごとに「どこまで進んでいて、次に何をするか」を覚えておく側です。",
  },
  {
    q: "複数のマッチングアプリでも使えますか？",
    a: "そのための形にしてあります。with・Pairs・タップルなど、どこで出会ったかを相手ごとに持つので、アプリをまたいで1つの一覧になります。アプリごとに見比べる必要はありません。",
  },
  {
    q: "無料では何ができますか？",
    a: `${FREE_PEOPLE}人・${FREE_RECORDS}記録まで、そのまま使えます。貼って整理して、次にやることが残るところまでです。登録もお支払いもありません。相手が増えてきたら Tashikame Pass です。`,
  },
  {
    q: `実在する${advisorWord()}には、何を聞けますか？`,
    a: `「これを送ったら、実際どう受け取られるか」です。このLINEどう感じる、この誘い方どう見える、この写真どう、デート後のこの状況どう見える。AIの予測では埋まらないところだけ、人に回ります。Pass に月${HUMAN_PER_MONTH}回ぶん含まれています。`,
  },
  {
    q: "相談した内容は、相手に知られませんか？",
    a: `知られません。相手の名前・写真・連絡先は保存していません。電話番号やアカウント名が会話に出てきても、こちらに届く前に伏せ字にします。答えてくれた${advisorWord()}とあなたが直接つながる仕組みも、作っていません。`,
    safety: true,
  },
  {
    /* ══════════════════════════════════════════════
       聞かれる前に、ここで答える
       ══════════════════════════════════════════════
       1画面目から断りを外したので、
       「女性は使えないのか」の答えが要る場所はここになる。

       謝らない。順番の話として書く。
       実際、恋亀と記録のほうは性別で変わらない。
       変わるのは確カメる（回答者が女性だけ）の1つ。 */
    q: "女性も使えますか？",
    a: `${notYetNote() ?? "男女どちらの方にもお使いいただけます。"}まずは一方に絞って、使う人の近くで作り込んでいます。順番の話で、どちらが大事ということではありません。`,
  },
  {
    q: "解約はいつでもできますか？",
    a: "会員ページから、こちらに連絡しなくても解約できます。解約したあとも、お支払い済みの期間の終わりまでは使えます。期間が決まっているプラン（3か月・6か月・12か月）の月払いは、途中でやめても残りのご請求は止まりません。",
  },
];

/**
 * 安心・安全。「知られませんか？」の中で開く。
 *
 * 節として独立させていたが、並べた6つは全部その質問への答えだった。
 * 同じ答えを2か所に置くと、どちらも読まれない。
 */
function Safety() {
  return (
    <div className="px-4 pb-5 sm:px-5">
      <ul className="grid gap-2 sm:grid-cols-2">
        {[
          "匿名で使えます。名前もメールアドレスも要りません",
          "相手の名前・連絡先は保存しません",
          "送る前に、個人情報は自動で伏せます",
          `答えてくれた${advisorWord()}と直接つながる仕組みはありません`,
          `年齢と立場を確認した${advisorWord()}だけが見ます`,
          "18歳未満に関する相談はお受けしていません",
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
  /**
   * 暗い面。
   *
   * 白と淡い青だけで最後まで進むと、どの節も同じ強さに見える。
   * 1か所だけ暗い面を置いて、ここが芯だと分かる場所を作る。
   * 2か所にすると、どちらも芯に見えなくなる。
   */
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

/** 英字の小見出し。日本語の見出しの上に、小さく添えるだけ */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11.5px] font-bold tracking-[0.14em] text-steel">{children}</p>;
}

/**
 * 節の見出し。
 *
 * 全部これで出す。節ごとに大きさが違うと、
 * どれがいちばん大事なのか分からなくなる。
 *
 * ── 飾り（Flourish）を外した ──────────────────
 * 見出しの最後に、小さな斜線の飾りを添えていた。
 * 1行の見出しでは効いていたが、携帯だと見出しは2〜3行になる。
 * 「最初から説明しなくていい。」のあと、飾りだけが4行目に落ちていた。
 *
 * 行の折れ方は見出しごとに変わるので、こちらで直せない。
 * 文字だけにする。
 */
function H({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    // 全部スクロールで読むページなので、節の頭で1回だけ動かす。
    // 派手にしない。上に10px、それだけ（Reveal が持っている）。
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
        <span className="text-[17px] font-black text-slate">Aさん</span>
        <span className="rounded-pill bg-mist px-2 py-0.5 text-[10.5px] font-bold text-steel">
          with
        </span>
        <span className="text-[12.5px] font-bold text-steel">2回目デート後</span>
      </div>

      <div className="mt-3.5 flex items-start gap-2 border-t border-line pt-3.5">
        <span aria-hidden className="mt-[2px] shrink-0 text-[10px] font-black tracking-wide text-brand">
          NEXT
        </span>
        <span className="min-w-0 flex-1 text-[15px] font-bold leading-[1.6] text-slate">
          水族館の日程を決める
        </span>
      </div>

      {/* 状態と、次の予定。
          「次の予定 未定」を隠さない。埋まっていないことも結果 */}
      {/* 「次の予定 未定」も出していたが、外した。
          NEXT と状態が決まっていれば、見本としては足りる。
          行が1本減ると、この1組が1画面に収まる。
          実際の画面では、分かっているときだけ出している。 */}
      <dl className="mt-3 flex flex-col gap-1.5 text-[12.5px] leading-[1.7]">
        {[["状態", "自分から動く"]].map(([k, v]) => (
          <div key={k} className="flex gap-3">
            <dt className="w-[4.5em] shrink-0 text-steel">{k}</dt>
            <dd className="min-w-0 font-bold text-slate">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default async function HomePage() {
  /* おすすめのプラン。先着の特典は、ここに付くぶんを出す
     （期間が短いものには、原価のかかる特典が付かない） */
  const best = PERIODS.find((p) => p.best) ?? PERIODS[0];
  const perks = perksFor(best);

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
          {/* 上から「マチアプ恋愛に迷ったら、／タシカメ」と読ませる。
              2行で1つの文になるので、標語の側に名前は入れない。
              320px では標語を出さない（12文字がどう詰めても入らない）。 */}
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
            {/* ずっと出ている押す場所。header が sticky なので、
                下まで読んでも常に出ている。下に別の固定バーは足さない
                （携帯でヘッダーとバーの両方が居座ると、読む所が狭くなる）。 */}
            <Link
              href="/koi"
              className="inline-flex min-h-[42px] shrink-0 items-center justify-center whitespace-nowrap rounded-pill bg-brand px-3.5 text-[13px] font-bold text-paper shadow-card sm:px-5 sm:text-[13.5px]"
            >
              {CTA}
            </Link>
            {/* フッターを外したので、ほかの面への行き先はここに畳んである */}
            <MenuButton />
          </nav>
        </Wrap>
      </header>

      {/* ══ 1. ファーストビュー ══ */}
      {/* ══════════════════════════════════════════════
          最初の1行で、どこを取る製品かを言う
          ══════════════════════════════════════════════
          「マチアプは、マッチしてからが勝負。」

          これは読む人の困りごとではなく、こちらの立場。
          マッチ率・いいね・足あとはやらない、と同時に言っている。

          困りごと（誰に何したか分からない）は次の節が持つ。
          1行目でそれを言うと、読む人を「物忘れする人」にしてしまう。
          買うのは、マッチもデートも自力でできている人。

          説明は3行で止める。4行目から先は、画面が言う。 */}
      <section className="relative overflow-hidden bg-sky">
        <Wrap className="pb-2 pt-4 sm:pt-7">
          <h1 className="text-mega font-black text-slate">
            {/* 携帯（390px・30px）で全角11字が上限。
                HERO_B は11字あるので、360px 以下で折れる。
                折る場所をこちらで決めて、「勝負。」を独立させる。 */}
            {HERO_A}
            <br />
            {HERO_B1}
            <br />
            {/* 下線は最後の行だけ。2行にまたがると汚い。

                前は帯に -z-10 を当てて、文字の後ろへ送っていた。
                この節は bg-sky を持つので、負の z-index は
                節の背景より後ろへ回り込んで、帯ごと見えなくなっていた。
                帯を先に描いて、文字を relative で上に載せる。 */}
            <span className="relative inline-block">
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-[0.06em] h-[0.4em] rounded-[2px] bg-brand/25"
              />
              <span className="relative">{HERO_B2}</span>
            </span>
          </h1>

          {/* 何をする場所かを1行。
              恋亀と話せるかどうかで中身が変わる（lib/koi/gate.ts）。
              手で書き換えないので、入れ忘れ・戻し忘れが起きない。 */}
          {/* 誰に向けた製品かを、ここで名乗る。
              行ごとに出す。長さ・折る場所は lib/koi/gate.ts が持つ
              （携帯で最後の1字だけが落ちるのを、字数のほうで止めている）。 */}
          <p className="mt-3 text-[18px] font-black leading-[1.5] text-brand sm:text-[20px]">
            {heroSubLines.map((line, i) => (
              <span key={line} className="block">
                {line}
                {i < heroSubLines.length - 1 && <span className="sr-only"> </span>}
              </span>
            ))}
          </p>

          {/* 何を渡すと、何が残るか。1画面目に要るのはこの1文だけ。
              定義そのもの（DEFINITION）は、検索結果とOGPが持っている。 */}
          <p className="mt-3 max-w-[26em] text-[16px] font-bold leading-[1.7] text-slate sm:max-w-[38em] sm:text-[18px]">
            AIに話した内容を貼るだけで、誰と／どこまで／次に何するか、が残る。
          </p>
          <p className="mt-2 max-w-[26em] text-[14px] leading-[1.85] text-steel sm:max-w-[38em]">
            迷ったら、月{HUMAN_PER_MONTH}回、実在する{advisorWord()}にも確カメられる。
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
                断りを、1画面目から下へ移した
                ══════════════════════════════════════════
                ここには「いま確カメるをお使いいただけるのは、
                男性の方のみです。女性の方向けは…」の2行を置いていた。

                押す場所の真下で、いちばん目に入るのが断りだった。
                そして来た男性にとっては、1行も自分の話ではない。

                2行目で「男性のマチアプ恋愛を、」と名乗るようにしたので、
                誰に向けた製品かは、断る前に分かる。
                断りそのものは、よくある質問とフッターに置いた
                （買う場所にも1行だけ残してある）。

                両方の向きが開いたら、ひとりでに消える。 */}

            {/* 自分のアプリが入っているかは、文字で「複数アプリ」と
                書いても分からない。名前を並べる。
                名前は lib/koi/board.ts から引く（受け取れる名前と
                ここに出す名前がずれないように）。
                ロゴは置かない。他社の商標なので許諾が要る。 */}
            <div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              {KNOWN_APPS.map((a) => (
                <span
                  key={a}
                  className="rounded-pill border border-line bg-paper px-2.5 py-1 text-[11.5px] font-bold text-steel"
                >
                  {a}
                </span>
              ))}
              <span className="text-[11.5px] text-steel">そのほかのアプリにも対応</span>
            </div>
          </div>
        </Wrap>

        {/* ══════════════════════════════════════════════
            説明より先に、使った状態を見せる
            ══════════════════════════════════════════════
            1画面目のすぐ下に、実際の画面（相手の一覧）を出す。
            複数のアプリ、複数の相手、それぞれの次の一手。

            5秒で「何をする場所か」が分かるのは、言葉よりこちら。
            顔写真は使わない。Aさん・Bさん・Cさんで足りる
            （出した時点で、実在しない誰かの名簿になる）。 */}
        <div className="mt-7 pb-10 sm:pb-14">
          <HeroDashboard />
        </div>
      </section>

      {/* ══ 2. ペインストーリー ══ */}
      {/* ══════════════════════════════════════════════
          箇条書きをやめて、ひとりの話にした
          ══════════════════════════════════════════════
          ここは「Aさん、前回何話した？」のような札を4枚
          並べていた。言っていることは合っているが、
          読む人は札を見ているだけで、自分の話だと思わない。

          ひとりの男性の、実際に起きる順番で書く。
            3人と並行している（アプリ名入り）
            最初は楽しい
            人数が増えると、思い出せないことが増える
            開くたびに、最初から説明し直す
            返信を考える・誘う時期を考える・動くか待つか考える
            そして、また次の人

          「これ俺やん」と思わせるのが、この節の全部。
          思わなかった人は、この製品を買わない。

          ── 疲れの名前を、最後に置く ──────────────
          先に「判断疲れ」と名前を付けると、
          読む人は自分の体験を思い出す前に、言葉で納得してしまう。
          思い出させてから、名前を付ける。 */}
      <Block>
        <H>
          マッチした瞬間から、
          <br className="sm:hidden" />
          考えることが増えていく。
        </H>

        {/* 悩んでいる絵。
            1画面目は「何をする場所か」を見せる場所で、
            「それが自分のことだ」と思わせるのはこちらの節。 */}
        <div className="relative mt-7 overflow-hidden rounded-card shadow-card">
          <Slot name="hero" rounded="" position="center 14%" className="h-[150px] w-full sm:h-[210px]" />
        </div>
        <p className="mt-2 text-[11px] leading-[1.7] text-steel">※ 写真はイメージです。</p>

        {/* ── いま、3人と並行している ───────────────
            アプリ名を出す。「複数人」と書くより、
            with / Pairs / タップル と並ぶほうが自分の画面に見える。 */}
        <ul className="mt-8 flex max-w-[30em] flex-col gap-1.5">
          {[
            ["with", "Aさんとマッチ。"],
            ["Pairs", "Bさんとやりとり中。"],
            ["タップル", "Cさんとは、土曜に初デート。"],
          ].map(([app, say]) => (
            <li key={app} className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <span className="rounded-pill bg-mist px-2 py-0.5 text-[11px] font-bold text-steel">
                {app}
              </span>
              <span className="text-[15px] font-bold leading-[1.8] text-slate">{say}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-[30em] text-[15px] leading-[1.9] text-steel">
          最初は、楽しい。
          <br />
          でも人数が増えると、こうなる。
        </p>

        {/* ── 思い出せないこと ──────────────────────
            口に出るときの言い方そのままにする。
            「記憶の負担」と書いた瞬間に、他人の話になる。 */}
        <ul className="mt-5 flex max-w-[26em] flex-col gap-2">
          {[
            "Aさん、昨日なんの話したっけ？",
            "Bさん、もう電話誘った？",
            "Cさん、店まだ決めてない。",
          ].map((t) => (
            <li
              key={t}
              className="rounded-card rounded-bl-[4px] bg-mist px-4 py-3 text-[15px] font-bold leading-[1.7] text-slate"
            >
              {t}
            </li>
          ))}
        </ul>

        {/* ── 開くたびに、説明し直す ────────────────
            ここがいちばん効く。3つ開いて、3回同じことを言う。
            短い行を重ねて、繰り返している感じを出す。 */}
        <div className="mt-8 max-w-[30em]">
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-[15px] font-bold leading-[1.9] text-slate">
            <span>LINEを開く。</span>
            <span>アプリを開く。</span>
            <span>ChatGPTを開く。</span>
          </p>
          <p className="mt-3 text-[14.5px] leading-[1.95] text-steel">
            そのたびに、
            <br />
            「この人とはこういう状況で、前回こうなって……」
            <br />
            を、最初から説明する。
          </p>
        </div>

        {/* ── そして、また次の人 ────────────────────
            考えることを3つ並べて、最後に「また次の人」で畳む。
            終わらないことが伝わればよい。 */}
        <div className="mt-7 max-w-[30em] border-l-2 border-line pl-4">
          <p className="text-[14.5px] leading-[2.05] text-steel">
            返信を考える。
            <br />
            誘うタイミングを考える。
            <br />
            今日は動くのか、待つのか考える。
          </p>
          <p className="mt-2.5 text-[14.5px] font-bold leading-[1.9] text-slate">
            そして、また次の人。
          </p>
        </div>

        <p className="mt-9 max-w-[30em] text-[19px] font-black leading-[1.75] text-slate sm:text-[22px]">
          恋愛に疲れてるというより、
          <br />
          判断と記憶に疲れてる。
        </p>
      </Block>

      {/* ══ 3. HOW IT WORKS ══ */}
      {/* 「ChatGPTで話して、貼ってください」と文で書くと手間が多そうに読める。
          実際は3つしかない。数を先に見せる。
          3つ目は本人がやることではないので、そこも伝わる。 */}
      <Block tint id="how">
        {/* ── 前の節からの、受け ──────────────────────
            ペインストーリーの直後なので、答えを先に1行で言う。
            「頭の中だけで管理しない」が、この製品のやること全部。 */}
        <p className="text-[17px] font-black leading-[1.75] text-brand sm:text-[19px]">
          だから、マッチ後を
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
            [
              "1",
              "AIに話す",
              "ChatGPT Voice がおすすめ。文章でも、Claude や Gemini でも大丈夫です。",
            ],
            [
              "2",
              "タシカメに貼る",
              "相談の結果を、そのまま貼るだけ。入力フォームはありません。",
            ],
            [
              "3",
              "次が残る",
              "誰と／どこまで／次に何するか、が相手ごとに整理されます。ここは何もしません。",
            ],
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
      {/* ══════════════════════════════════════════════
          変換そのものが商品
          ══════════════════════════════════════════════
          言葉で説明するより、入れたものと出てくるものを並べたほうが早い。
          この1組で値段の理由まで伝わるので、大きく出す。

          After 側に「次の予定 未定」を残す。
          埋まっていないことも結果なので、こちらで埋めない。 */}
      <Block>
        <H>
          話した1行が、
          <br className="sm:hidden" />
          こうなる。
        </H>

        <div className="mt-7 max-w-[28em]">
          <p className="text-[11.5px] font-bold tracking-[0.08em] text-steel">BEFORE</p>
          <p className="mt-2 rounded-card rounded-bl-[4px] bg-brand px-4 py-3.5 text-[14.5px] font-bold leading-[1.8] text-paper">
            昨日Aさんと2回目会って、向こうから水族館行きたいって言われた
          </p>

          <p aria-hidden className="py-4 text-center text-[22px] font-black text-brand">
            ↓
          </p>

          <p className="mb-2 text-[11.5px] font-bold tracking-[0.08em] text-steel">AFTER</p>
          <AfterCard />
        </div>

        <p className="mt-5 text-[12px] leading-[1.8] text-steel">
          ※ 画面の見本です。特定の利用者のやりとりではありません。
        </p>
      </Block>

      {/* ══ 5. 継続価値 ══ */}
      {/* ══════════════════════════════════════════════
          ChatGPTの履歴やメモとの差は、ここにしかない
          ══════════════════════════════════════════════
          「前回の続きから相談できます」と書いても、どう続くのか分からない。
          渡す文章そのものを出す。これを見れば、毎回いちから
          説明しなくて済む理由が1秒で分かる。

          文章は lib/koi/brief.ts が作る。実際に出るものと同じ。
          隠して渡すこともできるが、そうすると何が外へ出るのか
          分からないまま貼ることになる。恋愛の話なので、そこは見えていること。 */}
      <Block tint>
        <H>
          毎回、最初から
          <br className="sm:hidden" />
          説明しなくていい。
        </H>
        <p className="mt-4 max-w-[30em] text-[14.5px] leading-[1.9] text-steel">
          前回までの流れをタシカメが覚えているので、次は「Aさんなんやけど」から始められます。
          ボタンを押せば、AIに渡す文章のほうを作ります。
        </p>

        <div className="mt-7 max-w-[28em]">
          <BriefCard text={DEMO_BRIEF} demo />
          {/* 押せる形を見せる。これが相手の画面にある場所 */}
          <div className="mt-3 flex min-h-[52px] items-center justify-center gap-2 rounded-pill bg-brand px-6 text-[15px] font-bold text-paper shadow-card">
            <KoiFace size={24} alive={false} />
            AさんについてAIに相談する
          </div>
          <p className="mt-2.5 text-[12px] leading-[1.8] text-steel">
            相手が何人いても、それぞれ別に覚えています。
          </p>
        </div>
      </Block>

      {/* ══ 6. 実在する異性 ══ */}
      {/* ══════════════════════════════════════════════
          押し売りにしない
          ══════════════════════════════════════════════
          強いので大きく立てたくなるが、立てると
          「異性に相談するサービス」に見えて、月額の理由がぼける。

          出すのは、聞ける質問の形だけ。
          顔も、人数も、返ってきた文の見本も出さない。
          出した時点で、実在しない誰かの回答を見せることになる
          （審査を通った人が入ったら、そのとき実物を出す）。 */}
      <Block>
        {/* 携帯だと「AIで決めきれないところだけ、」が14字あって、
            「け、」だけが2行目に落ちていた。
            text-huge は 26px。360px の本文幅は 320px なので、
            どの行も全角12字までにする。 */}
        <H>
          AIで決めきれない
          <br className="sm:hidden" />
          ときだけ、人に確カメる。
        </H>

        <ul className="mt-7 flex max-w-[30em] flex-col gap-2.5">
          {[
            "このLINE、実際どう感じる？",
            "この誘い方、自然？",
            "この写真、どう見える？",
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
          AIの予測ではなく、受け取る側に立つ人が、実際にどう感じたかが返ります。
          正解をもらうためではなく、判断の材料を1つ増やすためです。
        </p>
        <p className="mt-4 max-w-[30em] text-[16px] font-black leading-[1.7] text-slate">
          月{HUMAN_PER_MONTH}回、実在する{advisorWord()}に確カメられる。
        </p>

        <Link
          href="/trial"
          className="mt-6 inline-flex min-h-[50px] items-center justify-center rounded-pill border border-brand bg-paper px-6 text-[14.5px] font-bold text-brand"
        >
          {advisorWord()}に読んでもらう <span aria-hidden className="ml-1.5">&rarr;</span>
        </Link>
      </Block>

      {/* ══ 7. 役割分担 ══ */}
      {/* ══════════════════════════════════════════════
          ChatGPT を倒しにいかない
          ══════════════════════════════════════════════
          2枚（AI / タシカメ）で並べると、どうしても
          「どちらが優れているか」に読める。実際は競っていない。

          3つに分けて、それぞれの持ち場だけ書く。
          AIも人も下に置かない。「ここだけ埋まっていない」が伝わればよい。

          このページで唯一、暗い面にしている節。
          考え方そのものなので、ここが芯だと分かる場所にする。 */}
      <Block dark>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          {/* ── 並べる順番を、使う人の動きに合わせた ────
              前は AI ／ タシカメ ／ 人 の順で、タシカメが真ん中だった。
              並列に見えて、3つのうちの1つになっていた。

              実際の動きは AI → 人 → そのあと。
              タシカメは最後。AIにも人にも無いのは「そのあと」のほう。 */}
          {[
            { who: "AI", can: "考える" },
            { who: `実在する${advisorWord()}`, can: "確カメる" },
            { who: NAME, can: "その続き全部を覚えておく", ours: true },
          ].map((x) => (
            <div
              key={x.who}
              className={`flex-1 rounded-card p-5 ${
                x.ours ? "bg-paper" : "border border-paper/20 bg-paper/5"
              }`}
            >
              <p
                className={`text-[12px] font-black ${x.ours ? "text-brand" : "text-brand-tint"}`}
              >
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

        {/* 3つの持ち場を1つの文にしたもの。
            折る場所と中身は lib/voice.ts が持つ（TRIAD_LINES）。
            ここと最後の節で同じものを出すので、書き分けない。 */}
        <p className="mt-8 text-huge font-black text-paper">
          {TRIAD_LINES.map((line, i) => (
            <span key={line} className="block">
              {line}
              {i < TRIAD_LINES.length - 1 && <span className="sr-only"> </span>}
            </span>
          ))}
        </p>
      </Block>

      {/* ══ 8. やらないこと ══ */}
      {/* ══════════════════════════════════════════════
          広げないと決めたことを、客に先に言う
          ══════════════════════════════════════════════
          マッチ率・いいね攻略・アプリ選び・高額コンサル・担当制コーチング。
          どれも売れるが、どれも中途半端になる。

          書いておくと、答えられない人を呼ばなくて済む。
          そして、ここを読んだ人には「何屋なのか」がもう一度はっきりする。
          長くしない。3行で足りる。 */}
      <Block>
        <H>
          {NAME}は、
          <br className="sm:hidden" />
          恋愛の何でも屋
          <br className="sm:hidden" />
          ではありません。
        </H>

        {/* 札（グレーの箱）を3枚並べていた。
            やらないことに箱を使うと、やることと同じ重さに見える。
            行だけにして、高さを 1/3 にした。 */}
        <ul className="mt-6 flex max-w-[32em] flex-col gap-1.5">
          {[
            "マッチ率やいいねを増やすサービスではありません",
            "脈あり判定も、相手を動かす駆け引きもありません",
            "高額な恋愛コンサルでも、AIチャットの置き換えでもありません",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2.5 text-[14px] leading-[1.85] text-steel">
              <span aria-hidden className="mt-[2px] shrink-0 text-[12px] font-black text-steel">
                ×
              </span>
              <span className="min-w-0">{t}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-[30em] text-[16px] font-black leading-[1.8] text-slate">
          相手を動かすのではなく、
          <br className="sm:hidden" />
          自分の判断をラクにする。
        </p>
        <p className="mt-2.5 max-w-[30em] text-[14px] leading-[1.9] text-steel">
          マッチした後の、記憶・判断・次の行動。そこに集中します。
        </p>
      </Block>

      {/* ══ 9. Tashikame Pass ══ */}
      {/* ══════════════════════════════════════════════
          期間を4枚、並べるだけにした
          ══════════════════════════════════════════════
          ここは期間4つ × 払い方2つを2段で選ばせる作りだった。
          7通りを正しく出せていたが、トップで最初に見る形ではない。
          値段を知りたい人が見たいのは「いくらで、どれが得か」だけ。

          4枚に並べて、月あたりを添える。長いほど安いのが一目で分かる。
          値段は lib/pass/periods.ts から引く（直書きしない）。

          払い方（月払い・◯か月契約の断り）と先着の特典は、
          その下に畳んである。月払いは「いつでも解約」ではないので、
          選ぶ画面には必ず契約期間を出す（PriceChooser が持っている）。

          おすすめは 6か月。複数人が同時に進む長さのほう。 */}
      <Block tint id="price">
        {/* ══════════════════════════════════════════
            商品名を見出しにした
            ══════════════════════════════════════════
            前は商品名を12pxの小さな札にして、
            サブコピー（恋亀に、続きを覚えてもらう。）を
            見出しの大きさで出していた。大小が逆。

            しかもサブコピーは14字あって、携帯だと
            「う。」だけが2行目に落ちていた。
            見出しの大きさで出すものではない。 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <H>{PAYWALL_NAME}</H>
          {!passEnabled && (
            <span className="rounded-pill bg-paper px-2.5 py-1 text-[10.5px] font-bold text-steel">
              受付前
            </span>
          )}
        </div>
        <p className="mt-2 text-[19px] font-black leading-[1.55] text-slate sm:text-[21px]">
          {PAYWALL_HEAD}
        </p>

        {/* ── 携帯でも2列にする ──────────────────────────
            1列に積むと、4枚で携帯の2画面ぶん（約680px）になる。
            値段の比較は、並んでいないと比較にならない。

            2列なら2段で収まり、長いほど月あたりが安いことが
            目で見て分かる。字を少し小さくするだけで入る。 */}
        <ul className="mt-7 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {PERIODS.map((p) => (
            <li
              key={p.months}
              className={`relative rounded-card border bg-paper p-4 shadow-card sm:p-5 ${
                p.best ? "border-2 border-brand" : "border-line"
              }`}
            >
              {p.best && (
                <span className="absolute -top-2.5 left-4 rounded-pill bg-brand px-2.5 py-0.5 text-[10px] font-black text-paper sm:left-5">
                  おすすめ
                </span>
              )}
              <p className="text-[12.5px] font-black text-steel">{p.label}</p>
              <p className="mt-1 text-[21px] font-black leading-none tabular-nums text-slate sm:text-[24px]">
                ¥{p.lump.toLocaleString()}
              </p>
              {/* 1か月は、月あたりが総額と同じ。書くと同じ数字が2回出る */}
              {p.months > 1 && (
                <p className="mt-1.5 text-[11.5px] font-bold tabular-nums text-steel">
                  月あたり ¥{perMonth(p).toLocaleString()}
                </p>
              )}
              <p className="mt-2 text-[11.5px] leading-[1.7] text-steel">{p.why}</p>
            </li>
          ))}
        </ul>

        <ul className="mt-7 flex max-w-[32em] flex-col gap-2">
          {INCLUDED.map((x) => (
            <li key={x} className="flex items-start gap-2.5 text-[14px] leading-[1.75]">
              <span aria-hidden className="mt-[4px] shrink-0 text-[11px] font-black text-brand">
                ✓
              </span>
              <span className="min-w-0 text-slate">{x}</span>
            </li>
          ))}
        </ul>

        {/* 先着の特典。値段は下げない。中身を足す
            （一度下げた値段は、上げるときに必ず揉める） */}
        {perks.length > 0 && (
          <div className="mt-6 max-w-[32em] rounded-soft border border-line bg-paper px-4 py-3.5">
            <p className="text-[12px] font-black text-steel">はじめの100人に付くもの</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {perks.map((k) => (
                <li
                  key={k.text}
                  className="flex items-start gap-2 text-[12.5px] leading-[1.75] text-steel"
                >
                  <span aria-hidden className="mt-[3px] shrink-0 text-[10px] font-black text-brand">
                    ＋
                  </span>
                  <span className="min-w-0">
                    {k.text}
                    {k.minMonths > 1 && `（${k.minMonths}か月以上のプラン）`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-7 max-w-[22em]">
          <Link
            href="/koi"
            className="flex min-h-[56px] w-full items-center justify-center rounded-pill bg-brand px-8 text-[16.5px] font-bold text-paper shadow-card"
          >
            {CTA} <span aria-hidden className="ml-2">&rarr;</span>
          </Link>
          <p className="mt-2 text-[12px] leading-[1.7] text-steel">{CTA_NOTE}</p>
        </div>

        {/* 払い方。月払いは「いつでも解約」ではないので、
            選ぶ画面には必ず契約期間を出す（PriceChooser が持っている）。
            トップの表には出さない。細かすぎて、4枚が読まれなくなる。 */}
        <details className="group mt-7 max-w-[32em]">
          <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 rounded-card border border-line bg-paper px-4 text-[13.5px] font-bold text-steel shadow-card">
            月払いで分ける（3か月以上）
            <span aria-hidden className="text-[12px] group-open:hidden">開く</span>
            <span aria-hidden className="hidden text-[12px] group-open:inline">閉じる</span>
          </summary>
          <div className="mt-4">
            <PriceChooser />
          </div>
        </details>

        {/* 単発は、残すが主役にしない。
            月のぶんを使い切った人には要るし、
            月額が開くまでは、ここだけが買える口になる。 */}
        <details className="group mt-2.5 max-w-[32em]">
          <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 rounded-card border border-line bg-paper px-4 text-[13.5px] font-bold text-steel shadow-card">
            1回ずつ買う
            <span aria-hidden className="text-[12px] group-open:hidden">開く</span>
            <span aria-hidden className="hidden text-[12px] group-open:inline">閉じる</span>
          </summary>
          <div className="mt-4">
            <FamilyCards openIds={openPlanIds()} />
          </div>
        </details>

        <p className="mt-5 text-[12.5px] leading-[1.85] text-steel">{MANAGE_NOTE}</p>
        <p className="mt-2 text-[12px] leading-[1.85] text-steel">
          税込。
          <Link
            href="/plans"
            className="ml-1 font-bold text-brand underline decoration-line underline-offset-4"
          >
            キャンセルと返金について
          </Link>
        </p>

        {/* ══════════════════════════════════════════
            買う場所にだけは、残す
            ══════════════════════════════════════════
            LPの本文からは、使えない向きの話を全部外した
            （1画面目で「男性の」と名乗っているので、読めば分かる）。

            ただし、お金が動く場所だけは別。
            買ったあとで「使えなかった」と気づくのが、いちばん悪い。
            枠も色も付けず、ほかの但し書きと同じ重さで1行だけ。 */}
        {notYetNote() && (
          <p className="mt-2 text-[12px] leading-[1.85] text-steel">{notYetNote()}</p>
        )}
      </Block>

      {/* ══ 10. よくある質問 ══ */}
      {/* 6つ全部開いていると、それだけで3画面分になる。
          見出しだけ並べて、読みたいものだけ開く。 */}
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

      {/* ══ 11. 最後 ══ */}
      {/* 締めは、看板の繰り返しではなく、手に入るほうにする。
          押す場所は1画面目と同じ文言。
          最後だけ別の行き先にすると、どちらが本筋か分からなくなる。 */}
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
            {/* 暗い面と同じ文。voice.ts の TRIAD から出す。
                ここだけ言い方が違うと、締めで別の約束になる。 */}
            <p className="relative mt-4 max-w-[26em] text-[15.5px] font-bold leading-[1.9]">
              {TRIAD}
            </p>
            <div className="mt-7">
              <Link
                href="/koi"
                className="flex min-h-[60px] w-full items-center justify-center rounded-pill bg-paper px-9 text-[16.5px] font-bold text-brand-deep sm:w-auto"
              >
                {CTA} <span aria-hidden className="ml-2">→</span>
              </Link>
              <p className="mt-2.5 text-[12.5px] leading-[1.7] text-paper/90">{CTA_NOTE}</p>
              {/* AIで決めきれないときの道。第一CTAと役が違うので、小さく */}
              <p className="relative mt-3.5 text-[12.5px] leading-[1.8] text-paper/90">
                AIで決めきれないときは{" "}
                <PlanCta
                  plan={ENTRY_PLAN}
                  from="footer_second"
                  className="!inline font-bold text-paper underline decoration-paper/50 underline-offset-4"
                >
                  {advisorWord()}に確カメる
                </PlanCta>
                {" "}こともできます。
              </p>
            </div>
          </div>
        </Wrap>
      </section>

      {/* スクロールを先導するタシカメ。進み具合と、押す場所を兼ねる */}
      <TashikameGuide />

      {/* ══ フッター ══ */}
      {/* 外せないのは2つだけ。誰が売っているか（社名）と、
          特定商取引法に基づく表記への道。決済を扱う以上、
          トップから辿れる必要がある。目立たせない。 */}
      <footer className="border-t border-line bg-paper">
        <Wrap className="py-7 sm:py-8">
          <div className="flex flex-col gap-2.5 text-[11.5px] leading-[1.7] text-steel sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            {/* 社名の隣に、いま誰に出しているかを1行。
                よくある質問まで開かない人のために、ここにも置く。
                両方の向きが開いたら、ひとりでに消える。 */}
            <p className="min-w-0">
              {site.company.name}
              {notYetNote() && (
                <span className="mt-1 block text-[11px] text-steel">{notYetNote()}</span>
              )}
            </p>
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
