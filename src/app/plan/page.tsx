import type { Metadata } from "next";
import Link from "next/link";
import PlanClient from "@/components/PlanClient";
import StepsSection from "@/components/StepsSection";
import { clusters } from "@/lib/clusters";
import { site } from "@/lib/site";

// 編成結果のページ。条件は query（lib/planQuery）にだけ載る。
//
// ここに「はじめかたの5ステップ」を置いている。プランを見た直後に
// 「で、どう始めるのか」を出すのが、いちばん効く位置だから。
// LP に置いていた頃は、まだ何も組んでいない人に手順だけ見せていた。
//
// 個人の入力に対する結果なので、検索には載せない（noindex）。

const DIAG_AREAS = ["impression", "hair", "skin", "face", "body-hair", "mind"] as const;
const planArticles: Record<string, { slug: string; title: string }[]> = Object.fromEntries(
  DIAG_AREAS.map((area) => [
    area,
    clusters
      .filter((c) => c.areaId === area && c.kind !== "interview")
      .slice(0, 3)
      .map((c) => ({ slug: c.slug, title: c.title })),
  ]),
);

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export const metadata: Metadata = {
  title: "あなたのパッケージ",
  description: "入力から自動で組んだ、あなた用の構成と日程プラン。",
  robots: { index: false, follow: false },
  alternates: { canonical: `${site.url}/plan` },
};

export default function PlanPage() {
  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      {/* ── 見出し ── */}
      <section className="relative overflow-hidden bg-[#16241A] text-[#EDF1E8]">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 95% 75% at 50% 20%, #24382b 0%, #16241A 58%, #0f1a12 100%)" }}
        />
        <div className="relative max-w-[880px] mx-auto px-5 sm:px-8 pt-16 sm:pt-18 pb-7 sm:pb-9">
          <nav aria-label="パンくず" className="text-[11.5px] text-[#9FB0A0] mb-4">
            <Link href="/" className="hover:text-[#EDF1E8]">ホーム</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#EDF1E8]">あなたのパッケージ</span>
          </nav>
          <h1 className="text-[#EDF1E8] text-[1.4rem] sm:text-[1.9rem] leading-[1.4]" style={{ ...MINCHO, fontWeight: 800 }}>
            あなたの、<span className="text-[#85AB8B]">整える順番。</span>
          </h1>
          <p className="mt-2.5 text-[12.5px] sm:text-[13.5px] text-[#C9D2C4] leading-[1.9] max-w-[34rem]">
            入力から自動で組んだ下書きです。無料相談で、現在地と日程に合わせて設計し直します。
          </p>
        </div>
      </section>

      {/* ── 結果（構成・日程・読みもの） ── */}
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 pt-6 sm:pt-8">
        <div className="rounded-[1.6rem] bg-white border border-[#1f2a1d]/10 shadow-[0_24px_60px_-40px_rgba(20,32,26,0.55)] overflow-hidden">
          <PlanClient articles={planArticles} />
        </div>
      </div>

      {/* ── はじめかた（プランを見た直後に、手順を。ただし畳んで） ── */}
      <StepsSection compact />

      {/* 追従CTA が最下部で内容を隠さないための余白 */}
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 pb-24">
        <p className="text-[11.5px] text-[#6b7a66] leading-[1.9]">
          ※ His Recoveries は医療行為を行いません。医療が必要な場合は、中立の立場で情報を整理し、
          判断はご本人と医療機関に委ねます。特定の医療機関・商品を推奨・斡旋しません。
        </p>
      </div>
    </div>
  );
}
