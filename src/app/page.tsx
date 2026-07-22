import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import GlassNav from "@/components/GlassNav";
import BoomerangVideo from "@/components/BoomerangVideo";
import ValueSection from "@/components/ValueSection";
import StepsSection from "@/components/StepsSection";
import LibraryStrip from "@/components/LibraryStrip";
import FeaturesSection from "@/components/FeaturesSection";
import FaqSection from "@/components/FaqSection";
import StickyConsultBar from "@/components/StickyConsultBar";

// Hero display — an elegant high-contrast mincho serif for a premium,
// editorial feel (the grotesk read too generic / "cheap" at hero scale).
const HERO_HEAD: React.CSSProperties = {
  fontFamily:
    "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', 'YuMincho', serif",
  fontWeight: 800,
  letterSpacing: "0.015em",
  fontFeatureSettings: '"palt" 1',
  WebkitFontSmoothing: "antialiased",
  textRendering: "optimizeLegibility",
};

// 背景: ウェルネス体験コラージュ写真（public/media/hero/wellness-collage.png）を
// 配置するとビルド時に自動で写真背景へ切り替わる。無い間は既存の動画のまま。
const HERO_COLLAGE = "/media/hero/wellness-collage.png";
const hasCollage = existsSync(join(process.cwd(), "public", "media", "hero", "wellness-collage.png"));

export default function HomePage() {
  return (
    <div className="relative font-sans bg-[#dfe6dc]">
      {/* Persistent ambient backdrop — fixed behind everything. */}
      <div aria-hidden className="fixed inset-0 z-0 pointer-events-none">
        {hasCollage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={HERO_COLLAGE}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <BoomerangVideo src="/media/hero/boomerang.mp4" />
        )}
      </div>

      {/* Fixed nav at the root level so it stays above every section. */}
      <GlassNav />

      {/* ============ Hero ============ */}
      <section className="relative z-10 w-full min-h-[72vh] sm:min-h-[80vh] overflow-hidden">
        {/* Bottom scrim — desktop uses a dark scrim under white copy. */}
        <div
          aria-hidden
          className="absolute inset-0 z-[1] pointer-events-none hidden sm:block"
          style={{ background: "linear-gradient(180deg, transparent 48%, rgba(15,26,16,0.55) 100%)" }}
        />
        {/* Mobile uses a light scrim so the dark-green bottom copy stays legible. */}
        <div
          aria-hidden
          className="absolute inset-0 z-[1] pointer-events-none sm:hidden"
          style={{ background: "linear-gradient(180deg, transparent 42%, rgba(245,247,242,0.86) 100%)" }}
        />
        {/* Soft center veil — a faint light glow behind the hero copy so the
            dark-green type lifts off the busy bright image without hiding it. */}
        <div
          aria-hidden
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 78% 58% at 50% 42%, rgba(247,249,244,0.62) 0%, rgba(247,249,244,0.30) 48%, rgba(247,249,244,0) 78%)",
          }}
        />

        {/* Hero copy — vertically centered in the viewport */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[72vh] sm:min-h-[80vh] px-4 sm:px-6 pt-24 pb-10 on-media">
          {/* ブランドを中心に */}
          <h1 className="logo-type text-[#1f2a1d] text-[3rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6.25rem] leading-[1.05] tracking-[0.01em]">
            His <span className="text-[#3d5638]">Recoveries</span>
          </h1>

          <p
            className="mt-6 sm:mt-8 text-[#2d4228] text-[1.05rem] sm:text-[1.4rem] md:text-[1.6rem] leading-[1.5]"
            style={{ ...HERO_HEAD, fontWeight: 800 }}
          >
            もっと、いい男へ。<wbr />もっと、<span className="text-[#3d5638]">自分らしく</span>。
          </p>

          <p className="mt-5 text-[#4b5b47] text-[12.5px] sm:text-[14px] leading-[1.9] max-w-[30rem]">
            男性の健康・美容・活力を整える、ウェルネス・コンシェルジュ。相談は無料・完全守秘、費用も先に。
          </p>
        </div>
      </section>

      {/* ============ Lower sections — frosted glass over the boomerang video ============ */}
      {/* The fixed video shows through a translucent, white-blurred veil so it
          keeps faintly moving behind; content sits on top in dark ink. */}
      <div className="relative z-10 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none backdrop-blur-[2px]"
          aria-hidden="true"
          style={{ background: "linear-gradient(180deg, rgba(245,247,242,0.2) 0%, rgba(240,244,238,0.12) 40%, rgba(238,243,237,0.16) 100%)" }}
        />


        {/* 価値 → できること（体験）を1セクションに統合 */}
        <ValueSection />

        {/* はじめかた — 無料LINE相談から記録まで5ステップ（Oh my teeth 型） */}
        <StepsSection />

        {/* メディア導線 — /areas の記事を横に流す */}
        <LibraryStrip />

        {/* His Recoveries の特徴 — 機能価値を2×2で（Oh my teeth 型） */}
        <FeaturesSection />

        {/* FAQ — 予約直前の不安を潰す */}
        <FaqSection />

        {/* ===== Footer (simple) ===== */}
        <footer className="relative z-10 border-t border-[#1f2a1d]/10 bg-[#eef1ea]">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <Link href="/" className="logo-type text-xl font-semibold tracking-tight text-[#1f2a1d]">His Recoveries</Link>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#4b5b47]">
              <Link href="/manifesto" className="hover:text-[#1f2a1d] transition-colors">思想</Link>
              <Link href="/areas" className="hover:text-[#1f2a1d] transition-colors">Library</Link>
              <Link href="/member" className="hover:text-[#1f2a1d] transition-colors">会員ページ（β）</Link>
              <Link href="/privacy" className="hover:text-[#1f2a1d] transition-colors">プライバシー・免責事項</Link>
            </nav>
            <span className="text-[12px] text-[#6b7a66]">© 2026 His Recoveries</span>
          </div>
          {/* 追従バーが最下部で内容を隠さないための余白 */}
          <div aria-hidden className="h-20" />
        </footer>
      </div>

      {/* スクロール追従の下部固定CTA（Oh my teeth 型） */}
      <StickyConsultBar />
    </div>
  );
}
