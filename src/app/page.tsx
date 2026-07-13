import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import GlassNav from "@/components/GlassNav";
import BoomerangVideo from "@/components/BoomerangVideo";
import BookingCTA from "@/components/BookingCTA";
import ServiceSection from "@/components/ServiceSection";
import FlowSection from "@/components/FlowSection";
import WhySection from "@/components/WhySection";
import TenToSenSection from "@/components/TenToSenSection";
import PricingSection from "@/components/PricingSection";
import FaqSection from "@/components/FaqSection";

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
      <section className="relative z-10 w-full min-h-screen sm:h-screen overflow-hidden">
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
        <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4 sm:px-6 pt-20 pb-16 on-media">
          <div className="flex items-center gap-3 mb-6 text-[#4b5b47]">
            <span aria-hidden className="block w-8 sm:w-10 h-px bg-[#85AB8B]/70" />
            <span className="text-[11px] sm:text-sm tracking-[0.32em] font-medium" style={{ fontFeatureSettings: '"palt" 1' }}>
              メンズウェルネスの、伴走者
            </span>
            <span aria-hidden className="block w-8 sm:w-10 h-px bg-[#85AB8B]/70" />
          </div>

          {/* ブランドを中心に */}
          <h1 className="logo-type text-[#1f2a1d] text-[3rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6.25rem] leading-[1.05] tracking-[0.01em]">
            His <span className="text-[#3d5638]">Recoveries</span>
          </h1>

          <p
            className="mt-6 sm:mt-8 text-[#2d4228] text-[1.05rem] sm:text-[1.4rem] md:text-[1.6rem] leading-[1.5]"
            style={{ ...HERO_HEAD, fontWeight: 800 }}
          >
            誰にも言えなかった悩みを、<wbr />「<span className="text-[#3d5638]">変われるもの</span>」に。
          </p>

          <p className="mt-5 text-[#4b5b47] text-[12.5px] sm:text-[14px] leading-[1.9] max-w-[30rem]">
            ばらばらに売られてきた悩みを、一本の回復の旅程に。はじまりは、第一印象を整える一日と、血液で現在地を知ることから。相談は、匿名のままで。
          </p>

          <div className="mt-7 sm:mt-8 flex flex-wrap items-center justify-center gap-3">
            <BookingCTA className="rounded-full bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-[14px] font-semibold px-8 py-3.5 transition-colors shadow-[0_18px_40px_-20px_rgba(20,32,26,0.8)]">
              匿名で相談する
            </BookingCTA>
            <Link href="/#service" className="rounded-full border border-[#1f2a1d]/25 hover:border-[#1f2a1d] text-[#1f2a1d] text-[14px] font-semibold px-8 py-3.5 transition-colors bg-white/40 backdrop-blur-sm">
              サービスを見る
            </Link>
          </div>
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


        {/* 点を、線に。＝ 事業の軸（回復の旅程＋ふたつの現在地） */}
        <TenToSenSection />

        {/* サービス内容（第一印象の一日 ＝ 外側の現在地の詳細） */}
        <ServiceSection />

        {/* 当日の流れ */}
        <FlowSection />

        {/* Why — なぜやるのか（共感・思想） */}
        <WhySection />

        {/* 予約（商品ラダー） */}
        <PricingSection />

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
              <Link href="/partners" className="hover:text-[#1f2a1d] transition-colors">現場のプロの方へ</Link>
              <Link href="/privacy" className="hover:text-[#1f2a1d] transition-colors">プライバシー・免責事項</Link>
            </nav>
            <span className="text-[12px] text-[#6b7a66]">© 2026 His Recoveries</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
