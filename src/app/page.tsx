import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { openPlanIds } from "@/lib/call/gate";
import { plan as getPlan, ENTRY_PLAN, DEFAULT_PLAN } from "@/lib/ask/plans";
import FamilyCards from "@/components/brand/FamilyCards";
import { DEMO } from "@/lib/ask/demo";
import { EXAMPLES, TOPICS } from "@/lib/ask/examples";
import { AB_DEMO } from "@/lib/ask/ab";
import KoiFace from "@/components/koi/KoiFace";
import Timeline from "@/components/koi/Timeline";
import BriefCard from "@/components/koi/BriefCard";
import { DEMO_BRIEF } from "@/lib/koi/briefDemo";
import { DEMO_TIMELINE } from "@/lib/koi/timelineDemo";
import { DEMO_TALK } from "@/lib/koi/demo";
import SituationCardView from "@/components/koi/SituationCard";
import { DEMO_CARD } from "@/lib/koi/cardDemo";
import { heroSub } from "@/lib/koi/gate";
import { passEnabled } from "@/lib/stripe";
import { INCLUDED } from "@/lib/pass/entitle";
import PriceChooser from "@/components/pass/PriceChooser";
import { FREE_PEOPLE, FREE_RECORDS } from "@/lib/pass/free";
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
import { KNOWN_APPS } from "@/lib/koi/board";
import type { ImageKey } from "@/lib/images";
import HeroDashboard from "@/components/koi/HeroDashboard";
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
/* ── 質問を、芯に合わせて入れ替えた ────────────────
   前は「3人の意見が割れたら」「集まらなかったら」など、
   単発で異性に読んでもらう前提の質問が中心だった。

   いま最初に来るのは、そこではない。
     ChatGPT を使っているのに、これも要るのか
     アプリを何個使っていても大丈夫か
     何人まで登録できるか
   先に答えるのは、こちらにする。

   異性に読んでもらう側の質問（意見が割れたら等）は
   /plans と /ask が持っている。 */
