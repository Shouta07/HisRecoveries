import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ConsultLink from "@/components/ConsultLink";
import { site } from "@/lib/site";
import { PLAN } from "@/lib/pricing";
import {
  producer,
  PROFILE,
  METHOD,
  PRINCIPLES,
  FIRST_CALL,
  FIT,
  NOT_FIT,
} from "@/lib/producer";

// 担当者のページ。
//
// 販売実績が0の段階で「この人に任せていいか」を判断してもらうための面。
// 数字がないので、代わりに「どう考えているか」を全部先に見せる。
//
// 禁止：モテる／イケメンになる／別人になる／女性受け。
//   これらは「いまのあなたではダメだ」という前提を含むので、
//   「否定せずに、最大限良く見える方法を一緒に探す」というこの人の
//   立ち位置と両立しない。
//
// 実名・写真・経歴は src/lib/producer.ts。空なら正直に「準備中」と出す。

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

const url = `${site.url}/producer`;

export const metadata: Metadata = {
  title: "第一印象改善プロデューサー — あなたを変えるのではなく、あなたの魅力を引き出す。",
  description:
    "His Recoveries の第一印象改善プロデューサーの考え方とメソッド。髪型・眉・服・表情・姿勢を総合的に見て、いま持っているものが正しく伝わる形に整えます。誰かの真似をさせることはしません。",
  alternates: { canonical: url },
  openGraph: {
    type: "profile",
    url,
    title: "あなたを変えるのではなく、あなたの魅力を引き出す。",
    description:
      "髪型・眉・服・表情・姿勢を総合的に見て、いま持っているものが正しく伝わる形に整える。第一印象改善プロデューサーの考え方。",
  },
};

// 目指す印象を、最初の3語で。派手な成功者感を出さない。
const STANCE = ["否定しません", "別人にしません", "一緒に探します"];

