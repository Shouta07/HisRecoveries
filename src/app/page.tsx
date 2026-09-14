import type { Metadata } from "next";
import Link from "next/link";
import { complexes } from "@/lib/complexes";
import { SITUATIONS } from "@/lib/situations";
import { site } from "@/lib/site";
import { STAGES } from "@/lib/journey";
import RecordDemo from "@/components/home/RecordDemo";
import FinalCta from "@/components/home/FinalCta";

// ══════════════════════════════════════════════════════════════
// トップページ。
//
// ── ここが売るもの ────────────────────────────────
// 以前のトップは「男の改善は、順番で決まる」を売っていた。
// ヒーローは男性の写真、選択肢は 清潔感／髪／肌／疲れ顔／ヒゲ／眠り。
// つまり /app（出会ったあとを、大切にする）とは別のプロダクトだった。
// 同じ看板で2つのことを言うのをやめ、ここは /app の入口にする。
//
// 記事55本・診断・順番・プランは消していない。URLもそのまま。
// トップからの大量露出だけを外し、導線はフッターと /app/knowledge に残す。
//
// ── 順番 ─────────────────────────────────────
//   具体的な自分ごと → 触れる → 価値を理解 → 思想に共感 → 安心 → 使う
// ブランドの一文から説明を始めない。
// 「出会ったあとを、大切にする。」は §14 の位置でいちばん効く。
//
// ── 6つまで ───────────────────────────────────
//   触れるヒーロー / 出会ったあとの問題 / 残す・振り返る・分かってくる /
//   道のり / 相手を攻略しない・記録は自分のもの / 最後のCTA
// 記事一覧もカテゴリ一覧も置かない。
//
// ── 見た目 ────────────────────────────────────
// /app と同じ設計システム（DESIGN-APP.md）。
// 地は ground、線は hairline、アクセントは #B2543C 一色。
// カードは押せるものにだけ使う。区切りは 余白 → 線 → カード の順。
// ══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "His Recoveries — 出会ったあとを、大切にする。",
  description:
    "会ったあと、どうだったかを残しておく。「楽しかった」「また会いたい」「ちょっと違った」。その日の感覚を30秒で記録し、続けるうちに自分がどんな関係を心地よく感じるのかが見えてきます。",
  alternates: { canonical: site.url },
};

/* ── 小さな部品 ──────────────────────────────────
   /app の system.tsx と同じ規則で書く。
   ここはサーバー側なので import せず、同じ値で持つ。 */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11.5px] font-medium tracking-[0.12em] text-faint">{children}</p>;
}

/**
 * 見出しの候補（§37）。
 *
 * あとで差し替えられるように、文面をここに1箇所だけ持つ。
 * JSXの中に直接書くと、試すたびにレイアウトを触ることになり、
 * 「文面を変えたのか、組みを変えたのか」が分からなくなる。
 *
 * いまは A を出している。B・C は書いてあるだけで、まだ出していない。
 * 配信の仕組み（誰にどちらを出すか）は作っていないので、
 * 試すときは、ここを1行入れ替えて、期間で比べる。
 */
const HERO = {
  A: ["会ったあと、", "どうだったかを", "残しておく。"],
  B: ["また会いたい。", "その理由まで", "覚えていますか？"],
  C: ["会った日の感覚は、", "意外とすぐ忘れる。"],
} as const;

const HEADLINE = HERO.A;

function Section({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="mx-auto w-full max-w-[720px] px-6 sm:px-10">
      {children}
    </section>
  );
}

/** 一本の線（§24）。セクションの切れ目に、同じ太さで反復する */
function Thread() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-6 sm:px-10">
      <span aria-hidden className="block h-px w-full bg-hairline" />
    </div>
  );
}

