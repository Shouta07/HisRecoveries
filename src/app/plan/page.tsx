import type { Metadata } from "next";
import Link from "next/link";
import MomentSection from "@/components/MomentSection";
import PlanPricing from "@/components/PlanPricing";
import ScopeSection from "@/components/ScopeSection";
import TrustSection from "@/components/TrustSection";
import StepsSection from "@/components/StepsSection";
import FaqSection from "@/components/FaqSection";
import StickyConsultBar from "@/components/StickyConsultBar";
import { PLAN } from "@/lib/pricing";
import { site } from "@/lib/site";

// 個人向けサービスの面。
//
// 以前はこの内容がホームだった。メディア化にあたって、ホームは「読む場所」に戻し、
// 売る面はここに集約した。理由は2つ。
//  1. 検索から来る人はほぼ記事に着地する。ホームを営業面にしても読まれない
//  2. 実施キャパが土日・1人で月4〜8人。全力の営業面を張る対象が少なすぎる
// サービスは記事の文脈から辿り着く形にして、ホームは中立の証明に使う。

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.015em",
  fontFeatureSettings: '"palt" 1',
};

const url = `${site.url}/plan`;

export const metadata: Metadata = {
  title: "第一印象改善プラン（30日）— 東京都内・土日・1日の体験",
  description:
    "男性の第一印象を30日で整える個人向けプラン。眉・メンズメイク・服選び・髪型の提案・写真撮影を1日で行い、メイクの手順動画・服のサイズ表・髪型のオーダー資料など6点をお渡しします。東京都内・土日のみ。費用は個別のお見積り、ご相談は無料です。",
  alternates: { canonical: url },
  openGraph: {
    type: "website",
    url,
    title: "第一印象改善プラン（30日）",
    description:
      "眉・メイク・服選び・髪型・撮影を1日で。手順の動画とサイズ表を持ち帰れます。東京都内・土日のみ。",
  },
};

const FACTS = [
  { k: "期間", v: `${PLAN.days}日`, sub: "" },
  { k: "実施", v: PLAN.where, sub: PLAN.when },
  { k: "所要", v: PLAN.duration, sub: "体験" },
  { k: "費用", v: "個別見積", sub: "" },
];

export default function PlanPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: site.url },
      { "@type": "ListItem", position: 2, name: "個人向けプラン", item: url },
    ],
  };

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── ヒーロー：事実だけ。読まない人がここで判断できる状態にする ── */}
      <section className="relative overflow-hidden bg-[#16241A] text-[#EDF1E8]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 95% 75% at 50% 18%, #24382b 0%, #16241A 58%, #0f1a12 100%)",
          }}
        />
        <div className="relative max-w-[880px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12 sm:pb-16">
          <nav aria-label="パンくず" className="text-[12.5px] text-[#9FB0A0] mb-8">
            <Link href="/" className="hover:text-[#EDF1E8]">
              ホーム
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#EDF1E8]">個人向けプラン</span>
          </nav>

          <p className="hr-eyebrow hr-eyebrow-on-dark mb-4">For individuals — 個人の方へ</p>
          <h1
            className="text-[1.85rem] sm:text-[2.7rem] leading-[1.35] text-[#EDF1E8]"
            style={HEAD}
          >
            <span className="inline-block">大事な日までに、</span>
            <br />
            <span className="inline-block text-[#9ec4a3]">間に合わせる。</span>
          </h1>
          <p className="mt-5 text-[15px] text-[#C9D2C4] leading-[2] max-w-[34rem]">
            眉・髪型・服・メイク・写真。別々に探す時代から、
            <span className="text-[#EDF1E8] font-semibold">まとめて整える</span>時代へ。
            何をやるかを決めて、1日で整え、手順の動画とサイズ表を持ち帰っていただきます。
          </p>

          <dl className="hr-facts mt-8 w-full max-w-[600px] text-left">
            {FACTS.map((f) => (
              <div key={f.k}>
                <dt className="text-[10.5px] tracking-[0.14em] uppercase text-[#9FB0A0]">{f.k}</dt>
                <dd className="hr-figure mt-1.5 text-[17px] sm:text-[19px] font-bold text-[#E0B75F]">
                  {f.v}
                  {f.sub && (
                    <span className="ml-1 text-[11px] font-normal text-[#C9D2C4]">{f.sub}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full border border-[#E0B75F]/45 bg-[#E0B75F]/12 hover:bg-[#E0B75F]/22 text-[#EDF1E8] text-[15px] font-semibold px-7 py-3.5 transition-colors"
            >
              何をするのかを見る <span aria-hidden className="text-[#E0B75F]">→</span>
            </a>
            <Link
              href="/#plan"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 hover:border-white/50 text-[#EDF1E8] text-[15px] font-semibold px-6 py-3.5 transition-colors"
            >
              先に、自分のロードマップを作る
            </Link>
          </div>
        </div>
      </section>

      <div className="relative z-10 overflow-hidden bg-[#f4f6f2]">
        {/* これは自分の話だ */}
        <MomentSection />
        {/* 何を、いくらで */}
        <PlanPricing />
        {/* できないこと */}
        <ScopeSection />
        {/* 誰がやるのか */}
        <TrustSection />
        {/* どう始めるか */}
        <StepsSection />
        {/* 残る疑問 */}
        <FaqSection />

        <div className="max-w-[880px] mx-auto px-5 sm:px-8 pb-20 pt-4">
          <div className="rounded-[1.3rem] border border-[#1f2a1d]/10 bg-white px-6 py-6">
            <p className="text-[12.5px] font-bold tracking-[0.08em] text-[#7E5B29] mb-1.5">
              法人・団体の方へ
            </p>
            <p className="text-[15px] font-bold text-[#1f2a1d] leading-[1.6] mb-2">
              新卒研修・営業職研修・会員向け講座としても実施します。
            </p>
            <p className="text-[14px] text-[#5c6b58] leading-[1.9]">
              個人向けは土日・1名ずつのため枠が限られます。まとまった人数の場合は、
              集合形式のほうが早く、1人あたりの費用も下がります。
              <Link
                href="/business"
                className="ml-1 text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-4"
              >
                法人向けのご案内
              </Link>
            </p>
          </div>
        </div>
      </div>

      <StickyConsultBar />
    </div>
  );
}
