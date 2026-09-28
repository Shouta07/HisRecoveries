import type { Metadata } from "next";
import Link from "next/link";
import { complexes } from "@/lib/complexes";
import { SITUATIONS } from "@/lib/situations";
import { site } from "@/lib/site";
import { CATEGORIES, BILLING_ENABLED } from "@/lib/ask/model";

// ══════════════════════════════════════════════════════════════
// トップページ。
//
// ── ここが売るもの ────────────────────────────────
// 「男だけでは分からないことを、実際の女性に聞けるサービス」。
// 恋愛メディアでも、AI恋愛相談でもない。
// 説明を足さないと何か分からない状態にしない。1行で分かるようにする。
//
// ── AIを表に出さない ──────────────────────────────
// AIは 整理・匿名化・振り分け に徹する裏方なので、看板に書かない。
// 「AIが判定します」と書いた瞬間、価値が人から機械へ移って見える。
//
// ── 盛らない ──────────────────────────────────────
// 回答者は招待した女性メンバーで、いまは少人数。
// 「何千人が回答」のような、実態にない規模を書かない。
// 返答までの時間も、実績が無いので書かない。書けば嘘になる。
//
// ── 記事は残す。中心から外すだけ ──────────────────
// 55本はURLもそのまま。トップからの露出を外し、
// フッターと記事末尾のCTAで、プロダクトへの導線として使う。
// ══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "His Recoveries — それ、女性に聞いてみる？",
  description:
    "LINE、デート、写真、恋愛。自分では分からないことを、実際の女性に匿名で聞けます。登録なし。",
  alternates: { canonical: site.url },
};

function Section({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="mx-auto w-full max-w-[680px] px-6 sm:px-10">
      {children}
    </section>
  );
}

function Rule() {
  return (
    <div className="mx-auto w-full max-w-[680px] px-6 sm:px-10">
      <span aria-hidden className="block h-px w-full bg-hairline" />
    </div>
  );
}

