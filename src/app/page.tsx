import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { openPlanIds } from "@/lib/call/gate";
import {
  PLANS,
  plan as getPlan,
  tier as getTier,
  ENTRY_PLAN,
  DEFAULT_PLAN,
  OPEN_USE_CASES,
} from "@/lib/ask/plans";
import { DEMO, count } from "@/lib/ask/demo";
import {
  ALTERNATIVES,
  COMPARE,
  COMPARE_NOTE,
  COMPARE_SCOPE,
  INSTEAD,
} from "@/lib/ask/compare";
import { VERDICTS, PANEL_AGES, ATTRS_OPEN } from "@/lib/ask/model";
import { NAME, SUB, THESIS, THESIS_A, THESIS_A1, THESIS_A2, THESIS_B, DEFINITION, TAGLINE } from "@/lib/voice";
import { supply } from "@/lib/supply";
import Reveal from "@/components/brand/Reveal";
import PlanCta from "@/components/brand/PlanCta";
import Tashikame from "@/components/brand/Tashikame";
import Journey from "@/components/brand/Journey";
import TashikameGuide from "@/components/brand/TashikameGuide";
import MenuButton from "@/components/brand/MenuButton";
import Flourish from "@/components/brand/Flourish";
import Slot from "@/components/brand/Slot";
import type { ImageKey } from "@/lib/images";
import HeroBoard, { HeroNote } from "@/components/brand/HeroBoard";
import CaseRows from "@/components/brand/CaseRows";
import PlanCards from "@/components/brand/PlanCards";
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
  title: `${NAME} — ${THESIS_B}`,
  description: `${DEFINITION}${THESIS} ${SUB}`,
  alternates: { canonical: site.url },
};

