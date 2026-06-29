import Link from "next/link";
import GlassNav from "@/components/GlassNav";
import BoomerangVideo from "@/components/BoomerangVideo";
import HowFlow from "@/components/HowFlow";
import PackagesSection from "@/components/PackagesSection";

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

export default function HomePage() {
  return (
    <div className="relative font-sans bg-[#dfe6dc]">
      {/* Persistent ambient boomerang video — fixed behind everything, so it
          keeps playing faintly in the background while you scroll. */}
      <div aria-hidden className="fixed inset-0 z-0 pointer-events-none">
        <BoomerangVideo src="/media/hero/boomerang.mp4" />
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

        {/* Hero copy — vertically centered in the viewport */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-screen px-4 sm:px-6 pt-20 pb-16 on-media">
          <div className="flex items-center gap-3 mb-6 text-[#4b5b47]">
            <span aria-hidden className="block w-8 sm:w-10 h-px bg-[#85AB8B]/70" />
            <span className="text-[11px] sm:text-sm tracking-[0.32em] font-medium" style={{ fontFeatureSettings: '"palt" 1' }}>
              男性のための ウェルネス伴走サービス
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


        {/* Recovery Journey — directly under the hero */}
        <section id="how" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-20 md:pb-28">
            <div className="on-media mb-8 max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span aria-hidden className="block w-8 h-px bg-[#85AB8B]" />
                <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium">
                  Recovery Journey
                </span>
              </div>
              <h2 className="text-[1.9rem] md:text-[2.4rem] leading-[1.3]" style={{ ...HERO_HEAD, fontWeight: 800 }}>
                理解から、<span className="text-[#3d5638]">自信まで。</span>
              </h2>
              <p className="mt-4 text-[#4b5b47] text-[14.5px] leading-[1.95]">
                理解から実践、定着、そしてつながりへ。一本の線ではなく、循環する設計です。
              </p>
            </div>

            <HowFlow />
          </div>
        </section>

        {/* 改善パッケージ */}
        <PackagesSection />

        {/* ===== Footer (simple) ===== */}
        <footer className="relative z-10 border-t border-[#1f2a1d]/10 bg-[#eef1ea]">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <Link href="/" className="logo-type text-xl font-semibold tracking-tight text-[#1f2a1d]">His Recoveries</Link>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#4b5b47]">
              <Link href="/privacy" className="hover:text-[#1f2a1d] transition-colors">プライバシー・免責事項</Link>
            </nav>
            <span className="text-[12px] text-[#6b7a66]">© 2026 His Recoveries</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