const FAQ: { q: string; a: string; extra?: "ai" | "flow" | "safety" }[] = [
  {
    q: "ChatGPTを使っていても、必要ですか？",
    a: "ChatGPTはそのまま使ってください。倒しにいっていません。足りないのは、話したことが残らないところです。次に相談するとき、また最初から説明することになります。タシカメは、相手ごとに「どこまで進んでいて、次に何をするか」を覚えておく側です。恋亀の文を渡すので、話し相手は変わりません。",
    extra: "ai",
  },
  {
    q: "複数のマッチングアプリを使っていても大丈夫ですか？",
    a: "そのための形にしてあります。with・Pairs・タップルなど、どこで出会ったかを相手ごとに持つので、アプリをまたいで一覧になります。アプリごとに見比べる必要はありません。",
  },
  {
    q: "何人まで登録できますか？",
    a: "いまは上限を決めていません。同時に何人と進んでいても、それぞれ別に覚えています。一覧では、最後に動いた順に並びます。",
  },
  {
    q: "どうやって進みますか？",
    a: "3つです。恋亀の文をコピーしてChatGPTに貼る、気になっている人のことを普通に話す、その会話をタシカメに貼り戻す。あとは1枚に整理されて返ってきます。まとめてから貼る必要はありません。",
    extra: "flow",
  },
  {
    q: "無料体験では何ができますか？",
    a: "気になっている人を1人ぶん、整理できます。いまどこまで進んでいるか、次に何をするかまで出ます。登録もお支払いもありません。続きを覚えておくところから先が、月額です。",
  },
  {
    q: `実在する${advisorWord()}には、何を聞けますか？`,
    a: `「これを送ったら、実際どう受け取られるか」です。AIには分からないところだけ、人に回ります。毎回ではありません。月額に月1回ぶん含まれていて、それ以上は別にお申し込みいただきます。`,
  },
  {
    q: "友達に相談するのと、何が違いますか？",
    a: "友達に聞けるなら、そのほうがいいです。置き換えるつもりはありません。埋まっていないのは、聞きにくいときのほうです。同じ人の話を何度もするのは気が引ける、異性の友達がそんなに多くない、気を遣わない返事がほしい。そういうときの、もう一つの手です。",
  },
  {
    q: "相談した内容は、相手に知られませんか？",
    a: `知られません。相手の名前・写真・連絡先は保存していません。電話番号やアカウント名が会話に出てきても、こちらに届く前に伏せ字にします。答えてくれた${advisorWord()}とあなたが直接つながる仕組みも、作っていません。`,
    extra: "safety",
  },
  {
    q: "解約はいつでもできますか？",
    a: "できます。会員ページから、こちらに連絡しなくても解約できます。解約したあとも、お支払い済みの期間の終わりまでは使えます。",
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
            {/* 行き先を /trial から /koi へ変えた。
                /trial は「文章1件を異性が読む」体験で、
                ここで約束している「整理する」とは別のもの。
                押した人が着く先が違っていた。 */}
            <Link
              href="/koi"
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
            {/* ══════════════════════════════════════════
                着地先を /trial から /koi へ変えた
                ══════════════════════════════════════════
                「まず1回、無料で整理する」と書いているのに、
                /trial は「送る前の文章を1件、異性が読む」体験だった。
                押した人が、整理ではなく添削の画面に着いていた。

                /koi が、ここで約束しているものそのもの。
                  恋亀の文を受け取る → ChatGPTで話す → 貼る → 1枚になる
                登録も鍵も要らない。今日から動く。

                /trial（異性に読んでもらう体験）は消していない。
                あちらは「異性に確カメる」側の入口として、下の節から行く。 */}
            <Link
              href="/koi"
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

            {/* ══════════════════════════════════════════
                どのアプリでも、を先に出す
                ══════════════════════════════════════════
                「複数アプリ」と文字で書いても、自分のアプリが
                入っているかは分からない。名前を並べる。

                アプリ名は lib/koi/board.ts の APP_LABEL から引く。
                そこが受け取れる名前と、ここに出す名前がずれると、
                「Tinder も対応」と書いてあるのに
                貼ったら名前が揃わない、が起きる。

                ロゴは置かない。他社の商標なので、使うには許諾が要る。
                名前だけにする。 */}
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

        {/* ══════════════════════════════════════════
            1画面目の絵を、入れ替えた
            ══════════════════════════════════════════
            ここには Before → 実在する異性に相談 → After の3枚があった。

            見出しとボタンを「整理する」に変えたあとも、
            すぐ下のこの絵がいちばん大きく
            「異性に相談するサービス」と言い続けていた。
            絵のほうが強いので、変えた芯が打ち消されていた。

            実際の画面（相手の一覧）を出す。
            複数のアプリ、複数の相手、それぞれの次の一手。
            5秒で「何をする場所か」が分かるのは、言葉よりこちら。

            前の絵（components/brand/HeroBoard.tsx）は消した。
            残しておくと、芯が戻ったときに戻される。 */}
        {/* ══════════════════════════════════════════
            手が止まっている絵を、見出しの下に戻した
            ══════════════════════════════════════════
            1画面目を相手の一覧に替えたとき、この絵も一緒に外した。
            一覧は「何をする場所か」を見せるが、
            「それが自分のことだ」とは思わせない。

            絵が先、一覧が後。
              絵   送る前に手が止まっている（自分のこと）
              一覧 それが、こう整理される（この製品のこと）

            Before / After の3枚には戻さない。
            あれは「異性に相談するサービス」の見せ方だった。
            出すのは1枚だけ。 */}
        <Wrap className="pt-6">
          <div className="relative overflow-hidden rounded-card shadow-card">
            <Slot name="hero" rounded="" position="center 14%" className="h-[160px] w-full sm:h-[220px]" />
            {/* 絵の上に、迷いの言葉を1つだけ重ねる。
                3つ並べると、絵ではなく一覧になる */}
            <p className="absolute bottom-3 left-3 max-w-[16em] rounded-card bg-paper/95 px-3.5 py-2.5 text-[13px] font-bold leading-[1.6] text-slate shadow-card">
              これ、送っていいのかな…？
            </p>
          </div>
          <p className="mt-2 text-[11px] leading-[1.7] text-steel">
            ※ 写真はイメージです。
          </p>
        </Wrap>

        <div className="mt-6">
          <HeroDashboard />
        </div>

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
            /* 4つ目は、相手のことではない。
               AIに毎回いちから説明し直す負担のほう。
               ここが入っていないと、ただの物忘れの話に見える。 */
            ["AIに相談", "また最初から説明するの？"],
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
        {/* 畳んだ節から移した1行。
            上の絵（1画面目の一覧）が答えなので、ここは言葉だけでよい。 */}
        <p className="mt-3 max-w-[30em] text-[14px] leading-[1.9] text-steel">
          誰に何を送ったか。誰と電話したか。次に誰と会うか。
          頭の中だけで覚えておかなくて大丈夫です。
        </p>
      </Block>

      {/* ══ 1.06 「複数アプリ、複数人。全部ここに。」を畳んだ ══ */}
      {/* ══════════════════════════════════════════════
          同じ画面を、2回続けて出していた
          ══════════════════════════════════════════════
          1画面目の絵を、Before/After から相手の一覧に替えた。
          その直後にこの節があり、同じ一覧をもう一度出していた。

          携帯で見ると、2画面続けて同じカードが並ぶ。
          読む人は「さっき見た」と思って飛ばす。

          一覧は1画面目が持つ。
          ここで言いたかった1行（頭の中だけで覚えなくていい）は、
          その上の「判断疲れ」の節の締めに移した。 */}

      {/* ══ 1.065 AIで話す。貼る。終わり。 ══ */}
      {/* ══════════════════════════════════════════════
          やることを、3つに見せる
          ══════════════════════════════════════════════
          「ChatGPTで話して、貼ってください」と文で書くと、
          手間が多そうに読める。実際は3つしかない。

          数を先に見せる。1 話す／2 貼る／3 整理される。
          3つ目は本人がやることではないので、そこも伝わる。

          そのあとに、入れたものと出てくるものを並べる。
          変換そのものが商品なので、言葉で説明するより早い。 */}
      <Block>
        <h2 className="text-huge font-black leading-[1.35] text-slate">
          AIで話す。貼る。
          <br className="sm:hidden" />
          終わり。
        </h2>

        <ol className="mt-7 flex flex-col gap-2.5">
          {[
            ["1", "AIで話す", "ChatGPT Voice がおすすめ。Claude や Gemini でも大丈夫です。"],
            ["2", "タシカメに貼る", "相談の中身を、そのまま貼るだけ。まとめなくて大丈夫です。"],
            ["3", "整理される", "誰と／どこまで／次に何するか、が残ります。ここは何もしません。"],
          ].map(([n, head, sub]) => (
            <li key={n} className="flex items-start gap-3 rounded-soft bg-mist px-4 py-3.5">
              <span
                aria-hidden
                className="mt-[1px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-black text-paper"
              >
                {n}
              </span>
              <span className="min-w-0">
                <span className="block text-[14.5px] font-black leading-[1.5] text-slate">{head}</span>
                <span className="mt-0.5 block text-[12.5px] leading-[1.75] text-steel">{sub}</span>
              </span>
            </li>
          ))}
        </ol>

        {/* 入れたものと、出てくるもの。変換そのものが商品 */}
        <div className="mt-8 max-w-[26em]">
          <p className="text-[11.5px] font-bold text-steel">たとえば、こんな相談から</p>
          <p className="mt-2 rounded-card rounded-bl-[4px] bg-brand px-4 py-3 text-[13.5px] font-bold leading-[1.75] text-paper">
            昨日Aさんと2回目会って、水族館行きたいって言われた
          </p>

          <p aria-hidden className="py-3 text-center text-[18px] font-black text-brand">
            ↓
          </p>

          <p className="mb-2 text-[11.5px] font-bold text-steel">こう整理されます</p>
          <div className="rounded-card border border-line bg-paper p-4 shadow-card">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[15px] font-black text-slate">Aさん</span>
              <span className="rounded-pill bg-mist px-2 py-0.5 text-[10.5px] font-bold text-steel">
                with
              </span>
              <span className="text-[12px] font-bold text-steel">2回目デート後</span>
            </div>
            <div className="mt-2.5 flex items-start gap-2 border-t border-line pt-2.5">
              <span aria-hidden className="mt-[1px] shrink-0 text-[10px] font-black text-brand">
                NEXT
              </span>
              <span className="min-w-0 flex-1 text-[13.5px] font-bold leading-[1.6] text-slate">
                水族館の日程を決める
              </span>
            </div>
            <p className="mt-2 text-[11.5px] text-steel">いまは、自分から動く番</p>
          </div>
        </div>

        <p className="mt-5 text-[12px] leading-[1.8] text-steel">
          ※ 画面の見本です。特定の利用者のやりとりではありません。
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

        {/* ══════════════════════════════════════════
            何を渡すのかを、見せる
            ══════════════════════════════════════════
            「前回の続きから相談できます」と書いても、
            どうやって続くのかが分からない。

            渡す文章そのものを出す。これを見れば、
            毎回いちから説明しなくて済む理由が1秒で分かる。

            文章は lib/koi/brief.ts が作る。実際に出るものと同じ。 */}
        <div className="mt-5 max-w-[26em]">
          <BriefCard text={DEMO_BRIEF} demo />
        </div>
        <p className="mt-1.5 max-w-[30em] text-[13px] leading-[1.8] text-steel">
          相手が何人いても、それぞれ別に覚えています。
        </p>

        <p className="mt-5 text-[12px] leading-[1.8] text-steel">
          ※ 画面の見本です。特定の利用者の記録ではありません。
        </p>
      </Block>

      {/* ══ 1.1 話す → 1枚になる ══ */}
      {/* ══════════════════════════════════════════════
          1節に、1つのことだけ
          ══════════════════════════════════════════════
          ここは 1,193px あって、トップでいちばん高かった。
          中に3つ入っていたため。
            恋亀との会話（7往復→5往復に減らしたもの）
            できたもの（EPのカード）
            2回目は、続きから（もう1本の会話）

          3つめは、すぐ上の節（ここまでが残る）が同じことを
          言っている。「次に話すときは『Aさんなんやけど』から」。
          2つめも、出している形が違うだけで同じ。

          残すのは1つ。「話す」と「返ってくる1枚」の関係。
          会話は3往復だけ見せて、矢印で1枚につなぐ。

          出している1枚は、実際に返ってくるものと同じ部品
          （SituationCard）。ここだけ別に作ると、
          見せている1枚と返ってくる1枚がずれる。

          会話は ChatGPT でしてもらうので、吹き出しの上に
          そう書いておく。ここで話すと思われると、着いてから戸惑う。 */}
      <Block tint>
        <h2 className="text-huge font-black leading-[1.35] text-slate">
          話したら、
          <br className="sm:hidden" />
          1枚になって返る。
        </h2>
        <p className="mt-3 max-w-[30em] text-[14.5px] leading-[1.85] text-steel">
          入力する欄はありません。まとめなくても大丈夫です。
        </p>

        <div className="mt-7 max-w-[26em]">
          <p className="text-[11.5px] font-bold text-steel">ChatGPT で話す</p>
          <ul className="mt-2 flex flex-col gap-2.5 rounded-card bg-paper px-3 py-4 sm:px-4">
            {DEMO_TALK.slice(0, 4).map((t, i) => (
              <li
                key={t.say}
                className={`flex ${t.who === "me" ? "justify-end" : "justify-start"}`}
              >
                <div className="flex max-w-[86%] items-end gap-2">
                  {t.who === "koi" && (
                    <KoiFace size={30} delay={i * 0.4} className="-mb-1" />
                  )}
                  <p
                    className={`rounded-card px-3.5 py-2.5 text-[13px] leading-[1.75] ${
                      t.who === "me"
                        ? "rounded-br-[4px] bg-brand font-bold text-paper"
                        : "rounded-bl-[4px] bg-mist text-slate"
                    }`}
                  >
                    {t.say}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p aria-hidden className="py-3 text-center text-[18px] font-black text-brand">
            ↓
          </p>

          <p className="mb-2 text-[11.5px] font-bold text-steel">タシカメに残る</p>
          <SituationCardView card={DEMO_CARD} />
        </div>

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

      {/* ══ 4. 3つの役割 ══ */}
      {/* ══════════════════════════════════════════════
          ChatGPT を倒しにいかない
          ══════════════════════════════════════════════
          ここは「AI / タシカメ」の2枚だった。
          2枚だと、どうしても「どちらが優れているか」に読める。

          実際は競っていない。
          ChatGPT は会話が得意で、そのまま使ってもらう。
          タシカメが持つのは、相手ごとに覚えておくほう。

          3つに分けて、それぞれの持ち場を書く。
          AIを下に置かない。友達も下に置かない。
          「ここだけ埋まっていない」が伝わればよい。

          前の比較表（タシカメ / AI / 友達 / 恋愛コンサルの4列）は
          lib/ask/compare.ts に残してある（shown を true で戻せる）。 */}
      <Block tint>
        <h2 className="text-huge font-black leading-[1.35] text-slate">
          考えるのはAI。
          <br />
          確カメるのは人。
          <br className="sm:hidden" />
          覚えておくのがタシカメ。
        </h2>

        <div className="mt-7 flex flex-col gap-3">
          {[
            {
              who: "ChatGPT",
              can: "考える",
              lead: "返信案も、言い方も、選択肢も。いま使っているなら、そのまま使ってください。恋亀の文を渡すので、話し相手だけ変わります。",
            },
            {
              who: "タシカメ",
              can: "覚えておく",
              lead: "誰と、どのアプリで、どこまで進んでいて、次に何をするか。話すたびに1か所にたまります。毎回いちから説明しなくて済みます。",
              ours: true,
            },
            {
              who: `実在する${advisorWord()}`,
              can: "確カメる",
              lead: "AIで決めきれないときだけ。実際に読んだ人が、どう受け取ったかを返します。毎回ではありません。",
            },
          ].map((x) => (
            <div
              key={x.who}
              className={`rounded-card border p-5 shadow-card ${
                x.ours ? "border-brand bg-paper" : "border-line bg-paper"
              }`}
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className={`text-[12px] font-black ${x.ours ? "text-brand" : "text-steel"}`}>
                  {x.who}
                </p>
                <p className="text-[17px] font-black leading-[1.4] text-slate">{x.can}</p>
              </div>
              <p className="mt-2 text-[13px] leading-[1.8] text-steel">{x.lead}</p>
            </div>
          ))}
        </div>
      </Block>

      {/* ══ 4.5 友達との役割 ══ */}
      {/* ══════════════════════════════════════════════
          友達も、競合にしない
          ══════════════════════════════════════════════
          「友達より正確です」とは書かない。書けない。
          友達に聞けるなら、そのほうがいい。

          埋まっていないのは、聞ける相手がいない瞬間ではなく、
          聞きにくい瞬間のほう。
            毎回は聞きにくい
            同じ相談を何度もしたくない
            異性の友達がいない
            気を遣わない返事がほしい

          ここを名指しできると、友達を否定せずに済む。 */}
      <Block>
        <h2 className="text-huge font-black leading-[1.35] text-slate">
          友達に聞きたい。
          <br />
          でも、毎回は聞きにくい。
        </h2>

        <ul className="mt-7 flex max-w-[32em] flex-col gap-2.5">
          {[
            "同じ人の話を、何度もするのは気が引ける",
            "異性の友達が、そんなに多くない",
            "気を遣わない返事が、ほしいときがある",
          ].map((t) => (
            <li
              key={t}
              className="rounded-soft bg-mist px-4 py-3.5 text-[14px] leading-[1.8] text-steel"
            >
              {t}
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-[30em] text-[15px] font-bold leading-[1.85] text-slate">
          友達の代わりではありません。
          <br className="sm:hidden" />
          聞きにくいときの、もう一つの手です。
        </p>

        {/* 「異性に確カメる」側の入口。
            第一CTA（整理する）とは役が違うので、ここに置く。 */}
        <Link
          href="/trial"
          className="mt-6 inline-flex min-h-[50px] items-center justify-center rounded-pill border border-brand bg-paper px-6 text-[14.5px] font-bold text-brand"
        >
          {advisorWord()}に読んでもらう <span aria-hidden className="ml-1.5">&rarr;</span>
        </Link>
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
              期間と払い方を、分けて選ばせる
              ══════════════════════════════════════════
              期間4つ × 払い方2つで7通り。
              カードを7枚並べると、どれを見ればいいか分からない。

                1 使う期間を選ぶ（1 / 3 / 6 / 12か月）
                2 払い方を選ぶ（一括 / 月々）

              月払いは「いつでも解約」ではない。期間が決まっていて、
              支払いだけ分けるもの。札にも断りにも、必ず期間を書く。
              「月々2,780円」だけを大きく出さない。

              値段・採算・特典は lib/pass/periods.ts。
              一括が月払いより高い／長いほうが月あたり高い／
              どれかが限界利益率の床を割ると、公開の前に止まる。

              創業メンバー価格はやめた。一度下げた値段は、
              上げるときに必ず揉める。先着は、値段ではなく中身を足す。 */}
          <div className="mt-5">
            <PriceChooser />
          </div>

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
      {/* ══════════════════════════════════════════════
          最後は、覚えなくていいことで締める
          ══════════════════════════════════════════════
          ここは「Aならこう感じた、Bならこう感じた」で締めていた。
          異性に読んでもらうサービスだったころの締め。

          いま売っているのは、覚えておくこと。
          締めも、そちらにする。

          押す場所は1画面目と同じ「無料で整理する」。
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
            <p className="relative mt-4 max-w-[26em] text-[15px] leading-[1.8]">
              AIで考える。タシカメが覚える。迷ったら、人に確カメる。
            </p>
            <div className="mt-7">
              <Link
                href="/koi"
                className="flex min-h-[60px] w-full items-center justify-center rounded-pill bg-paper px-9 text-[16.5px] font-bold text-brand-deep sm:w-auto"
              >
                無料で整理する <span aria-hidden className="ml-2">→</span>
              </Link>
              <p className="mt-2.5 text-[12.5px] leading-[1.7] text-paper/90">
                {FREE_PEOPLE}人・{FREE_RECORDS}記録まで無料。登録はありません。
              </p>
            </div>
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