export default function HomePage() {
  // 記事の索引は、このページの主役ではなくなった。
  // 55本を並べた ItemList をここに残すと、1本もリンクしていない面が
  // 「索引です」と名乗ることになる。記事の発見は sitemap（92URL）が担う。
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${site.url}/#webpage`,
    url: site.url,
    name: `${site.name} — 出会ったあとを、大切にする。`,
    description: metadata.description,
    inLanguage: "ja",
    isPartOf: { "@id": `${site.url}/#website` },
  };

  return (
    <div className="min-h-screen bg-ground text-charcoal">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      {/* ══════ ヘッダー。極小（§28）══════
          ナビを並べない。ここに置くものが増えるほど、ヒーローが遅れて届く。 */}
      <header className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-4 px-6 pb-2 pt-6 sm:px-10">
        <Link href="/" className="text-[14.5px] font-bold tracking-[0.01em] text-charcoal">
          {site.name}
        </Link>
        <nav aria-label="サイト" className="flex items-center gap-5">
          <Link
            href="/app/knowledge"
            className="text-[13px] text-faint transition-colors hover:text-accent"
          >
            知る
          </Link>
          <Link
            href="/app"
            className="inline-flex min-h-[40px] items-center rounded-[8px] border border-hairline px-3.5 text-[13px] text-bodytext transition-colors hover:border-accent hover:text-accent"
          >
            記録してみる
          </Link>
        </nav>
      </header>

      {/* ══════ 1. ヒーロー ══════
          Desktop は左に言葉、右に触れる記録。Mobile は縦に。
          ファーストビューに、見出し・説明・記録・CTA 以外を置かない。 */}
      <Section>
        {/* 縦の並びは 見出し → 説明 → 触れる記録 → CTA（§9）。
            スマホでCTAを先に置くと、触れるものが折り返しの下に落ちる。
            押す前に触らせたいので、順番のほうを直す。
            広い画面では、言葉が左、触れる記録が右。 */}
        <div className="grid items-start gap-7 pb-16 pt-6 sm:pt-10 lg:grid-cols-[1fr_340px] lg:gap-x-14 lg:gap-y-8">
          <div className="lg:col-start-1 lg:row-start-1">
            <h1
              className="font-display font-bold leading-[1.35] tracking-[-0.015em] text-charcoal [text-wrap:balance]"
              style={{ fontSize: "clamp(34px, 9.4vw, 60px)" }}
            >
              {HEADLINE.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-[30em] text-[15.5px] leading-[2] text-bodytext sm:text-[16.5px]">
              「楽しかった」「また会いたい」「ちょっと違った」。
              その日の感覚を30秒で記録。
              続けるうちに、自分がどんな相手・関係を心地よく感じるのかが、
              少しずつ見えてきます。
            </p>
          </div>

          {/* その場で触れる。スマホの絵を置かない（§7）*/}
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <RecordDemo />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-start-1 lg:row-start-2">
            <Link
              href="/app/new"
              className="inline-flex min-h-[54px] items-center justify-center rounded-[8px] bg-accent px-7 text-[15.5px] font-bold text-white transition-colors duration-200 hover:bg-accent/90"
            >
              30秒で記録してみる
            </Link>
            <Link
              href="#what"
              className="inline-flex min-h-[44px] items-center text-[14px] text-bodytext transition-colors hover:text-accent"
            >
              どんなサービス？
            </Link>
          </div>
        </div>
      </Section>

      <Thread />

      {/* ══════ 2. 出会ったあとの問題 ══════ */}
      <Section id="what">
        <div className="py-20 sm:py-28">
          <h2 className="max-w-[18em] font-display text-[24px] font-bold leading-[1.6] text-charcoal sm:text-[30px] [text-wrap:balance]">
            出会う方法は、たくさんある。
            <br />
            出会ったあとを考える場所は、あまりない。
          </h2>
          <div className="mt-9 max-w-[26em] text-[16px] leading-[2.1] text-bodytext">
            <p>
              マッチした。話した。会った。楽しかった。
              <br />
              でも、そのあと。
            </p>
            <p className="mt-6">
              また会いたいのか。何が良かったのか。少し違ったのか。
              <br />
              自分でも、意外と分からない。
            </p>
          </div>
          <p className="mt-9 border-l border-accent pl-4 text-[16.5px] font-bold leading-[1.95] text-charcoal">
            His Recoveries は、その感覚を残しておく場所です。
          </p>
        </div>
      </Section>

      <Thread />

      {/* ══════ 3. 残す → 振り返る → 分かってくる ══════
          横並びの3枚カードにしない（§12）。縦に、線でつないで、順に変わっていく。 */}
      <Section>
        <div className="py-20 sm:py-28">
          <ol className="relative ml-1 flex flex-col gap-16 border-l border-hairline pl-7 sm:gap-20 sm:pl-10">
            <li className="relative">
              <span
                aria-hidden
                className="absolute left-[-32px] top-[9px] block h-[9px] w-[9px] rounded-full bg-accent sm:left-[-44px]"
              />
              <Eyebrow>残す</Eyebrow>
              <h3 className="mt-3 font-display text-[21px] font-bold leading-[1.6] text-charcoal sm:text-[24px]">
                その日の感覚を、残す。
              </h3>
              <p className="mt-4 max-w-[26em] text-[15.5px] leading-[2.05] text-bodytext">
                長い日記はいりません。「楽しかった」「また会いたい」「まだ分からない」。
                まずはそれだけでも。
              </p>
              <div className="mt-6 max-w-[380px] rounded-[14px] border border-hairline bg-surface p-4">
                <p className="text-[15px] font-bold leading-[1.6] text-charcoal">
                  今日は、どうでしたか？
                </p>
                <div className="mt-3.5 flex flex-col gap-2">
                  {["楽しかった", "もう一度会いたい", "まだ分からない", "少し違った"].map(
                    (t, i) => (
                      <span
                        key={t}
                        className={`block rounded-[10px] border px-3.5 py-3 text-[14px] ${
                          i === 1
                            ? "border-accent bg-accent-tint text-charcoal"
                            : "border-hairline bg-ground text-bodytext"
                        }`}
                      >
                        {t}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </li>

            <li className="relative">
              <span
                aria-hidden
                className="absolute left-[-32px] top-[9px] block h-[9px] w-[9px] rounded-full border border-hairline bg-ground sm:left-[-44px]"
              />
              <Eyebrow>振り返る</Eyebrow>
              <h3 className="mt-3 font-display text-[21px] font-bold leading-[1.6] text-charcoal sm:text-[24px]">
                答えではなく、問いが返ってくる。
              </h3>
              <p className="mt-4 max-w-[26em] text-[15.5px] leading-[2.05] text-bodytext">
                相手の気持ちを予測するのではなく、自分の感覚を少しだけ振り返る手助けをします。
              </p>
              <div className="mt-6 max-w-[380px] rounded-[14px] border border-hairline bg-surface p-4">
                <p className="text-[11.5px] font-medium tracking-[0.12em] text-faint">
                  少し振り返ってみる
                </p>
                <p className="mt-2.5 text-[15.5px] font-bold leading-[1.8] text-charcoal">
                  もう一度会いたいと思ったのは、どんなところでしたか？
                </p>
                <p className="mt-2 text-[12.5px] text-faint">理由のほうが先に薄れます。</p>
              </div>
            </li>

            <li className="relative">
              <span
                aria-hidden
                className="absolute left-[-32px] top-[9px] block h-[9px] w-[9px] rounded-full border border-hairline bg-ground sm:left-[-44px]"
              />
              <Eyebrow>分かってくる</Eyebrow>
              <h3 className="mt-3 font-display text-[21px] font-bold leading-[1.6] text-charcoal sm:text-[24px]">
                続けると、自分のことが少し分かる。
              </h3>
              <p className="mt-4 max-w-[26em] text-[15.5px] leading-[2.05] text-bodytext">
                どんな時間が心地よかったのか。どんなとき自然体だったのか。
                記録が増えると、自分自身の傾向が少しずつ見えてきます。
              </p>
              <div className="mt-6 max-w-[380px] rounded-[14px] border border-hairline bg-surface p-4">
                <p className="text-[11.5px] font-medium tracking-[0.12em] text-faint">
                  最近のあなた
                </p>
                <p className="mt-2.5 border-l border-accent pl-3.5 text-[15px] leading-[1.95] text-charcoal">
                  自然体でいられた日に、「楽しかった」「もう一度会いたい」と書いていることが多いようです。
                </p>
              </div>
            </li>
          </ol>
        </div>
      </Section>

      <Thread />

      {/* ══════ 4. 道のり ══════ */}
      <Section>
        <div className="py-20 sm:py-28">
          <h2 className="font-display text-[24px] font-bold leading-[1.6] text-charcoal sm:text-[30px]">
            関係には、いろんな途中がある。
          </h2>

          {/* /app と同じ線。ここでも塗り分けない */}
          <div className="mt-10">
            <div className="relative">
              <span
                aria-hidden
                className="absolute left-0 right-0 top-[4px] block h-px bg-hairline"
              />
              <ul className="relative flex items-start justify-between">
                {STAGES.map((s, i) => (
                  <li key={s.id} className="flex flex-col items-center">
                    <span
                      aria-hidden
                      className={`block rounded-full ${
                        i === 4 ? "-mt-[3px] h-[11px] w-[11px] bg-accent" : "h-[5px] w-[5px] bg-hairline"
                      }`}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-[11px] text-faint">{STAGES[0]?.label}</span>
              <span className="text-[11px] text-faint">{STAGES[STAGES.length - 1]?.label}</span>
            </div>
          </div>

          <p className="mt-10 max-w-[27em] text-[16px] leading-[2.1] text-bodytext">
            His Recoveries は、早く次へ進むためのサービスではありません。
            その途中で、自分が何を感じているのかを見失わないための場所です。
          </p>

          {/* 知るへの導線は Secondary（§15）。記事のカードは並べない */}
          <p className="mt-8 text-[14px] leading-[1.9] text-faint">
            迷ったときは、他の人の経験や知識も。
            <Link
              href="/app/knowledge"
              className="ml-2 inline-flex min-h-[44px] items-center text-bodytext underline decoration-hairline underline-offset-4 transition-colors hover:text-accent"
            >
              知る →
            </Link>
          </p>
        </div>
      </Section>

      <Thread />

      {/* ══════ 5. ブランド + 信頼 + 記録の扱い ══════
          ブランドの一文は、ここで初めて大きく出す（§14）。 */}
      <Section>
        <div className="py-20 sm:py-28">
          <h2
            className="font-display font-bold leading-[1.45] tracking-[-0.015em] text-charcoal"
            style={{ fontSize: "clamp(30px, 8.2vw, 54px)" }}
          >
            出会ったあとを、
            <br />
            大切にする。
          </h2>
          <p className="mt-7 max-w-[26em] text-[16px] leading-[2.1] text-bodytext">
            出会うためのサービスはたくさんあります。
            His Recoveries は、その先にある時間を支えます。
          </p>

          <div className="mt-16">
            <h3 className="font-display text-[20px] font-bold leading-[1.6] text-charcoal sm:text-[22px]">
              相手を攻略するためのサービスではありません。
            </h3>
            <p className="mt-4 max-w-[26em] text-[15.5px] leading-[2.05] text-bodytext">
              大切にするのは、相手を思い通りに動かすことではなく、
              自分自身がその関係をどう感じているかを知ることです。
            </p>
            <ul className="mt-7 max-w-[24em] divide-y divide-hairline border-y border-hairline">
              {[
                "脈ありスコアを出さない",
                "相手の感情を断定しない",
                "相手を点数化しない",
                "無理に関係を進めない",
                "恋愛成功率を出さない",
              ].map((t) => (
                <li key={t} className="py-3 text-[14.5px] leading-[1.8] text-bodytext">
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-16">
            <h3 className="font-display text-[20px] font-bold leading-[1.6] text-charcoal sm:text-[22px]">
              自分のことだから、
              <br />
              自分で決める。
            </h3>
            <p className="mt-4 max-w-[27em] text-[15.5px] leading-[2.05] text-bodytext">
              関係の記録は、とても個人的なものです。
              His Recoveries は記録をサーバーに預かりません。
              あなたの端末の中にだけ残るので、こちらから読むことも、
              復元することもできません。相手の名前・写真・連絡先は、
              そもそも入力する場所を作っていません。
            </p>
            <ul className="mt-6 max-w-[27em] text-[14.5px] leading-[2.05] text-faint">
              <li>・1件ずつ消せます。まとめても消せます</li>
              <li>・匿名の利用計測は、設定でオフにできます</li>
              <li>・登録もログインも要りません</li>
            </ul>
            <p className="mt-6 text-[13.5px] text-faint">
              <Link
                href="/privacy"
                className="underline decoration-hairline underline-offset-4 transition-colors hover:text-accent"
              >
                プライバシー・免責事項
              </Link>
            </p>
          </div>
        </div>
      </Section>

      <Thread />

      {/* ══════ 6. 最後のCTA ══════ */}
      <FinalCta />

      {/* ══════ フッター ══════
          記事・診断・順番・プランへの導線は、1本も減らしていない。
          トップから外したのは露出であって、リンクではない。 */}
      <footer className="border-t border-hairline">
        <div className="mx-auto w-full max-w-[720px] px-6 py-16 sm:px-10">
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[12px] text-faint">分野</p>
              <ul className="mt-3.5 grid grid-cols-2 gap-x-6 gap-y-2 text-[13.5px] sm:grid-cols-1">
                {complexes.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/areas/${c.id}`}
                      className="-my-1 block py-1 text-bodytext transition-colors hover:text-accent"
                    >
                      {c.ja}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[12px] text-faint">状況からさがす</p>
              <ul className="mt-3.5 space-y-2 text-[13.5px]">
                {SITUATIONS.map((x) => (
                  <li key={x.id}>
                    <Link
                      href={`/situations/${x.id}`}
                      className="-my-1 block py-1 text-bodytext transition-colors hover:text-accent"
                    >
                      {x.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[12px] text-faint">読みもの</p>
              <ul className="mt-3.5 space-y-2 text-[13.5px]">
                {[
                  ["/app/knowledge", "知る"],
                  ["/check", "現在地を測る"],
                  ["/order", "男の改善、全部の順番"],
                  ["/skip", "やらなくていいこと"],
                  ["/letters", "お便りについて"],
                  ["/feed.xml", "RSS"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="-my-1 block py-1 text-bodytext transition-colors hover:text-accent"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[12px] text-faint">His Recoveries</p>
              <ul className="mt-3.5 space-y-2 text-[13.5px]">
                {[
                  ["/about", "編集方針"],
                  ["/updates", "更新記録"],
                  ["/disclosure", "広告と収益について"],
                  ["/research", "調査"],
                  ["/interview", "取材にご協力いただけませんか"],
                  ["/partner", "取材・掲載について"],
                  ["/plan", "第一印象改善プラン"],
                  ["/privacy", "プライバシー・免責事項"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="-my-1 block py-1 text-bodytext transition-colors hover:text-accent"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-hairline pt-7 sm:flex-row sm:items-baseline sm:justify-between">
            <Link href="/" className="text-[16px] font-bold text-charcoal">
              {site.name}
            </Link>
            <p className="text-[12px] text-faint">
              © 2026 His Recoveries — 出会ったあとを、大切にする。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