export default function ProducerPage() {
  const hasName = producer.name.length > 0;
  const hasPhoto = producer.photo.length > 0;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "担当者", item: url },
    ],
  };

  return (
    <div className="bg-[#F3F0EA] text-[#1F1E1B]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ══════ 1. ファーストビュー ══════════════════════════
          派手さを出さない。写真は自然なもの、余白を広く取って
          「落ち着いて話を聞いてくれそう」という印象を優先する。 */}
      <section className="relative overflow-hidden bg-[#1E2A38] text-[#F3F0EA]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 95% 75% at 50% 18%, #2A3849 0%, #1E2A38 58%, #161F2A 100%)",
          }}
        />
        <div className="relative max-w-[980px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-14 sm:pb-20">
          <nav aria-label="パンくず" className="text-[12.5px] text-[#8E979E] mb-9">
            <Link href="/" className="hover:text-[#F3F0EA]">
              ホーム
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#F3F0EA]">担当者</span>
          </nav>

          <div className="grid md:grid-cols-[1fr_320px] gap-10 md:gap-12 items-center">
            <div>
              <p className="hr-eyebrow hr-eyebrow-on-dark mb-5">{producer.role}</p>
              {/* 文節ごとに inline-block で包む。global の word-break:keep-all だと
                  「、」だけが次行に落ちるので、区切りを自分で決める。 */}
              <h1
                className="text-[1.75rem] sm:text-[2.6rem] leading-[1.45] text-[#F3F0EA]"
                style={HEAD}
              >
                <span className="inline-block">あなたを変えるのではなく、</span>
                <br />
                <span className="inline-block text-[#C28863]">あなたの魅力を引き出す。</span>
              </h1>
              <p className="mt-6 text-[15px] text-[#C6CAD0] leading-[2] max-w-[34rem]">
                足りないものを足していく作業ではありません。
                すでに持っているものが、いま正しく伝わっていないだけかもしれない——
                そこから始めます。
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {STANCE.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-[#C28863]/35 bg-[#C28863]/10 px-4 py-1.5 text-[13px] font-semibold text-[#F3F0EA]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* 写真枠。未設定でも崩れず、嘘もつかない。 */}
            <div className="order-first md:order-none mx-auto w-[220px] md:w-full max-w-[320px]">
              {hasPhoto ? (
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-[#2A3849]">
                  <Image
                    src={producer.photo}
                    alt={producer.photoAlt || producer.name || producer.role}
                    fill
                    priority
                    sizes="(min-width: 768px) 320px, 220px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="relative aspect-[4/5] rounded-[1.6rem] border border-dashed border-[#C28863]/30 bg-white/[0.04] grid place-items-center px-6 text-center">
                  <div>
                    <span
                      aria-hidden
                      className="mx-auto mb-3 grid place-items-center w-11 h-11 rounded-full border border-[#C28863]/40 text-[#C28863] text-[18px]"
                    >
                      ●
                    </span>
                    <p className="text-[13px] text-[#C6CAD0] leading-[1.9]">
                      担当者の写真は、
                      <br />
                      公開の準備ができ次第
                      <br />
                      掲載します。
                    </p>
                  </div>
                </div>
              )}
              {hasName && (
                <p className="mt-4 text-center md:text-left text-[15.5px] font-bold text-[#F3F0EA]">
                  {producer.name}
                  <span className="ml-2 text-[12px] font-normal text-[#8E979E]">
                    {producer.role}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[980px] mx-auto px-5 sm:px-8">
        {/* ══════ 2. 担当者紹介 ══════════════════════════════
            経歴ではなく「考え方」を4問で。実績0でも書ける唯一の材料。 */}
        <section className="py-14 sm:py-20 hr-readable">
          <p className="hr-eyebrow mb-3.5">担当するのは</p>
          <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={HEAD}>
            {producer.role}が、
            <br className="sm:hidden" />
            考えていること。
          </h2>

          <dl className="mt-9 grid sm:grid-cols-2 gap-4">
            {PROFILE.map((p) => (
              <div
                key={p.q}
                className="rounded-[1.3rem] bg-white border border-[#1F1E1B]/10 px-6 py-6"
              >
                <dt className="flex items-baseline gap-2.5 mb-2.5">
                  <span
                    aria-hidden
                    className="block w-2.5 h-2.5 shrink-0 rounded-full bg-[#97613F] translate-y-[-1px]"
                  />
                  <span className="text-[15.5px] font-bold text-[#1F1E1B]" style={HEAD}>
                    {p.q}
                  </span>
                </dt>
                <dd className="text-[14px] text-[#45443E] leading-[2]">{p.a}</dd>
              </div>
            ))}
          </dl>

          {producer.background.length > 0 && (
            <div className="mt-5 rounded-[1.3rem] bg-[#EDE9E0] px-6 py-6">
              <p className="text-[12.5px] font-bold tracking-[0.08em] text-[#97613F] mb-3">
                経歴
              </p>
              <ul className="space-y-1.5">
                {producer.background.map((b) => (
                  <li key={b} className="text-[14px] text-[#45443E] leading-[1.9]">
                    ・{b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ══════ 3. メソッド ════════════════════════════════
            「足す」ではなく「整理する」。4観点で、何を見ているかを開示する。 */}
        <section className="pb-14 sm:pb-20 hr-readable">
          <p className="hr-eyebrow mb-3.5">見ている4つの観点</p>
          <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={HEAD}>
            魅力は、足すものではなく、
            <br className="sm:hidden" />
            <span className="hr-mark">整理するもの</span>。
          </h2>
          <p className="mt-4 text-[14.5px] text-[#45443E] leading-[2] max-w-[36rem]">
            新しい要素を積み上げるほど、その人らしさは見えにくくなります。
            やることは逆で、いま持っているものを整理して、いちばん伝わる並びに直すこと。
            そのために、次の4つを見ます。
          </p>

          <ol className="mt-9 grid sm:grid-cols-2 gap-4">
            {METHOD.map((m) => (
              <li
                key={m.n}
                className="rounded-[1.3rem] bg-white border border-[#1F1E1B]/10 overflow-hidden"
              >
                <div className="flex items-start gap-4 px-6 pt-6">
                  <span className="hr-figure shrink-0 text-[1.6rem] font-bold text-[#97613F]">
                    {m.n}
                  </span>
                  <div>
                    <p className="text-[16px] font-bold text-[#1F1E1B] leading-[1.5]" style={HEAD}>
                      {m.t}
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-[#97613F]">{m.lead}</p>
                  </div>
                </div>
                <p className="px-6 pb-6 pt-3.5 text-[14px] text-[#45443E] leading-[2]">{m.d}</p>
              </li>
            ))}
          </ol>

          <p className="mt-5 text-[13.5px] text-[#5E6A70] leading-[1.95]">
            ※ 4つ全部に手を入れるとは限りません。あなたの場合どこが効くのかを見極めて、
            必要なところだけを扱います。
          </p>
        </section>
      </div>

      {/* ══════ 4. 顧客へのメッセージ ════════════════════════
          ここだけ大きく、静かに。ページ全体で一番言いたいこと。 */}
      <section className="bg-[#1E2A38] text-[#F3F0EA]">
        <div className="max-w-[820px] mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
          <span aria-hidden className="mx-auto mb-8 block w-10 h-px bg-[#C28863]" />
          <p
            className="text-[1.35rem] sm:text-[1.85rem] leading-[1.85] text-[#F3F0EA]"
            style={{ ...HEAD, fontWeight: 700 }}
          >
            <span className="inline-block">誰かの真似をする必要はありません。</span>
            <br />
            <span className="inline-block">あなたには、</span>
            <span className="inline-block">あなたにしかない魅力があります。</span>
            <br />
            <span className="inline-block">
              <span className="hr-mark-dark">ただ、それが正しく伝わっていないだけ</span>
              かもしれません。
            </span>
          </p>
          <span aria-hidden className="mx-auto mt-8 block w-10 h-px bg-[#C28863]" />
        </div>
      </section>

      <div className="max-w-[980px] mx-auto px-5 sm:px-8">
        {/* ══════ 5. 信頼構築 ════════════════════════════════
            実績の数字がないので、判断の基準・進め方・向き不向きを開示する。
            「何をしてくれるか」より「何をしないか」のほうが効く。 */}
        <section className="py-14 sm:py-20 hr-readable">
          <p className="hr-eyebrow mb-3.5">判断の基準</p>
          <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={HEAD}>
            まだ、お客様の実績はありません。
          </h2>
          <p className="mt-4 text-[14.5px] text-[#45443E] leading-[2] max-w-[36rem]">
            始めたばかりだからです。作った数字を並べることはしません。
            代わりに、
            <span className="font-semibold text-[#1F1E1B]">どういう基準で判断しているか</span>
            を、先に全部お見せします。ここを読んで違うと思われたら、それが正しい判断です。
          </p>

          <ul className="mt-9 space-y-3">
            {PRINCIPLES.map((p, i) => (
              <li
                key={p.t}
                className="flex gap-4 rounded-[1.2rem] bg-white border border-[#1F1E1B]/10 px-6 py-5"
              >
                <span className="hr-figure shrink-0 text-[13px] font-bold text-[#97613F] pt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[15.5px] font-bold text-[#1F1E1B] leading-[1.5]" style={HEAD}>
                    {p.t}
                  </p>
                  <p className="mt-1.5 text-[14px] text-[#45443E] leading-[2]">{p.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 初回相談の流れ */}
        <section className="pb-14 sm:pb-20 hr-readable">
          <p className="hr-eyebrow mb-3.5">初回相談ですること</p>
          <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={HEAD}>
            まず、現在地を整理します。
          </h2>
          <p className="mt-4 text-[14.5px] text-[#45443E] leading-[2] max-w-[36rem]">
            いきなり「これをやりましょう」とは言いません。
            何が起きているのかを一緒に見てからでないと、順番が決められないからです。
            相談は無料で、実名も顔写真も要りません。
          </p>

          <ol className="mt-9 relative border-l-2 border-[#97613F]/30 ml-3.5 space-y-6">
            {FIRST_CALL.map((s) => (
              <li key={s.n} className="relative pl-7">
                <span
                  aria-hidden
                  className="absolute -left-[13px] top-0.5 grid place-items-center w-6 h-6 rounded-full bg-[#97613F] text-white text-[10.5px] font-bold"
                >
                  {s.n}
                </span>
                <p className="text-[15.5px] font-bold text-[#1F1E1B] leading-[1.5]" style={HEAD}>
                  {s.t}
                </p>
                <p className="mt-1 text-[14px] text-[#45443E] leading-[2]">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 向き / 不向き */}
        <section className="pb-14 sm:pb-20 hr-readable">
          <p className="hr-eyebrow mb-3.5">向き・不向き</p>
          <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={HEAD}>
            合う人と、合わない人がいます。
          </h2>

          <div className="mt-9 grid sm:grid-cols-2 gap-4">
            <div className="rounded-[1.3rem] bg-white border-l-[3px] border-l-[#97613F] border-y border-r border-[#1F1E1B]/10 px-6 py-6">
              <p className="text-[13px] font-bold tracking-[0.06em] text-[#97613F] mb-4">
                こういう方に向いています
              </p>
              <ul className="space-y-2.5">
                {FIT.map((x) => (
                  <li key={x} className="flex gap-2.5 text-[14px] text-[#45443E] leading-[1.9]">
                    <span aria-hidden className="text-[#97613F] shrink-0">
                      ✓
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.3rem] bg-[#EAE6DC] border border-[#1F1E1B]/10 px-6 py-6">
              <p className="text-[13px] font-bold tracking-[0.06em] text-[#5E6A70] mb-4">
                こういう場合は、お引き受けしません
              </p>
              <ul className="space-y-2.5">
                {NOT_FIT.map((x) => (
                  <li key={x} className="flex gap-2.5 text-[14px] text-[#5E6A70] leading-[1.9]">
                    <span aria-hidden className="shrink-0">
                      —
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 締め — プランへ */}
        <section className="pb-16 sm:pb-24">
          <div className="rounded-[1.5rem] bg-[#1E2A38] text-[#F3F0EA] px-6 sm:px-10 py-9 sm:py-11">
            <p className="hr-eyebrow hr-eyebrow-on-dark mb-4">このあと</p>
            <p
              className="text-[1.25rem] sm:text-[1.6rem] leading-[1.6] text-[#F3F0EA]"
              style={{ ...HEAD, fontWeight: 700 }}
            >
              合うかどうかは、
              <br className="sm:hidden" />
              話してから決めてください。
            </p>
            <p className="mt-4 text-[14px] text-[#C6CAD0] leading-[2] max-w-[34rem]">
              お取り扱いは{PLAN.name}（{PLAN.days}日）の1本だけです。実施は{PLAN.where}・
              {PLAN.when}。費用は内容によって変わるため、ご相談のうえでお見積りします。
              ご相談は無料で、合わないと思えばその場でそうお伝えします。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ConsultLink className="inline-flex items-center gap-2 rounded-full bg-[#C28863] hover:bg-[#D19C78] text-[#1E2A38] text-[15px] font-bold px-7 py-3.5 transition-colors">
                まず無料で相談する <span aria-hidden>→</span>
              </ConsultLink>
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:border-white/60 text-[#F3F0EA] text-[15px] font-semibold px-6 py-3.5 transition-colors"
              >
                プランの中身を見る
              </Link>
            </div>
          </div>

          <p className="mt-7 text-[13.5px]">
            <Link
              href="/why"
              className="text-[#97613F] underline decoration-[#C28863]/60 underline-offset-4 hover:decoration-[#97613F] transition-colors"
            >
              なぜ、この事業をやるのか
            </Link>
            <span className="mx-2 text-[#DAD6CD]">/</span>
            <Link
              href="/"
              className="text-[#97613F] underline decoration-[#C28863]/60 underline-offset-4 hover:decoration-[#97613F] transition-colors"
            >
              ホームに戻る
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
