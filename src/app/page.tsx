import Link from "next/link";
import GlassNav from "@/components/GlassNav";
import BoomerangVideo from "@/components/BoomerangVideo";
import HowFlow from "@/components/HowFlow";
import BookingCTA from "@/components/BookingCTA";
import PackagesSection from "@/components/PackagesSection";
import MechanismSection from "@/components/MechanismSection";
import InterviewsSection from "@/components/InterviewsSection";

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

        {/* Hero copy */}
        <div className="relative z-10 flex flex-col items-center text-center pt-24 sm:pt-28 md:pt-32 px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-5 text-[#4b5b47]">
            <span aria-hidden className="block w-8 sm:w-10 h-px bg-[#85AB8B]/70" />
            <span className="text-xs sm:text-sm tracking-[0.4em] font-medium" style={{ fontFeatureSettings: '"palt" 1' }}>
              男性のための
            </span>
            <span aria-hidden className="block w-8 sm:w-10 h-px bg-[#85AB8B]/70" />
          </div>
          <h1
            className="text-[#336443] text-[2.75rem] sm:text-[4rem] md:text-[5rem] lg:text-[5.75rem] xl:text-[6.5rem] max-w-5xl"
            style={{ ...HERO_HEAD, lineHeight: 1.2 }}
          >
            コンプレックスから、
            <br />
            <span className="text-[#85AB8B]">自信</span>へ。
          </h1>
          <p
            className="mt-7 sm:mt-9 text-[#4b5b47] text-[15px] sm:text-[17px] md:text-lg leading-[2.05] tracking-[0.04em] max-w-lg px-2"
            style={{ fontFeatureSettings: '"palt" 1', fontWeight: 400 }}
          >
            その変化を、デザインする。
            <wbr />
            完全招待制・完全匿名の、改善プログラム。
          </p>
        </div>

        {/* Bottom-left CTA block — on mobile the on-media halo + light scrim
            keep the dark-green copy legible over the bright video. */}
        <div className="absolute left-4 right-4 sm:right-auto sm:left-6 md:left-10 bottom-6 sm:bottom-8 md:bottom-10 z-10 sm:max-w-sm on-media sm:[text-shadow:none] text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-[#2d4228] sm:text-white/95 mb-3">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" /><path d="M19 3v4" /><path d="M21 5h-4" /></svg>
            <span className="text-sm font-semibold sm:font-medium">完全匿名 ・ 完全守秘義務のもと</span>
          </div>
          <p className="text-[#2d4228] sm:text-white/85 text-xs leading-relaxed mb-6 max-w-xs mx-auto sm:mx-0 font-semibold sm:font-normal">
            「なぜ起きるのか」を理解し、「どう変われるのか」を知り、自分に合った改善を選ぶ。His Recoveries は、理解から定着まで伴走する改善サービスです。
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
            <a href="#mechanism" className="border border-[#3d5638]/60 sm:border-white/70 text-[#2d4228] sm:text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#3d5638]/10 sm:hover:bg-white/15 transition-colors">変化の仕組みを見る</a>
            <BookingCTA className="bg-[#3d5638] sm:bg-white hover:bg-[#2d4228] sm:hover:bg-white/90 text-white sm:text-[#1f2a1d] text-sm font-semibold px-6 py-3 rounded-full transition-colors shadow-sm">予約登録する</BookingCTA>
          </div>
        </div>

        {/* Bottom-right link */}
        <div className="hidden sm:flex absolute right-6 md:right-10 bottom-8 md:bottom-10 z-10 items-center gap-2 text-white/90 text-sm">
          <a href="/#mechanism" className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
            <svg className="w-3 h-3 ml-0.5 fill-white text-white" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          </a>
          <span className="font-medium">メカニズム特集</span>
          <span className="text-white/60">インタビュー</span>
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


        {/* ② 理解する — なぜ変われるのか（メカニズム → 記事） */}
        <MechanismSection />

        {/* ③ 希望を持つ — どう変わったのか（インタビュー） */}
        <InterviewsSection />

        {/* ④ 安心への入口 — His Recoveries とは */}
        <section className="relative z-10 text-[#1f2a1d]">
          <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-16 md:py-24 text-center on-media">
            <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#3d5638] font-medium mb-5">
              His Recoveries
            </div>
            <h2 className="text-[1.7rem] md:text-[2.3rem] leading-[1.5] text-[#1f2a1d]" style={{ ...HERO_HEAD, fontWeight: 800 }}>
              私たちは、<span className="text-[#3d5638]">治療を売る会社ではありません。</span>
            </h2>
            <p className="mt-6 text-[#4b5b47] text-[15px] leading-[2] max-w-xl mx-auto">
              コンプレックスは、施術だけでは終わりません。
              理解し、実践し、定着するまで。専属が、ずっと伴走します。
            </p>
            <div className="mt-8 flex items-center justify-center gap-3 text-[13px] font-semibold text-[#3d5638]">
              <span>理解</span>
              <span aria-hidden className="text-[#85AB8B]">→</span>
              <span>実践</span>
              <span aria-hidden className="text-[#85AB8B]">→</span>
              <span>定着</span>
            </div>
          </div>
        </section>

        {/* ⑤⑥ Recovery Journey — 5 steps with the app woven in */}
        <section id="how" className="relative z-10 scroll-mt-24 text-[#1f2a1d]">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-6 pb-20 md:pb-28">
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
                原因の特定から、実践、定着まで。コンプレックスから自信へ、一本の流れで設計します。
              </p>
            </div>

            <HowFlow />
          </div>
        </section>

        {/* ⑦ 改善パッケージ */}
        <PackagesSection />

        {/* ⑧ 予約 CTA */}
        <section className="relative z-10">
          <div className="max-w-[920px] mx-auto px-5 sm:px-8 pb-16 md:pb-24">
            <div className="rounded-[2rem] bg-[#16241a] text-[#EDF1E8] p-9 md:p-14 text-center">
              <h2 className="text-[1.5rem] md:text-[2rem] leading-[1.55] text-[#EDF1E8]" style={{ ...HERO_HEAD, fontWeight: 800 }}>
                一人で悩み続けるより、
                <br className="hidden sm:block" />
                まずは現在地を整理しませんか。
              </h2>
              <div className="mt-6 flex items-center justify-center gap-3 text-[12.5px] text-[#85AB8B] font-medium">
                <span>完全匿名</span>
                <span className="text-white/25">・</span>
                <span>完全守秘義務</span>
                <span className="text-white/25">・</span>
                <span>中立</span>
              </div>
              <div className="mt-8">
                <BookingCTA className="bg-[#EDF1E8] hover:bg-white text-[#16241a] text-sm font-semibold px-8 py-4 rounded-full transition-colors">
                  予約登録する
                </BookingCTA>
              </div>
            </div>
          </div>
        </section>

        {/* ⑨ 医療連携・サロン・専門家・免責 */}
        <section className="relative z-10 on-media">
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pb-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                { t: "医療連携", d: "必要な段階は、紹介手数料ゼロで連携医療機関へ中立につなぎます。" },
                { t: "提携サロン・専門家", d: "日々の見え方は、提携先と役割を分けて伴走します。" },
                { t: "中立・匿名", d: "売らない・断定しない・完全守秘義務のもとで運営します。" },
              ].map((x) => (
                <div key={x.t} className="rounded-[1.2rem] bg-white/85 border border-[#1f2a1d]/10 p-5">
                  <div className="text-[13px] font-bold text-[#1f2a1d] mb-1.5">{x.t}</div>
                  <p className="text-[12px] text-[#4b5b47] leading-[1.8]">{x.d}</p>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[#6b7a66] leading-[1.9]">
              ※ 本プログラムは医療行為ではありません。診断・治療は連携する医療機関が行います。
              特定の医療機関・商品を推奨・斡旋せず、紹介手数料は受け取りません（中立）。
            </p>
          </div>
        </section>

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
