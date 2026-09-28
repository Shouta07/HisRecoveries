import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { PLANS, USE_CASES, FLOW, DEFAULT_PLAN, ENTRY_PLAN } from "@/lib/ask/plans";
import { MARKET, hasPrice } from "@/lib/market-prices";
import { canCharge } from "@/lib/legal";
import Reveal from "@/components/brand/Reveal";
import Donut from "@/components/brand/Donut";
import PlanCta from "@/components/brand/PlanCta";
import Tashikame from "@/components/brand/Tashikame";

// ══════════════════════════════════════════════════════════════
// トップページ。
//
// ── これは何のサービスか ──────────────────────────
// 恋愛相談サービスではない。
// 5人にアンケートを取るサービスでもない。
// 大事な一手を、本番の前に実際の人で試せるサービス。
// ここからブレない。
//
// ── 10秒で伝わること ─────────────────────────────
//   「AIは予測。これは実際の人の反応。」
// 料金を見たときに伝わること:
//   「5人に聞くだけでこの価格」ではなく
//   「人で試して、直して、本番前に仕上げるなら分かる」
//
// ── 言葉 ──────────────────────────────────────────
// 利用者の画面に C2C / Human Validation / マーケットプレイス を出さない。
// 裏の概念として持つだけ。仕組みの説明は下層ページへ。
// （plans.ts のビルド時チェックが、専門用語の混入で落とす）
//
// ── AIを否定しない ────────────────────────────────
// まずAIに聞いていい。最後だけ、人にも聞く。この順番を崩さない。
//
// ── 他社の金額を、うろ覚えで並べない ──────────────
// 比較広告になる。出典の無い金額は market-prices.ts が出さない。
// いまは出典が無いので、金額は伏せて「何が違うか」だけ出している。
//
// ── 人の写真を置かない ────────────────────────────
// 撮影していない写真は、素材か生成物のどちらかになる。
// 実在しない顔を「回答者」として並べると、
// まだ登録がない状態で、いる人の数を偽ることになる。
//
// ── 落としたもの ──────────────────────────────────
//   ベータ無料 / いま流れている相談 / 待機中 / 回答0 /
//   長い仕組みの説明 / AI思想の長文 / 運営事情 /
//   旧メディアの強い導線（フッターの1行だけ残す）
// ══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "His Recoveries — 本番の前に、人で確かめる。",
  description:
    "LINE、写真、服装、デート。相手に近い実在の人で試して、必要なら直して、もう一度確かめる。最後は自分で決める。",
  alternates: { canonical: site.url },
};

/* 結果の見え方。実際の回答ではないので、必ず「画面の見本」と書く */
const DEMO_Q = "このLINE、今日送っていい？";
const DEMO_WHO = ["25〜29歳", "女性", "アプリ経験あり"];
const DEMO_SAYS = [
  { age: 25, say: "私は普通に嬉しい。", ok: true },
  { age: 27, say: "最後だけ少し重い。", ok: true },
  { age: 28, say: "このくらいなら全然あり。", ok: true },
  { age: 29, say: "この関係なら全然あり。", ok: true },
  { age: 26, say: "私はもう少し待つかも。", ok: false },
];

const STEPS = ["聞きたいことを送る", "相手に近い人へ届く", "本音が返ってくる", "自分で決める"];

const NAV = [
  ["#flow", "使い方"],
  ["#moments", "利用シーン"],
  ["#price", "料金"],
  ["#safety", "安心・安全"],
  ["/join", "回答者になる"],
] as const;

const TARGET_CHIPS = [
  { t: "女性", on: true },
  { t: "25〜29歳", on: true },
  { t: "アプリ経験あり", on: true },
  { t: "現在独身", on: true },
  { t: "関西", on: false },
  { t: "カフェ好き", on: false },
];

