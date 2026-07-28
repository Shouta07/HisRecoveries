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
    <div className="bg-[#F3F0EA] text-[#1F1E1B]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── ヒーロー：事実だけ。読まない人がここで判断できる状態にする ── */}
      <section className="relative overflow-hidden bg-[#1E2A38] text-[#F3F0EA]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 95% 75% at 50% 18%, #2A3849 0%, #1E2A38 58%, #161F2A 100%)",
          }}
        />
        <div className="relative max-w-[880px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-12 sm:pb-16">
          <nav aria-label="パンくず" className="text-[12.5px] text-[#8E979E] mb-8">
            <Link href="/" className="hover:text-[#F3F0EA]">
              ホーム
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#F3F0EA]">個人向けプラン</span>
          </nav>

          <p className="hr-eyebrow hr-eyebrow-on-dark mb-4">個人の方へ</p>
          <h1
            className="text-[1.85rem] sm:text-[2.7rem] leading-[1.35] text-[#F3F0EA]"
            style={HEAD}
          >
            <span className="inline-block">大事な日までに、</span>
            <br />
            <span className="inline-block text-[#C28863]">間に合わせる。</span>
          </h1>
          <p className="mt-5 text-[15px] text-[#C6CAD0] leading-[2] max-w-[34rem]">
            眉・髪型・服・メイク・写真。別々に探す時代から、
            <span className="text-[#F3F0EA] font-semibold">まとめて整える</span>時代へ。
            何をやるかを決めて、1日で整え、手順の動画とサイズ表を持ち帰っていただきます。
          </p>

          <dl className="hr-facts mt-8 w-full max-w-[600px] text-left">
            {FACTS.map((f) => (
              <div key={f.k}>
                <dt className="text-[10.5px] tracking-[0.14em] uppercase text-[#8E979E]">{f.k}</dt>
                <dd className="hr-figure mt-1.5 text-[17px] sm:text-[19px] font-bold text-[#C28863]">
                  {f.v}
                  {f.sub && (
                    <span className="ml-1 text-[11px] font-normal text-[#C6CAD0]">{f.sub}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-full border border-[#C28863]/45 bg-[#C28863]/12 hover:bg-[#C28863]/22 text-[#F3F0EA] text-[15px] font-semibold px-7 py-3.5 transition-colors"
            >
              何をするのかを見る <span aria-hidden className="text-[#C28863]">→</span>
            </a>
            <Link
              href="/#plan"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 hover:border-white/50 text-[#F3F0EA] text-[15px] font-semibold px-6 py-3.5 transition-colors"
            >
              先に、自分のロードマップを作る
            </Link>
          </div>
        </div>
      </section>

      <div className="relative z-10 overflow-hidden bg-[#F3F0EA]">
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

      </div>

      <StickyConsultBar />
    </div>
  );
}