const NAV = [
  ["#moments", "恋愛の道のり"],
  ["#before-after", "実例"],
  ["#faq", "よくある質問"],
  // 「どれを使う？」は、別の節として持っていた。
  // 料金と1つにしたので、行き先も1つでいい
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
        href="/safety"
        className="mt-4 inline-flex min-h-[44px] items-center text-[13px] font-bold text-brand underline decoration-line underline-offset-4"
      >
        できないことも含めて、詳しく
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
      <Wrap className="py-12 sm:py-16 lg:py-20">{children}</Wrap>
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
const USE_ICON: Record<string, string> = {
  message: "M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20.5l1.5-4.6A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4Z",
  photo: "M6 3h8l4 4v14H6z M14 3v4h4 M9 12h6 M9 16h4",
  signal: "M4 18v-6M10 18V8M16 18v-9M22 18V5",
  date: "M5 3h6l-2 7a3 3 0 0 1-2 0zM8 10v9M5.5 21h5M19 3h-6l2 7a3 3 0 0 0 2 0zM16 10v9M13.5 21h5",
  romance: "M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20",
  distance: "M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4",
  other: "M12 17h.01M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7v.5",
};

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
          {/* 上から「恋に迷ったら、／タシカメ」と読ませる。
              2行で1つの文になるので、標語の側に名前は入れない */}
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Tashikame size={44} />
            <span className="min-w-0">
              <span className="block truncate text-[10.5px] font-bold leading-[1.3] text-steel">
                {TAGLINE}
              </span>
              <span className="block truncate text-[21px] font-black leading-[1.15] tracking-[0.02em] text-slate">
                {NAME}
              </span>
            </span>
          </Link>
          <nav aria-label="サイト" className="flex shrink-0 items-center gap-5">
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
            {/* 答える側の入口。トップの最後から外したので、ここが唯一の常設導線。
                買う人の押す場所と同じ大きさにしない（押す先が2つになる） */}
            <Link
              href="/join"
              className="hidden whitespace-nowrap text-[13px] font-bold text-steel transition-colors hover:text-brand sm:inline"
            >
              答える側になる
            </Link>
            <PlanCta
              plan={DEFAULT_PLAN}
              from="header"
              className="min-h-[42px] rounded-pill bg-brand px-5 text-[13.5px] !text-paper shadow-card"
            >
              確かめる
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
        <Wrap className="pb-4 pt-6 sm:pb-5 sm:pt-8">
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
          <p className="mt-4 max-w-[38em] text-[14.5px] font-bold leading-[1.75] text-steel sm:text-[16px]">
            {DEFINITION}
          </p>
        </Wrap>

        {/* 相談する男性と、読んで返す女性を1枚に入れる。
            片方だけだと、誰が誰に何をしてもらえるのかが伝わらない。 */}
        <HeroBoard />

        <Wrap className="relative pb-10 pt-3 sm:pb-16 sm:pt-8 lg:pt-8">
          <div className="lg:max-w-[34em]">

            {/* いくらなのかを、1画面目で出す。
                下まで読まないと値段が分からないと、
                読んでいるあいだずっと「いくらだろう」が残る。
                まとめ売りなので「1件いくら」に見せない
                （1つの素材に8,000円を払う話になってしまう）。 */}
            <ul className="mt-4 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[13.5px] font-bold text-slate">
              <li>
                <Yen yen={entry.yen} />
                <span className="ml-1 text-[12.5px] font-normal text-steel">
                  / {entry.uses}回分
                </span>
              </li>
              <li aria-hidden className="text-line">|</li>
              <li>月額なし</li>
              <li aria-hidden className="text-line">|</li>
              <li>匿名</li>
            </ul>

            {/* 押す場所も、スクロールさせない */}
            <div data-hero-cta className="mt-5 max-w-[24em]">
              <PlanCta
                plan={DEFAULT_PLAN}
                from="hero"
                className="min-h-[60px] w-full rounded-pill bg-brand px-9 text-[17px] !text-paper shadow-card"
              >
                今の選択を確かめる <span aria-hidden className="ml-2">&rarr;</span>
              </PlanCta>
            </div>

            {/* 押す前に引っかかるところを、4つだけ先に消す。
                文字を並べるより、絵があるほうが読まずに入る。 */}
            <ul className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
              {[
                { t: "実在女性が回答", d: "M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1 M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7 M21 20v-1a4 4 0 0 0-3-3.9" },
                { t: "匿名OK", d: "M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4" },
                { t: "都度払い", d: "M3 7h18v12H3z M3 11h18" },
                sup.canPromiseSpeed
                  ? { t: "最短数分", d: "M13 2 4 14h7l-1 8 9-12h-7z" }
                  : { t: "追加料金なし", d: "M12 3v18 M8.5 7.5h5.2a2.6 2.6 0 0 1 0 5.2H9.6a2.6 2.6 0 0 0 0 5.2h5.9" },
              ].map((x) => (
                <li key={x.t} className="flex flex-col items-center gap-1.5 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-tint">
                    <svg aria-hidden viewBox="0 0 24 24" className="h-[22px] w-[22px] text-brand" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={x.d} />
                    </svg>
                  </span>
                  <span className="text-[11px] font-bold leading-[1.4] text-slate sm:text-[12.5px]">
                    {x.t}
                  </span>
                </li>
              ))}
            </ul>

            {/* 「自己紹介文／メッセージ／会話」の3つを、ここに並べていた。
                1画面目で商品の種類を選ばせていたことになる。
                何を見てもらうかは、相談を書き始めてから選べばいい。
                最初の画面で押す場所は、1つでいい。 */}

            <div className="mt-6">
              <HeroNote />
            </div>

            {/* 受け付けていないことの断りは、値段の節（買う場所）に置いてある。
                1画面目で先に言うと、見る前に帰る。隠してはいない。 */}


          </div>
        </Wrap>

      </section>

      {/* ══ 2. 恋愛の道のりと、その場面 ══ */}
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

          {/* 案内役。見出しの下、説明の右。見出しに被らせない */}
          <Tashikame
            size={92}
            className="pointer-events-none absolute right-0 top-[96px] opacity-95 sm:!h-[150px] sm:!w-[150px] sm:top-[70px] lg:!h-[180px] lg:!w-[180px] lg:top-[56px]"
          />
        </div>

        {/* ここでは売らない。どの段で何に迷うかを書くだけ。
            押せる場所を作らない（作ると、この節が考え方と商品の入口を
            両方背負って、どちらも中途半端になる）。
            売るのは、次の「こんな選択を、選ぶ前に」と料金の節。 */}
        <Journey />

        {/* 一度で終わらせない。次の分岐点が来たときに、また開くもの。
            ここは機能の説明ではなく、続けて使える理由として書く。 */}
        <div className="mt-9 flex items-start gap-4 rounded-card border border-line bg-paper px-5 py-5 shadow-card">
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3.5 2" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-[14.5px] font-black leading-[1.6] text-slate">
              一度使ったあとは、前回の続きから進められます。
            </p>
            <p className="mt-2 text-[13.5px] leading-[1.9] text-steel">
              相手のことも、これまでの流れも、毎回ゼロから説明し直す必要はありません。
              次は「今回どうするか」だけを書けば済みます。
            </p>
            <p className="mt-2 text-[12.5px] leading-[1.85] text-steel">
              残すのは、あなたが書いたことと、返ってきた反応だけです。
              相手の実名も、連絡先も、メッセージの全文も保存しません。
            </p>
          </div>
        </div>
      </Block>


      {/* ══ 2.4 こんな選択を、選ぶ前に ══ */}
      {/* 売るのはここ。
          道のりの節は考え方だけにしたので、
          「実際に何が返ってくるか」はこちらで見せる。
          頭に置くのは場面名ではなく、そこで迷っている選択。 */}
      <Block tint>
        <Eyebrow>MEN&apos;S EXAMPLE</Eyebrow>
        <h2 className="mt-2 text-huge font-black text-slate">
          こんな選択を、
          <br className="sm:hidden" />
          選ぶ前に。
        </h2>
        <p className="mt-4 max-w-[34em] text-[15px] leading-[1.85] text-steel">
          自己紹介文、LINE、誘い方、デートのあと、切り出すとき。
          どれも実在の女性が読んで、実際にどう受け取ったかを返します。
          そのうえで決めるのは、あなたです。
        </p>

        <div className="mt-7">
          <CaseRows />
        </div>

        <div className="mt-7 max-w-[26em]">
          <PlanCta
            plan={DEFAULT_PLAN}
            from="cases"
            className="min-h-[58px] w-full rounded-pill bg-brand px-9 text-[16px] !text-paper shadow-card"
          >
            自分の場面で確かめる <span aria-hidden className="ml-2">&rarr;</span>
          </PlanCta>
        </div>

        <p className="mt-5 text-[12px] leading-[1.8] text-steel">
          ※ 写真はイメージ、文面と回答は画面の見本です。特定の利用者の体験談ではありません。
        </p>
      </Block>

      {/* ══ 2.5 初めての方へ ══ */}
      {/* 道のりは「いまどこにいるか」から入る形なので、
          自分がどこにいるか決まっていない人が素通りする。
          その下に、思い当たる一言だけを4つ並べる。
          言葉は plans.ts の OPEN_USE_CASES。受け付けていない場面は
          そもそもここに来ない（服と店は画像を受け取れないので出ない）。 */}
      <Block tint>
        <span className="inline-flex rounded-pill bg-paper px-3.5 py-1.5 text-[12px] font-bold text-brand shadow-card">
          初めての方へ
        </span>
        <h2 className="mt-4 text-huge font-black leading-[1.35] text-slate">
          タシカメは、
          <br className="sm:hidden" />
          こんなときに使えます。
        </h2>
        <p className="mt-4 max-w-[30em] text-[15px] leading-[1.85] text-steel">
          マッチングアプリでの悩みを、実在の女性の目線から具体的に。
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-3.5">
          {OPEN_USE_CASES.slice(0, 4).map((u, i) => (
            <li key={u.q}>
              <Reveal delay={i * 50}>
                <PlanCta
                  plan={DEFAULT_PLAN}
                  from={`use_${u.category}`}
                  category={u.category}
                  className="!flex h-full w-full !flex-col !items-stretch rounded-card border border-line bg-paper p-4 text-left shadow-card sm:p-5"
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand"
                    >
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                        <path d={USE_ICON[u.category] ?? USE_ICON.message} />
                      </svg>
                    </span>
                    <span className="text-[11px] font-bold text-steel">{u.tag}</span>
                  </span>
                  <span className="mt-3 block text-[14.5px] font-black leading-[1.55] text-slate">
                    {u.q}
                  </span>
                  <span className="mt-auto block pt-3 text-[12px] font-bold text-brand">
                    ここから確かめる →
                  </span>
                </PlanCta>
              </Reveal>
            </li>
          ))}
        </ul>

        <div className="mt-7 max-w-[26em]">
          {/* 値段は同じページの下にある。読み込み直させない */}
          <Link
            href="#price"
            className="inline-flex min-h-[54px] w-full items-center justify-center rounded-pill border border-brand bg-paper px-8 text-[15.5px] font-bold text-brand shadow-card transition-shadow hover:shadow-card-hover"
          >
            プランを詳しく見る <span aria-hidden className="ml-2">&darr;</span>
          </Link>
        </div>
      </Block>

      {/* ══ 3. 相談前と、相談後 ══ */}
      {/* 押す場所のすぐ下に置く。買う前に、何が起きるのかを1回で見せる。
          ここより下に同じものを置かない（2回出ると、どちらも弱くなる） */}
      <Block id="before-after">
        <H>相談前と、相談後。</H>
        <p className="mt-4 max-w-[34em] text-[15px] leading-[1.85] text-steel">
          自分では気づかなかったところが、送る前に出てきます。
          大丈夫そうなら「このままで大丈夫そう」と返ってきます。無理に探しません。
        </p>

        {/* 渡された案を、そのままの形で。
            写真は2枚とも同じ撮影のもの（hero = 考えている、heroTall = 決まった）。
            人を合成したり、表情を作ったりはしていない。 */}
        <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-5">
          {/* ── 相談前 ── */}
          <Reveal className="h-full">
          <div className="h-full overflow-hidden rounded-card border border-line bg-mist shadow-card">
            <div className="relative">
              <Slot name="hero" rounded="" position="center 22%" className="h-[190px] w-full" />
              <span className="absolute left-4 top-4 rounded-soft bg-slate/85 px-3.5 py-1.5 text-[13px] font-black text-paper">
                相談前
              </span>
              {/* 手が止まっているときの、頭の中 */}
              <span className="absolute bottom-4 right-4 max-w-[62%] rounded-card rounded-br-[4px] bg-paper/95 px-3.5 py-2 text-[12.5px] font-bold leading-[1.6] text-slate shadow-card">
                これで送っていいのかな…
              </span>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex items-end gap-2.5">
                <p className="min-w-0 flex-1 rounded-card rounded-br-[4px] bg-paper px-3.5 py-2.5 text-[13.5px] leading-[1.7] text-slate">
                  {DEMO.before}
                </p>
                <span
                  aria-hidden
                  className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-steel/35 text-paper"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M2 21 23 12 2 3l4 7 9 2-9 2Z" />
                  </svg>
                </span>
              </div>

              <ul className="mt-4 flex flex-col gap-2">
                {["重くないかな…？", "この言い方で大丈夫…？", "変に思われないかな…？"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-[13px] text-steel">
                    <span
                      aria-hidden
                      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-steel/25 text-paper"
                    >
                      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          </Reveal>

          <p
            aria-hidden
            className="justify-self-center self-center text-[26px] font-black text-brand lg:text-[30px]"
          >
            <span className="lg:hidden">&darr;</span>
            <span className="hidden lg:inline">&rarr;</span>
          </p>

          {/* ── 相談後 ── */}
          <Reveal className="h-full" delay={140}>
          <div className="h-full overflow-hidden rounded-card border border-brand bg-brand-tint shadow-card">
            <div className="relative">
              <Slot name="heroTall" rounded="" position="center 24%" className="h-[190px] w-full" />
              <span className="absolute left-4 top-4 rounded-soft bg-brand px-3.5 py-1.5 text-[13px] font-black text-paper">
                相談後
              </span>
              <span className="absolute bottom-4 right-4 max-w-[62%] rounded-card rounded-br-[4px] bg-paper/95 px-3.5 py-2 text-[12.5px] font-bold leading-[1.6] text-brand-deep shadow-card">
                反応を確かめたうえで、送れる
              </span>
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex items-end gap-2.5">
                <p className="min-w-0 flex-1 rounded-card rounded-br-[4px] bg-paper px-3.5 py-2.5 text-[13.5px] font-bold leading-[1.7] text-slate">
                  {DEMO.after}
                </p>
                <span
                  aria-hidden
                  className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-paper"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M2 21 23 12 2 3l4 7 9 2-9 2Z" />
                  </svg>
                </span>
              </div>

              <ul className="mt-4 flex flex-col gap-2">
                {[
                  "自然な言い方が分かった",
                  "女性の反応を確かめられた",
                  "迷わずに送れる",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-[13px] font-bold text-slate">
                    <span
                      aria-hidden
                      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-brand text-paper"
                    >
                      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </Reveal>
        </div>

        {/* 1回 = 1人。返ってくるものを、そのまま並べる */}
        <div className="mt-5 rounded-card border border-line bg-paper px-5 py-4 shadow-card">
          <p className="text-[13.5px] font-bold leading-[1.7] text-slate">
            気になったところ：{DEMO.common}
          </p>

          <div className="mt-3 border-t border-line pt-3">
            <p className="text-[12px] font-bold text-steel">そのまま使える修正文</p>
            <p className="mt-1.5 rounded-card rounded-br-[4px] bg-brand-tint px-3.5 py-2.5 text-[13.5px] font-bold leading-[1.7] text-brand-deep">
              {DEMO.after}
            </p>
          </div>

          <div className="mt-3 border-t border-line pt-3">
            <p className="text-[12px] font-bold text-steel">なぜ、そう直したか</p>
            <p className="mt-1.5 text-[13px] leading-[1.8] text-slate">{DEMO.why}</p>
          </div>
        </div>

        <p className="mt-4 text-[12px] leading-[1.75] text-steel">
          ※ 写真はイメージ、文面と回答は画面の見本です。実際の相談ではありません。
        </p>
      </Block>

      {/* 見本のすぐ下。
          ここに「何人がどう答えたか／みんなが気にしたところ／意見が分かれたところ／
          書かれた言葉そのまま」の4枚と、確率を出さない断りを置いていた。
          すぐ上の見本が、そのまま同じことを見せている。
          見せたあとに説明を足すと、見本のほうが弱くなる。
          「女性みんなの答えではない」はよくある質問に残してある。

          ここから料金の節まで、スマホで5画面ぶん押す場所が無い。
          見本を読み終えた直後がいちばん近いので、押す場所だけ残す。 */}
      <section className="bg-paper">
        <Wrap className="pb-14 sm:pb-16">
          <div className="max-w-[24em]">
            <PlanCta
              plan={DEFAULT_PLAN}
              from="after_demo"
              className="min-h-[58px] w-full rounded-pill bg-brand px-9 text-[16px] !text-paper shadow-card"
            >
              自分のも見てもらう <span aria-hidden className="ml-2">&rarr;</span>
            </PlanCta>
            <p className="mt-3 text-[12.5px] text-steel">
              ¥{entry.yen.toLocaleString()}から / 1回ごと / 匿名
            </p>
          </div>
        </Wrap>
      </section>

      {/* ══ 4. ほかの選び方との違い ══ */}
      {/* 比較広告は景表法の対象。実証・正確な引用・公正な比較の3つが要る。
          他社の金額は書かない（出典が無い）。事実に反することも書かない
          （AIは無料で使えるものが多い）。中身と判定は lib/ask/compare.ts。 */}
      <Block tint>
        <H>ほかの選び方と、どう違うか。</H>
        <p className="mt-4 max-w-[32em] text-[15px] leading-[1.85] text-steel">
          いちばん多いのは「友達に聞けばいい」「AIに聞けばいい」です。
          どちらもふつうに役に立ちます。足りないのは1点だけです。
        </p>

        {/* ── 先に、いちばん多い2つに答える ──
            6列の表はスマホで横に切れて読まれない。
            読まれないまま「友達でいいや」「AIでいいや」で閉じられる。
            表の前に、その2つだけ縦で答える。 */}
        <ul className="mt-8 flex flex-col gap-3">
          {INSTEAD.map((x, i) => (
            <Reveal key={x.id} delay={i * 60}>
              <li className="rounded-card border border-line bg-paper p-5 shadow-card">
                <p className="text-[16px] font-black text-slate">{x.label}</p>

                <div className="mt-3 flex items-start gap-2.5">
                  <span
                    aria-hidden
                    className="mt-[3px] shrink-0 text-[11px] font-black text-ok-text"
                  >
                    ✓
                  </span>
                  <p className="min-w-0 text-[13.5px] leading-[1.8] text-steel">
                    <span className="font-bold text-slate">足りるとき：</span>
                    {x.enough}
                  </p>
                </div>

                <div className="mt-2.5 flex items-start gap-2.5 border-t border-line pt-3">
                  <span aria-hidden className="mt-[3px] shrink-0 text-[11px] font-black text-brand">
                    →
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-black leading-[1.6] text-brand-deep">
                      {x.short}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-[1.8] text-steel">{x.why}</p>
                  </div>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>

        <p className="mt-5 text-[14.5px] font-black leading-[1.7] text-slate">
          タシカメが返すのは、相手と同じ側に立つ、あなたを知らない女性が
          実際にどう受け取ったかです。
        </p>

        {/* 表は、もっと詳しく知りたい人のため。
            スマホでは畳んでおく（開かなくても上の2つで足りる） */}
        <details className="group mt-7">
          <summary className="flex min-h-[48px] cursor-pointer list-none items-center gap-2 text-[13.5px] font-bold text-brand">
            結婚相談所・マッチングアプリとの違いも見る
            <span
              aria-hidden
              className="text-[16px] leading-none transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>

          <p className="mt-3 text-[13px] leading-[1.85] text-steel">{COMPARE_SCOPE}</p>
          <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-steel lg:hidden">
            <span aria-hidden>↔</span> 表は横にスクロールできます
          </p>

        <div className="mt-3 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0 lg:mt-5">
          <table className="w-full min-w-[880px] border-collapse overflow-hidden rounded-card border border-line bg-paper shadow-card">
            <thead>
              <tr>
                <th scope="col" className="w-[6.5em] bg-paper px-3 py-3" />
                {ALTERNATIVES.map((a) => (
                  <th
                    key={a.id}
                    scope="col"
                    className={`px-3 py-3 text-[13px] font-black leading-[1.4] ${
                      a.us ? "bg-brand text-paper" : "bg-mist text-steel"
                    }`}
                  >
                    {a.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <th
                    scope="row"
                    className="px-3 py-3 text-left align-top text-[12px] font-bold leading-[1.6] text-steel"
                  >
                    {r.label}
                  </th>
                  {ALTERNATIVES.map((a) => (
                    <td
                      key={a.id}
                      className={`px-3 py-3 align-top text-[12px] leading-[1.7] ${
                        a.us ? "bg-brand-tint font-bold text-brand-deep" : "text-steel"
                      }`}
                    >
                      {r.cells[a.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          <p className="mt-4 text-[12px] leading-[1.85] text-steel">{COMPARE_NOTE}</p>
        </details>

        <div className="mt-7 max-w-[26em]">
          <PlanCta
            plan={DEFAULT_PLAN}
            from="compare"
            className="min-h-[58px] w-full rounded-pill bg-brand px-9 text-[16px] !text-paper shadow-card"
          >
            今の選択を確かめる <span aria-hidden className="ml-2">&rarr;</span>
          </PlanCta>
        </div>
      </Block>

      {/* ══ 6. よくある質問 ══ */}
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

      {/* ══ 6.3 誰が読むのか ══ */}
      {/* ══════════════════════════════════════════════
          顔を出す。ただし、名簿にはしない
          ══════════════════════════════════════════════
          「実在の女性が読む」と言っておいて、画面に人が1人も
          いないと、本当にいるのかが伝わらない。

          ただし、審査を通った登録者はまだ0人。
          顔の横に「26歳 会社員 回答42件」と並べた瞬間、
          それは実在しない人の名簿になる。

          だから出し方を分ける。
            顔      イメージ（※と書く）
            年代    実際に指定できる区分
            確認    実際にこちらがやっていること
          数（回答件数・役に立った割合）は、貯まるまで出さない。
          実際に登録がある人は /answerers に出る（いまは0人）。 */}
      <Block>
        <H>裏で、こんな女性が読んでいます。</H>
        <p className="mt-4 max-w-[32em] text-[15px] leading-[1.85] text-steel">
          登録すれば読めるようにはしていません。
          年齢と立場を確認し、通った方にだけお願いしています。
          名前も連絡先も出しません。出す仕組み自体を作っていません。
        </p>

        {/* 顔。年代だけを添える。職業も件数も付けない */}
        <ul className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {FACES.map((f) => (
            <li key={f.key} className="flex flex-col items-center gap-2">
              <Slot
                name={f.key}
                rounded="rounded-full"
                className="aspect-square w-full max-w-[92px]"
              />
              <span className="text-[12px] font-bold text-steel">{f.age}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11.5px] leading-[1.75] text-steel">
          ※ 写真はイメージです。実際に登録のある方は
          <Link
            href="/answerers"
            className="mx-1 font-bold text-brand underline decoration-line underline-offset-4"
          >
            誰が読むのか
          </Link>
          に出ます。
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-card border border-line bg-paper px-5 py-5 shadow-card">
            <p className="text-[12px] font-bold text-steel">こちらで確認していること</p>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {["年齢", "いまの立場", "書いてもらった文が読める内容か"].map((t) => (
                <li key={t} className="flex items-start gap-2 text-[13.5px] leading-[1.75]">
                  <span aria-hidden className="mt-[3px] text-[11px] font-black text-ok-text">
                    ✓
                  </span>
                  <span className="min-w-0 text-steel">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-line bg-paper px-5 py-5 shadow-card">
            <p className="text-[12px] font-bold text-steel">読む人は選べます</p>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {PANEL_AGES.filter((a) => a.id !== "any").map((a) => (
                <li
                  key={a.id}
                  className="rounded-pill bg-mist px-2.5 py-1 text-[12px] text-steel"
                >
                  {a.label}
                </li>
              ))}
              {ATTRS_OPEN.map((a) => (
                <li
                  key={a.id}
                  className="rounded-pill bg-mist px-2.5 py-1 text-[12px] text-steel"
                >
                  {a.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 max-w-[32em] text-[13.5px] leading-[1.9] text-steel">
          恋愛の専門家ではありません。正解を教えてくれる人でもありません。
          一人の女性として、実際にどう思ったかを書いてくれる人です。
        </p>
      </Block>

      {/* ここに「言いにくいことほど、女性に確かめる。」の節を置いていた。
          トップで大きく立てると、それを目当てに来る人が増えて、
          いちばん来てほしい人が引く。

          機能そのものは残っている。
          相談のカテゴリ「距離感・言いにくいこと」から入れるし、
          線と決まりは lib/ask/sensitive.ts が持っていて、
          選んだ人には相談を書く画面で出る。
          トップから売り込むのをやめただけ。 */}

      {/* ══ 7. サービスプラン ══ */}
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
        <H>サービスプラン。</H>
        <p className="mt-4 max-w-[34em] text-[15px] leading-[1.85] text-steel">
          どれを使うかは、迷いの大きさで決まります。値段ではありません。
          月額はありません。自動更新もしません。
        </p>

        {/* 場面 → どれ。
            役割の名前だけ並べても、自分がどれなのかは決まらない。
            ラベルは TIERS から引く。書き写すと、片方だけ古くなる */}
        <ul className="mt-7 flex flex-col divide-y divide-line overflow-hidden rounded-card border border-line bg-paper">
          {(
            [
              // 「この写真どっち？」は置けない。画像を受け取る口がまだ無い
              ["「この自己紹介文どっち？」", "check"],
              ["「このLINE送っていい？」", "check"],
              ["「この子、今誘うべき？」", "decide"],
              ["「2回目に進めるか迷う」", "decide"],
              ["「初デート前に会話を練習したい」", "try"],
            ] as const
          ).map(([q, t]) => (
            <li key={q} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="min-w-0 text-[13.5px] leading-[1.6] text-slate">{q}</span>
              <span className="shrink-0 text-[12.5px] font-black text-brand">
                → {getTier(t).label}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <PlanCards from="price" openIds={openPlanIds()} />
        </div>

        <p className="mt-6 text-[12.5px] leading-[1.85] text-steel">
          税込。いま受け付けているのは「{main.name}」だけです。
          通話とMock Dateは、時間を決めた受け入れ方と、その場を見る体制が
          用意できてから開きます。
          <Link
            href="/plans"
            className="ml-1 font-bold text-brand underline decoration-line underline-offset-4"
          >
            キャンセルと返金について
          </Link>
        </p>
      </Block>

      {/* ══ 8. 最後 ══ */}
      <section className="bg-paper">
        <Wrap className="pb-20 pt-6 sm:pb-24">
          <div className="relative overflow-hidden rounded-card bg-brand p-8 text-paper shadow-card sm:p-14">
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
            <p className="relative text-big font-black leading-[1.5]">
              {THESIS_A1}
              <br className="sm:hidden" />
              {THESIS_A2}
              <br />
              {THESIS_B}
            </p>
            <p className="relative mt-5 max-w-[26em] text-[16px] leading-[1.85]">
              Aならこう感じた、Bならこう感じた。そこまでがこちらの仕事です。
              どちらにするかは、あなたが決めてください。
            </p>
            <div className="mt-9">
              <PlanCta
                plan={DEFAULT_PLAN}
                from="final"
                className="min-h-[60px] w-full rounded-pill bg-paper px-9 text-[16.5px] !text-brand-deep sm:w-auto"
              >
                今の選択を確かめる <span aria-hidden className="ml-2">→</span>
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

      {/* 答える側への入口は、ここに置かない。
          ここは買う人の画面で、最後に「自分は答える側かもしれない」と
          思わせると、押す先が2つになって、どちらも押されなくなる。
          答える側の話は、ヘッダーから /join へ渡す。 */}
    </div>
  );
}
