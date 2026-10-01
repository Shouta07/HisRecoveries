import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { openPlanIds } from "@/lib/call/gate";
import { plan as getPlan, ENTRY_PLAN, DEFAULT_PLAN } from "@/lib/ask/plans";
import FamilyCards from "@/components/brand/FamilyCards";
import { DEMO } from "@/lib/ask/demo";
import { EXAMPLES, TOPICS } from "@/lib/ask/examples";
import { VERDICTS } from "@/lib/ask/model";
import { NAME, SUB, THESIS, THESIS_A1, THESIS_A2, THESIS_B, DEFINITION, HERO_HOW, TAGLINE, TAB_TITLE } from "@/lib/voice";
import { supply } from "@/lib/supply";
import Reveal from "@/components/brand/Reveal";
import PlanCta from "@/components/brand/PlanCta";
import Mark from "@/components/brand/Mark";
import Tashikame from "@/components/brand/Tashikame";
import Journey from "@/components/brand/Journey";
import TashikameGuide from "@/components/brand/TashikameGuide";
import MenuButton from "@/components/brand/MenuButton";
import Flourish from "@/components/brand/Flourish";
import Slot from "@/components/brand/Slot";
import type { ImageKey } from "@/lib/images";
import HeroBoard from "@/components/brand/HeroBoard";
import VideoEmbed from "@/components/brand/VideoEmbed";
import MomentsArt from "@/components/brand/MomentsArt";
import { hasPublicFile } from "@/lib/publicFile";
import ResultCase from "@/components/brand/ResultCase";
import { OPEN_CASES } from "@/lib/ask/cases";
import Yen from "@/components/brand/Yen";

// ══════════════════════════════════════════════════════════════
// トップページ。
//
// ── 売っているもの ────────────────────────────────
// モテる方法ではない。
// 大事な相手とのチャンスを、自分の判断ミスで失わないこと。
//
// ── いちばん大きく直したところ ────────────────────
// 前の見本は、回答が肯定的なものばかりだった。
//   「いいと思います！」「好印象です！」「送って大丈夫です！」
// これを見た人が、お金を払う理由は無い。
// 全部が「いいと思います」なら、聞く必要が無かったことになる。
//
// いまの見本は、必ず何かが引っかかっている。
// そして、引っかかったところを直した文面と、なぜそう直したかまで見せる。
// これが、この製品にお金が発生する唯一の理由。
// 直したものをもう一度別の人に通す工程は売っていないので、見本にも出さない。
//
// ── ただし悪いところ探しのサービスにしない ────────────────
// 問題が無ければ「このままで問題なさそう」も、ちゃんと結果。
//
// ── 入口の言葉は「相談」 ──────────────────────────
// 「評価される」「診断される」は、押す前に身構える。
// 「ちょっと相談する」のほうが手が伸びる。
// ただし相談で止めない。何が返ってくるかを隣に必ず書く。
//
// ── 出さない数字 ──────────────────────────────────
// 「失敗確率72%」は出さない。根拠が無い。
// 出すのは「3人中2人」だけ。数えられるものしか出さない。
// 3人の反応を、女性全体のみんなの答えとして書かない。
//
// ── 何のサービスに見えるか ────────────────────────
// 「LINEを送る前に女性に聞くサービス」だけに見せない。
// 実際に売っているのは、恋愛の分岐点を選ぶ前に確かめられること。
//   どの自己紹介文にするか / いま返すか、待つか / そろそろ誘うか
//   電話するか / 今日送るか、明日にするか / 切り出すか、待つか
// だから1画面目の次は、Before/After ではなく分岐点の一覧にしてある。
// 先に「何のサービスか」を決めて、そのあとに「何が返るか」を見せる。
//
// ── 構成 ──────────────────────────────────────────
//   1 ファーストビュー
//   2 恋愛の道のりと、その場面（段を押すとその場で開く）
//   3 相談前と、相談後
//   4 ほかの選び方との違い
//   5 安心・安全
//   6 よくある質問（AIとの違い・進め方を畳んである）
//   7 料金
//   8 最後
//
// 料金はいちばん最後に置く。先に出すと、買えるのが1つだけなので
// 「高い／買えない」が最初の印象になる。
// カードは /plans と同じ PlanCards から出す。
// キャンセル・返金・特商法の断りは /plans が持つ。
//
// ── 節を増やさない ────────────────────────────────
// 「こんな選択を、選ぶ前に」は2の中へ入れた。同じことを2回言っていた。
// 「実在の女性が回答します」も外した。誰が読むのかは /answerers にある。
// 「AIではなく」「やることは4つ」は、よくある質問に畳んだ。
// 全部を同じ大きさで並べると、どれも読まれない。
// ══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  // タブに出るのは店名。住所（hisrecoveries.com）とは別
  title: { absolute: TAB_TITLE },
  /* 検索結果に出る説明。
     DEFINITION（誰が誰に何をするか）＋ HERO_HOW（何を渡すと何が返るか）。
     THESIS と SUB は考え方の文で、検索結果では場所の無駄になっていた。
     人数は plans.ts と突き合わせている（voice.ts の HERO_HOW）。 */
  description: `${DEFINITION}${HERO_HOW}`,
  alternates: { canonical: site.url },
  /* ── シェアされたときのカードを、この面が自分で持つ ──────
     ここは openGraph を持っていなかったので layout のものを
     継いでいた。layout は運営・記事側の名乗り（site.name）なので、
     トップを貼ると「His Recoveries — 送る前に、女性の目を通す」の
     カードが出ていた。前の屋号。

     /articles で同じことが起きて直したが、トップが残っていた。

     Next.js はページ側で openGraph を書くと親を丸ごと置き換える。
     images を書き忘れるとカードから画像が消えるので、一緒に渡す。 */
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

/* ── 行き先を2つ外した ──────────────────────────────
   #before-after  その節は前に外してあり、アンカーが残っていなかった。
                  押すと何も起きないリンクが、ずっと出ていた。

   /reviewers     トップから外した「今日、受け付けている人」と
                  同じ一覧。実在しない4人が出る面なので、
                  いちばん目立つところから案内しない。
                  面そのものは消していない（実在の人が入ったら戻す）。 */
const NAV = [
  ["#moments", "恋愛の道のり"],
  ["#faq", "よくある質問"],
  ["#price", "料金とプラン"],
] as const;

