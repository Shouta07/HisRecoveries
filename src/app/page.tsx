import Link from "next/link";
import GlassNav from "@/components/GlassNav";
import BoomerangVideo from "@/components/BoomerangVideo";
import { complexes } from "@/lib/complexes";

const APPLY = "/apply";

// Heading face: the design uses Neue Haas Grotesk (licensed). Fall back to
// Inter + Zen Kaku Gothic New, which we load, then system grotesks.
// `palt` enables proportional Japanese metrics for tight, professional kerning.
const HEAD: React.CSSProperties = {
  fontFamily:
    "var(--font-inter), var(--font-zen), 'Helvetica Neue', Helvetica, Arial, sans-serif",
  letterSpacing: "-0.025em",
  fontWeight: 500,
  fontFeatureSettings: '"palt" 1, "kern" 1',
  WebkitFontSmoothing: "antialiased",
  textRendering: "optimizeLegibility",
};

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
    href: "#how",
    tag: "ニキビ・肌",
    span: "8ヶ月後",
    title: "歯科衛生士、一日中マスクの下で頬を気にしていた頃のこと",
    who: "20代後半・歯科衛生士 / 勤務中はほぼ終日マスク",
  },
  {
    href: "#how",
    tag: "汗・におい",
    span: "半年後",
    title: "ワキガ手術から半年、夏のグレーを選び直せた朝のこと",
    who: "20代後半・夏のグレーを、何年も避けてきた",
  },
];

const STEPS = [
  { n: "01", t: "原因を特定する", d: "自己観察と連携専門家の診断で、何が・なぜ起きているかを言葉に。" },
  { n: "02", t: "中立に並べる", d: "効果・期間・費用・リスクを正直に。「何もしない」も含めて。" },
  { n: "03", t: "医療と連携する", d: "必要な段階なら、その悩みに強い医療機関へ。紹介手数料はゼロ。" },
  { n: "04", t: "専属で伴走する", d: "生活に根づくまで、専属担当がオンライン・対面で並走。" },
  { n: "05", t: "定着したら卒業", d: "自分で再現できる状態がゴール。終わりを設計に含めます。" },
];

