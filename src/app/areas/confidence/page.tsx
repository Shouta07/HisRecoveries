import type { Metadata } from "next";
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";
import { site } from "@/lib/site";

// 「自信・パートナーシップ」— 言葉にしにくい悩み（自信・関係・性のこと）を、
// 抽象度を保ったまま「回復の一部」として匿名で扱う、静かなランディング。
// ガードレール: 具体的な症状名・施術名は出さない。ここまでの抽象度で止める。
// 静的ルートのため /areas/[id] の「なぜ起きるのか」テンプレートには乗らない。
const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 700,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

export const metadata: Metadata = {
  title: "自信・パートナーシップ — 言葉にしにくい悩みも、回復の一部として",
  description:
    "見た目を整える理由の奥に、たいてい「誰かの前でどうありたいか」がある。自信、関係、性のこと。それも回復の一部として、守秘のもとで扱います。茶化さず、急かさず。",
  alternates: { canonical: `${site.url}/areas/confidence` },
  openGraph: {
    type: "article",
    url: `${site.url}/areas/confidence`,
    title: "自信・パートナーシップ | His Recoveries",
    description: "言葉にしにくい悩みも、回復の一部として、守秘のもとで。茶化さず、急かさず。",
  },
};

export default function ConfidencePage() {
  return (
    <div className="bg-[#2E4A66] text-[#F1F3F3] min-h-screen">
      <div className="mx-auto max-w-[720px] px-6 sm:px-10 pt-20 sm:pt-28 pb-24">
        <nav aria-label="パンくず" className="text-[13.5px] text-[#8FA6B4] mb-10">
          <Link href="/" className="hover:text-[#F1F3F3]">ホーム</Link>
          <span className="mx-1.5">/</span>
          <Link href="/#index" className="hover:text-[#F1F3F3]">記事</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[#F1F3F3]">自信・パートナーシップ</span>
        </nav>

        <div className="font-mono text-[12px] tracking-[0.22em] uppercase text-[#70B0B0] mb-5">Confidence &amp; Partnership</div>
        <h1 className="text-[#F1F3F3] text-[1.9rem] sm:text-[2.5rem] leading-[1.4]" style={HEAD}>
          自信・パートナーシップ
        </h1>

        <div className="mt-8 space-y-5 text-[15px] sm:text-[16px] text-[#C3D3D6] leading-[2.1] max-w-[34rem]">
          <p>見た目を整える理由の奥に、たいてい「誰かの前でどうありたいか」がある。</p>
          <p>言葉にしにくい悩み——自信、関係、性のこと。</p>
          <p>
            ここでは、それも<span className="text-[#F1F3F3] font-normal">回復の一部</span>として、守秘のもとで扱います。
            <br className="hidden sm:block" />
            茶化さず、急かさず。
          </p>
          <p className="text-[#F1F3F3] font-normal">相談は、守秘のもとで。</p>
        </div>

        <div className="mt-10">
          <ConsultLink className="inline-flex items-center gap-2 rounded-full bg-[#F1F3F3] hover:bg-white text-[#2E4A66] text-[15px] font-bold px-7 py-3.5 transition-colors">
            無料で相談する <span aria-hidden>→</span>
          </ConsultLink>
        </div>

        <p className="mt-12 text-[12.5px] text-[#6f7d6c] leading-[1.9]">
          ※ His Recoveries は医療行為を行いません。診断・治療は連携する医療機関が行います。
          特定の医療機関・商品を推奨・斡旋しません。ご相談は完全守秘義務のもとで。
        </p>

        <div className="mt-8">
          <Link href="/#index" className="text-[14.5px] text-[#70B0B0] font-bold hover:text-[#F1F3F3] transition-colors">
            ← Library に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