const STEPS = [
  { n: "01", t: "送る前のものを出す", d: "送る前のLINE、または自己紹介文。そのまま貼るだけです。" },
  { n: "02", t: "条件に合う女性に届く", d: "年代や立場を選べます。確認が済んだ女性にだけ届きます。" },
  { n: "03", t: "一人ずつ返ってくる", d: "このままでOK / 少し気になる / 変えた方がいい と、そう思った理由。" },
  { n: "04", t: "直すか、そのまま出すか決める", d: "大丈夫そうならそのまま。気になる点が出たら、直してから。" },
];

// よくある質問。
//
// ── 節にしない ────────────────────────────────────
// 「AIではなく、実在の女性である理由。」と「やることは、4つ。」を
// 節として立てていた。どちらも大事だが、押す前に必ず読むものではない。
// 全部を同じ大きさで並べると、どれも読まれない。
// 気になった人が開けばいいので、ここへ畳んだ。
//
// ── 開かなくても分かる答えを、先に書く ────────────
// extra が付くものは、開くと絵も出る。
// ただし a だけ読んでも答えになっていること（検索結果にはこちらが出る）。
const FAQ: { q: string; a: string; extra?: "ai" | "flow" | "safety" }[] = [
  {
    q: "AIに聞くのと何が違いますか？",
    a: "AIが出すのは「たぶんこう思われます」です。ここで返ってくるのは、実在の女性が実際にどう思ったかです。予想ではなく、本当の反応です。まずAIに聞いていい。文面を作るのも、考えをまとめるのもAIのほうが得意です。それでも最後に残る「実際どう思われるか」だけ、人に聞きます。",
    extra: "ai",
  },
  {
    q: "どうやって進みますか？",
    a: "4つです。送る前のものを出す、条件に合う女性に届く、一人ずつ返ってくる、直すかそのまま出すかを決める。出すのは送る前のLINEか自己紹介文で、そのまま貼るだけです。",
    extra: "flow",
  },
  {
    q: "3人がそう言えば、女性みんながそう思うということですか？",
    a: "違います。読んだ人がそう感じた、というだけです。だから意見が分かれたところも、そのまま出します。女性みんなの答えではありません。",
  },
  {
    q: "悪いところを無理に探されませんか？",
    a: "探しません。問題が無ければ「このままで大丈夫そう」と返ってきます。それも答えです。悪いところ探しになると、本当に直すべきところが埋もれます。",
  },
  {
    q: "相手に知られませんか？",
    a: "知られません。匿名で使えて、相手の名前・写真・連絡先は保存していません。答えてくれた女性とあなたが直接つながる仕組みも、作っていません。",
    extra: "safety",
  },
  {
    q: "どのくらいで返ってきますか？",
    a: "条件に合う女性が何人いるかによります。実際のところが分かるまでは、何分とは言いません。いま何人に届いて何人が見ているかは、画面で分かるようにしてあります。",
  },
  {
    q: "集まらなかったら？",
    a: "集まらなかった分はお返しします。条件を広げてもう少し待つか、全額返してもらうかを選べます。こちらで勝手に決めません。",
  },
];

/**
 * AIとの分かれ目。よくある質問の中で開く。
 *
 * 節として独立させていたが、押す前に必ず読むものではない。
 * 気になった人だけが開けばいい。
 * 見本の言葉は demo.ts のもの。ここで書き足さない。
 */
