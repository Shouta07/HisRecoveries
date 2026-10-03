import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { openPlanIds } from "@/lib/call/gate";
import { plan as getPlan, ENTRY_PLAN, DEFAULT_PLAN } from "@/lib/ask/plans";
import FamilyCards from "@/components/brand/FamilyCards";
import { DEMO } from "@/lib/ask/demo";
import { EXAMPLES, TOPICS } from "@/lib/ask/examples";
import { AB_DEMO } from "@/lib/ask/ab";
import TalkDemo from "@/components/koi/TalkDemo";
import KoiFace from "@/components/koi/KoiFace";
import PersonBoard from "@/components/koi/PersonBoard";
import Timeline from "@/components/koi/Timeline";
import { DEMO_TIMELINE } from "@/lib/koi/timelineDemo";
import { DEMO_BOARD } from "@/lib/koi/boardDemo";
import { DEMO_AGAIN } from "@/lib/koi/demo";
import { heroSub } from "@/lib/koi/gate";
import { passEnabled } from "@/lib/stripe";
import { PASS_YEN, EARLY_YEN, EARLY_SEATS, earlyOpen, INCLUDED } from "@/lib/pass/entitle";
import { PAYWALL_NAME, PAYWALL_HEAD, MANAGE_NOTE } from "@/lib/pass/copy";
import { advisorWord, notYetNote } from "@/lib/who";
import { VERDICTS } from "@/lib/ask/model";
import { HERO_A, HERO_B, NAME, SUB, THESIS, THESIS_A1, THESIS_A2, THESIS_B, DEFINITION, HERO_HOW, TAGLINE, TAB_TITLE } from "@/lib/voice";
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
import MomentsArt from "@/components/brand/MomentsArt";
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
  // タブに出るのは店名。住所（tashikame.app）とは別
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
  { n: "02", t: `条件に合う${advisorWord()}に届く`, d: `年代や立場を選べます。確認が済んだ方にだけ届きます。` },
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
    a: `AIが出すのは「たぶんこう思われます」です。ここで返ってくるのは、実在する${advisorWord()}が実際にどう思ったかです。予想ではなく、本当の反応です。まずAIに聞いていい。文面を作るのも、考えをまとめるのもAIのほうが得意です。それでも最後に残る「実際どう思われるか」だけ、人に聞きます。`,
    extra: "ai",
  },
  {
    q: "どうやって進みますか？",
    a: `4つです。送る前のものを出す、条件に合う${advisorWord()}に届く、一人ずつ返ってくる、直すかそのまま出すかを決める。出すのは送る前のLINEか自己紹介文で、そのまま貼るだけです。`,
    extra: "flow",
  },
  {
    // ── いちばん言いたいこと ────────────────────────
    // 3人に見せると、答えが割れることがある。
    // そのとき「どっちが正しいの？」が最初に来る。
    //
    // ここで「多いほうが正解です」と答えると、
    // 多数決を売っていることになる。売っているのは反応のほう。
    //
    // 割れたことを、失敗や中途半端として見せない。
    // 人によって違うと分かること自体が、聞いた結果。
    q: "3人の意見が全部違ったら、どうすればいいですか？",
    a: "それで大丈夫です。ここは正解を決める場所ではありません。感じ方が人によって違うこと自体が、知りたかったことです。3人とも気になると言えば、一度立ち止まれます。分かれたなら「人による」と分かります。どちらに寄せるかは、あなたが決めてください。",
  },
  {
    q: `3人がそう言えば、${advisorWord()}みんながそう思うということですか？`,
    a: `違います。読んだ人がそう感じた、というだけです。だから意見が分かれたところも、そのまま出します。${advisorWord()}みんなの答えではありません。`,
  },
  {
    q: "悪いところを無理に探されませんか？",
    a: "探しません。問題が無ければ「このままで大丈夫そう」と返ってきます。それも答えです。悪いところ探しになると、本当に直すべきところが埋もれます。",
  },
  {
    q: "相手に知られませんか？",
    a: `知られません。匿名で使えて、相手の名前・写真・連絡先は保存していません。答えてくれた${advisorWord()}とあなたが直接つながる仕組みも、作っていません。`,
    extra: "safety",
  },
  {
    q: "どのくらいで返ってきますか？",
    a: `条件に合う${advisorWord()}が何人いるかによります。実際のところが分かるまでは、何分とは言いません。いま何人に届いて何人が見ているかは、画面で分かるようにしてあります。`,
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
          <p className="text-[11.5px] font-black text-brand">実在する{advisorWord()}{DEMO.says.length}人</p>
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
        AIは予測する。{advisorWord()}は、実際に受け取る。
      </p>

      {/* 敵対させない。AIで選択肢を作り、その選択肢を人で確かめる */}
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {[
          { who: "AIがやること", on: false, list: ["文面を考える", "選択肢を作る", "状況を整理する"] },
          {
            who: "タシカメがやること",
            on: true,
            list: [
              `その選択肢を実在する${advisorWord()}が読む`,
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
            {/* ずっと出ているボタン。
                前は「異性に確カメる」で /ask へ行っていた。
                第一CTAを「整理する」に変えたので、ここも合わせる。
                上下で行き先が違うと、どちらが本筋か分からなくなる。 */}
            <Link
              href="/trial"
              className="inline-flex min-h-[42px] shrink-0 items-center justify-center whitespace-nowrap rounded-pill bg-brand px-3.5 text-[13px] font-bold text-paper shadow-card sm:px-5 sm:text-[13.5px]"
            >
              無料で整理する
            </Link>
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
            {HERO_A}
            <br />
            <span className="relative inline-block">
              {HERO_B}
              <span
                aria-hidden
                className="absolute -bottom-0.5 left-0 -z-10 h-[0.42em] w-full rounded-[2px] bg-brand/25"
              />
            </span>
          </h1>
          {/* 何をすればいいかを1つだけ。いちばん軽い動作を書く。

              恋亀と話せるかどうかで中身が変わる（lib/koi/gate.ts）。
              鍵が入っていないあいだは、いまできること（確カメる）が出る。
              手で書き換えないので、入れ忘れ・戻し忘れが起きない。 */}
          <p className="mt-2.5 text-[18px] font-black leading-[1.5] text-brand sm:text-[20px]">
            {heroSub}
          </p>
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
          {/* ══════════════════════════════════════════
              第一CTAを「整理する」にした
              ══════════════════════════════════════════
              前はここが「異性に確カメる」で、/ask へ行っていた。

              それだと、来た人が最初に受け取るのが
              「異性に相談できるサービス」になる。
              単発の相談に見えて、月額の理由がぼける。

              最初に体験してほしいのは、相談そのものより
              「話した結果、自分の状況が1枚になって出てくる」ほう。
              そこへ行く道（/trial）を第一にする。

              「異性に確カメる」は下げて、節のほうで出す。 */}
          <div className="mt-5 max-w-[22em]">
            <Link
              href="/trial"
              className="flex min-h-[56px] w-full items-center justify-center rounded-pill bg-brand px-8 text-[16px] font-bold text-paper shadow-card"
            >
              まず1回、無料で整理する <span aria-hidden className="ml-2">&rarr;</span>
            </Link>
            <p className="mt-2 text-[12px] leading-[1.7] text-steel">
              登録なし。気になっている人のことを1人ぶん話すだけです。
            </p>
            {/* ══════════════════════════════════════════
                はじめての人の道を、ここで分ける
                ══════════════════════════════════════════
                上のボタンは /ask へ行き、書いたあとお支払いになる。
                お支払いの口が開いていないあいだ、その道は
                「いま申し込めません」で止まる（/ask が先に言う）。

                体験（/trial）は、そのあいだも動く。
                保存先が無くてもメールに回るので、止まらない。

                ここは静的に作る面なので、開いているかどうかで
                出し分けない。出し分けると、鍵を入れても
                作り直すまで画面が変わらない。
                /trial 側が、自分の開き閉じを実行時に見る。 */}
            {/* 第二CTA。AIで決めきれないときの道。
                第一CTAと役が違うので、見た目でも差を付ける。 */}
            <p className="mt-3 text-[13px] leading-[1.8] text-steel">
              AIで決めきれないときは{" "}
              <PlanCta
                plan={ENTRY_PLAN}
                from="hero_second"
                className="!inline font-bold text-brand underline decoration-line underline-offset-4"
              >
                {advisorWord()}に確カメる
              </PlanCta>
              {" "}こともできます。
            </p>

            {/* ══════════════════════════════════════════
                「異性」と書く以上、ここで断る
                ══════════════════════════════════════════
                相手の呼び方を「異性」に統一した（lib/who.ts）。
                男女どちらが読んでも自分のことだと分かる代わりに、
                どちらの向きも開いているように読める。

                実際に開いているのは男性からの相談だけ。
                女性の回答者しかいないので、女性の方には届けられない。

                断りは、前は料金のところにしか無かった。
                6500px の下のほうなので、1画面目で「使える」と
                思った人は、そこまで読まない。

                押す場所のすぐ下に置く。
                両方の向きが開いたら、ひとりでに消える。 */}
            {notYetNote() && (
              <p className="mt-3 rounded-soft bg-mist px-3.5 py-3 text-[12px] leading-[1.8] text-steel">
                {notYetNote()}
              </p>
            )}
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

      {/* ══ 1.05 判断疲れ ══ */}
      {/* ══════════════════════════════════════════════
          疲れているのは、恋愛にではない
          ══════════════════════════════════════════════
          「恋愛相談がしたい」人は、そんなに多くない。
          多いのは、マッチはしていて、そのあとで止まっている人。

            withのAさん、昨日何話したっけ
            PairsのBさん、電話いつするんやっけ
            タップルのCさん、これ返信したっけ

          アプリが複数、相手が複数。そのたびに小さな判断が増える。
          疲れているのは、判断に。

          ここを名指しできると、ChatGPT とも友達とも
          競合しなくて済む。困りごとの形が違うので。 */}
      <Block>
        <h2 className="text-huge font-black leading-[1.35] text-slate">
          マッチするほど、
          <br className="sm:hidden" />
          考えることが増えていく。
        </h2>

        <ul className="mt-7 flex max-w-[34em] flex-col gap-2.5">
          {[
            ["withのAさん", "昨日、何話したっけ"],
            ["PairsのBさん", "電話、いつするんやっけ"],
            ["タップルのCさん", "これ、返信したっけ"],
            ["Dさん", "初デート、いつやった"],
          ].map(([who, say]) => (
            <li
              key={who}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-soft bg-mist px-4 py-3.5"
            >
              <span className="text-[12.5px] font-black text-steel">{who}</span>
              <span className="text-[14.5px] font-bold leading-[1.7] text-slate">{say}</span>
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-[30em] text-[15px] font-bold leading-[1.85] text-slate">
          恋愛に疲れているというより、
          <br className="sm:hidden" />
          判断に疲れているのかもしれません。
        </p>
      </Block>

      {/* ══ 1.06 全部ひとつに ══ */}
      {/* ══════════════════════════════════════════════
          ここが、このサービスの芯
          ══════════════════════════════════════════════
          上で名指しした困りごとに、そのまま answer を返す節。

          文字で説明しない。画面を出す。
          「誰と」「どのアプリで」「どこまで」「次に何を」が
          1枚で分かることが、ここで伝わればよい。

          出している部品（PersonBoard）は、実際の画面
          （/koi/<鍵>）と同じもの。見本の中身だけが違う。
          別に作ると、売っている画面と見せている画面がずれる。 */}
      <Block tint>
        <h2 className="text-huge font-black leading-[1.35] text-slate">
          複数アプリ、複数人。
          <br />
          全部ここに。
        </h2>
        <p className="mt-3 max-w-[30em] text-[14.5px] leading-[1.85] text-steel">
          誰に何を送ったか。誰と電話したか。次に誰と会うか。
          頭の中だけで覚えておかなくて大丈夫です。
        </p>

        <div className="mt-7 max-w-[30em]">
          <PersonBoard cards={DEMO_BOARD} />
        </div>

        <p className="mt-5 text-[12px] leading-[1.8] text-steel">
          ※ 画面の見本です。特定の利用者の記録ではありません。
        </p>
      </Block>

      {/* ══ 1.07 ここまでが残る ══ */}
      {/* ══════════════════════════════════════════════
          相談して終わりじゃない
          ══════════════════════════════════════════════
          相談だけが並んでいると、相談サービスに見える。

          並べるのは 相談 → 行動 → 結果。
            2回目に誘うか話した   （相談）
            誘ってOKをもらった    （行動と結果）
            NEXT 日程を決める     （次）

          ここが続いているから、次に話すときに
          「Aさんなんやけど」から始められる。
          それが月額の理由そのもの。

          判定は lib/koi/timelineDemo.ts。
          相談だけ／行動だけになったら、公開の前に止まる。 */}
      <Block>
        <h2 className="text-huge font-black leading-[1.35] text-slate">
          相談して、
          <br className="sm:hidden" />
          終わりじゃない。
        </h2>
        <p className="mt-3 max-w-[30em] text-[14.5px] leading-[1.85] text-steel">
          送った。返信が来た。電話した。会った。
          その結果まで残るから、次の相談がラクになります。
        </p>

        <div className="mt-7 max-w-[26em] rounded-card border border-line bg-paper p-5 shadow-card">
          <p className="text-[13px] font-black text-slate">
            Aさん
            <span className="ml-2 rounded-pill bg-mist px-2 py-0.5 text-[10.5px] font-bold text-steel">
              with
            </span>
          </p>
          <div className="mt-4">
            <Timeline items={DEMO_TIMELINE} />
          </div>
        </div>

        <p className="mt-6 max-w-[30em] text-[15px] font-bold leading-[1.85] text-slate">
          次に話すときは、「Aさんなんやけど」から始められます。
        </p>
        <p className="mt-1.5 max-w-[30em] text-[13px] leading-[1.8] text-steel">
          相手が何人いても、それぞれ別に覚えています。
        </p>

        <p className="mt-5 text-[12px] leading-[1.8] text-steel">
          ※ 画面の見本です。特定の利用者の記録ではありません。
        </p>
      </Block>

      {/* ══ 1.1 恋亀との会話 ══ */}
      {/* ══════════════════════════════════════════════
          説明より先に、会話を見せる
          ══════════════════════════════════════════════
          「話すだけで整理されます」と書いても伝わらない。
          やりとりを見せて、そのあとに、できたものを出す。

          順番は 会話 → できたもの（EP）→ 人に聞く提案。
          最後が「人に聞ける」なのは、そこが値段の理由だから。

          言葉と判定は lib/koi/demo.ts。
          恋亀の返事が2文を超えたり、質問が2つ入ったり、
          会話に出ていないことがEPに入ると、公開前に止まる。 */}
      <Block tint>
        <h2 className="text-huge font-black leading-[1.35] text-slate">
          話したら、
          <br className="sm:hidden" />
          ここまで残る。
        </h2>
        <p className="mt-3 max-w-[30em] text-[14.5px] leading-[1.85] text-steel">
          入力する欄はありません。話した内容から、ひとりでに残ります。
        </p>

        <div className="mt-6 max-w-[34em]">
          <TalkDemo />
        </div>

        {/* ══════════════════════════════════════════════
            「2回目は、続きから」を、ここに畳んだ
            ══════════════════════════════════════════════
            前は、すぐ下に独立した節として置いていた。

            同じ恋亀との会話を、見出し・説明・吹き出しの組で
            2回続けて出していたので、読む人は
            「さっきと同じものをもう一度見せられている」と感じる。
            実測で、デモ3つがページの45%を占めていた。

            中身（2回目は覚えている）は残す。ここが月額の理由で、
            消すと月額が「AIの利用料」にしか見えなくなる。
            ただし、節ではなく、1回目の続きとして小さく出す。

            判定は lib/koi/demo.ts にそのまま置いてある。
              2回目が恋亀から始まると落ちる（聞き直している）
              利用者の最初の一言が長いと落ちる（説明させている）
              1回目の「次にやること」とつながっていないと落ちる */}
        <p className="mt-7 max-w-[30em] text-[14px] font-black leading-[1.7] text-slate">
          2回目は、続きから。
          <span className="ml-1.5 font-bold text-steel">
            前回どこまで話したかを、もう一度説明しなくて済みます。
          </span>
        </p>

        <ul className="mt-3 flex max-w-[34em] flex-col gap-2.5 rounded-card bg-paper px-3 py-4 sm:px-4">
          {DEMO_AGAIN.map((t) => (
            <li key={t.say} className={`flex ${t.who === "me" ? "justify-end" : "justify-start"}`}>
              <div className="flex max-w-[86%] items-end gap-2">
                {t.who === "koi" && <KoiFace size={34} delay={0.4} className="-mb-1" />}
                <p
                  className={`rounded-card px-3.5 py-2.5 text-[13.5px] leading-[1.75] ${
                    t.who === "me"
                      ? "rounded-br-[4px] bg-brand font-bold text-paper"
                      : "rounded-bl-[4px] bg-paper text-slate shadow-card"
                  }`}
                >
                  {t.say}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-3 max-w-[30em] text-[12.5px] leading-[1.8] text-steel">
          相手が何人いても、それぞれ別に覚えています。
        </p>

        <p className="mt-5 text-[12px] leading-[1.8] text-steel">
          ※ 画面の見本です。特定の利用者のやりとりではありません。
        </p>
      </Block>

      {/* ══ 1.2 紹介動画を外した ══ */}
      {/* ══════════════════════════════════════════════
          中身が、いまの商品と合わなくなった
          ══════════════════════════════════════════════
          「タシカメは、どういうサービスか」という動画だったが、
          説明しているのは確カメる（送る前に女性に見てもらう）のほう。

          いまの中心は恋亀に話すことなので、
          見出しで恋亀を名乗ったすぐ下に、別の商品の説明が来ていた。

          外した。277px。

          部品（VideoEmbed）と動画そのものは消していない。
          撮り直したら、ここへ戻す。
          押されるまで iframe を作らない作りもそのまま残っている。 */}

      {/* ══ 1.5 「こんな瞬間」を外した ══ */}
      {/* 絵と、相談の例12件を並べていた。

          どちらも「こういう場面で使える」を見せるもの。
          恋亀との会話が、同じことを実際のやりとりで見せている。
          絵で場面を並べるより、会話1本のほうが早い。

          絵（public/img/moments.jpg）と部品は消していない。
          相談の例（examples.ts）も残っている。 */}

      {/* ══ 2.4 「返ってくるのは、こういうものです。」を外した ══ */}
      {/* ══════════════════════════════════════════════
          見本を1つに絞る
          ══════════════════════════════════════════════
          ここには、相談1件ぶんの見本を丸ごと出していた。
            送る前の文 → 異性3人の返事（長文）→ 決めたこと
          実測で 1,255px。トップでいちばん高い節だった。

          すぐ上に、恋亀との会話の見本がある。
          読む人は、1画面のうちに作り物の見本を2つ続けて読むことになる。

          「何が返ってくるか」は、料金の節が項目で持っている
          （plans.ts の includes）。
          /ask と /trial でも、申し込む直前に同じことを書いている。

          部品（ResultCase）と中身（cases.ts の OPEN_CASES）は消していない。
          /plans と結果の画面が、いまも使っている。 */}

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

      {/* ══ 3.5 「何を確カメられるか」を外した ══ */}
      {/* ══════════════════════════════════════════════
          恋亀が主役になって、役目が終わった
          ══════════════════════════════════════════════
          LINE / 写真・プロフィール / 誘い方 / デートのあと の
          4枚を出していた。押すと、その種類で相談が始まる。

          それは「相談の種類を自分で選んでから書く」作りのときに要るもの。
          いまの中心は、恋亀に話すこと。種類は選ばない。話せば決まる。

          4つの場面そのものは、すぐ上の「こんな瞬間」の絵と、
          やりとりの見本が見せている。3回目になっていた。

          568px。言葉と判定（lib/ask/examples.ts の TOPICS）は
          消していない。相談を書く画面では、まだ使える。 */}

      {/* ══ 3.7 「AとBを並べる」を外した ══ */}
      {/* 票と理由を見せる節。作りとしては良かったが、
          確カメるの見せ方が2つ（やりとりの見本とこれ）になっていた。

          恋亀が主役になって、確カメるは「本当に迷ったときの手段」に
          なったので、見せ方は1つでいい。

          仕組み（PICKS / aggregate）も言葉（ab.ts）も消していない。
          相談を書く画面では、いまも AとB を選べる。 */}

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
          人に確カメる。
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
              lead: "送る相手に近い人が、実際に読む。感じたことがそのまま返る。",
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
          AIは、相手側の人が実際にどう感じるかまでは分かりません。
          そこだけ、本人に聞いたほうが早い。
        </p>
      </Block>

      {/* ══ 5. 「迷うのは、一度じゃない」を外した ══ */}
      {/* 恋愛のどの段で迷うかを、図で見せていた。

          「何度も迷う」は、恋亀の「2回目は、続きから」が
          実際のやりとりで見せている。図は、その説明をもう一度していた。

          Journey の部品と journey.ts は消していない。 */}

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
        {/* ── 月額を中心に置いた ──────────────────────────
            ここは「はじめの1件は ¥980」から始まっていた。
            都度課金が中心の、前のモデルの料金表。

            売っているものが変わった。
            いま売るのは「覚えてもらっている状態」で、
            そのうえで、迷ったときに人にも聞ける。

            1件いくらで並べると、毎回いちいち買う形に見える。
            それだと「覚えている」に値段が付かない。

            ── まだ買えない ──────────────────────────
            Price ID（STRIPE_PASS_PRICE_ID）が入っていないので、
            月額は受付前。入れば、ひとりでに開く。

            単発は、月のぶんを使い切ったときのために下に残す。 */}
        <div className="mt-5 max-w-[30em] rounded-card border-2 border-brand bg-paper p-5 shadow-card sm:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[12px] font-black tracking-[0.06em] text-brand">
              {PAYWALL_NAME}
            </p>
            {!passEnabled && (
              <span className="rounded-pill bg-mist px-2.5 py-1 text-[10.5px] font-bold text-steel">
                受付前
              </span>
            )}
          </div>

          <p className="mt-2 text-[17px] font-black leading-[1.6] text-slate sm:text-[19px]">
            {PAYWALL_HEAD}
          </p>

          {/* ══════════════════════════════════════════
              はじめの100人の値段を、隠さない
              ══════════════════════════════════════════
              「今だけ」「先着」とは書かない（voice.ts の CHEAP）。
              書くのは「はじめの100人」という事実だけ。
              100人に達したら、EARLY_SEATS を見て消す。

              安いほうを大きく、通常をその下に小さく。
              取り消し線は引かない。値引きに見せない。 */}
          {/* 人数に達したら、はじめの値段ごと消える（earlyOpen）。
              「先着100名」と書く以上、本当に100名で終わらせないと
              景表法（有利誤認）に触れる。手で消すと必ず忘れる。 */}
          {earlyOpen ? (
            <>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-2.5 text-[30px] font-black leading-none text-slate sm:text-[34px]">
                <span>
                  <Yen yen={EARLY_YEN} />
                  <span className="ml-1.5 align-middle text-[14px] font-bold text-steel">／月</span>
                </span>
                <span className="rounded-pill bg-brand px-2.5 py-1 text-[11px] font-black text-paper">
                  先着{EARLY_SEATS}名
                </span>
              </p>
              <p className="mt-1.5 text-[12.5px] leading-[1.75] text-steel">
                まだ出来上がっていないものに、最初から付き合ってもらうぶんの値段です。
                <br />
                {EARLY_SEATS}名に達したら <Yen yen={PASS_YEN} />／月 になります。
              </p>
            </>
          ) : (
            <p className="mt-3 text-[30px] font-black leading-none text-slate sm:text-[34px]">
              <Yen yen={PASS_YEN} />
              <span className="ml-1.5 align-middle text-[14px] font-bold text-steel">／月</span>
            </p>
          )}

          <ul className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4">
            {INCLUDED.map((x) => (
              <li key={x} className="flex items-start gap-2 text-[13px] leading-[1.7]">
                <span aria-hidden className="mt-[3px] shrink-0 text-[11px] font-black text-brand">
                  ✓
                </span>
                <span className="min-w-0 text-slate">{x}</span>
              </li>
            ))}
          </ul>

          <p className="mt-3.5 text-[12.5px] leading-[1.8] text-steel">
            {MANAGE_NOTE}
          </p>

          {/* 開いていない向きがあるなら、買う場所で断る。
              いま回答者は女性だけなので、女性の方は確カメるを使えない。
              買ったあとで気づくのが、いちばん悪い（lib/who.ts）。 */}
          {notYetNote() && (
            <p className="mt-2.5 rounded-soft bg-mist px-3 py-2.5 text-[12px] leading-[1.75] text-steel">
              {notYetNote()}
            </p>
          )}
        </div>

        {/* ── 単発は、残すが主役にしない ──────────────────
            月のぶん（月1回）を使い切ったときのために置いておく。

            §52 で「単発商品が大量に並ぶ価格表」を削るよう言われている。
            消さずに畳む。使い切った人には要るし、
            月額が開くまでは、ここだけが買える口になる。 */}
        <details className="group mt-6">
          <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-3 rounded-card border border-line bg-paper px-4 text-[13.5px] font-bold text-steel shadow-card">
            1回ずつ買う
            <span aria-hidden className="text-[12px] group-open:hidden">
              開く
            </span>
            <span aria-hidden className="hidden text-[12px] group-open:inline">
              閉じる
            </span>
          </summary>
          <div className="mt-4">
            <FamilyCards openIds={openPlanIds()} />
          </div>
        </details>

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
                {advisorWord()}に確カメる <span aria-hidden className="ml-2">→</span>
              </PlanCta>
            </div>
            <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[13px] font-bold text-paper">
              <li>匿名</li>
              <li>都度払い</li>
              <li>実在する{advisorWord()}が回答</li>
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
                /* 連絡先。審査でも、困った人も、まずここを探す。
                   /legal にも書いてあるが、1枚めくらないと出てこない。
                   返金やキャンセルの行き先は /legal が持っている。 */
                [`mailto:${site.company.email}`, "お問い合わせ"],
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
