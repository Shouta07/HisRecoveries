import Link from "next/link";
import GlassNav from "@/components/GlassNav";
import BoomerangVideo from "@/components/BoomerangVideo";
import HowFlow from "@/components/HowFlow";
import PackagesShowcase from "@/components/PackagesShowcase";

const APPLY = "/apply";

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

const INTERVIEWS_MORE = [
  {
    href: "/interviews",
    tag:"ニキビ・肌",
    span: "8ヶ月後",
    title: "歯科衛生士、一日中マスクの下で頬を気にしていた頃のこと",
    who: "20代後半・歯科衛生士 / 勤務中はほぼ終日マスク",
  },
  {
    href: "/interviews",
    tag:"汗・におい",
    span: "半年後",
    title: "ワキガ手術から半年、夏のグレーを選び直せた朝のこと",
    who: "20代後半・夏のグレーを、何年も避けてきた",
  },
];

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
            コンプレックス
            <br />
            からの<span className="text-[#85AB8B]">解放</span>
          </h1>
          <p
            className="mt-7 sm:mt-9 text-[#4b5b47] text-[15px] sm:text-[17px] md:text-lg leading-[2.05] tracking-[0.04em] max-w-lg px-2"
            style={{ fontFeatureSettings: '"palt" 1', fontWeight: 400 }}
          >
            言えない悩みを持つ人同士で。
            <wbr />
            完全招待制の匿名改善プログラム。
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
            すべて匿名・完全守秘義務のもとで。Webアプリで状態を可視化し、オフラインで専属が伴走します。完全招待制・中立。
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap">
            <Link href={APPLY} className="bg-[#3d5638] sm:bg-white hover:bg-[#2d4228] sm:hover:bg-white/90 text-white sm:text-[#1f2a1d] text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-colors shadow-sm">予約登録する</Link>
            <a href="#how" className="text-[#3d5638] sm:text-white text-sm font-semibold sm:font-medium hover:opacity-80 transition-opacity">進め方を見る</a>
          </div>
        </div>

        {/* Bottom-right link */}
        <div className="hidden sm:flex absolute right-6 md:right-10 bottom-8 md:bottom-10 z-10 items-center gap-2 text-white/90 text-sm">
          <a href="/interviews" className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
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


        {/* ===== How (app × 5 steps, merged into one swipeable diagram) ===== */}
        <section id="how" className="relative z-10 text-[#1f2a1d]">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-20 md:pb-28">
            <div className="on-media mb-8">
              <h3 className="text-xl md:text-2xl text-[#1f2a1d] font-normal" style={{ letterSpacing: "-0.02em" }}>改善の進め方 — 5つのステップ</h3>
              <p className="mt-3 text-[#4b5b47] text-sm leading-relaxed">アプリで可視化しながら、隠さず・順番どおりに。</p>
            </div>

            {/* swipeable diagram: phone mock + 5 steps */}
            <HowFlow />

            <div className="on-media mt-10 flex flex-wrap items-center gap-4">
              <Link href={APPLY} className="bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">予約登録する</Link>
              <span className="text-[#4b5b47] text-[13px]">すべて完全匿名・完全守秘義務のもとで運営します。※ 本プログラムは医療行為ではありません。診断・治療は連携する医療機関が行います。</span>
            </div>
          </div>
        </section>

        {/* ===== Experience packages (EC-style parallel grid) ===== */}
        <PackagesShowcase />

        {/* ===== Footer (simple) ===== */}
        <footer className="relative z-10 border-t border-[#1f2a1d]/10 bg-[#eef1ea]">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <Link href="/" className="logo-type text-xl font-semibold tracking-tight text-[#1f2a1d]">His Recoveries</Link>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#4b5b47]">
              <Link href="/mechanism" className="hover:text-[#1f2a1d] transition-colors">メカニズム</Link>
              <Link href="/interviews" className="hover:text-[#1f2a1d] transition-colors">インタビュー</Link>
              <Link href="/packages" className="hover:text-[#1f2a1d] transition-colors">体験パッケージ</Link>
              <Link href="/animals" className="hover:text-[#1f2a1d] transition-colors">動物と過ごす</Link>
              <Link href="/articles" className="hover:text-[#1f2a1d] transition-colors">記事</Link>
              <Link href="/privacy" className="hover:text-[#1f2a1d] transition-colors">プライバシー・免責事項</Link>
            </nav>
            <span className="text-[12px] text-[#6b7a66]">© 2026 His Recoveries</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
