import Link from "next/link";
import Image from "next/image";
import GlassNav from "@/components/GlassNav";
import StepsSection from "@/components/StepsSection";
import ExperiencesSection from "@/components/ExperiencesSection";
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

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

// 男性の内なる声（ヒーロー上部を静かに流れる・共感の代弁）。2本＝左流れ／右流れ。
const VOICES_A = [
  "清潔感がない、って言われた",
  "鏡の自分に、自信がない",
  "何から始めればいいか、分からない",
  "調べるほど、分からなくなる",
  "写真の自分が、嫌いだ",
];
const VOICES_B = [
  "誰にも、相談できずにいる",
  "このままじゃ、まずい気がする",
  "ぼったくられるのが、怖い",
  "老けたね、って言われたくない",
  "変わりたい、とは思ってる",
];

// ヒーロー直下の推し3カラム（Oh my teeth の 通院不要/短期間/リーズナブル に相当）。
// ポジティブな機能ラベルで、見出し「最短距離」を支える3本柱。
const BURDENS = [
  { k: "まとめて", t: "ひとつの窓口。", d: "髪・肌・体・心を、まとめて相談。" },
  { k: "完全守秘", t: "知られない。", d: "実名不要・相互NDAで。" },
  { k: "明朗会計", t: "売り込まれない。", d: "売らない・中立。費用は先に。" },
];

export default function HomePage() {
  return (
    <div className="relative font-sans bg-[#f4f6f2]">
      {/* Fixed nav at the root level so it stays above every section. */}
      <GlassNav />

      {/* ============ Hero — His Recoveries を象徴する深緑のカラーデザイン ============ */}
      <section className="relative z-10 w-full min-h-[72vh] sm:min-h-[80vh] overflow-hidden bg-[#16241A]">
        {/* deep green with a soft sage glow */}
        <div
          aria-hidden
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 95% 72% at 50% 24%, #24382b 0%, #16241A 56%, #0f1a12 100%)" }}
        />
        <div
          aria-hidden
          className="absolute -top-28 left-1/2 -translate-x-1/2 w-[540px] h-[540px] rounded-full blur-3xl z-0 pointer-events-none"
          style={{ background: "rgba(133,171,139,0.18)" }}
        />

        {/* Hero copy — vertically centered in the viewport */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center min-h-[72vh] sm:min-h-[80vh] px-4 sm:px-6 pt-24 pb-10">
          {/* 男性の内なる声 — 2本のマーキー（上=左へ / 下=右へ） */}
          <div aria-hidden className="w-screen overflow-hidden mb-6 sm:mb-8 space-y-2.5 sm:space-y-3 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            <div className="hr-marquee flex w-max gap-8 sm:gap-12 whitespace-nowrap">
              {[0, 1].map((n) => (
                <div key={n} className="flex gap-8 sm:gap-12">
                  {VOICES_A.map((v) => (
                    <span key={v} className="text-[12px] sm:text-[13px] text-[#C9D2C4]/85 tracking-[0.04em]" style={MINCHO}>
                      「{v}」
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div className="hr-marquee-rev flex w-max gap-8 sm:gap-12 whitespace-nowrap">
              {[0, 1].map((n) => (
                <div key={n} className="flex gap-8 sm:gap-12">
                  {VOICES_B.map((v) => (
                    <span key={v} className="text-[12px] sm:text-[13px] text-[#C9D2C4]/65 tracking-[0.04em]" style={MINCHO}>
                      「{v}」
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 人物画（マーキーと見出しの間・レスポンシブ） */}
          <div className="relative w-[128px] h-[164px] sm:w-[168px] sm:h-[214px] mb-6 sm:mb-7 rounded-[1.5rem] overflow-hidden ring-1 ring-[#85AB8B]/25 shadow-[0_30px_64px_-26px_rgba(0,0,0,0.7)]">
            <Image
              src="/media/hero/portrait.png"
              alt=""
              fill
              priority
              sizes="(max-width: 640px) 128px, 168px"
              className="object-cover object-top"
            />
            {/* 深緑に馴染ませる下端のフェード */}
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: "linear-gradient(180deg, transparent, rgba(15,26,16,0.55))" }} />
          </div>

          {/* 主役はタグライン（His Recoveries は左上のロゴのみ） */}
          <h1
            className="text-[#EDF1E8] text-[1.95rem] sm:text-[3.1rem] md:text-[3.7rem] leading-[1.32]"
            style={{ ...HERO_HEAD, fontWeight: 800 }}
          >
            もっといい男を、<br /><span className="text-[#85AB8B]">最短距離</span>で。
          </h1>

          <p className="mt-6 text-[#C9D2C4] text-[12.5px] sm:text-[14px] leading-[1.9] max-w-[30rem]">
            男性の健康・美容・活力を整える、ウェルネス・コンシェルジュ。相談は無料・完全守秘、費用も先に。
          </p>

          {/* 価値3カラム（手間・恥・損）— サブコピー直下 */}
          <div className="mt-8 w-full max-w-[600px] grid grid-cols-3 rounded-[1.4rem] bg-white/95 backdrop-blur-sm border border-[#1f2a1d]/10 divide-x divide-[#1f2a1d]/10 overflow-hidden shadow-[0_20px_48px_-26px_rgba(20,32,26,0.5)]">
            {BURDENS.map((b) => (
              <div key={b.k} className="flex flex-col items-center text-center px-1.5 sm:px-4 py-4 sm:py-6">
                <span className="inline-flex items-center rounded-full bg-[#16241A] text-[#EDF1E8] px-2.5 sm:px-3.5 py-0.5 sm:py-1 text-[10px] sm:text-[11.5px] font-bold tracking-[0.06em]">{b.k}</span>
                <div className="mt-2 sm:mt-3 text-[12px] sm:text-[15px] font-bold text-[#1f2a1d] leading-[1.4]" style={MINCHO}>{b.t}</div>
                <p className="mt-1 text-[9.5px] sm:text-[11.5px] text-[#6b7a66] leading-[1.55]">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Lower sections — 明るいクリームのキャンバス ============ */}
      <div className="relative z-10 overflow-hidden bg-[#f4f6f2]">
        {/* はじめかた — 無料LINE相談から記録まで5ステップ（Oh my teeth 型） */}
        <StepsSection />

        {/* できること — 5ステップの③〜④の具体（体験）。はじめかたの後に置く */}
        <ExperiencesSection />

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
