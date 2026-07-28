import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ConsultLink from "@/components/ConsultLink";
import { site } from "@/lib/site";
import { PLAN, TIERS, yen } from "@/lib/pricing";
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
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ══════ 1. ファーストビュー ══════════════════════════
          派手さを出さない。写真は自然なもの、余白を広く取って
          「落ち着いて話を聞いてくれそう」という印象を優先する。 */}
      <section className="relative overflow-hidden bg-[#16241A] text-[#EDF1E8]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 95% 75% at 50% 18%, #24382b 0%, #16241A 58%, #0f1a12 100%)",
          }}
        />
        <div className="relative max-w-[980px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-14 sm:pb-20">
          <nav aria-label="パンくず" className="text-[12.5px] text-[#9FB0A0] mb-9">
            <Link href="/" className="hover:text-[#EDF1E8]">
              ホーム
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#EDF1E8]">担当者</span>
          </nav>

          <div className="grid md:grid-cols-[1fr_320px] gap-10 md:gap-12 items-center">
            <div>
              <p className="hr-eyebrow hr-eyebrow-on-dark mb-5">{producer.role}</p>
              {/* 文節ごとに inline-block で包む。global の word-break:keep-all だと
                  「、」だけが次行に落ちるので、区切りを自分で決める。 */}
              <h1
                className="text-[1.75rem] sm:text-[2.6rem] leading-[1.45] text-[#EDF1E8]"
                style={HEAD}
              >
                <span className="inline-block">あなたを変えるのではなく、</span>
                <br />
                <span className="inline-block text-[#E0B75F]">あなたの魅力を引き出す。</span>
              </h1>
              <p className="mt-6 text-[15px] text-[#C9D2C4] leading-[2] max-w-[34rem]">
                足りないものを足していく作業ではありません。
                すでに持っているものが、いま正しく伝わっていないだけかもしれない——
                そこから始めます。
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {STANCE.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-[#E0B75F]/35 bg-[#E0B75F]/10 px-4 py-1.5 text-[13px] font-semibold text-[#EDF1E8]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* 写真枠。未設定でも崩れず、嘘もつかない。 */}
            <div className="order-first md:order-none mx-auto w-[220px] md:w-full max-w-[320px]">
              {hasPhoto ? (
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] bg-[#24382b]">
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
                <div className="relative aspect-[4/5] rounded-[1.6rem] border border-dashed border-[#E0B75F]/30 bg-white/[0.04] grid place-items-center px-6 text-center">
                  <div>
                    <span
                      aria-hidden
                      className="mx-auto mb-3 grid place-items-center w-11 h-11 rounded-full border border-[#E0B75F]/40 text-[#E0B75F] text-[18px]"
                    >
                      ●
                    </span>
                    <p className="text-[13px] text-[#C9D2C4] leading-[1.9]">
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
                <p className="mt-4 text-center md:text-left text-[15.5px] font-bold text-[#EDF1E8]">
                  {producer.name}
                  <span className="ml-2 text-[12px] font-normal text-[#9FB0A0]">
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
          <p className="hr-eyebrow mb-3.5">Who — 担当するのは</p>
          <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={HEAD}>
            {producer.role}が、
            <br className="sm:hidden" />
            考えていること。
          </h2>

          <dl className="mt-9 grid sm:grid-cols-2 gap-4">
            {PROFILE.map((p) => (
              <div
                key={p.q}
                className="rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 px-6 py-6"
              >
                <dt className="flex items-baseline gap-2.5 mb-2.5">
                  <span
                    aria-hidden
                    className="block w-2.5 h-2.5 shrink-0 rounded-full bg-[#B98A3C] translate-y-[-1px]"
                  />
                  <span className="text-[15.5px] font-bold text-[#1f2a1d]" style={HEAD}>
                    {p.q}
                  </span>
                </dt>
                <dd className="text-[14px] text-[#4b5b47] leading-[2]">{p.a}</dd>
              </div>
            ))}
          </dl>

          {producer.background.length > 0 && (
            <div className="mt-5 rounded-[1.3rem] bg-[#eef3ea] px-6 py-6">
              <p className="text-[12.5px] font-bold tracking-[0.08em] text-[#7E5B29] mb-3">
                経歴
              </p>
              <ul className="space-y-1.5">
                {producer.background.map((b) => (
                  <li key={b} className="text-[14px] text-[#4b5b47] leading-[1.9]">
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
          <p className="hr-eyebrow mb-3.5">Method — 見ている4つの観点</p>
          <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={HEAD}>
            魅力は、足すものではなく、
            <br className="sm:hidden" />
            <span className="hr-mark">整理するもの</span>。
          </h2>
          <p className="mt-4 text-[14.5px] text-[#4b5b47] leading-[2] max-w-[36rem]">
            新しい要素を積み上げるほど、その人らしさは見えにくくなります。
            やることは逆で、いま持っているものを整理して、いちばん伝わる並びに直すこと。
            そのために、次の4つを見ます。
          </p>

          <ol className="mt-9 grid sm:grid-cols-2 gap-4">
            {METHOD.map((m) => (
              <li
                key={m.n}
                className="rounded-[1.3rem] bg-white border border-[#1f2a1d]/10 overflow-hidden"
              >
                <div className="flex items-start gap-4 px-6 pt-6">
                  <span className="hr-figure shrink-0 text-[1.6rem] font-bold text-[#B98A3C]">
                    {m.n}
                  </span>
                  <div>
                    <p className="text-[16px] font-bold text-[#1f2a1d] leading-[1.5]" style={HEAD}>
                      {m.t}
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-[#7E5B29]">{m.lead}</p>
                  </div>
                </div>
                <p className="px-6 pb-6 pt-3.5 text-[14px] text-[#4b5b47] leading-[2]">{m.d}</p>
              </li>
            ))}
          </ol>

          <p className="mt-5 text-[13.5px] text-[#6b7a66] leading-[1.95]">
            ※ 4つ全部に手を入れるとは限りません。あなたの場合どこが効くのかを見極めて、
            必要なところだけを扱います。
          </p>
        </section>
      </div>

      {/* ══════ 4. 顧客へのメッセージ ════════════════════════
          ここだけ大きく、静かに。ページ全体で一番言いたいこと。 */}
      <section className="bg-[#16241A] text-[#EDF1E8]">
        <div className="max-w-[820px] mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
          <span aria-hidden className="mx-auto mb-8 block w-10 h-px bg-[#E0B75F]" />
          <p
            className="text-[1.35rem] sm:text-[1.85rem] leading-[1.85] text-[#EDF1E8]"
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
          <span aria-hidden className="mx-auto mt-8 block w-10 h-px bg-[#E0B75F]" />
        </div>
      </section>

      <div className="max-w-[980px] mx-auto px-5 sm:px-8">
        {/* ══════ 5. 信頼構築 ════════════════════════════════
            実績の数字がないので、判断の基準・進め方・向き不向きを開示する。
            「何をしてくれるか」より「何をしないか」のほうが効く。 */}
        <section className="py-14 sm:py-20 hr-readable">
          <p className="hr-eyebrow mb-3.5">Principles — 判断の基準</p>
          <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={HEAD}>
            まだ、お客様の実績はありません。
          </h2>
          <p className="mt-4 text-[14.5px] text-[#4b5b47] leading-[2] max-w-[36rem]">
            始めたばかりだからです。作った数字を並べることはしません。
            代わりに、
            <span className="font-semibold text-[#1f2a1d]">どういう基準で判断しているか</span>
            を、先に全部お見せします。ここを読んで違うと思われたら、それが正しい判断です。
          </p>

          <ul className="mt-9 space-y-3">
            {PRINCIPLES.map((p, i) => (
              <li
                key={p.t}
                className="flex gap-4 rounded-[1.2rem] bg-white border border-[#1f2a1d]/10 px-6 py-5"
              >
                <span className="hr-figure shrink-0 text-[13px] font-bold text-[#B98A3C] pt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[15.5px] font-bold text-[#1f2a1d] leading-[1.5]" style={HEAD}>
                    {p.t}
                  </p>
                  <p className="mt-1.5 text-[14px] text-[#4b5b47] leading-[2]">{p.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 初回相談の流れ */}
        <section className="pb-14 sm:pb-20 hr-readable">
          <p className="hr-eyebrow mb-3.5">First call — 初回相談ですること</p>
          <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={HEAD}>
            まず、現在地を整理します。
          </h2>
          <p className="mt-4 text-[14.5px] text-[#4b5b47] leading-[2] max-w-[36rem]">
            いきなり「これをやりましょう」とは言いません。
            何が起きているのかを一緒に見てからでないと、順番が決められないからです。
            相談は無料で、実名も顔写真も要りません。
          </p>

          <ol className="mt-9 relative border-l-2 border-[#B98A3C]/30 ml-3.5 space-y-6">
            {FIRST_CALL.map((s) => (
              <li key={s.n} className="relative pl-7">
                <span
                  aria-hidden
                  className="absolute -left-[13px] top-0.5 grid place-items-center w-6 h-6 rounded-full bg-[#B98A3C] text-white text-[10.5px] font-bold"
                >
                  {s.n}
                </span>
                <p className="text-[15.5px] font-bold text-[#1f2a1d] leading-[1.5]" style={HEAD}>
                  {s.t}
                </p>
                <p className="mt-1 text-[14px] text-[#4b5b47] leading-[2]">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 向き / 不向き */}
        <section className="pb-14 sm:pb-20 hr-readable">
          <p className="hr-eyebrow mb-3.5">Fit — 向き・不向き</p>
          <h2 className="text-[1.45rem] sm:text-[2rem] leading-[1.4]" style={HEAD}>
            合う人と、合わない人がいます。
          </h2>

          <div className="mt-9 grid sm:grid-cols-2 gap-4">
            <div className="rounded-[1.3rem] bg-white border-l-[3px] border-l-[#B98A3C] border-y border-r border-[#1f2a1d]/10 px-6 py-6">
              <p className="text-[13px] font-bold tracking-[0.06em] text-[#7E5B29] mb-4">
                こういう方に向いています
              </p>
              <ul className="space-y-2.5">
                {FIT.map((x) => (
                  <li key={x} className="flex gap-2.5 text-[14px] text-[#3a453a] leading-[1.9]">
                    <span aria-hidden className="text-[#B98A3C] shrink-0">
                      ✓
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.3rem] bg-[#eef1ea] border border-[#1f2a1d]/10 px-6 py-6">
              <p className="text-[13px] font-bold tracking-[0.06em] text-[#6b7a66] mb-4">
                こういう場合は、お引き受けしません
              </p>
              <ul className="space-y-2.5">
                {NOT_FIT.map((x) => (
                  <li key={x} className="flex gap-2.5 text-[14px] text-[#6b7a66] leading-[1.9]">
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
          <div className="rounded-[1.5rem] bg-[#16241A] text-[#EDF1E8] px-6 sm:px-10 py-9 sm:py-11">
            <p className="hr-eyebrow hr-eyebrow-on-dark mb-4">Next</p>
            <p
              className="text-[1.25rem] sm:text-[1.6rem] leading-[1.6] text-[#EDF1E8]"
              style={{ ...HEAD, fontWeight: 700 }}
            >
              合うかどうかは、
              <br className="sm:hidden" />
              話してから決めてください。
            </p>
            <p className="mt-4 text-[14px] text-[#C9D2C4] leading-[2] max-w-[34rem]">
              お取り扱いは{PLAN.name}（{PLAN.days}日）の1本だけです。
              {yen(TIERS.founder.amount)}（税込・{TIERS.founder.label}）、実施は{PLAN.where}・
              {PLAN.when}。
              ご相談は無料で、合わないと思えばその場でそうお伝えします。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ConsultLink className="inline-flex items-center gap-2 rounded-full bg-[#E0B75F] hover:bg-[#EBC97E] text-[#16241A] text-[15px] font-bold px-7 py-3.5 transition-colors">
                まず無料で相談する <span aria-hidden>→</span>
              </ConsultLink>
              <Link
                href="/plan"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:border-white/60 text-[#EDF1E8] text-[15px] font-semibold px-6 py-3.5 transition-colors"
              >
                プランの中身を見る
              </Link>
            </div>
          </div>

          <p className="mt-7 text-[13.5px]">
            <Link
              href="/why"
              className="text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-4 hover:decoration-[#3d5638] transition-colors"
            >
              なぜ、この事業をやるのか
            </Link>
            <span className="mx-2 text-[#c9d3c4]">/</span>
            <Link
              href="/"
              className="text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-4 hover:decoration-[#3d5638] transition-colors"
            >
              ホームに戻る
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
