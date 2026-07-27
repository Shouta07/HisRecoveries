import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ConsultLink from "@/components/ConsultLink";
import { site } from "@/lib/site";
import { operator } from "@/lib/trust";

// /why — なぜ、やるのか。運営者の原体験（ニキビが何年も治らなかったこと）を起点に、
// 「結果を約束しない代わりに、判断を一人で抱えなくていい状態を約束する」という
// サービスの立脚点を説明する。
//
// ここに書く体験は、運営者本人が実際に語ったことだけを使う（創作しない）。
// 実名・顔は src/lib/trust.ts の operator に入れると自動で表示される。

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Sans', system-ui, sans-serif",
  fontFeatureSettings: '"palt" 1',
  letterSpacing: "-0.01em",
};

export const metadata: Metadata = {
  title: "なぜ、やるのか — 治らない時間を、知っているから",
  description:
    "ニキビが何年も治らなかった。皮膚科に通い、薬を飲み、塗っても。その時間を知っている人間がつくったサービスです。結果は約束しません。約束するのは、判断を一人で抱えなくていい状態です。",
  alternates: { canonical: `${site.url}/why` },
  openGraph: {
    type: "website",
    url: `${site.url}/why`,
    title: "なぜ、やるのか — His Recoveries",
    description: "治らない時間を、知っているから。",
  },
};

export default function WhyPage() {
  const hasOperator = operator.name.length > 0;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "なぜ、やるのか", item: `${site.url}/why` },
    ],
  };

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── ヒーロー（深緑・ブランド） ── */}
      <section className="relative overflow-hidden bg-[#16241A] text-[#EDF1E8]">
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 95% 75% at 50% 18%, #24382b 0%, #16241A 58%, #0f1a12 100%)" }} />
        <div className="relative max-w-[760px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12 sm:pb-16">
          <nav aria-label="パンくず" className="text-[11.5px] text-[#9FB0A0] mb-8">
            <Link href="/" className="hover:text-[#EDF1E8]">ホーム</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#EDF1E8]">なぜ、やるのか</span>
          </nav>
          <div className="font-mono text-[11px] tracking-[0.28em] text-[#85AB8B] mb-4">WHY — なぜ、やるのか</div>
          <h1 className="text-[#EDF1E8] text-[2rem] sm:text-[2.9rem] leading-[1.35] font-[800]" style={HEAD}>
            治らない時間を、<br />
            <span className="text-[#9ec4a3]">知っているから。</span>
          </h1>
        </div>
      </section>

      {/* ── 本文（原体験） ── */}
      <div className="max-w-[680px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="space-y-7 text-[15px] sm:text-[16px] leading-[2.05] text-[#3a423a]">
          <p>
            ニキビが、なかなか治りませんでした。
          </p>
          <p>
            皮膚科に通いました。薬を飲みました。塗り薬も塗りました。
            それでも、すぐには治らなかった。
            <span className="font-semibold text-[#16241A]">何年も、かかりました。</span>
          </p>
          <p>
            若い時期は、ホルモンのバランスもあります。ある程度は、仕方のない面がある。
            ——それが分かるまでにも、時間がかかりました。
          </p>

          <p className="text-[1.15rem] sm:text-[1.3rem] font-[800] text-[#16241A] leading-[1.7] py-2" style={HEAD}>
            いちばん困ったのは、<br />
            治らないこと、そのものではありませんでした。
          </p>

          <p>
            これは効いているのか。この方法でいいのか。続けるべきか、変えるべきか。
            <span className="font-semibold text-[#16241A]">その判断が、ずっと終わらない。</span>
            そして、聞ける相手がいない。友達には言えない。家族には、もっと言えない。
            検索すれば、出てくるのは売り込みばかりでした。
          </p>

          <p>
            だから His Recoveries は、<span className="font-semibold text-[#16241A]">結果を約束しません</span>。
            肌が完璧になることも、短期間で変わることも、約束できません。
            1年で解決するとは限らない、ということも、先にお伝えします。
          </p>

          <p className="text-[1.15rem] sm:text-[1.3rem] font-[800] text-[#16241A] leading-[1.7] py-2" style={HEAD}>
            約束するのは、<br />
            <span className="text-[#3d5638]">判断を、一人で抱えなくていい状態</span>です。
          </p>

          <p>
            それに、肌が完璧でなくても、第一印象は動きます。
            第一印象は、髪・眉・服のサイズ感・姿勢・表情・写真の撮られ方の総合点で、
            肌はそのうちの一つだからです。
            <span className="font-semibold text-[#16241A]">十割ではありません。</span>
            動かせるところから動かして、時間のかかるものは、時間をかけて付き合う。
            その順番を、一緒に決めます。
          </p>

          <p>
            笑いません。急かしません。どこかへ渡して終わりにもしません。
            必要のないことは「やらなくていい」と言います。
            提携先からの紹介料を受け取っていないので、そう言えます。
          </p>
        </div>

        {/* 運営者 — trust.ts に入れると実名・顔が出る */}
        <div className="mt-11 rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 p-6 sm:p-7">
          {hasOperator ? (
            <div className="flex flex-col sm:flex-row gap-5">
              {operator.photo ? (
                <div className="relative w-[92px] h-[92px] shrink-0 rounded-full overflow-hidden bg-[#eef3ea]">
                  <Image src={operator.photo} alt={operator.name} fill className="object-cover" sizes="92px" />
                </div>
              ) : null}
              <div>
                <p className="text-[15.5px] font-bold text-[#1f2a1d]" style={HEAD}>
                  {operator.name}
                  <span className="ml-2 text-[12px] font-normal text-[#6b7a66]">{operator.role}</span>
                </p>
                {operator.background.length > 0 ? (
                  <ul className="mt-3 space-y-1">
                    {operator.background.map((b) => (
                      <li key={b} className="text-[12.5px] text-[#5c6b58] leading-[1.8]">・{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-[12.5px] text-[#5c6b58] leading-[1.95]">
              いまは名前と顔を出していませんが、
              <span className="text-[#1f2a1d] font-semibold">公開の準備をしています</span>。
              大事なことをお任せいただく以上、誰がやっているかは見えているべきだと考えています。
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-[1.6rem] bg-[#16241a] text-[#EDF1E8] p-7 sm:p-9">
          <h2 className="text-[1.25rem] sm:text-[1.55rem] leading-[1.5] mb-2 text-[#EDF1E8] font-[800]" style={HEAD}>
            まず、あなたの<span className="text-[#85AB8B]">「整える順番」</span>を。
          </h2>
          <p className="text-[13px] text-[#C9D2C4] leading-[1.95] mb-6">
            30秒・無料・匿名。迎えたい日を選ぶだけで、その日までにやることの順番をお見せします。
            相談は、そのあとで大丈夫です。
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/#plan" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#EDF1E8] hover:bg-white text-[#16241A] text-[14px] font-bold px-7 py-3.5 transition-colors">
              整える順番を見る <span aria-hidden>→</span>
            </Link>
            <ConsultLink className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 hover:bg-white/10 text-[#EDF1E8] text-[14px] font-semibold px-7 py-3.5 transition-colors">
              無料で相談する <span aria-hidden>→</span>
            </ConsultLink>
          </div>
        </div>

        <p className="mt-6 text-[11.5px] text-[#8a9686] leading-[1.9]">
          ※ His Recoveries は医療行為を行いません。診断・治療方針の決定は医師の領域です。
          ここに書いた経験は運営者本人のものであり、同じ経過をたどることを示すものではありません。
        </p>
      </div>
    </div>
  );
}