export default function HomePage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${site.url}/#webpage`,
    url: site.url,
    name: `${site.name} — それ、女性に聞いてみる？`,
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

      {/* ── ヘッダー。極小 ── */}
      <header className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-4 px-6 pb-2 pt-6 sm:px-10">
        <Link href="/" className="text-[14.5px] font-bold text-charcoal">
          {site.name}
        </Link>
        <nav aria-label="サイト" className="flex items-center gap-5">
          <Link
            href="/articles"
            className="text-[13px] text-faint transition-colors hover:text-accent"
          >
            読みもの
          </Link>
          <Link
            href="/ask"
            className="inline-flex min-h-[40px] items-center rounded-[8px] border border-hairline px-3.5 text-[13px] text-bodytext transition-colors hover:border-accent hover:text-accent"
          >
            女性に聞く
          </Link>
        </nav>
      </header>

      {/* ── 1. ファーストビュー ── */}
      <Section>
        <div className="pb-14 pt-10 sm:pt-16">
          <h1
            className="font-display font-bold leading-[1.35] tracking-[-0.015em] text-charcoal [text-wrap:balance]"
            style={{ fontSize: "clamp(34px, 9.6vw, 60px)" }}
          >
            それ、
            <br />
            女性に聞いてみる？
          </h1>

          <p className="mt-7 max-w-[26em] text-[16px] leading-[2] text-bodytext sm:text-[17px]">
            LINE、写真、デート、恋愛。
            相手に近い女性から、リアルな反応をもらえます。
          </p>

          <div className="mt-9">
            <Link
              href="/ask"
              className="inline-flex min-h-[56px] w-full items-center justify-center rounded-[8px] bg-accent px-7 text-[16px] font-bold text-white transition-colors duration-200 hover:bg-accent/90 sm:w-auto sm:px-12"
            >
              女性に聞く
            </Link>
          </div>

          <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-faint">
            <li>匿名</li>
            <li aria-hidden>·</li>
            <li>登録なし</li>
            <li aria-hidden>·</li>
            <li>女性3人または5人から回答</li>
            {!BILLING_ENABLED && (
              <>
                <li aria-hidden>·</li>
                <li>ベータ中につき無料</li>
              </>
            )}
          </ul>

          {/* カテゴリから直接入れる。何を聞けるかが、押す前に分かる */}
          <ul className="mt-9 flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c.id !== "other").map((c) => (
              <li key={c.id}>
                <Link
                  href={`/ask?c=${c.id}`}
                  className="inline-flex min-h-[40px] items-center rounded-full border border-hairline px-3.5 text-[13px] text-bodytext transition-colors hover:border-accent hover:text-accent"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Rule />

      {/* ── 2. AIではなく人に聞く理由 ── */}
      <Section id="why">
        <div className="py-20 sm:py-24">
          <h2 className="max-w-[16em] font-display text-[23px] font-bold leading-[1.6] text-charcoal sm:text-[28px] [text-wrap:balance]">
            AIで答えが出る時代に、
            <br />
            あえて人に聞く。
          </h2>
          <div className="mt-8 max-w-[27em] text-[16px] leading-[2.1] text-bodytext">
            <p>
              AIに聞けば、たいていのことはすぐ答えが返ってきます。
              でも「このLINE、実際どう感じる？」で本当に知りたいのは、
              考え出された正解ではありません。
            </p>
            <p className="mt-6">相手に近い、実在する人がどう感じるか、です。</p>
          </div>
          <p className="mt-8 border-l border-accent pl-4 text-[16.5px] font-bold leading-[1.95] text-charcoal">
            AIは予測する。
            <br />
            His Recoveries は、人間の反応を測る。
          </p>
          <p className="mt-7 max-w-[27em] text-[14.5px] leading-[2] text-faint">
            架空の人物をこちらで作って答えさせることはしません。答えるのは実在の人です。
            機械が受け持つのは、質問の整理、個人情報を伏せること、
            条件に合う人を探すこと——聞くまでの手間を下げるところだけです。
          </p>
        </div>
      </Section>

      <Rule />

      {/* ── 3. 誰に聞くか ── */}
      <Section>
        <div className="py-20 sm:py-24">
          <h2 className="font-display text-[23px] font-bold leading-[1.6] text-charcoal sm:text-[28px]">
            誰に聞くかが、価値になる。
          </h2>
          <p className="mt-7 max-w-[27em] text-[16px] leading-[2.05] text-bodytext">
            「誰か女性に聞いた」と「気になっている相手に近い5人に聞いた」は、
            同じ回答数でも、受け取り方がまるで違います。
            年代と、近い条件を選んでから聞けます。
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {["25〜29歳の女性", "マッチングアプリ経験あり", "いまは恋人がいない"].map((t) => (
              <li
                key={t}
                className="inline-flex items-center rounded-full border border-accent bg-accent-tint px-3.5 py-2 text-[13px] text-charcoal"
              >
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[14px] leading-[2] text-faint">
            条件は、回答してくれる人が増えるごとに増やしていきます。
            いま選べるのは、この3つだけです。選べるのに集まらない状態を作らないためです。
          </p>
        </div>
      </Section>

      <Rule />

      {/* ── 4. 相談ではなく、確かめる ── */}
      <Section>
        <div className="py-20 sm:py-24">
          <h2 className="font-display text-[23px] font-bold leading-[1.6] text-charcoal sm:text-[28px]">
            「相談」ではなく、「確かめる」。
          </h2>
          <p className="mt-7 max-w-[27em] text-[16px] leading-[2.05] text-bodytext">
            重い人生相談をする場所ではありません。
            送る前、会う前、選ぶ前に、ひとつ確かめる場所です。
          </p>
          <ul className="mt-8 max-w-[24em] divide-y divide-hairline border-y border-hairline">
            {[
              "LINEを送る前",
              "プロフィール写真を決める前",
              "デートに誘う前",
              "店を決める前",
              "服装を選ぶ前",
            ].map((t) => (
              <li key={t} className="py-3 text-[14.5px] text-bodytext">
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-7 text-[15px] leading-[2] text-charcoal">
            「これでいいかな？」と思った瞬間に使うものです。
          </p>
        </div>
      </Section>

      <Rule />

      {/* ── 5. 3つの手順 ── */}
      <Section>
        <div className="py-20 sm:py-24">
          <ol className="relative ml-1 flex flex-col gap-12 border-l border-hairline pl-7 sm:pl-9">
            {[
              {
                t: "聞く",
                d: "カテゴリを選んで、聞きたいことを書く。30秒ほどで終わります。",
              },
              {
                t: "誰に聞くか選ぶ",
                d: "年代と、近い条件を指定する。3人か5人から選べます。",
              },
              {
                t: "人が答える",
                d: "登録している女性メンバーに匿名で届きます。回答した人どうしも、出すまで他の回答は見えません。",
              },
              {
                t: "結果を見て、自分で決める",
                d: "何人がどう答えたか、一人ひとりが何と書いたかが並びます。送る、変える、待つ、やめる。決めるのはあなたです。",
              },
            ].map((s, i) => (
              <li key={s.t} className="relative">
                <span
                  aria-hidden
                  className={`absolute left-[-32px] top-[10px] block h-[9px] w-[9px] rounded-full sm:left-[-40px] ${
                    i === 0 ? "bg-accent" : "border border-hairline bg-ground"
                  }`}
                />
                <h2 className="font-display text-[20px] font-bold leading-[1.6] text-charcoal sm:text-[22px]">
                  {s.t}
                </h2>
                <p className="mt-3 max-w-[27em] text-[15.5px] leading-[2.05] text-bodytext">
                  {s.d}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Rule />

      {/* ── 3. 結果の見え方（見本）── */}
      <Section>
        <div className="py-20 sm:py-24">
          <h2 className="font-display text-[22px] font-bold leading-[1.6] text-charcoal sm:text-[26px]">
            多数決と、一人ひとりの言葉。
            <br />
            両方が見えます。
          </h2>
          <p className="mt-5 max-w-[27em] text-[15.5px] leading-[2.05] text-bodytext">
            数字だけだと、なぜそう思われたのかが分かりません。
            一人の意見だけだと、それが全体かどうか分かりません。だから両方を並べます。
          </p>

          <div className="mt-8 rounded-[14px] border border-hairline bg-surface p-5">
            <p className="text-[11.5px] font-medium tracking-[0.12em] text-faint">画面の見本</p>
            <p className="mt-3 font-display text-[18px] font-bold text-charcoal">
              女性5人に聞きました
            </p>
            <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
              {[
                ["良い", 4],
                ["微妙", 1],
              ].map(([l, n]) => (
                <li key={String(l)} className="flex items-center gap-4 py-2.5">
                  <span className="w-[5em] shrink-0 text-[14px] text-charcoal">{l}</span>
                  <span
                    aria-hidden
                    className="h-[6px] rounded-full bg-accent"
                    style={{ width: `${(Number(n) / 5) * 60}%`, minWidth: "8px" }}
                  />
                  <span className="text-[13px] tabular-nums text-faint">{n}人</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[14px] leading-[1.9] text-bodytext">
              あなたなら、返信したいと思いますか？
            </p>
            <p className="mt-1.5 text-[16px] font-bold text-charcoal">5人中4人が「はい」</p>

            <p className="mt-6 text-[11.5px] font-medium tracking-[0.12em] text-faint">
              それぞれの回答
            </p>
            <div className="mt-3 flex flex-col gap-3.5">
              <p className="text-[14px] leading-[1.95] text-charcoal">
                <span className="text-faint">20代後半の女性（マッチングアプリ経験あり）</span>
                <br />
                「文章自体は好印象。ただ、次の約束まで一度に入れると少し重く感じます。」
              </p>
              <p className="text-[14px] leading-[1.95] text-charcoal">
                <span className="text-faint">20代後半の女性（いまは恋人がいない）</span>
                <br />
                「前半はいいと思います。最後の2行は無くてもいいかも。」
              </p>
            </div>
            <p className="mt-5 border-t border-hairline pt-4 text-[12px] leading-[1.8] text-faint">
              これは画面の見本です。実際の回答ではありません。
            </p>
          </div>
        </div>
      </Section>

      <Rule />

      {/* ── 4. 扱わないこと ── */}
      <Section>
        <div className="py-20 sm:py-24">
          <h2 className="font-display text-[22px] font-bold leading-[1.6] text-charcoal sm:text-[26px]">
            相手を動かすためのサービスではありません。
          </h2>
          <p className="mt-5 max-w-[27em] text-[15.5px] leading-[2.05] text-bodytext">
            分かるのは「女性が実際にどう感じるか」までです。
            そのとおりにすれば思いどおりになる、という話ではありません。
          </p>

          <ul className="mt-8 max-w-[26em] divide-y divide-hairline border-y border-hairline">
            {[
              "同意のない行為に関する相談は扱いません",
              "特定・晒しにつながる相談は扱いません",
              "18歳未満に関する相談は扱いません",
              "回答者の名前も連絡先も、相談者には渡しません",
              "送る前に、電話番号・ID・住所などは伏せます",
            ].map((t) => (
              <li key={t} className="py-3 text-[14.5px] leading-[1.85] text-bodytext">
                {t}
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-[27em] text-[14.5px] leading-[2] text-faint">
            回答しているのは、こちらが招待した女性メンバーです。
            いまは人数が少ないため、3人と5人だけ受け付けています。
            名前らしいものや画像の中の文字は機械では消せないので、
            画像の受け付けは、安全に扱える形が整うまで止めています。
          </p>
        </div>
      </Section>

      <Rule />

      {/* ── 5. 最後のCTA ── */}
      <Section>
        <div className="py-24 sm:py-28">
          <h2
            className="font-display font-bold leading-[1.45] tracking-[-0.015em] text-charcoal"
            style={{ fontSize: "clamp(28px, 7.6vw, 46px)" }}
          >
            一人で考えるより、
            <br />
            聞いたほうが早い。
          </h2>
          <p className="mt-6 max-w-[24em] text-[16px] leading-[2.05] text-bodytext">
            送る前のLINEでも、選べない写真でも。30秒で聞けます。
          </p>
          <div className="mt-9">
            <Link
              href="/ask"
              className="inline-flex min-h-[56px] w-full items-center justify-center rounded-[8px] bg-accent px-8 text-[16px] font-bold text-white transition-colors duration-200 hover:bg-accent/90 sm:w-auto sm:px-12"
            >
              女性に聞く
            </Link>
          </div>
        </div>
      </Section>

      {/* ── フッター。記事への導線は減らさない ── */}
      <footer className="border-t border-hairline">
        <div className="mx-auto w-full max-w-[680px] px-6 py-16 sm:px-10">
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
                  ["/articles", "記事をさがす"],
                  ["/app", "出会ったあとの記録"],
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
              © 2026 His Recoveries — それ、女性に聞いてみる？
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
