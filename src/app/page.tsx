import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { topPlans, plan as getPlan, ENTRY_PLAN } from "@/lib/ask/plans";
import { canCharge } from "@/lib/legal";
import Reveal from "@/components/brand/Reveal";
import PlanCta from "@/components/brand/PlanCta";
import Slot from "@/components/brand/Slot";
import Flourish from "@/components/brand/Flourish";
import OnlineCount from "@/components/ask/OnlineCount";

// ══════════════════════════════════════════════════════════════
// トップページ。見本のとおりに組んだ。
//
// ── 見本と変えたところは3つだけ ──────────────────
//
// 1. 人物写真
//    こちらで用意しない。素材サイトの写真も、生成した人物も置かない。
//    とくに、回答者として顔を並べるなら、その人が実在して掲載に
//    同意していることが要る。実在しない顔を「回答している女性」として
//    並べると、まだ登録が0の状態で、いる人の数を偽ることになる。
//    枠は見本どおりに置いてあるので、public/img/ に写真を置けば
//    その瞬間から見本と同じ絵になる（lib/images.ts）。
//
// 2. 「今、回答できる女性 128人」
//    実データから出す（OnlineCount）。いまは0人と出る。
//    ここに固定の数字を書くと、この画面はその瞬間から全部うそになる。
//
// 3. ログイン
//    このサービスに会員登録が無い。結果は URL の鍵だけで開く。
//    押しても行き先が無いので置いていない。
//
// ── 配色 ──────────────────────────────────────────
// 青は「聞く」、赤は「買う」。見本の使い分けをそのまま踏襲。
// ══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "His Recoveries — これ、今送っていい？",
  description:
    "LINEのメッセージ、写真、デートの誘い、服装…。迷ったら、実際の女性たちに聞いてみよう。匿名・都度払い・実際の女性が回答します。",
  alternates: { canonical: site.url },
};

const NAV = [
  ["#how", "使い方"],
  ["#voices", "みんなの声"],
  ["#price", "料金プラン"],
  ["/answerers", "回答する女性たち"],
] as const;

/* 画面の見本。実際の回答ではない */
const PHONE = [
  { age: 25, say: "いいと思います！\nこのメッセージは丁寧で好印象です" },
  { age: 27, say: "もう少しカジュアルにしても\nいいかも！最後に質問を入れると◎" },
  { age: 23, say: "良いです！\nぜひ送ってみてください！" },
  { age: 29, say: "すごくいいと思います！\n私だったら返信したくなります" },
  { age: 26, say: "この流れは自然で好印象です。\n送って大丈夫です！" },
];

const CASES = [
  { img: "caseMessage", tag: "LINEのメッセージ", q: "これ、今送っていい？", c: "message" },
  { img: "caseDate", tag: "デートの誘い", q: "この誘い方で大丈夫？", c: "signal" },
  { img: "casePhoto", tag: "プロフィール写真", q: "この写真どう思う？", c: "photo" },
  { img: "caseStyle", tag: "デートの服装", q: "このコーデでいい？", c: "style" },
  { img: "caseProfile", tag: "プロフィール", q: "この自己紹介いい？", c: "photo" },
  { img: "caseWords", tag: "うまく言葉にできない", q: "どう伝えればいい？", c: "other" },
] as const;

const STEPS = [
  { n: "01", t: "質問する", d: "LINE・写真・デート・服装など迷っていることを送るだけ。" },
  { n: "02", t: "女性に届く", d: "あなたの質問が、実際の女性たちに届きます。" },
  { n: "03", t: "一人ずつ返信がくる", d: "リアルな女性の反応が続々と届きます。" },
  { n: "04", t: "判断する", d: "複数の意見を見て、自信を持って行動できます。" },
] as const;

const VOICES = [
  {
    tag: "LINEのメッセージ",
    kind: "message" as const,
    sent: "来週の土曜あたり\nご飯でもどうですか？\nよかったらぜひ！",
    time: "19:24",
    says: [
      { age: 25, say: "いいと思います！\nシンプルで誘いやすいです" },
      { age: 27, say: "いいですね！土曜でもいいけど、\nお店の提案があるともっと嬉しいかも！" },
    ],
  },
  {
    tag: "プロフィール写真",
    kind: "photo" as const,
    says: [
      { age: 23, say: "この写真すごくいいです！\n自然な笑顔で好印象です。" },
      { age: 26, say: "清潔感があって素敵です！\nこの写真をメインにしていいと思います。" },
    ],
  },
];

function Wrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1120px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-[23px] font-black leading-[1.4] text-slate sm:text-[27px]">
      <span>{children}</span>
      <Flourish className="text-brand" />
    </h2>
  );
}

/** 年齢だけで人を表す。顔は置かない */
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

function Heart() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-rose" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20.5 3.8 12.3a5 5 0 0 1 7.1-7.1l1.1 1.1 1.1-1.1a5 5 0 0 1 7.1 7.1Z" />
    </svg>
  );
}

export default function HomePage() {
  const paid = canCharge();
  const tops = topPlans();

  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${site.url}/#webpage`,
    url: site.url,
    name: `${site.name} — これ、今送っていい？`,
    description: metadata.description,
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
  };

  return (
    <div data-brand className="min-h-screen bg-paper text-slate">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* ── ヘッダー ── */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <Wrap className="flex items-center justify-between gap-4 py-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-brand"
            >
              <span className="flex gap-[3px]">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-[4px] w-[4px] rounded-full bg-paper" />
                ))}
              </span>
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[17px] font-black text-slate">
                His Recoveries
              </span>
              <span className="hidden text-[10px] text-steel sm:block">
                男性の恋愛を、みんなでサポート
              </span>
            </span>
          </Link>

          <nav aria-label="サイト" className="flex shrink-0 items-center gap-6">
            <ul className="hidden items-center gap-7 lg:flex">
              {NAV.map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="whitespace-nowrap text-[13.5px] font-bold text-slate transition-colors hover:text-brand"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <PlanCta
              plan={ENTRY_PLAN}
              from="header"
              className="min-h-[42px] rounded-pill bg-brand px-6 text-[13.5px] !text-paper shadow-card"
            >
              今すぐ聞く
            </PlanCta>
          </nav>
        </Wrap>
      </header>

      {/* ══ ヒーロー ══ */}
      <section className="relative overflow-hidden bg-sky">
        <Wrap className="grid gap-10 pb-12 pt-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-8 lg:pb-14 lg:pt-12">
          <div className="relative z-10">
            <p className="text-[14.5px] font-bold text-slate">送る前に、女性の本音を。</p>

            <h1 className="mt-4 text-mega font-black leading-[1.22] text-slate">
              これ、
              <br />
              <span className="relative inline-block">
                今送っていい？
                {/* 見本の下線。手で引いた線のニュアンス */}
                <span
                  aria-hidden
                  className="absolute -bottom-1 left-0 h-[10px] w-full -skew-x-6 rounded-pill bg-brand/25"
                />
              </span>
            </h1>

            <p className="mt-7 max-w-[24em] text-[15.5px] leading-[1.9] text-steel sm:text-[16.5px]">
              LINEのメッセージ、写真、デートの誘い、服装…
              <br className="hidden sm:block" />
              迷ったら、実際の女性たちに聞いてみよう。
            </p>

            <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              {[
                ["実際の女性が回答", "M16 19a4 4 0 0 0-8 0 M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6"],
                ["最短数分で返信", "M13 3 4 14h7l-1 7 9-11h-7l1-7Z"],
                ["匿名で気軽に相談", "M5 11V8a7 7 0 0 1 14 0v3 M4 11h16v9H4z"],
              ].map(([label, d]) => (
                <li key={label} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper shadow-card"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-brand"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={d} />
                    </svg>
                  </span>
                  <span className="text-[12.5px] font-bold text-steel">{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PlanCta
                plan={ENTRY_PLAN}
                from="hero"
                className="!flex-col !items-start min-h-[70px] rounded-[18px] bg-brand px-7 py-3 !text-paper shadow-card"
              >
                <span className="flex items-center gap-2.5 text-[17px] font-black">
                  <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 20.5l1.5-4.6A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4Z" />
                  </svg>
                  今すぐ女性に聞く
                </span>
                <span className="mt-0.5 pl-[30px] text-[12px] font-bold opacity-90">
                  5人の意見 ¥{getPlan(ENTRY_PLAN).yen.toLocaleString()}〜
                </span>
              </PlanCta>

              <Link
                href="#talk"
                className="flex min-h-[70px] flex-col justify-center rounded-[18px] border border-line bg-paper px-7 py-3 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <span className="flex items-center gap-2.5 text-[17px] font-black text-slate">
                  <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 text-slate" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                    <path d="M4 14v-3a8 8 0 0 1 16 0v3 M4 14a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2Z M20 14a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2Z" />
                  </svg>
                  人と話す
                </span>
                <span className="mt-0.5 pl-[30px] text-[12px] font-bold text-steel">
                  女性と直接相談 ¥{getPlan("talk").yen.toLocaleString()}〜
                </span>
              </Link>
            </div>
          </div>

          {/* 右: 写真 ＋ スマホの画面 */}
          <div className="relative">
            <Slot name="hero" className="aspect-[4/3] w-full lg:aspect-[5/4]" />

            {/* 吹き出し */}
            <p className="absolute left-4 top-5 rotate-[-6deg] text-[12.5px] font-bold leading-[1.6] text-slate sm:left-8">
              これで送って
              <br />
              大丈夫かな…？
            </p>

            {/* スマホ */}
            <div className="mt-4 overflow-hidden rounded-[22px] border-[6px] border-slate bg-paper shadow-card lg:absolute lg:-right-2 lg:top-2 lg:mt-0 lg:w-[62%]">
              <div className="flex items-center justify-between px-4 pb-1.5 pt-2 text-[10px] font-bold text-slate">
                <span>12:34</span>
                <span className="flex gap-1" aria-hidden>
                  <span className="h-2 w-3 rounded-[2px] bg-slate/70" />
                  <span className="h-2 w-3 rounded-[2px] bg-slate/70" />
                  <span className="h-2 w-4 rounded-[2px] bg-slate/70" />
                </span>
              </div>
              <div className="flex items-center gap-2 border-b border-line px-4 pb-2.5">
                <span aria-hidden className="text-[13px] text-steel">
                  ‹
                </span>
                <p className="text-[13px] font-black">5人の女性の反応</p>
              </div>
              <ul className="divide-y divide-line">
                {PHONE.map((r) => (
                  <li key={r.age} className="flex items-start gap-2.5 px-4 py-2.5">
                    <Who age={r.age} size={30} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10.5px] font-black text-rose-text">
                        {r.age}歳 <span className="text-steel">女性</span>
                      </span>
                      <span className="mt-0.5 block whitespace-pre-line text-[11px] leading-[1.6] text-slate">
                        {r.say}
                      </span>
                    </span>
                    <Heart />
                  </li>
                ))}
              </ul>
              <p className="border-t border-line px-4 py-2 text-center text-[10px] text-steel">
                画面の見本
              </p>
            </div>
          </div>
        </Wrap>
      </section>

      {/* ══ こんなときに ══ */}
      <section id="cases" className="scroll-mt-20 bg-paper">
        <Wrap className="py-14 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <H>こんなときに、女性のリアルな意見を。</H>
            <Link
              href="/ask"
              className="text-[12.5px] font-bold text-steel transition-colors hover:text-brand"
            >
              すべて見る <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
            {CASES.map((c, i) => (
              <Reveal key={c.tag} delay={i * 40}>
                <PlanCta
                  plan={ENTRY_PLAN}
                  from="case"
                  category={c.c}
                  className="!flex h-full !flex-col !items-stretch overflow-hidden rounded-card border border-line bg-paper !p-0 text-left shadow-card"
                >
                  <Slot name={c.img} rounded="" className="aspect-[4/3] w-full" />
                  <span className="flex flex-1 flex-col p-3">
                    <span className="flex items-center justify-between gap-1.5">
                      <span className="min-w-0 truncate text-[12.5px] font-black text-slate">
                        {c.tag}
                      </span>
                      <span aria-hidden className="shrink-0 text-[12px] text-steel">
                        ›
                      </span>
                    </span>
                    <span className="mt-1 block text-[11.5px] leading-[1.6] text-steel">
                      {c.q}
                    </span>
                  </span>
                </PlanCta>
              </Reveal>
            ))}
          </div>
        </Wrap>
      </section>

      {/* ══ 使い方 ══ */}
      <section id="how" className="scroll-mt-20 bg-sky">
        <Wrap className="py-14 sm:py-16">
          <H>使い方は、とてもシンプル。</H>

          <ol className="mt-7 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 60}>
                <li className="flex h-full flex-col rounded-card border border-line bg-paper p-5 shadow-card">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-tint text-[13px] font-black tabular-nums text-brand-deep"
                    >
                      {s.n}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15.5px] font-black text-slate">{s.t}</span>
                      <span className="mt-1.5 block text-[12.5px] leading-[1.75] text-steel">
                        {s.d}
                      </span>
                    </span>
                  </div>

                  {/* 各段の絵 */}
                  <div className="mt-4 flex-1">
                    {i === 0 && (
                      <div className="relative">
                        <Slot name="step1" className="aspect-[5/3] w-full" />
                        <span className="absolute -bottom-1 right-1 rounded-card bg-paper px-3 py-2 text-[10.5px] font-bold leading-[1.5] shadow-card">
                          このメッセージ
                          <br />
                          送っていい？
                        </span>
                      </div>
                    )}
                    {i === 1 && (
                      <div className="flex items-center justify-center gap-2 py-3">
                        {[24, 27, 25].map((a, k) => (
                          <span key={a} className={k === 1 ? "translate-y-2" : ""}>
                            <Who age={a} size={40} />
                          </span>
                        ))}
                        <svg
                          aria-hidden
                          viewBox="0 0 24 24"
                          className="h-7 w-7 shrink-0 text-brand"
                          fill="currentColor"
                        >
                          <path d="M2 21 23 12 2 3l4 7 9 2-9 2Z" />
                        </svg>
                      </div>
                    )}
                    {i === 2 && (
                      <div className="flex items-start gap-2 rounded-card bg-mist p-3">
                        <Who age={25} size={28} />
                        <span className="min-w-0">
                          <span className="block text-[10.5px] font-black text-rose-text">
                            25歳 <span className="text-steel">女性</span>
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-[1.6] text-slate">
                            いいと思います！
                            <br />
                            このまま送って大丈夫です
                          </span>
                        </span>
                      </div>
                    )}
                    {i === 3 && (
                      <div className="relative">
                        <Slot name="step4" className="aspect-[5/3] w-full" />
                        <span className="absolute bottom-2 right-2 text-[12px] font-black text-brand">
                          よし、これで送ろう！
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </Wrap>
      </section>

      {/* ══ 料金プラン ══ */}
      <section id="price" className="scroll-mt-20 bg-paper">
        <Wrap className="py-14 sm:py-16">
          <H>プランはシンプルに。</H>

          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {tops.map((p, i) => {
              const first = i === 0;
              return (
                <Reveal key={p.id} delay={i * 60}>
                  <div
                    className={`flex h-full flex-col rounded-card border bg-paper p-6 shadow-card ${
                      first ? "border-rose" : "border-line"
                    }`}
                  >
                    <p className="text-[17px] font-black text-slate">{p.name}</p>
                    <p
                      className={`mt-2 text-[30px] font-black leading-none tabular-nums ${
                        first ? "text-rose-text" : "text-brand"
                      }`}
                    >
                      ¥{p.yen.toLocaleString()}
                      <span className="text-[19px]">〜</span>
                    </p>
                    <p className="mt-3.5 text-[13px] leading-[1.8] text-steel">{p.tagline}</p>

                    <div className="mt-5">
                      {p.available ? (
                        <PlanCta
                          plan={p.id}
                          from="price"
                          className={`min-h-[50px] w-full rounded-pill px-5 text-[14.5px] shadow-card ${
                            first
                              ? "bg-rose-fill !text-paper"
                              : "border border-brand bg-paper !text-brand"
                          }`}
                        >
                          {first ? "今すぐ女性に聞く" : "改善案を依頼する"}{" "}
                          <span aria-hidden className="ml-1.5">
                            →
                          </span>
                        </PlanCta>
                      ) : (
                        <Link
                          href="#talk"
                          className="inline-flex min-h-[50px] w-full items-center justify-center rounded-pill border border-brand bg-paper px-5 text-[14.5px] font-bold text-brand"
                        >
                          今すぐ話せる人を探す <span aria-hidden className="ml-1.5">→</span>
                        </Link>
                      )}
                    </div>

                    <ul className="mt-5 flex flex-col gap-2">
                      {p.includes.slice(0, 3).map((x) => (
                        <li key={x} className="flex items-start gap-2 text-[12.5px] leading-[1.7]">
                          <span aria-hidden className="mt-[2px] shrink-0 text-[12px] font-black text-brand">
                            ✓
                          </span>
                          <span className="min-w-0 text-steel">{x}</span>
                        </li>
                      ))}
                    </ul>

                    {!p.available && (
                      <p className="mt-4 rounded-soft bg-mist px-3.5 py-2.5 text-[11.5px] leading-[1.7] text-steel">
                        いまは順番待ちのみ。相手も実在の人なので、時間の決め方と
                        その場を見る体制が用意できてから開きます。
                      </p>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>

          <p className="mt-6 text-[12px] leading-[1.9] text-steel">
            税込。月額も入会金もありません。募集を始める前ならキャンセルできます。
            人数が集まらなかった場合は、集まらなかった分をご返金します。
            <Link
              href="/legal"
              className="ml-1 font-bold text-brand underline decoration-line underline-offset-4"
            >
              特定商取引法に基づく表記
            </Link>
          </p>

          {!paid && (
            <p className="mt-4 rounded-card border border-brand bg-paper p-4 text-[13px] leading-[1.9] text-slate shadow-card">
              いまお支払いは受け付けていません。特定商取引法に基づく表記が整うまで、
              決済を開始できないようにしてあります。
            </p>
          )}
        </Wrap>
      </section>

      {/* ══ 実際にこんな反応が届きます ══ */}
      <section id="voices" className="scroll-mt-20 bg-sky">
        <Wrap className="py-14 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <H>実際にこんな反応が届きます。</H>
            <p className="text-[11px] text-steel">※ 画面の見本です</p>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            {VOICES.map((v) => (
              <div
                key={v.tag}
                className="grid gap-4 rounded-card border border-line bg-paper p-5 shadow-card sm:grid-cols-[0.85fr_1.15fr]"
              >
                <div>
                  <span className="inline-flex rounded-pill bg-slate px-3 py-1.5 text-[11px] font-bold text-paper">
                    {v.tag}
                  </span>
                  {v.kind === "message" ? (
                    <div className="mt-3 rounded-card rounded-tl-[4px] bg-brand-tint p-3.5">
                      <p className="whitespace-pre-line text-[12.5px] leading-[1.75] text-slate">
                        {v.sent}
                      </p>
                      <p className="mt-2 text-right text-[10px] text-steel">{v.time}</p>
                    </div>
                  ) : (
                    <Slot name="casePhoto" className="mt-3 aspect-[4/3] w-full" />
                  )}
                </div>

                <ul className="flex flex-col justify-center gap-3.5">
                  {v.says.map((s) => (
                    <li key={s.age} className="flex items-start gap-2.5">
                      <Who age={s.age} size={32} />
                      <span className="min-w-0">
                        <span className="block text-[10.5px] font-black text-rose-text">
                          {s.age}歳 <span className="text-steel">女性</span>
                        </span>
                        <span className="mt-0.5 block whitespace-pre-line text-[12px] leading-[1.7] text-slate">
                          {s.say}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Wrap>
      </section>

      {/* ══ 相談じゃない。実際の女性が答える。 ══ */}
      <section className="bg-paper">
        <Wrap className="py-14 sm:py-16">
          <div className="grid gap-7 lg:grid-cols-[1fr_1fr_0.62fr] lg:items-center">
            <p className="border-l-[5px] border-brand pl-5 text-[22px] font-black leading-[1.55] text-slate sm:text-[26px]">
              相談じゃない。
              <br />
              実際の女性が答える。
            </p>

            <p className="text-[14px] leading-[1.95] text-steel">
              20代〜30代の一般の女性たちが、あなたの質問にリアルな意見を届けてくれます。
              だからこそ、本音のアドバイスがもらえます。
            </p>

            {/* 数は実データ。固定の数字は書かない */}
            <OnlineCount />
          </div>
        </Wrap>
      </section>

      {/* ══ 人と話す ══ */}
      <section id="talk" className="scroll-mt-20 bg-sky">
        <Wrap className="py-14 sm:py-16">
          <H>うまく言葉にできないときは。</H>

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            <div className="rounded-card border border-line bg-paper p-6 shadow-card">
              <p className="text-[17px] font-black">一緒に整理する</p>
              <span className="mt-2 inline-flex rounded-pill bg-ok-tint px-2.5 py-1 text-[11px] font-bold text-ok-text">
                いま使えます
              </span>
              <p className="mt-3.5 text-[14px] leading-[1.9] text-steel">
                質問の画面で「うまく書けない？」から進めます。3つ聞いて、こちらで質問を組み立てます。
                できた文は入力欄に入るだけなので、直せます。
              </p>
              <PlanCta
                plan={ENTRY_PLAN}
                from="assist"
                className="mt-5 min-h-[50px] w-full rounded-pill bg-brand px-5 text-[14.5px] !text-paper shadow-card"
              >
                質問をつくる <span aria-hidden className="ml-1.5">→</span>
              </PlanCta>
            </div>

            <div className="rounded-card border border-line bg-paper p-6 shadow-card">
              <div className="flex items-center gap-2.5">
                <p className="text-[17px] font-black">人と話す</p>
                <span className="rounded-pill bg-mist px-2.5 py-1 text-[11px] font-bold text-steel">
                  受付前
                </span>
              </div>
              <p className="mt-3 text-[15px] font-bold leading-[1.7]">
                まだ、うまく言葉になってなくてもいい。
              </p>
              <p className="mt-3 text-[14px] leading-[1.9] text-steel">
                実在する女性と話しながら、状況を話して、相手側から聞かれて、
                自分が何に迷っているのかを見つける。
              </p>
              <p className="mt-3.5 text-[12.5px] leading-[1.85] text-steel">
                相手も実在の人なので、時間の決め方と、その場を見る体制が用意できてから開きます。
                いまは順番待ちだけ受けています。目安 ¥
                {getPlan("talk").yen.toLocaleString()}〜 / 20分〜
              </p>
              <Link
                href="/talk"
                className="mt-5 inline-flex min-h-[50px] w-full items-center justify-center rounded-pill border border-brand bg-paper px-5 text-[14.5px] font-bold text-brand"
              >
                順番待ちに入る <span aria-hidden className="ml-1.5">→</span>
              </Link>
            </div>
          </div>
        </Wrap>
      </section>

      {/* ══ 最後 ══ */}
      <section className="bg-paper">
        <Wrap className="pb-20 pt-6 sm:pb-24">
          <div className="rounded-card bg-brand p-8 text-paper shadow-card sm:p-14">
            <p className="text-huge font-black">今決めたいなら、今、聞く。</p>
            <p className="mt-5 text-[16px] font-bold leading-[1.85]">
              送る前。誘う前。会う前。一人で考え続ける前に。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PlanCta
                plan={ENTRY_PLAN}
                from="final"
                className="min-h-[58px] rounded-pill bg-paper px-9 text-[16px] !text-brand-deep"
              >
                今すぐ女性に聞く <span aria-hidden className="ml-2">→</span>
              </PlanCta>
              <Link
                href="#talk"
                className="inline-flex min-h-[58px] items-center justify-center rounded-pill border border-paper/60 px-8 text-[15.5px] font-bold text-paper transition-opacity hover:opacity-80"
              >
                人と話す
              </Link>
            </div>

            <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13px] font-bold text-paper">
              <li>匿名</li>
              <li>都度払い</li>
              <li>実際の女性が回答</li>
            </ul>
          </div>
        </Wrap>
      </section>

      {/* ── フッター ── */}
      <footer className="border-t border-line bg-mist">
        <Wrap className="py-12">
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
            {[
              {
                h: "使う",
                items: [
                  ["/ask", "今すぐ聞く"],
                  ["/talk", "人と話す"],
                  ["/mine", "聞いたこと"],
                ] as const,
              },
              {
                h: "知る",
                items: [
                  ["/how", "仕組み"],
                  ["/safety", "安心・安全"],
                  ["/answerers", "回答する女性たち"],
                  ["/articles", "記事"],
                ] as const,
              },
              {
                h: "参加する",
                items: [
                  ["/join", "回答者になる"],
                  ["/about", "編集方針"],
                  ["/updates", "更新記録"],
                ] as const,
              },
              {
                h: "決まりごと",
                items: [
                  ["/legal", "特定商取引法に基づく表記"],
                  ["/privacy", "プライバシー・免責事項"],
                  ["/disclosure", "広告と収益について"],
                ] as const,
              },
            ].map((col) => (
              <div key={col.h}>
                <p className="text-[12.5px] font-bold text-steel">{col.h}</p>
                <ul className="mt-3.5 flex flex-col gap-2 text-[13.5px]">
                  {col.items.map(([href, label]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="-my-1 block py-1 text-slate/80 transition-colors hover:text-brand"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-brand"
              >
                <span className="flex gap-[3px]">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-[3.5px] w-[3.5px] rounded-full bg-paper" />
                  ))}
                </span>
              </span>
              <span className="text-[15px] font-black text-slate">His Recoveries</span>
            </Link>
            <p className="text-[12px] text-steel">
              © 2026 His Recoveries — 男性の恋愛を、みんなでサポート
            </p>
          </div>
        </Wrap>
      </footer>
    </div>
  );
}