export default function HomePage() {
  return (
    <div className="relative font-sans bg-[#dfe6dc]">
      {/* Persistent ambient boomerang video — fixed behind everything, so it
          keeps playing faintly in the background while you scroll. */}
      <div aria-hidden className="fixed inset-0 z-0 pointer-events-none">
        <BoomerangVideo src="/media/hero/boomerang.mp4" />
      </div>

      {/* ============ Hero ============ */}
      <section className="relative z-10 w-full min-h-screen sm:h-screen overflow-hidden">
        {/* Bottom scrim — keeps the white bottom copy legible before the video
            loads (or on browsers without H.264) without darkening the heading. */}
        <div
          aria-hidden
          className="absolute inset-0 z-[1] pointer-events-none hidden sm:block"
          style={{ background: "linear-gradient(180deg, transparent 48%, rgba(15,26,16,0.55) 100%)" }}
        />

        <GlassNav />

        {/* Hero copy */}
        <div className="relative z-10 flex flex-col items-center text-center pt-24 sm:pt-28 md:pt-32 px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-5 text-[#4b5b47]">
            <span aria-hidden className="block w-7 sm:w-9 h-px bg-[#85AB8B]/70" />
            <span className="text-[11px] sm:text-xs tracking-[0.42em] font-medium" style={{ fontFeatureSettings: '"palt" 1' }}>
              男性のための
            </span>
            <span aria-hidden className="block w-7 sm:w-9 h-px bg-[#85AB8B]/70" />
          </div>
          <h1
            className="text-[#336443] text-[2.6rem] sm:text-[3.4rem] md:text-[4.25rem] lg:text-[4.75rem] xl:text-[5.25rem] max-w-4xl"
            style={{ ...HERO_HEAD, lineHeight: 1.22 }}
          >
            恥じらいの
            <br />
            悩みを、<span className="text-[#85AB8B]">救う。</span>
          </h1>
          <p
            className="mt-7 sm:mt-9 text-[#4b5b47] text-[13.5px] sm:text-[15px] md:text-base leading-[2.05] tracking-[0.04em] max-w-md px-2"
            style={{ fontFeatureSettings: '"palt" 1', fontWeight: 400 }}
          >
            薄毛・汗・肌・顔・体毛。人に言えない悩みを、原因から。
            <wbr />
            完全招待制の改善プログラム。
          </p>
        </div>

        {/* Bottom-left CTA block */}
        <div className="absolute left-4 right-4 sm:right-auto sm:left-6 md:left-10 bottom-6 sm:bottom-8 md:bottom-10 z-10 max-w-sm">
          <div className="flex items-center gap-2 text-[#3d5638] sm:text-white/95 mb-3">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" /><path d="M19 3v4" /><path d="M21 5h-4" /></svg>
            <span className="text-sm font-semibold sm:font-medium">完全招待制 ・ 中立</span>
          </div>
          <p className="text-[#3d5638]/90 sm:text-white/85 text-xs leading-relaxed mb-6 max-w-xs font-medium sm:font-normal">
            Webアプリで状態を可視化し、オフラインで専属が伴走。各悩みのメカニズムは、当事者のインタビューで特集します。効果は保証しません。
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link href={APPLY} className="bg-[#3d5638] sm:bg-white hover:bg-[#2d4228] sm:hover:bg-white/90 text-white sm:text-[#1f2a1d] text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-colors shadow-sm">参加を申し込む</Link>
            <a href="#how" className="text-[#3d5638] sm:text-white text-sm font-semibold sm:font-medium hover:opacity-80 transition-opacity">進め方を見る</a>
          </div>
        </div>

        {/* Bottom-right link */}
        <div className="hidden sm:flex absolute right-6 md:right-10 bottom-8 md:bottom-10 z-10 items-center gap-2 text-white/90 text-sm">
          <a href="#interviews" className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
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

        {/* ===== Complexes ===== */}
        <section id="complexes" className="relative z-10 text-[#1f2a1d]">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 md:py-28">
            <div className="max-w-2xl mb-12 md:mb-16">
              <div className="text-xs tracking-[0.22em] text-[#3d5638] font-semibold mb-4">WHAT WE WORK ON</div>
              <h2 className="leading-[1.04] text-[#1f2a1d] text-[2rem] sm:text-[2.5rem] md:text-[3rem]" style={HEAD}>
                向き合う、<span className="text-[#3d5638]">6つの悩み。</span>
              </h2>
              <p className="mt-5 text-[#4b5b47] text-sm md:text-base leading-relaxed">それぞれ「なぜ起きるのか」を、原因から読めるようにしています。煽らず、断定せず、仕組みから。</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1f2a1d]/10 rounded-[1.5rem] overflow-hidden border border-[#1f2a1d]/10">
              {complexes.map((c, i) => (
                <a key={c.id} href="#interviews" className="group bg-white/65 hover:bg-white/85 backdrop-blur-md transition-colors p-7 md:p-8 flex flex-col">
                  <div className="text-[13px] text-[#3d5638] font-semibold mb-3">{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="text-xl text-[#1f2a1d] font-semibold mb-2">{c.ja}</h3>
                  <p className="text-[13.5px] text-[#4b5b47] leading-relaxed">{c.mechanism}</p>
                  <span className="mt-5 text-[13px] text-[#3d5638] font-semibold group-hover:opacity-70 transition-opacity">なぜ起きる？を読む →</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Interviews ===== */}
        <section id="interviews" className="relative z-10 text-[#1f2a1d]">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 md:py-28">
            <div className="max-w-2xl mb-12 md:mb-16">
              <div className="text-xs tracking-[0.22em] text-[#3d5638] font-semibold mb-4">INTERVIEWS</div>
              <h2 className="leading-[1.04] text-[#1f2a1d] text-[2rem] sm:text-[2.5rem] md:text-[3rem]" style={HEAD}>
                同じ道を、<span className="text-[#3d5638]">通った人たち。</span>
              </h2>
              <p className="mt-5 text-[#4b5b47] text-sm md:text-base leading-relaxed">悩みごとに、原因のメカニズムと、当事者がどう向き合ったか。成功談ではなく、過程の記録として。</p>
            </div>

            {/* featured */}
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-stretch mb-10">
              <a href="#how" className="rounded-[2rem] bg-white/70 backdrop-blur-md border border-[#1f2a1d]/10 p-8 md:p-12 flex flex-col justify-between min-h-[320px] hover:bg-white/85 transition-colors shadow-sm">
                <div>
                  <div className="flex items-center gap-2 text-[#3d5638] text-[13px] font-semibold mb-6">
                    <span>薄毛・AGA</span><span className="text-[#1f2a1d]/25">·</span><span className="text-[#6b7a66]">1年後</span>
                  </div>
                  <p className="text-2xl md:text-[2rem] leading-[1.5] font-normal text-[#1f2a1d]" style={{ letterSpacing: "-0.02em" }}>「名刺を渡す角度を、いつのまにか変えていた。気づいたのは、変えなくてよくなってからでした。」</p>
                </div>
                <div className="mt-8 text-[#6b7a66] text-sm">30代前半・法人営業 / 一日に何度も初対面の相手と向き合う</div>
              </a>
              <div className="rounded-[2rem] bg-white/70 backdrop-blur-md border border-[#1f2a1d]/10 p-8 md:p-10 flex flex-col shadow-sm">
                <div className="text-xs tracking-[0.16em] text-[#3d5638] font-semibold mb-5">メカニズム</div>
                <h3 className="text-lg text-[#1f2a1d] font-semibold mb-3">なぜ起きるのか</h3>
                <p className="text-[#4b5b47] text-sm leading-[1.9]">テストステロンが5αリダクターゼによってDHTへ変換され、感受性の高い前頭部・頭頂部の毛包でヘアサイクルが短縮します。原因を見立てた上で、必要なら連携医療機関へ。</p>
                <div className="mt-auto pt-8">
                  <a href="#how" className="inline-flex items-center gap-2 text-[#3d5638] text-sm font-semibold hover:opacity-70 transition-opacity">改善の進め方を見る →</a>
                </div>
              </div>
            </div>

            {/* more */}
            <div className="grid sm:grid-cols-2 gap-6">
              {INTERVIEWS_MORE.map((it) => (
                <a key={it.title} href={it.href} className="group rounded-[1.5rem] bg-white/70 backdrop-blur-md border border-[#1f2a1d]/10 hover:bg-white/90 transition-colors p-7 md:p-8 flex flex-col min-h-[200px] shadow-sm">
                  <div className="flex items-center gap-2 text-[#3d5638] text-[13px] font-semibold mb-5">
                    <span>{it.tag}</span><span className="text-[#1f2a1d]/25">·</span><span className="text-[#6b7a66]">{it.span}</span>
                  </div>
                  <h3 className="text-lg md:text-xl leading-[1.55] text-[#1f2a1d] font-normal">{it.title}</h3>
                  <div className="mt-auto pt-6 text-[#6b7a66] text-[13px]">{it.who}</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ===== How (web app × offline, 5 steps) ===== */}
        <section id="how" className="relative z-10 text-[#1f2a1d]">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 md:py-28">
            <div className="max-w-2xl mb-12 md:mb-16">
              <div className="text-xs tracking-[0.22em] text-[#3d5638] font-semibold mb-4">HOW IT WORKS</div>
              <h2 className="leading-[1.04] text-[#1f2a1d] text-[2rem] sm:text-[2.5rem] md:text-[3rem]" style={HEAD}>
                Webアプリ × オフラインで、<br className="hidden sm:block" /><span className="text-[#3d5638]">改善する。</span>
              </h2>
              <p className="mt-5 text-[#4b5b47] text-sm md:text-base leading-relaxed">アプリだけでは続かない。対面だけでも届かない。両輪を一つにして、原因から定着まで運びます。</p>
            </div>

            {/* eye-catch: web app + offline */}
            <div className="grid lg:grid-cols-2 gap-6 mb-16 md:mb-20">
              {/* web app */}
              <div className="rounded-[2rem] bg-white p-7 md:p-9 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#3d5638] mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#85AB8B]" />ONLINE — Webアプリ
                </div>
                <div className="rounded-[1.4rem] bg-[#f4f5f1] border border-[#e4e6df] p-6">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[13px] font-semibold text-[#1f2a1d]">His Recoveries</span>
                    <span className="text-[11px] px-3 py-1 rounded-full bg-[#e7ede4] text-[#3d5638] font-medium">改善中</span>
                  </div>
                  <div className="text-[11px] text-[#8a9285] tracking-wide mb-1">いまの状態</div>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-[3.2rem] leading-none font-normal text-[#1f2a1d]" style={{ letterSpacing: "-0.03em" }}>62</span>
                    <span className="text-[#a0a89c] text-sm mb-2">/ 100</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#e2e5dd] overflow-hidden mb-6">
                    <div className="h-full w-[62%] rounded-full bg-[#3d5638]" />
                  </div>
                  <div className="text-[11px] text-[#8a9285] tracking-wide mb-3">変化の記録</div>
                  <div className="space-y-2.5">
                    <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-white border border-[#e7e9e2] px-4 py-2.5 text-[12.5px] leading-relaxed text-[#3a423a]">今週、調子はどうですか？写真も見ますよ。</div>
                    <div className="ml-auto max-w-[72%] rounded-2xl rounded-tr-md bg-[#3d5638] px-4 py-2.5 text-[12.5px] leading-relaxed text-white">少し落ち着いてきました</div>
                  </div>
                </div>
                <p className="mt-6 text-[#4b5b47] text-sm leading-relaxed">セルフ診断で現在地を把握し、記録で変化を追う。専属担当とのやり取りも、ひとつの画面に。</p>
              </div>

              {/* offline */}
              <div className="rounded-[2rem] bg-white/70 backdrop-blur-md border border-[#1f2a1d]/10 text-[#1f2a1d] p-7 md:p-9 flex flex-col shadow-sm">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#3d5638] mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#85AB8B]" />OFFLINE — 専属伴走
                </div>
                <div className="rounded-[1.4rem] bg-white/60 border border-[#1f2a1d]/10 p-6 flex-1 flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#85AB8B]/20 border border-[#85AB8B]/40 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#3d5638]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <div>
                      <div className="text-[#1f2a1d] font-semibold">専属担当との面談</div>
                      <div className="text-[#6b7a66] text-[13px]">オンライン / 対面・連携クリニック</div>
                    </div>
                  </div>
                  <div className="h-px bg-[#1f2a1d]/10" />
                  <ul className="space-y-3 text-sm text-[#4b5b47]">
                    <li className="flex gap-3"><span className="text-[#3d5638]">—</span>専属担当による改善設計</li>
                    <li className="flex gap-3"><span className="text-[#3d5638]">—</span>専門医療機関との連携</li>
                    <li className="flex gap-3"><span className="text-[#3d5638]">—</span>定着までの継続フォロー</li>
                  </ul>
                </div>
                <p className="mt-6 text-[#4b5b47] text-sm leading-relaxed">原因の診断から定着まで、専属の担当と専門家が、対面でもオンラインでも並走します。</p>
              </div>
            </div>

            {/* 5 steps */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl text-[#1f2a1d] font-normal" style={{ letterSpacing: "-0.02em" }}>改善の進め方 — 5つのステップ</h3>
              <p className="mt-3 text-[#4b5b47] text-sm leading-relaxed">どれも、隠さず・順番どおりに。</p>
            </div>
            <div className="grid md:grid-cols-5 gap-px bg-[#1f2a1d]/10 rounded-[1.5rem] overflow-hidden border border-[#1f2a1d]/10">
              {STEPS.map((s) => (
                <div key={s.n} className="bg-white/65 backdrop-blur-md p-6 flex flex-col">
                  <div className="text-[#3d5638] text-sm font-semibold mb-4">{s.n}</div>
                  <h4 className="text-[15px] text-[#1f2a1d] font-semibold mb-2">{s.t}</h4>
                  <p className="text-[12.5px] text-[#4b5b47] leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Link href={APPLY} className="bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">参加を申し込む</Link>
              <span className="text-[#6b7a66] text-[13px]">※ 本プログラムは医療行為ではありません。診断・治療は連携する医療機関が行います。</span>
            </div>
          </div>
        </section>

        {/* ===== Footer ===== */}
        <footer className="relative z-10 border-t border-[#1f2a1d]/10">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-14 md:py-16">
            <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
              <div>
                <div className="logo-type text-lg font-semibold tracking-tight text-[#1f2a1d] mb-4">His Recoveries</div>
                <p className="text-[#4b5b47] text-[13px] leading-[1.95] max-w-xs">男性のコンプレックスを、原因の特定から定着まで伴走して整える、完全招待制の改善プログラム。Webアプリと、専属の伴走で。</p>
                <Link href={APPLY} className="mt-6 inline-block bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-medium px-6 py-3 rounded-full transition-colors">参加を申し込む</Link>
              </div>
              <div>
                <div className="text-[11px] tracking-[0.16em] text-[#6b7a66] font-semibold mb-4">悩み</div>
                <ul className="space-y-2.5 text-[13.5px] text-[#4b5b47]">
                  {complexes.map((c) => (
                    <li key={c.id}><a href="#complexes" className="hover:text-[#1f2a1d] transition-colors">{c.ja}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[11px] tracking-[0.16em] text-[#6b7a66] font-semibold mb-4">読む</div>
                <ul className="space-y-2.5 text-[13.5px] text-[#4b5b47]">
                  <li><a href="#interviews" className="hover:text-[#1f2a1d] transition-colors">インタビュー</a></li>
                  <li><a href="#complexes" className="hover:text-[#1f2a1d] transition-colors">メカニズム</a></li>
                  <li><a href="#how" className="hover:text-[#1f2a1d] transition-colors">進め方</a></li>
                  <li><Link href="/articles" className="hover:text-[#1f2a1d] transition-colors">記事</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-6 border-t border-[#1f2a1d]/10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-[12px] text-[#6b7a66]">
              <div>© 2026 His Recoveries ・ <Link href="/privacy" className="hover:text-[#1f2a1d] transition-colors">プライバシー・免責事項</Link></div>
              <div>※ 診断・治療は連携する医療機関が行います。</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