function AiSplit() {
  return (
    <div className="px-4 pb-5 sm:px-5">
      <div className="grid gap-2.5 sm:grid-cols-[1fr_auto_1.1fr] sm:items-stretch">
        <div className="rounded-card border border-line bg-mist p-4">
          <p className="text-[11.5px] font-black text-steel">AIに聞くと</p>
          <p className="mt-2.5 text-[13.5px] leading-[1.8] text-steel">
            「丁寧で好印象だと思います。相手に配慮が伝わる自然な文面です。」
          </p>
          <p className="mt-3 text-right">
            <span className="rounded-pill bg-paper px-2.5 py-1 text-[10.5px] font-bold text-steel">
              予測
            </span>
          </p>
        </div>

        <p aria-hidden className="justify-self-center self-center text-[18px] text-steel">
          →
        </p>

        <div className="rounded-card border border-brand bg-paper p-4">
          <p className="text-[11.5px] font-black text-brand">実在の女性{DEMO.says.length}人</p>
          <ul className="mt-2.5 flex flex-col gap-2.5">
            {DEMO.says.map((x) => (
              <li key={x.age} className="flex items-start gap-2.5">
                <Who age={x.age} size={26} />
                <span className="min-w-0">
                  {/* 年代だけ。職業は付けない */}
                  <span className="block text-[10.5px] font-bold text-slate">{x.age}歳・女性</span>
                  <span className="block text-[12.5px] leading-[1.7] text-steel">{x.say}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-right">
            <span className="rounded-pill bg-brand px-2.5 py-1 text-[10.5px] font-bold text-paper">
              実際の反応
            </span>
          </p>
        </div>
      </div>

      <p className="mt-4 text-[15px] font-black leading-[1.6] text-slate">
        AIは予測する。女性は、実際に受け取る。
      </p>

      {/* 敵対させない。AIで選択肢を作り、その選択肢を人で確かめる */}
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {[
          { who: "AIがやること", on: false, list: ["文面を考える", "選択肢を作る", "状況を整理する"] },
          {
            who: "タシカメがやること",
            on: true,
            list: [
              "その選択肢を実在の女性が読む",
              "実際にどう受け取ったかを返す",
              "なぜそう感じたかを書く",
            ],
          },
        ].map((x) => (
          <div
            key={x.who}
            className={`rounded-card p-4 ${x.on ? "bg-brand text-paper" : "border border-line bg-mist"}`}
          >
            <p className={`text-[12px] font-black ${x.on ? "text-paper" : "text-steel"}`}>
              {x.who}
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {x.list.map((t) => (
                <li
                  key={t}
                  className={`text-[12.5px] leading-[1.7] ${x.on ? "text-paper" : "text-steel"}`}
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12.5px] leading-[1.85] text-steel">
        どちらが上という話ではありません。AIで選択肢を作って、その選択肢を人で確かめる。
        この順番がいちばん速いと思っています。
      </p>
    </div>
  );
}

/** やることは4つ。よくある質問の中で開く */
/**
 * 安心・安全。よくある質問の「相手に知られませんか？」の中で開く。
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
          "答えてくれた女性と直接つながる仕組みはありません",
          "年齢と立場を確認した女性だけが見ます",
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

function Flow() {
  return (
    <ol className="grid gap-2.5 px-4 pb-5 sm:grid-cols-2 sm:px-5">
      {STEPS.map((x) => (
        <li key={x.n} className="rounded-card border border-line bg-mist p-4">
          <p className="text-[11px] font-black tabular-nums text-brand">{x.n}</p>
          <p className="mt-1.5 text-[13.5px] font-black leading-[1.5] text-slate">{x.t}</p>
          <p className="mt-1.5 text-[12.5px] leading-[1.75] text-steel">{x.d}</p>
        </li>
      ))}
    </ol>
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
   * 白と淡い青だけで最後まで進むと、どの節も同じ強さに見えて、
   * ページ全体の印象が薄くなる。1か所だけ黒い面を置いて、
   * 読んでいる途中に「ここが芯」と分かる場所を作る。
   */
  dark?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 ${dark ? "bg-slate" : tint ? "bg-mist" : "bg-paper"}`}
    >
      {/* 上下の余白。py-12 だった。
          節が9つあるので、1つ24px詰めると画面1/4ぶん縮む。
          文字は減らさずに、間だけ詰める。 */}
      <Wrap className="py-9 sm:py-14 lg:py-16">{children}</Wrap>
    </section>
  );
}

/** 英字の小見出し。日本語の見出しの上に、小さく添えるだけ */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11.5px] font-bold tracking-[0.14em] text-steel">{children}</p>;
}

function H({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    // 全部スクロールで読むページなので、節の頭で1回だけ動かす。
    // 派手にしない。上に10px、それだけ（Reveal が持っている）。
    // 動きを止めている人には出したまま何もしない。
    <Reveal>
      <h2
        className={`flex items-center gap-2 text-[24px] font-black leading-[1.35] tracking-[-0.02em] sm:text-[28px] ${
          dark ? "text-paper" : "text-slate"
        }`}
      >
        <span>{children}</span>
        <Flourish className={dark ? "text-brand-tint" : "text-brand"} />
      </h2>
    </Reveal>
  );
}

/** 年齢だけで表す。顔は置かない */
function Who({ age, size = 36 }: { age: number; size?: number }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-brand-tint font-black tabular-nums text-brand-deep"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.33) }}
    >
      {age}
    </span>
  );
}

// 3つの役割の説明（WHICH）を、ここに持っていた。
// 「どれを使えばいい？」の節で1枚ずつ出していたもの。
// その節を料金と1つにまとめたので、役割の説明はカードだけが持つ。
// 同じことを2か所に書くと、片方だけ古くなる。

/**
 * 「こんな女性が読んでいます」に出す顔。
 *
 * 写真はイメージ。年代だけを添える。
 * 職業も回答件数も付けない（付けた時点で、
 * 実在しない人の名簿になる。登録者はまだ0人）。
 */
const FACES: { key: ImageKey; age: string }[] = [
  { key: "w1", age: "20代前半" },
  { key: "w2", age: "20代後半" },
  { key: "w3", age: "20代後半" },
  { key: "w4", age: "30代" },
  { key: "w5", age: "20代前半" },
];

/** 使う瞬間の絵柄。カテゴリごとに1つ */
// 「タシカメは、こんなときに使えます。」の節で使っていた絵を、
// ここに持っていた。節ごと畳んだので、絵も要らない。
// 場面は「こんな瞬間、ありませんか？」に寄せた（lib/ask/pain.ts）。


const TONE: Record<string, string> = {
  as_is: "bg-ok-tint text-ok-text",
  slight: "bg-mist text-steel",
  change: "bg-rose-tint text-rose-text",
};

function label(v: string) {
  return VERDICTS.find((x) => x.id === v)?.label ?? v;
}

export default async function HomePage() {
  const entry = getPlan(ENTRY_PLAN);
  const main = getPlan(DEFAULT_PLAN);
  // 速さを約束できるかだけ、ここで見る。
  // 「受け付けていない」の断りは /plans（買う場所）に置いてある。
  const sup = await supply(main.answers);

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

      {/* ── ヘッダー ── */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <Wrap className="flex items-center justify-between gap-4 py-3">
          {/* 上から「マチアプ恋愛に迷ったら、／タシカメ」と読ませる。
              2行で1つの文になるので、標語の側に名前は入れない。

              ── 標語が伸びたぶん、まわりを詰める ────────────
              390px では、絵・標語・名前・ボタン・メニューで
              横幅がちょうど埋まっていた。標語が4文字伸びて
              「マチアプ恋愛に迷っ…」と切れていた。
              truncate は黙って切るので、落ちずにそのまま出る。

              狭い画面だけ、絵と標語を小さくし、ボタンの余白と
              右側の間隔を詰めた。640px から先は元のまま。

              ── 320px では出さない ────────────────────
              いちばん狭い端末では、ボタンとメニューを置いた残りが
              64px しかない。12文字はどう縮めても入らない。
              切れた標語を出すくらいなら、名前だけにする。
              すぐ下の1画面目に、同じことが文で書いてある。 */}
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <Mark size={36} className="sm:!h-11 sm:!w-11" />
            <span className="min-w-0">
              <span className="hidden truncate text-[9px] font-bold leading-[1.3] text-steel min-[360px]:block sm:text-[10.5px]">
                {TAGLINE}
              </span>
              {/* 名前は切らない。標語は消せても、名前は消せない。
                  320px では字を詰めて入れる（文字間も 360px から） */}
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
            {/* 答える側の入口（/join）は、ページごと畳んだ。
                募集は個別に案内する。公開の入口は置かない。 */}
            {/* ── ずっと出ている押す場所 ──────────────────
                これが固定CTAそのもの。header が sticky なので、
                下まで読んでも常に出ている。

                下に別の固定バーを足すことは、しない。
                携帯の画面でヘッダーとバーの両方が居座ると、
                読むところが2本ぶん狭くなる。
                同じ役の押す場所を2つ出す理由も無い。

                文言は「確かめる」だった。何を確かめるのかが
                入っていないので、ページ全体と同じ言い方にそろえた。
                行き先も、いちばん軽い入口（ENTRY_PLAN）に変えた。
                ずっと出ているボタンが、いちばん高い商品を指していた。 */}
            <PlanCta
              plan={ENTRY_PLAN}
              from="header"
              className="min-h-[42px] whitespace-nowrap rounded-pill bg-brand px-3.5 text-[13px] !text-paper shadow-card sm:px-5 sm:text-[13.5px]"
            >
              女性に確カメる
            </PlanCta>
            {/* フッターを外したので、ほかの面への行き先はここに畳んである。
                特商法の表記とプライバシーも、ここから辿れる */}
            <MenuButton />
          </nav>
        </Wrap>
      </header>

      {/* ══ 1. ファーストビュー ══ */}
      {/* 写真を小さく置かない。
          この製品を買う人は「いま手が止まっている人」なので、
          その人が自分を見つけられる絵を、最初に大きく出す。
          文字は写真に重ねず、左に置く（顔が隠れると何の絵か分からない）。 */}
      <section className="relative overflow-hidden bg-sky">
        {/* いちばん上に、言いたいこと1つ。その下に、何のサービスかを1文。
            考え方（恋愛は、小さな選択の積み重ね。）は次の節の見出しが持つ。
            同じ文を2回出すと、どちらも弱くなる。 */}
        <Wrap className="pb-2 pt-3 sm:pb-4 sm:pt-6">
          <h1 className="text-mega font-black leading-[1.15] text-slate">
            迷ったら、
            <br />
            <span className="relative inline-block">
              女性に聞けばいい。
              <span
                aria-hidden
                className="absolute -bottom-0.5 left-0 -z-10 h-[0.42em] w-full rounded-[2px] bg-brand/25"
              />
            </span>
          </h1>
          {/* ── 大きさの順番を直した ──────────────────
              見出し30px、この文13.5pxのグレーだった。
              いちばん大きいのが標語で、何のサービスかを言う文が
              いちばん小さい。ぱっと見で何屋か分からないのは、
              言葉が足りないのではなく、この順番が逆だったから。

              色も steel（グレー）から slate（本文の色）にした。
              グレーは「読み飛ばしていい文字」の色で、
              いちばん読んでほしい1文に使う色ではない。 */}
          <p className="mt-2.5 max-w-[26em] text-[16px] font-bold leading-[1.65] text-slate sm:max-w-[38em] sm:text-[18px]">
            {DEFINITION}
          </p>
          {/* 渡すものと、返るもの。
              吹き出しが渡すものを見せているので、返るものを言葉にする。
              細く小さくして、上の1文と大きさを争わせない。 */}
          <p className="mt-1.5 max-w-[26em] text-[13px] leading-[1.7] text-steel sm:max-w-[38em] sm:text-[14px]">
            {HERO_HOW}
          </p>

          {/* ── 押す場所を1画面目に戻した ──────────────────
              一度外して、また戻している。前と事情が変わった。

              外したときの理由は「ヘッダーに常設のボタンがあるので、
              1画面目に入口が2つ並ぶ」だった。

              ただヘッダーのボタンは「確かめる」としか書いておらず、
              何を確かめるのかが入っていない。
              1画面目を読み終えた直後に、何をする場所なのかを
              書いた状態で押せるようにする。

              文言はページ全部でこれに統一した。
              押すたびに言い方が変わると、同じ場所に行くことが分からない。 */}
          <div className="mt-5 max-w-[22em]">
            <PlanCta
              plan={ENTRY_PLAN}
              from="hero"
              className="min-h-[56px] w-full rounded-pill bg-brand px-8 text-[16px] !text-paper shadow-card"
            >
              女性に確カメる <span aria-hidden className="ml-2">&rarr;</span>
            </PlanCta>
            <p className="mt-2 text-[12px] leading-[1.7] text-steel">
              LINE・写真・プロフィール・誘い方に対応。
            </p>
          </div>
        </Wrap>

        {/* 相談する男性と、読んで返す女性を1枚に入れる。
            片方だけだと、誰が誰に何をしてもらえるのかが伝わらない。 */}
        <HeroBoard openIds={openPlanIds()} />

        {/* ── 中身の無い余白を外した ──────────────────
            ここは Wrap(pb-10 pt-3) + div だけが残っていて、
            中に描くものが1つも無かった。
            携帯で52px、机で96px、何も無い帯が出ていた。

            1画面目を詰めたいのに、詰めた分をここが食べていた。
            下の節との間だけ空ける。

            なぜ中身が無いのかは、下に残してある。 */}
        <div className="h-3 sm:h-8" />

            {/* ここに「¥7,980 / 5回分 ｜ 月額なし ｜ 匿名」を出していた。
                何のサービスかを言い終わる前に金額が目に入って、
                読む前に「高い／安い」の話になっていた。

                値段は、何が返ってくるかを見たあとで見るもの。
                料金の節（#price）と /plans にある。隠してはいない。 */}
            {/* ══════════════════════════════════════════
                押す場所と4つの印は、また外した
                ══════════════════════════════════════════
                一度戻して、また外している。理由は前と同じ。

                ヘッダーの「確かめる」がずっと出ている。
                絵が Before → 相談 → After で完結しているので、
                その下にもう一つ押す場所を置くと、
                1画面目に入口が2つ並ぶことになる。

                4つの印（実在の女性が回答／匿名でOK／都度払い／
                追加料金なし）は、よくある質問と料金の節が持っている。
                1画面目で条件を先に並べても、まだ何のサービスか
                分かっていないので読まれない。 */}
            {/* 受け付けていないことの断りは、値段の節（買う場所）に置いてある。
                1画面目で先に言うと、見る前に帰る。隠してはいない。 */}

      </section>

      {/* ══ 1.2 紹介動画 ══ */}
      {/* ══════════════════════════════════════════════
          なぜ1画面目のすぐ下なのか
          ══════════════════════════════════════════════
          1画面目で「何のサービスか」を読んだ人が、
          次にやることは1つしかない。もう少し知る、か、離れる。

          文章で説明を足すと、読む量が増えるだけになる。
          動画は、見るかどうかを見る側が選べる。
          押さなければ何も起きず、そのまま下へ進める。

          ══════════════════════════════════════════════
          押されるまで、何も読み込まない
          ══════════════════════════════════════════════
          YouTube の埋め込みは、置いただけで1MB近く読む。
          このサイトは Web フォントすら使っていないので、
          そのまま置くと、トップでいちばん重いものが紹介動画になる。

          最初は画像とボタンだけ。押されたときに iframe を作る
          （components/brand/VideoEmbed.tsx）。
          見ていない人に Cookie も入らない。 */}
      <section className="bg-paper">
        <Wrap>
          <div className="mx-auto max-w-[760px] py-10 sm:py-14">
            {/* 表紙が置いてあれば、そちらを使う（YouTube の絵を当てにしない）。
                public/img/video-poster.jpg */}
            <VideoEmbed
              title="タシカメは、どういうサービスか"
              poster={hasPublicFile("/img/video-poster.jpg") ? "/img/video-poster.jpg" : null}
            />
          </div>
        </Wrap>
      </section>

      {/* 「今日、受け付けている人」は、ここに置いていた。
          1画面目の直後だと、まだ何のサービスか分からないうちに
          人と時間の表が出てくる。
          「こんな選択を、選ぶ前に」で何が返ってくるかを見せたあと、
          その下へ移した。 */}

      {/* ══ 1.5 手が止まる瞬間 ══ */}
      {/* ══════════════════════════════════════════════
          なぜ1画面目の直後なのか
          ══════════════════════════════════════════════
          1画面目は「何のサービスか」を言う場所で、
          「それ、自分のことだ」と思ってもらう場所ではない。

          ここを1画面目の中に入れると、押す場所が下へ押し出される。
          いまスマホで、押す場所は 844px のうち 687px のところにある。
          7行足すと画面の外へ出る。それは割に合わない。

          1回スワイプした先に置く。順番はこう。
            何のサービスか（1画面目）
            それ、自分のことだ（ここ）
            ほかの手段では足りない理由（ここの下半分）
            どんな場面で使えるか（この下）

          ══════════════════════════════════════════════
          状態ではなく、瞬間を書く
          ══════════════════════════════════════════════
          「恋愛で悩んでいませんか？」とは書かない。
          悩んでいる人は、自分を悩んでいる人だと思っていない。
          思っているのは「このLINE、重くないかな」だけ。

          言葉は lib/ask/pain.ts。
          答えられないこと（写真・脈あり）は、向こうの判定が弾く。 */}
      <Block>
        <h2 className="text-huge font-black leading-[1.35] text-slate">
          こんな瞬間、
          <br className="sm:hidden" />
          ありませんか？
        </h2>

        {/* 絵。置かれていなければ、何も出ない（MomentsArt）。
            吹き出しの言葉は画像に焼き込まれているので、
            これで下の一覧を置き換えない。
            置き換えると、押せなくなり、読み上げにも検索にも乗らなくなる */}
        <MomentsArt alt="送る前に手が止まる、いくつもの場面" />

        {/* ══════════════════════════════════════════
            8つの一覧は外した
            ══════════════════════════════════════════
            場面を1つずつ押せるようにしていた（押すとその
            カテゴリを選んだ状態で相談が始まる）。

            絵の中に同じ場面が全部描かれているので、
            下に文字で並べると二度読ませることになっていた。

            押す先は1つだけ残す。カテゴリの選択は、
            相談を書く画面の最初で選べる。 */}
        {/* ── 実際に相談されている形を、そのまま並べる ──────
            絵は場面を見せるが、言葉になっていない。
            「自分のも聞いていいのか」が分かるのは、
            他人が何を聞いているかを見たとき。

            押すとそのカテゴリを選んだ状態で相談が始まる。
            横に流すのは、縦に12枚積むとこの節だけで2画面になるから。
            端を少し見せて、続きがあることを分かるようにしてある。 */}
        <ul
          className="-mx-5 mt-6 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: "none" }}
        >
          {EXAMPLES.map((e) => (
            <li key={e.q} className="shrink-0 snap-start">
              <Link
                href={`/ask?c=${e.cat}`}
                className="flex min-h-[52px] items-center rounded-pill border border-line bg-paper px-4 text-[14px] font-bold leading-[1.5] text-slate shadow-card transition-shadow hover:shadow-card-hover"
              >
                {e.q}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6 max-w-[26em]">
          <PlanCta
            plan={DEFAULT_PLAN}
            from="pain"
            className="min-h-[58px] w-full rounded-pill bg-brand px-9 text-[16px] !text-paper shadow-card"
          >
            女性に確カメる <span aria-hidden className="ml-2">&rarr;</span>
          </PlanCta>
        </div>

        {/* 「検索すれば／AIに聞けば」の3行は、ここに置いていた。
            置き場所としては早すぎた。
            まだ何のサービスか分からない段階で、ほかの手段と比べても、
            比べる先が頭の中に無い。

            「ほかの選び方と、どう違うか」の節へ移した。
            友達とAIの話をしている、まさにその場所。 */}
      </Block>

      {/* ══ 2.4 返ってくるもの ══ */}
      {/* 売るのはここ。
          道のりの節は考え方だけにしたので、
          「実際に何が返ってくるか」はこちらで見せる。

          見出しは「こんな選択を、選ぶ前に。」だった。やめた。
          すぐ上に「こんな瞬間、ありませんか？」と
          「段ごとに、こんなことで手が止まります」がある。
          3つ続けて同じことを言っていて、読む人は同じ節を3回読む。
          場面を並べるのは上の2つに任せ、ここは下にあるものの名前にする。 */}
      <Block tint>
        <Eyebrow>MEN&apos;S EXAMPLE</Eyebrow>
        <h2 className="mt-2 text-huge font-black text-slate">
          返ってくるのは、
          <br className="sm:hidden" />
          こういうものです。
        </h2>
        <p className="mt-4 max-w-[34em] text-[15px] leading-[1.85] text-steel">
          実在の女性が読んで、実際にどう受け取ったかを返します。
          そのうえで決めるのは、あなたです。
        </p>

        <div className="mt-7">
          {/* 表で並べると「機能の説明」になる。
              実際に起きるのは、送る前に止まって、読んでもらって、
              返ってきて、決める、という順番のある出来事。
              その順番のまま、やりとりの形で出す */}
          <ResultCase c={OPEN_CASES[0]} />
        </div>

        <div className="mt-7 max-w-[26em]">
          <PlanCta
            plan={DEFAULT_PLAN}
            from="cases"
            className="min-h-[58px] w-full rounded-pill bg-brand px-9 text-[16px] !text-paper shadow-card"
          >
            女性に確カメる <span aria-hidden className="ml-2">&rarr;</span>
          </PlanCta>
        </div>

        <p className="mt-5 text-[12px] leading-[1.8] text-steel">
          ※ 写真はイメージ、文面と回答は画面の見本です。特定の利用者の体験談ではありません。
        </p>
      </Block>

      {/* ══ 2.45 「今日、受け付けている人」を外した ══ */}
      {/* ══════════════════════════════════════════════
          架空の女性を出していた
          ══════════════════════════════════════════════
          審査を通った人が0人のあいだ、この節は
          「見せ方の見本」として、実在しない4人を出していた。

            みさき 25-29 / あや 20-24 / りこ 25-29 / まい 30s

          札（画面の見本）と断り（いま登録が済んだ人はいません）は
          付いていた。ただ、断りが付いていても出していることに変わりはない。

          しかも、断りのほうがもっと悪い。
          買おうか考えている人に、いちばん良い場所で
          「いま誰もいません」と伝えることになる。

          実在の女性が読むことが商品なので、
          その一覧が架空だと、商品そのものが疑われる。
          人が入るまでは、名前のある誰かを出さない。

          代わりに、何が起きるかだけを書く（下の節）。
          実在の人が入ったら、ここに戻す。
          部品（TodayReviewers）と /reviewers は消していない。 */}

      {/* ══ 2.5 初めての方へ（畳んだ） ══ */}
      {/* ここに「タシカメは、こんなときに使えます。」の節を置いていた。
          場面を6枚、押せる形で並べたもの。

          その1つ上の「こんな瞬間、ありませんか？」が、同じ仕事をしていた。
          どちらも「こういう場面で使えます」を、押せる形で並べたもの。
          同じことを2回読ませると、どちらも弱くなるし、
          スマホで2画面ぶん増える。

          瞬間のほう（1.5 節）に寄せた。あちらは
            手が止まる瞬間 → なぜAIではないのか
          まで続くので、場面を出す役に加えて、
          その場で「だからここなのか」まで答えられる。

          あちらが持っていなかった電話の場面は、MOMENTS へ移した
          （pain.ts の判定が、消えたら落とす）。

          押す場所も外した。

          ── なぜ外せるようになったか ──────────────────
          ここは「唯一の、値段へ降りる導線」だった。
          だから節が無くなったあとも、帯だけ残していた。

          いまは1画面目と、各節の下に「女性に確カメる」がある。
          文言も全部そろえてあるので、どこから押しても同じ場所に着く。
          値段だけを見に行く帯は、もう要らない。

          134px、何も書いていない帯が1つ減る。 */}

      {/* ══ 3.「相談前と、相談後」は外した ══ */}
      {/* ══════════════════════════════════════════════
          同じことを、2回見せていた
          ══════════════════════════════════════════════
          写真2枚の「相談前 / 相談後」と、気になったところ、
          そのまま使える修正文、なぜそう直したか、をここに置いていた。

          すぐ上の「こんな選択を、選ぶ前に。」を
          やりとりの形に作り直したとき、そこが同じ順番を持った。
            状況 → 文面 → 反応 → そのまま送れる修正案 → 決めたこと

          同じものが2回出ると、どちらも弱くなる。
          動いて出てくるほうを残して、こちらを外した。

          押す場所は減らしていない。ここにあった
          「自分のも見てもらう」は、上の見本の直後に同じものがある。 */}

      {/* ══ 3.5 何を確カメられるか ══ */}
      {/* ══════════════════════════════════════════════
          4つに絞る
          ══════════════════════════════════════════════
          受け付けているカテゴリは8つあるが、ここでは4つだけ出す。
          増やすと「どれを押すか」を決める作業になり、
          決められない人はそのまま帰る。

          残りは相談を書く画面の最初で選べるので、
          ここに全部並べる必要は無い。

          並びは恋愛の進み方そのもの。
            写真で会う前 → LINE → 誘う → 会ったあと

          ── 「脈を確カメる」にはしない ──────────────
          4つ目は「デートのあと」。
          相手がどう思ったかは当てられないので、聞くのは
          「昨日の自分が、どう映ったか」。答えるのは読んだ本人。
          言葉の判定は lib/ask/examples.ts が持つ。 */}
      <Block>
        <h2 className="text-huge font-black leading-[1.35] text-slate">
          何を確カメられる？
        </h2>

        <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {TOPICS.map((t) => (
            <li key={t.id}>
              <Link
                href={`/ask?c=${t.id}`}
                className="flex min-h-[92px] flex-col justify-center rounded-card border border-line bg-paper p-5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <span className="text-[15.5px] font-black leading-[1.45] text-slate">
                  {t.head}
                </span>
                <span className="mt-1.5 text-[13px] leading-[1.6] text-steel">
                  「{t.voice}」
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[12.5px] leading-[1.8] text-steel">
          ほかの場面も相談できます。書くときに選べます。
        </p>
      </Block>

      {/* ══ 4. AIとの役割の違い ══ */}
      {/* ══════════════════════════════════════════════
          比較表（110行）を、短い1節にした
          ══════════════════════════════════════════════
          タシカメ / AI / 友達 / 恋愛コンサル の4列を
          どの幅でも表で出していた。作りとしては正しく動いていたが、
          買うかどうかを決める場面で、4つを見比べる表は重い。

          ここで言いたいことは1つだけ。
            AIは予測する。タシカメは、実際の反応を聞く。

          AIを下に置かない。
          実際、文面を作るところまではAIのほうが速い。
          競っていないので、競っているように書かない。

          表の中身と、景表法まわりの判定は lib/ask/compare.ts に残してある。
          （shown を true に戻せば、また出せる） */}
      <Block tint>
        <h2 className="text-huge font-black leading-[1.35] text-slate">
          AIで考える。
          <br className="sm:hidden" />
          女性に確カメる。
        </h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            {
              who: "AI",
              can: "文章や選択肢を考える",
              lead: "何パターンでも、すぐ出てくる。たたき台を作るのは速い。",
            },
            {
              who: "タシカメ",
              can: "実際にどう受け取られるかを聞く",
              lead: "送る相手に近い女性が、ひとり読む。感じたことがそのまま返る。",
              ours: true,
            },
          ].map((x) => (
            <div
              key={x.who}
              className={`rounded-card border p-5 shadow-card ${
                x.ours ? "border-brand bg-paper" : "border-line bg-paper"
              }`}
            >
              <p
                className={`text-[12px] font-black ${x.ours ? "text-brand" : "text-steel"}`}
              >
                {x.who}
              </p>
              <p className="mt-1.5 text-[16px] font-black leading-[1.5] text-slate">
                {x.can}
              </p>
              <p className="mt-2 text-[13px] leading-[1.8] text-steel">{x.lead}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 max-w-[30em] text-[14.5px] leading-[1.85] text-steel">
          AIは、女性が実際にどう感じるかまでは分かりません。
          そこだけ、女性本人に聞いたほうが早い。
        </p>
      </Block>

      {/* ══ 5. 恋愛のどこで迷うか ══ */}
      {/* ここは「2. 恋愛の道のりと、その場面」として、
          1画面目のすぐ下にあった。料金より前、デモより前。

          1305px あって、買うかどうかを決める前にいちばん長い節だった。
          しかもここは「どの場面で使うか」の話で、
          何が返ってくるかを見る前に読んでも、読む土台が無い。

          何が返ってくるか（デモ）→ 何を確カメられるか → AIとの違い
          を読んだあとに置く。そこまで読んだ人には、
          「自分はこの段にいる」が意味を持つ。 */}
      {/* ここがこの製品の中身。
          「悩みの一覧」ではなく「そこで実際に迷う選択」を出す。
          状態を並べると相談窓口の一覧になり、困ったときにだけ開くものになる。
          選択を並べると、次の一手を決める前に開くものになる。

          形は渡された案のとおり、1本の線に沿って左右へ振る。
          縦に同じ箱を積むと一覧表に見えるが、線に沿わせると
          「順番に進むもの」に見える。実際そう進むので、そちらが正しい。

          問いは lib/ask/journey.ts の choices。受け取れない問いはビルドで弾く。 */}
      <Block id="moments">
        <div className="relative">
          {/* 考え方は、ここの見出しが持つ。1画面目では言わない（2回出すと弱くなる）。
              折る場所はこちらで決める。放っておくと「積み重／ね。」で折れる */}
          <h2 className="text-huge font-black leading-[1.35] text-slate">
            {THESIS_A1}
            <br />
            {THESIS_A2}
          </h2>
          <p className="mt-2 text-[16px] font-bold leading-[1.6] text-steel sm:text-[18px]">
            次の一手を、選ぶ前に確かめる。
          </p>
          {/* 案内役の下に潜り込まないよう、狭い画面では幅を詰める */}
          <p className="mt-4 max-w-[15em] text-[14.5px] leading-[1.85] text-steel sm:max-w-[24em] sm:text-[15px]">
            今どこまで進んでいますか？ 段ごとに、こんなことで手が止まります。
          </p>

          {/* 案内役。見出しの下、説明の右。見出しに被らせない。
              名前を下に置く。名前があると、絵が飾りではなく
              「この子が案内してくれる」に変わる */}
          <div className="pointer-events-none absolute right-0 top-[96px] flex flex-col items-center sm:top-[70px] lg:top-[56px]">
            <Tashikame
              size={92}
              className="opacity-95 sm:!h-[150px] sm:!w-[150px] lg:!h-[180px] lg:!w-[180px]"
            />
            <span className="mt-0.5 text-[12px] font-black tracking-[0.08em] text-steel sm:text-[13px]">
              恋亀
            </span>
          </div>
        </div>

        {/* ここでは売らない。どの段で何に迷うかを書くだけ。
            押せる場所を作らない（作ると、この節が考え方と商品の入口を
            両方背負って、どちらも中途半端になる）。
            売るのは、次の「こんな選択を、選ぶ前に」と料金の節。 */}
        <Journey />

        {/* ── 「前回の続きから進められます」の箱を外した ──────
            276px あった。買う前に読むものとしては長い。

            書いてあったのは3つ。
              一度使ったあとは、前回の続きから進められる
              毎回ゼロから説明し直さなくてよい
              相手の実名・連絡先・メッセージ全文は保存しない

            どれも本当だが、どれも2回目以降の話と、
            仕組みの話。まだ1回も使っていない人が、
            買うかどうかを決める材料にはならない。

            保存しないことは、プライバシーの方針（/privacy）と
            よくある質問が持っている。隠していない。 */}

      </Block>



      {/* ══ 6. サービスプラン ══ */}
      {/* ここは「どれを使えばいい？」と「料金」の2節だった。
          前の節は、3つの役割を1枚ずつ並べて、それぞれに
          いちばん安い商品の名前と値段を書いていた。
          そのすぐ下で、同じ役割・同じ値段をカードでもう一度出していた。
          二度同じものを読まされると、どちらも信用されない。

          1つにまとめる。
          残すのは、カードに書けないもの＝「この場面ならどれか」の対応表。
          役割の説明と値段は、カード（PlanCards）だけが持つ。

          いちばん最後に置く。先に出すと、買えるのが1つだけなので
          「高い／買えない」が最初の印象になる。
          ここまで読んだ人は、何が返ってくるかを知ったうえで値段を見る。

          カードの形は PlanCards（/plans と同じもの）。
          キャンセル・返金・特商法の断りは /plans が持つ。 */}
      <Block id="price">
        {/* 句点は付けない。ここは見出しではなく、ものの名前 */}
        <H>サービスプラン</H>
        {/* ここに「どれを使うかは、迷いの大きさで決まります」の一文と、
            場面→役割の対応表7行と、「確かめる／決める／試す」が
            文字か声かの注記を置いていた。

            商品を2つにしたので、全部要らなくなった。
            3つの役割を覚えてもらう必要も、
            どの役割に当たるかを引く表も、要らない。
            選ぶのは「文字か、声か」だけ。 */}
        {/* ── はじめの1件を、まず見せる ────────────────────
            ここは「文字か、声か」から始まっていた。
            選び方の話で、いくらかは下のカードを見るまで分からない。

            いちばん止まるのは、選び方ではなく
            「女性に読んでもらう」が分からないまま払うこと。
            一度でも反応が返れば、次からは想像できる。
            だから最初に出すのは、その一度の値段。

            金額は書かない。plans.ts から引く
            （画面に直接書くと prebuild の check-prices が落とす）。 */}
        <p className="mt-4 max-w-[30em] text-[17px] font-black leading-[1.7] text-slate sm:text-[19px]">
          はじめの1件は <Yen yen={getPlan(ENTRY_PLAN).yen} />。
          <br className="sm:hidden" />
          まず1人に読んでもらって、何が返ってくるかを見られます。
        </p>
        <p className="mt-2.5 max-w-[34em] text-[14px] leading-[1.85] text-steel">
          選ぶのは、文字で見てもらうか、声で話すかだけです。
          月額はありません。自動更新もしません。
        </p>

        {/* 選ぶのは「文字か、声か」だけ。
            商品を4枚並べるのをやめて、家族2つにした。
            1回と5回分は、同じ商品の買い方なのでカードの中に入れる */}
        <div className="mt-6">
          <FamilyCards openIds={openPlanIds()} />
        </div>

        {/* ここに「たとえば、こんな5回」の一覧（5項目）と、
            「1回だけの相談ではありません…」の説明、
            そして税込と受付前の断りを置いていた。

            カードを2列にして、値段が一目で比べられるようになった時点で、
            その下の説明は読まれない。上で言い切っていることを、
            下でもう一度言っているだけになっていた。

            ただし、キャンセルと返金への行き先だけは残す。
            買う画面から返金の条件へ辿れないのは、特商法の表示として
            まずい（/plans と /legal が中身を持っている）。 */}
        <p className="mt-5 text-[12px] leading-[1.85] text-steel">
          税込。
          <Link
            href="/plans"
            className="ml-1 font-bold text-brand underline decoration-line underline-offset-4"
          >
            キャンセルと返金について
          </Link>
        </p>
      </Block>

      {/* ══ 7. よくある質問 ══ */}
      {/* 安心・安全は、節として独立させていた。
          並べた6つは全部「知られませんか？」への答えで、
          その質問はこの下にある。答えを2か所に置くと、
          どちらも読まれない。畳んで、聞かれた場所で答える。 */}
      {/* 6つ全部開いていると、それだけで3画面分になる。
          見出しだけ並べて、読みたいものだけ開く。 */}
      <Block tint id="faq">
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
              {f.extra === "ai" && <AiSplit />}
              {f.extra === "flow" && <Flow />}
              {f.extra === "safety" && <Safety />}
            </details>
          ))}
        </div>
      </Block>

      {/* 「裏で、こんな女性が読んでいます。」の節は、ここに置いていた。
          顔・年代・確認していること・選べる条件まで、1節ぶん。

          受付の表の上へ、短くして移した。
          「今日いる人」を見せる前に、そもそも誰が読むのかを言う。
          離して置くと、表を見ている人には届かない。

          確認していることと選べる条件は、よくある質問と
          /answerers が持っている。 */}

      {/* ここに「言いにくいことほど、女性に確かめる。」の節を置いていた。
          トップで大きく立てると、それを目当てに来る人が増えて、
          いちばん来てほしい人が引く。

          機能そのものは残っている。
          相談のカテゴリ「距離感・言いにくいこと」から入れるし、
          線と決まりは lib/ask/sensitive.ts が持っていて、
          選んだ人には相談を書く画面で出る。
          トップから売り込むのをやめただけ。 */}

      {/* ══ 8. 最後 ══ */}
      <section className="bg-paper">
        {/* 上下 pb-20 pt-6 と内側 p-8 だった。
            最後の節は押すだけの場所なので、ここまで広く取らない。 */}
        <Wrap className="pb-12 pt-4 sm:pb-20">
          <div className="relative overflow-hidden rounded-card bg-brand p-7 text-paper shadow-card sm:p-12">
            {/* いちばん最後に、もう一度出す。背景は抜いてあるので青の上に乗る */}
            {/* 右下に置く。右上だと見出しに被る（「話す前に。」が読めなくなる）。
                下は文字が終わっていて、いちばん空いている。 */}
            <Tashikame
              size={104}
              className="pointer-events-none absolute -bottom-3 -right-3 sm:!h-[168px] sm:!w-[168px]"
            />
            {/* 最後は、考え方で締める。
                「選び間違いで終わらせないために」は、怖さで押していた。
                残したいのは、自分で選べたという感触のほう。 */}
            {/* 2行とも15字前後あるので、text-huge だと390pxで語の途中で折れる。
                1段下げたうえ、狭い画面では1行目をもう一度折る */}
            {/* ── 見出しを繰り返さない ────────────────────
                ここは「恋愛は、小さな選択の積み重ね。だから、選ぶ前に
                確かめる。」だった。恋愛プロセスの節と同じ見出し。
                同じ文を2回読ませると、2回目は読まれない。

                最後に要るのは考え方ではなく、押す場所と、
                押したあと何が起きるかの1行。 */}
            <p className="relative text-big font-black leading-[1.5]">
              {THESIS_B}
            </p>
            <p className="relative mt-4 max-w-[26em] text-[15px] leading-[1.8]">
              Aならこう感じた、Bならこう感じた。そこまでがこちらの仕事です。
              どちらにするかは、あなたが決めてください。
            </p>
            <div className="mt-7">
              <PlanCta
                plan={DEFAULT_PLAN}
                from="final"
                className="min-h-[60px] w-full rounded-pill bg-paper px-9 text-[16.5px] !text-brand-deep sm:w-auto"
              >
                女性に確カメる <span aria-hidden className="ml-2">→</span>
              </PlanCta>
            </div>
            <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[13px] font-bold text-paper">
              <li>匿名</li>
              <li>都度払い</li>
              <li>実在女性が回答</li>
              <li>
                {entry.name} <Yen yen={entry.yen} /> から
              </li>
            </ul>
          </div>
        </Wrap>
      </section>

      {/* スクロールを先導するタシカメ。進み具合と、押す場所を兼ねる */}
      <TashikameGuide />

      {/* ══ フッター ══ */}
      {/* ══════════════════════════════════════════════
          残すのは、外せないものだけ
          ══════════════════════════════════════════════
          前は、社名・住所・メール・4つのリンクに加えて、
          「契約と決済の相手方は当社」の3行まで置いていた。
          最後まで読んだ人に、もう一度全部読ませる形になっていた。

          住所とメールは /legal にある。
          商流の説明は利用規約の第1〜3条と、/legal の販売事業者の欄にある。
          ここで繰り返す必要は無い。

          外せないのは2つだけ。
            誰が売っているか（社名）
            特定商取引法に基づく表記への道

          この2つは、決済を扱う以上、トップから辿れる必要がある。
          畳んで（メニューの中だけに）しまうと、
          初めて来た人が確かめようとしたときに遠い。

          目立たせない。色は本文より薄く、字も小さく、1行に畳む。 */}
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
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="transition-colors hover:text-brand"
                  >
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