function Wrap({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1120px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

function Block({
  children,
  tint = false,
  id,
}: {
  children: React.ReactNode;
  tint?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-20 ${tint ? "bg-mist" : "bg-paper"}`}>
      <Wrap className="py-16 sm:py-24">{children}</Wrap>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11.5px] font-bold tracking-[0.14em] text-steel">{children}</p>;
}

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-big font-black text-slate">{children}</h2>;
}

/** 年齢だけで人を表す。顔は置かない */
function Who({ age }: { age: number }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[12px] font-black tabular-nums text-brand-deep">
      {age}
    </span>
  );
}

function Badges({ onBrand = false }: { onBrand?: boolean }) {
  return (
    <ul
      className={`flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13px] font-bold ${
        onBrand ? "text-paper" : "text-steel"
      }`}
    >
      <li>匿名</li>
      <li>都度払い</li>
      <li>実在する人が回答</li>
    </ul>
  );
}

/** 結果カード。ヒーローと本編で同じものを使う */
function Report({ compact = false }: { compact?: boolean }) {
  const ok = DEMO_SAYS.filter((s) => s.ok).length;
  const says = compact ? DEMO_SAYS.slice(0, 3) : DEMO_SAYS;

  return (
    <div className="overflow-hidden rounded-card border border-line bg-paper shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <p className="text-[12.5px] font-bold text-brand">Human Reaction Report</p>
        <span className="shrink-0 rounded-pill bg-mist px-2.5 py-1 text-[10.5px] text-steel">
          画面の見本
        </span>
      </div>

      <div className="px-5 pt-5">
        <Eyebrow>QUESTION</Eyebrow>
        <p className="mt-1.5 text-[17px] font-black leading-[1.5] text-slate sm:text-[19px]">
          {DEMO_Q}
        </p>
        <p className="mt-4 text-[11.5px] font-bold tracking-[0.14em] text-steel">TARGET</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {DEMO_WHO.map((t) => (
            <li key={t} className="rounded-pill bg-mist px-2.5 py-1 text-[11.5px] text-steel">
              {t}
            </li>
          ))}
          <li className="rounded-pill bg-mist px-2.5 py-1 text-[11.5px] font-bold text-steel">
            {DEMO_SAYS.length}人
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-5 px-5 py-6 sm:gap-8">
        <Donut n={ok} of={DEMO_SAYS.length} label="送ってOK" size={compact ? 118 : 136} />
        <Donut
          n={DEMO_SAYS.length - ok}
          of={DEMO_SAYS.length}
          label="もう少し待つ"
          positive={false}
          size={compact ? 92 : 104}
        />
      </div>

      <div className="border-t border-line px-5 py-5">
        <ul className="flex flex-col gap-3.5">
          {says.map((s) => (
            <li key={s.age} className="flex items-center gap-3">
              <Who age={s.age} />
              <span className="min-w-0">
                <span className="block text-[12px] font-bold text-slate">{s.age}歳・女性</span>
                <span className="block text-[14.5px] leading-[1.7] text-steel">「{s.say}」</span>
              </span>
            </li>
          ))}
        </ul>
        {compact && (
          <p className="mt-4 text-[12.5px] font-bold text-brand">
            他の回答も見る <span aria-hidden>→</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const paid = canCharge();
  const entry = PLANS.find((p) => p.id === ENTRY_PLAN)!;

  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${site.url}/#webpage`,
    url: site.url,
    name: `${site.name} — 本番の前に、人で確かめる。`,
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
            <Tashikame size={30} />
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[16px] font-black text-slate">
                His Recoveries
              </span>
              <span className="hidden text-[10px] tracking-[0.08em] text-steel sm:block">
                本番の前に、人で確かめる。
              </span>
            </span>
          </Link>

          <nav aria-label="サイト" className="flex shrink-0 items-center gap-5">
            <ul className="hidden items-center gap-6 lg:flex">
              {NAV.map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="whitespace-nowrap text-[13.5px] font-bold text-steel transition-colors hover:text-brand"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <PlanCta
              plan={DEFAULT_PLAN}
              from="header"
              className="min-h-[42px] rounded-pill bg-brand px-5 text-[13.5px] !text-paper shadow-card"
            >
              人に聞いてみる
            </PlanCta>
          </nav>
        </Wrap>
      </header>

      {/* ══ 1. ヒーロー ══ */}
      <section className="bg-paper">
        <Wrap className="grid gap-12 pb-16 pt-12 lg:grid-cols-[1fr_0.92fr] lg:items-start lg:gap-14 lg:pt-16">
          <div>
            <h1 className="text-mega font-black text-slate">
              AIには聞いた。
              <br />
              じゃあ最後に、
              <br />
              人に聞く。
            </h1>

            <ul className="mt-8 flex flex-col gap-1.5 text-[18px] font-bold leading-[1.65] text-slate sm:text-[21px]">
              <li>このLINE、送っていい？</li>
              <li>この写真、あり？</li>
              <li>今日の服、大丈夫？</li>
            </ul>

            <p className="mt-7 max-w-[24em] text-[15.5px] leading-[1.95] text-steel sm:text-[16.5px]">
              相手に近い実在の人に見てもらって、リアルな反応を聞く。
            </p>

            <div className="mt-9">
              <PlanCta
                plan={ENTRY_PLAN}
                from="hero"
                className="min-h-[60px] w-full rounded-pill bg-brand px-9 text-[17px] !text-paper shadow-card sm:w-auto"
              >
                人に聞いてみる <span aria-hidden className="ml-2">→</span>
              </PlanCta>
            </div>

            <div className="mt-7">
              <Badges />
            </div>
          </div>

          {/* 何が返ってくるかを、説明より先に見せる */}
          <Reveal>
            <Report compact />
          </Reveal>
        </Wrap>
      </section>

      {/* ══ 2. AIとの違い ══ */}
      <Block tint>
        <H>AIと、人に聞くのは違う。</H>

        <div className="mt-9 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1.15fr]">
          {/* AI。他社のロゴは借りない */}
          <div className="rounded-card border border-line bg-paper p-5 shadow-card">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-soft bg-mist text-[13px] font-black text-steel">
                AI
              </span>
              <p className="text-[14.5px] font-bold text-slate">AI</p>
            </div>
            <p className="mt-5 text-[16px] leading-[1.85] text-steel sm:text-[17px]">
              「このLINEなら、好印象だと思います。」
            </p>
            <p className="mt-5 text-right">
              <span className="rounded-pill bg-mist px-2.5 py-1 text-[11px] font-bold text-steel">
                予測
              </span>
            </p>
          </div>

          <p aria-hidden className="justify-self-center self-center text-[22px] text-steel">
            →
          </p>

          {/* 人 */}
          <div className="rounded-card border border-brand bg-paper p-5 shadow-card">
            <p className="text-[14.5px] font-black text-brand">His Recoveries</p>
            <ul className="mt-5 flex flex-col gap-3.5">
              {[
                { age: 25, say: "私は嬉しい。" },
                { age: 27, say: "最後だけ少し重い。" },
                { age: 29, say: "この関係なら全然あり。" },
              ].map((x) => (
                <li key={x.age} className="flex items-center gap-3">
                  <Who age={x.age} />
                  <span className="min-w-0">
                    <span className="block text-[12px] font-bold text-slate">{x.age}歳・女性</span>
                    <span className="block text-[15px] leading-[1.7] text-steel">「{x.say}」</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-right">
              <span className="rounded-pill bg-brand px-2.5 py-1 text-[11px] font-bold text-paper">
                実際の反応
              </span>
            </p>
          </div>
        </div>

        <p className="mt-10 text-[22px] font-black leading-[1.6] text-slate sm:text-[28px]">
          AIは予測する。
          <br />
          人は、実際に反応する。
        </p>
        <span aria-hidden className="mt-2.5 block h-1 w-[150px] rounded-pill bg-brand sm:w-[190px]" />

        {/* AIを否定しない。順番を書く */}
        <p className="mt-9 text-[17px] font-bold leading-[1.8] text-slate sm:text-[19px]">
          まずAIに聞いていい。最後だけ、人にも聞く。
        </p>

        {/* 友達との違い */}
        <div className="mt-9 rounded-card border border-line bg-paper p-6 shadow-card sm:p-7">
          <p className="text-[19px] font-black text-slate sm:text-[21px]">
            友達1人より、相手に近い5人。
          </p>
          <p className="mt-3 max-w-[32em] text-[14.5px] leading-[1.9] text-steel">
            友達には、あなたとの関係があります。ここでは匿名で、相手に近い条件の複数人へ聞けます。
          </p>
        </div>
      </Block>

      {/* ══ 3. 使う瞬間 ══ */}
      <Block id="moments">
        <H>迷うのは、決める直前。</H>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((u, i) => (
            <Reveal key={u.tag} delay={i * 60}>
              <PlanCta
                plan={DEFAULT_PLAN}
                from="moment"
                category={u.category}
                className="!flex h-full !flex-col !items-start rounded-card border border-line bg-paper p-5 text-left shadow-card"
              >
                <span className="text-[11px] font-bold tracking-[0.12em] text-steel">{u.tag}</span>
                <span className="mt-2.5 block text-[17.5px] font-black leading-[1.5] text-slate">
                  {u.q}
                </span>
                <span className="mt-3.5 block text-[13px] font-normal leading-[1.85] text-steel">
                  {u.body}
                </span>
                <span className="mt-5 flex-1" />
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-[15px] text-paper">
                  <span aria-hidden>→</span>
                </span>
              </PlanCta>
            </Reveal>
          ))}
        </div>
      </Block>

      {/* ══ 4. 誰に聞くか ══ */}
      <Block tint>
        <Eyebrow>TARGET</Eyebrow>
        <h2 className="mt-2 text-huge font-black text-slate">
          相手本人には聞けない。
          <br />
          だから、相手に近い人へ。
        </h2>
        <p className="mt-5 max-w-[26em] text-[15px] leading-[1.95] text-steel">
          ただの「女性5人」ではありません。自分が知りたい相手に近い条件で選べます。
        </p>

        <div className="mt-8 rounded-card border border-line bg-paper p-5 shadow-card sm:p-6">
          <p className="text-[13px] font-bold text-slate">条件を選ぶ（例）</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {TARGET_CHIPS.map((c) => (
              <li
                key={c.t}
                className={`rounded-pill px-3.5 py-2 text-[13px] font-bold ${
                  c.on ? "bg-brand text-paper" : "bg-mist text-steel"
                }`}
              >
                {c.t}
              </li>
            ))}
            <li className="rounded-pill bg-mist px-3.5 py-2 text-[13px] text-steel">…</li>
          </ul>
        </div>
      </Block>

      {/* ══ 5. 返ってくるもの ══ */}
      <Block id="report">
        <Eyebrow>RESULT</Eyebrow>
        <h2 className="mt-2 text-huge font-black text-slate">Human Reaction Report</h2>
        <p className="mt-3 text-[15px] text-steel">実際の人からのリアルな反応が届きます。</p>

        <Reveal>
          <div className="mt-8">
            <Report />
          </div>
        </Reveal>

        <p className="mt-10 text-[22px] font-black leading-[1.6] text-slate sm:text-[26px]">
          人は、同じじゃない。
          <br />
          だから人に聞く。
        </p>
        <p className="mt-5 max-w-[30em] text-[15px] leading-[1.95] text-steel">
          意見が割れることも、そのまま出します。
          「これが正解です」とは言いません。決めるのはあなたです。
        </p>
      </Block>

      {/* ══ 6. 聞いて終わりにしない ══ */}
      <Block tint id="flow">
        <H>聞いて終わり、にしない。</H>
        <p className="mt-4 max-w-[32em] text-[15px] leading-[1.95] text-steel">
          反応を見て、直して、もう一度同じ条件の別の人に見てもらう。
          良くなったことまで確かめてから、本番へ。
        </p>

        <ol className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {FLOW.map((f, i) => (
            <Reveal key={f.tag} delay={i * 60}>
              <li className="flex h-full flex-col rounded-card border border-line bg-paper p-5 shadow-card">
                <span className="text-[10.5px] font-bold tracking-[0.14em] text-steel">
                  {f.tag}
                </span>
                <span className="mt-2.5 text-[16px] font-black leading-[1.5] text-slate">
                  {f.label}
                </span>
                <span className="mt-3 text-[12.5px] leading-[1.8] text-steel">{f.note}</span>
              </li>
            </Reveal>
          ))}
        </ol>

        <p className="mt-9 text-[19px] font-black text-slate sm:text-[22px]">
          聞いて終わりじゃない。良くして返す。
        </p>
      </Block>

      {/* ══ 7. 料金 ══ */}
      <Block id="price">
        <H>どこまで仕上げるかで、選ぶ。</H>
        <p className="mt-4 max-w-[32em] text-[15px] leading-[1.95] text-steel">
          人数で分けていません。試すだけにするか、直すところまでやるか、
          直したものをもう一度確かめるかで分けています。
        </p>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <div
                className={`flex h-full flex-col rounded-card border bg-paper p-5 shadow-card ${
                  p.featured ? "border-brand" : "border-line"
                } ${p.available ? "" : "opacity-95"}`}
              >
                {p.featured ? (
                  <span className="mb-3 inline-flex w-fit rounded-pill bg-brand px-3 py-1 text-[11px] font-bold text-paper">
                    一番おすすめ
                  </span>
                ) : !p.available ? (
                  <span className="mb-3 inline-flex w-fit rounded-pill bg-mist px-3 py-1 text-[11px] font-bold text-steel">
                    受付前
                  </span>
                ) : (
                  <span aria-hidden className="mb-3 block h-[25px]" />
                )}

                <p className="text-[15.5px] font-black leading-[1.5] text-slate">{p.name}</p>
                <p className="mt-3 text-[30px] font-black leading-none tabular-nums text-slate">
                  ¥{p.yen.toLocaleString()}
                  {p.from && <span className="ml-1 text-[15px] text-steel">〜</span>}
                </p>
                <p className="mt-3.5 text-[13.5px] leading-[1.8] text-steel">{p.tagline}</p>

                {/* 金額だけ見せると高く感じる。何が返ってくるかを必ず並べる */}
                <ul className="mt-5 flex flex-col gap-2 border-t border-line pt-4">
                  {p.includes.map((x) => (
                    <li key={x} className="flex items-start gap-2 text-[12.5px] leading-[1.7]">
                      <span aria-hidden className="mt-[3px] text-[11px] font-black text-ok-text">
                        ✓
                      </span>
                      <span className="min-w-0 text-steel">{x}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex-1" />

                {p.available ? (
                  <PlanCta
                    plan={p.id}
                    from="price"
                    className={`min-h-[52px] rounded-pill px-5 text-[14.5px] shadow-card ${
                      p.featured ? "bg-brand !text-paper" : "border border-line bg-paper !text-slate"
                    }`}
                  >
                    これで確かめる
                  </PlanCta>
                ) : (
                  <p className="rounded-pill bg-mist px-5 py-3.5 text-center text-[13px] font-bold text-steel">
                    対面での確認を含むため、
                    <br />
                    まだ受け付けていません
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-[12.5px] leading-[1.9] text-steel">
          価格は税込です。月額も入会金もありません。募集を始める前ならキャンセルできます。
          人数が集まらなかった場合は、集まらなかった分をご返金します。
          <Link
            href="/legal"
            className="ml-1 font-bold text-brand underline decoration-line underline-offset-4"
          >
            特定商取引法に基づく表記
          </Link>
        </p>

        {!paid && (
          <p className="mt-4 rounded-card border border-brand bg-paper p-4 text-[13.5px] leading-[1.9] text-slate shadow-card">
            いまお支払いは受け付けていません。特定商取引法に基づく表記が整うまで、
            決済を開始できないようにしてあります。
          </p>
        )}
      </Block>

      {/* ══ 8. 市場価格との比較 ══ */}
      <Block tint>
        <H>人の力を借りると、実はこれくらい。</H>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MARKET.map((r) => (
            <li
              key={r.id}
              className={`flex flex-col rounded-card border bg-paper p-5 shadow-card ${
                r.ours ? "border-brand" : "border-line"
              }`}
            >
              <p
                className={`text-[14px] font-black ${r.ours ? "text-brand" : "text-slate"}`}
              >
                {r.label}
              </p>

              <p className="mt-3 text-[20px] font-black tabular-nums leading-none text-slate">
                {r.free ? (
                  "¥0〜"
                ) : r.ours ? (
                  <>
                    ¥{entry.yen.toLocaleString()}
                    <span className="ml-1 text-[13px] text-steel">〜 / 1回</span>
                  </>
                ) : hasPrice(r) && r.yen ? (
                  `¥${r.yen.from.toLocaleString()}〜`
                ) : (
                  <span className="text-[13.5px] font-bold text-steel">
                    サービスによって幅があります
                  </span>
                )}
              </p>

              <p className="mt-3.5 text-[13px] leading-[1.85] text-steel">{r.what}</p>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-[12px] leading-[1.85] text-steel">
          他社の金額は、出典を確認できたものだけを載せる方針にしています。
          確認できていないものは、金額を伏せて種類だけを出しています。
        </p>

        <div className="mt-9 rounded-card border border-line bg-paper p-6 shadow-card sm:p-7">
          <p className="text-[20px] font-black leading-[1.6] text-slate sm:text-[24px]">
            0円か、数十万円かじゃない。
          </p>
          <p className="mt-4 max-w-[34em] text-[14.5px] leading-[1.9] text-steel">
            AIだけで十分なときは、AIでいい。
            長く婚活そのものを支えてほしいなら、結婚相談所という選択肢もあります。
            どれが優れているという話ではなく、必要な支援の深さが違います。
            His Recoveries は、その間です。
          </p>
          <p className="mt-5 text-[17px] font-black text-slate sm:text-[19px]">
            今日の一手だけ、人の力を使う。
          </p>
        </div>
      </Block>

      {/* ══ 9. 信頼・安心 ══ */}
      <Block id="safety">
        <H>ちゃんと、人が答える。</H>

        <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
          {[
            "本人確認と年齢確認をしています",
            "条件（年代・経験・いまの立場）を確認しています",
            "匿名で聞けます。名前もメールアドレスも要りません",
            "相手の名前・写真・連絡先は保存しません",
            "送る前に、個人情報は自動で伏せます",
            "18歳未満に関する相談は受け付けません",
          ].map((t) => (
            <li
              key={t}
              className="flex items-start gap-3 rounded-soft bg-mist px-4 py-3.5 text-[13.5px] leading-[1.8] text-steel"
            >
              <span aria-hidden className="mt-[3px] text-[13px] font-black text-ok-text">
                ✓
              </span>
              <span className="min-w-0">{t}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/safety"
            className="inline-flex min-h-[50px] items-center justify-center rounded-pill border border-line bg-paper px-6 text-[14px] font-bold text-slate shadow-card transition-shadow hover:shadow-card-hover"
          >
            安心・安全について
          </Link>
          <Link
            href="/join"
            className="inline-flex min-h-[50px] items-center justify-center rounded-pill bg-slate px-6 text-[14px] font-bold text-paper transition-opacity hover:opacity-90"
          >
            回答者になる
          </Link>
        </div>

        <p className="mt-8 max-w-[32em] text-[15px] leading-[1.95] text-steel">
          答えるのは専門家ではありません。年齢と条件を確かめた、ふつうの人です。
          その人の年齢・経験・いまの立場・感覚そのものに価値があります。
        </p>
        <p className="mt-4 text-[17px] font-black text-slate sm:text-[19px]">
          あなたの感覚が、誰かの判断材料になる。
        </p>
      </Block>

      {/* ══ 10. 最後 ══ */}
      <section className="bg-paper">
        <Wrap className="pb-20 pt-4 sm:pb-24">
          <div className="rounded-card bg-brand p-8 text-paper shadow-card sm:p-14">
            <p className="text-huge font-black">大事な一手を、迷ったまま出さない。</p>

            <ul className="mt-7 flex flex-col gap-1.5 text-[17px] font-bold leading-[1.8]">
              <li>AIで考える。</li>
              <li>人で試す。</li>
              <li>必要なら直す。</li>
              <li>最後は自分で決める。</li>
            </ul>

            <div className="mt-9">
              <PlanCta
                plan={ENTRY_PLAN}
                from="final"
                className="min-h-[60px] w-full rounded-pill bg-paper px-10 text-[16.5px] !text-brand-deep sm:w-auto"
              >
                人で確かめる <span aria-hidden className="ml-2">→</span>
              </PlanCta>
            </div>

            <div className="mt-7">
              <Badges onBrand />
            </div>
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
                  ["/ask", "人に聞いてみる"],
                  ["/mine", "聞いたこと"],
                  ["/join", "回答者になる"],
                ] as const,
              },
              {
                h: "知る",
                items: [
                  ["/safety", "安心・安全"],
                  ["/how", "仕組み"],
                  ["/answerers", "答える人たち"],
                  ["/articles", "記事"],
                ] as const,
              },
              {
                h: "運営",
                items: [
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
              <Tashikame size={26} />
              <span className="text-[15px] font-black text-slate">His Recoveries</span>
            </Link>
            <p className="text-[12px] text-steel">
              © 2026 His Recoveries — 本番の前に、人で確かめる。
            </p>
          </div>
        </Wrap>
      </footer>
    </div>
  );
}
