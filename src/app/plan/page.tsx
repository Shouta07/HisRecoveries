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
        <div className="relative max-w-[880px] mx-auto px-5 sm:px-8 pt-14 sm:pt-18 pb-10 sm:pb-12">
          <nav aria-label="パンくず" className="text-[11.5px] text-[#9FB0A0] mb-7">
            <Link href="/" className="hover:text-[#EDF1E8]">ホーム</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#EDF1E8]">あなたのパッケージ</span>
          </nav>
          <div className="font-mono text-[11px] tracking-[0.28em] text-[#85AB8B] mb-4">Your package — 組みました</div>
          <h1 className="text-[#EDF1E8] text-[1.7rem] sm:text-[2.3rem] leading-[1.35]" style={{ ...MINCHO, fontWeight: 800 }}>
            あなたの、<span className="text-[#85AB8B]">整える順番。</span>
          </h1>
          <p className="mt-4 text-[13px] sm:text-[14px] text-[#C9D2C4] leading-[2] max-w-[34rem]">
            入力から自動で組んだ下書きです。このあと無料相談で、あなたの現在地と日程に合わせて設計し直します。
          </p>
        </div>
      </section>

      {/* ── 結果（構成・日程・読みもの） ── */}
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 pt-8 sm:pt-10">
        <div className="rounded-[1.6rem] bg-white border border-[#1f2a1d]/10 shadow-[0_24px_60px_-40px_rgba(20,32,26,0.55)] overflow-hidden">
          <PlanClient articles={planArticles} />
        </div>
      </div>

      {/* ── はじめかた（プランを見た直後に、手順を） ── */}
      <StepsSection />

      <div className="max-w-[880px] mx-auto px-5 sm:px-8 pb-16">
        <p className="text-[11.5px] text-[#6b7a66] leading-[1.9]">
          ※ His Recoveries は医療行為を行いません。医療が必要な場合は、中立の立場で情報を整理し、
          判断はご本人と医療機関に委ねます。特定の医療機関・商品を推奨・斡旋しません。
        </p>
      </div>
    </div>
  );
}
