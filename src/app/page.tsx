import Link from "next/link";
import GlassNav from "@/components/GlassNav";
import BoomerangVideo from "@/components/BoomerangVideo";
import { complexes } from "@/lib/complexes";

const APPLY = "/assessment";

// Heading face: the design uses Neue Haas Grotesk (licensed). Fall back to
// Inter + Zen Kaku Gothic New, which we load, then system grotesks.
const HEAD: React.CSSProperties = {
  fontFamily:
    "var(--font-inter), var(--font-zen), 'Helvetica Neue', Helvetica, Arial, sans-serif",
  letterSpacing: "-0.035em",
};

const INTERVIEWS_MORE = [
  {
    href: "/recoveries/dental-hygienist-mask-skin",
    tag: "ニキビ・肌",
    span: "8ヶ月後",
    title: "歯科衛生士、一日中マスクの下で頬を気にしていた頃のこと",
    who: "20代後半・歯科衛生士 / 勤務中はほぼ終日マスク",
  },
  {
    href: "/recoveries/wakiga-six-months-grey-shirt",
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
          <p className="text-[#4b5b47] text-xs sm:text-sm tracking-[0.18em] font-medium mb-4">
            男性のための
          </p>
          <h1
            className="font-normal leading-[0.95] text-[#336443] text-[2.4rem] sm:text-5xl md:text-6xl lg:text-[5.25rem] xl:text-[6rem] max-w-5xl"
            style={HEAD}
          >
            恥じらいの悩みを、{" "}
            <span className="text-[#85AB8B]">救う。</span>
          </h1>
          <p className="mt-6 sm:mt-8 text-[#4b5b47] text-sm sm:text-base md:text-lg leading-relaxed max-w-md px-2">
            薄毛・汗・肌・顔・体毛。人に言えない悩みを、原因から。完全招待制の改善プログラム。
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
          <Link href="/recoveries" className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
            <svg className="w-3 h-3 ml-0.5 fill-white text-white" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          </Link>
          <span className="font-medium">メカニズム特集</span>
          <span className="text-white/60">インタビュー</span>
        </div>
      </section>

      {/* ============ Forest (dark sections) ============ */}
      {/* Translucent dark gradient so the fixed boomerang video stays faintly
          visible behind the content while scrolling. */}
      <div className="relative z-10 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(22,36,26,0.86) 0%,rgba(27,44,32,0.9) 26%,rgba(22,35,26,0.92) 60%,rgba(14,21,13,0.95) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(72% 46% at 18% 6%,rgba(133,171,139,0.22),transparent 70%),radial-gradient(56% 42% at 88% 22%,rgba(133,171,139,0.14),transparent 72%)" }} />
          <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(90deg,rgba(0,0,0,0) 0,rgba(0,0,0,0) 46px,rgba(7,14,8,0.55) 68px,rgba(0,0,0,0) 92px,rgba(0,0,0,0) 150px)", filter: "blur(7px)", opacity: 0.5 }} />
          <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(90deg,rgba(0,0,0,0) 0,rgba(0,0,0,0) 120px,rgba(5,11,6,0.42) 150px,rgba(0,0,0,0) 188px,rgba(0,0,0,0) 280px)", filter: "blur(12px)", opacity: 0.45 }} />
          <div className="absolute inset-x-0 top-0 h-44" style={{ background: "linear-gradient(180deg,rgba(150,180,150,0.16),transparent)" }} />
        </div>

        {/* ===== Complexes ===== */}
        <section id="complexes" className="relative z-10 text-white">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 md:py-28">
            <div className="max-w-2xl mb-12 md:mb-16">
              <div className="text-xs tracking-[0.18em] text-[#85AB8B] font-medium mb-4">WHAT WE WORK ON</div>
              <h2 className="font-normal leading-[1.02] text-white text-[2rem] sm:text-[2.5rem] md:text-[3rem]" style={HEAD}>
                向き合う、<span className="text-[#85AB8B]">6つの悩み。</span>
              </h2>
              <p className="mt-5 text-white/70 text-sm md:text-base leading-relaxed">それぞれ「なぜ起きるのか」を、原因から読めるようにしています。煽らず、断定せず、仕組みから。</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 rounded-[1.5rem] overflow-hidden border border-white/10">
              {complexes.map((c, i) => (
                <Link key={c.id} href={`/territories/${c.territory}`} className="group bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-sm transition-colors p-7 md:p-8 flex flex-col">
                  <div className="text-[13px] text-[#85AB8B] font-medium mb-3">{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="text-xl text-white font-semibold mb-2">{c.ja}</h3>
                  <p className="text-[13.5px] text-white/70 leading-relaxed">{c.mechanism}</p>
                  <span className="mt-5 text-[13px] text-[#85AB8B] font-medium group-hover:opacity-70 transition-opacity">なぜ起きる？を読む →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Interviews ===== */}
        <section id="interviews" className="relative z-10 text-white">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 md:py-28">
            <div className="max-w-2xl mb-12 md:mb-16">
              <div className="text-xs tracking-[0.18em] text-[#85AB8B] font-medium mb-4">INTERVIEWS</div>
              <h2 className="font-normal leading-[1.02] text-white text-[2rem] sm:text-[2.5rem] md:text-[3rem]" style={HEAD}>
                同じ道を、<span className="text-[#85AB8B]">通った人たち。</span>
              </h2>
              <p className="mt-5 text-white/70 text-sm md:text-base leading-relaxed">悩みごとに、原因のメカニズムと、当事者がどう向き合ったか。成功談ではなく、過程の記録として。</p>
            </div>

            {/* featured */}
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-stretch mb-10">
              <Link href="/recoveries/sales-hairline-front-desk" className="rounded-[2rem] bg-[#0f1a10]/55 backdrop-blur-md border border-white/10 p-8 md:p-12 flex flex-col justify-between min-h-[320px] hover:bg-[#0f1a10]/70 transition-colors">
                <div>
                  <div className="flex items-center gap-2 text-[#85AB8B] text-[13px] font-medium mb-6">
                    <span>薄毛・AGA</span><span className="text-white/30">·</span><span className="text-white/60">1年後</span>
                  </div>
                  <p className="text-2xl md:text-[2rem] leading-[1.5] font-normal text-white" style={{ letterSpacing: "-0.02em" }}>「名刺を渡す角度を、いつのまにか変えていた。気づいたのは、変えなくてよくなってからでした。」</p>
                </div>
                <div className="mt-8 text-white/55 text-sm">30代前半・法人営業 / 一日に何度も初対面の相手と向き合う</div>
              </Link>
              <div className="rounded-[2rem] bg-[#0f1a10]/55 backdrop-blur-md border border-white/10 p-8 md:p-10 flex flex-col">
                <div className="text-xs tracking-[0.16em] text-[#85AB8B] font-medium mb-5">メカニズム</div>
                <h3 className="text-lg text-white font-semibold mb-3">なぜ起きるのか</h3>
                <p className="text-white/70 text-sm leading-[1.9]">テストステロンが5αリダクターゼによってDHTへ変換され、感受性の高い前頭部・頭頂部の毛包でヘアサイクルが短縮します。原因を見立てた上で、必要なら連携医療機関へ。</p>
                <div className="mt-auto pt-8">
                  <Link href="/territories/hair-loss" className="inline-flex items-center gap-2 text-[#85AB8B] text-sm font-medium hover:opacity-70 transition-opacity">改善の進め方を見る →</Link>
                </div>
              </div>
            </div>

            {/* more */}
            <div className="grid sm:grid-cols-2 gap-6">
              {INTERVIEWS_MORE.map((it) => (
                <Link key={it.href} href={it.href} className="group rounded-[1.5rem] bg-[#0f1a10]/55 backdrop-blur-md border border-white/10 hover:bg-[#33422f] transition-colors p-7 md:p-8 flex flex-col min-h-[200px]">
                  <div className="flex items-center gap-2 text-[#85AB8B] text-[13px] font-medium mb-5">
                    <span>{it.tag}</span><span className="text-white/30">·</span><span className="text-white/60">{it.span}</span>
                  </div>
                  <h3 className="text-lg md:text-xl leading-[1.55] text-white font-normal">{it.title}</h3>
                  <div className="mt-auto pt-6 text-white/50 text-[13px]">{it.who}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== How (web app × offline, 5 steps) ===== */}
        <section id="how" className="relative z-10 text-white">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 md:py-28">
            <div className="max-w-2xl mb-12 md:mb-16">
              <div className="text-xs tracking-[0.18em] text-[#85AB8B] font-medium mb-4">HOW IT WORKS</div>
              <h2 className="font-normal leading-[1.02] text-white text-[2rem] sm:text-[2.5rem] md:text-[3rem]" style={HEAD}>
                Webアプリ × オフラインで、<br className="hidden sm:block" /><span className="text-[#85AB8B]">改善する。</span>
              </h2>
              <p className="mt-5 text-white/70 text-sm md:text-base leading-relaxed">アプリだけでは続かない。対面だけでも届かない。両輪を一つにして、原因から定着まで運びます。</p>
            </div>

            {/* eye-catch: web app + offline */}
            <div className="grid lg:grid-cols-2 gap-6 mb-16 md:mb-20">
              {/* web app */}
              <div className="rounded-[2rem] bg-white p-7 md:p-9 flex flex-col">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#3d5638] mb-6">
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
              <div className="rounded-[2rem] bg-[#0f1a10]/55 backdrop-blur-md border border-white/10 text-white p-7 md:p-9 flex flex-col">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#85AB8B] mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#85AB8B]" />OFFLINE — 専属伴走
                </div>
                <div className="rounded-[1.4rem] bg-[#0f1a10]/55 backdrop-blur-md border border-white/10 p-6 flex-1 flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#85AB8B]/20 border border-[#85AB8B]/30 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-[#85AB8B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <div>
                      <div className="text-white font-semibold">専属担当との面談</div>
                      <div className="text-white/55 text-[13px]">オンライン / 対面・連携クリニック</div>
                    </div>
                  </div>
                  <div className="h-px bg-white/10" />
                  <ul className="space-y-3 text-sm text-white/80">
                    <li className="flex gap-3"><span className="text-[#85AB8B]">—</span>専属担当による改善設計</li>
                    <li className="flex gap-3"><span className="text-[#85AB8B]">—</span>専門医療機関との連携</li>
                    <li className="flex gap-3"><span className="text-[#85AB8B]">—</span>定着までの継続フォロー</li>
                  </ul>
                </div>
                <p className="mt-6 text-white/70 text-sm leading-relaxed">原因の診断から定着まで、専属の担当と専門家が、対面でもオンラインでも並走します。</p>
              </div>
            </div>

            {/* 5 steps */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl text-white font-normal" style={{ letterSpacing: "-0.02em" }}>改善の進め方 — 5つのステップ</h3>
              <p className="mt-3 text-white/70 text-sm leading-relaxed">どれも、隠さず・順番どおりに。</p>
            </div>
            <div className="grid md:grid-cols-5 gap-px bg-white/10 rounded-[1.5rem] overflow-hidden border border-white/10">
              {STEPS.map((s) => (
                <div key={s.n} className="bg-white/[0.06] backdrop-blur-sm p-6 flex flex-col">
                  <div className="text-[#85AB8B] text-sm font-semibold mb-4">{s.n}</div>
                  <h4 className="text-[15px] text-white font-semibold mb-2">{s.t}</h4>
                  <p className="text-[12.5px] text-white/70 leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Link href={APPLY} className="bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">参加を申し込む</Link>
              <span className="text-white/70 text-[13px]">※ 本プログラムは医療行為ではありません。診断・治療は連携する医療機関が行います。</span>
            </div>
          </div>
        </section>

        {/* ===== Footer ===== */}
        <footer className="relative z-10 border-t border-white/10">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-14 md:py-16">
            <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
              <div>
                <div className="logo-type text-lg font-semibold tracking-tight text-white mb-4">His Recoveries</div>
                <p className="text-white/55 text-[13px] leading-[1.95] max-w-xs">男性のコンプレックスを、原因の特定から定着まで伴走して整える、完全招待制の改善プログラム。Webアプリと、専属の伴走で。</p>
                <Link href={APPLY} className="mt-6 inline-block bg-white/10 hover:bg-white/[0.16] border border-white/15 text-white text-sm font-medium px-6 py-3 rounded-full transition-colors">参加を申し込む</Link>
              </div>
              <div>
                <div className="text-[11px] tracking-[0.16em] text-white/40 font-medium mb-4">悩み</div>
                <ul className="space-y-2.5 text-[13.5px] text-white/70">
                  {complexes.map((c) => (
                    <li key={c.id}><Link href={`/territories/${c.territory}`} className="hover:text-white transition-colors">{c.ja}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[11px] tracking-[0.16em] text-white/40 font-medium mb-4">読む</div>
                <ul className="space-y-2.5 text-[13.5px] text-white/70">
                  <li><Link href="/recoveries" className="hover:text-white transition-colors">インタビュー</Link></li>
                  <li><Link href="/territories" className="hover:text-white transition-colors">メカニズム</Link></li>
                  <li><a href="#how" className="hover:text-white transition-colors">進め方</a></li>
                  <li><Link href="/manifesto" className="hover:text-white transition-colors">編集方針</Link></li>
                  <li><Link href="/en" className="hover:text-white transition-colors">English</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-6 border-t border-white/10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-[12px] text-white/40">
              <div>© 2026 His Recoveries ・ <Link href="/privacy" className="hover:text-white/70 transition-colors">プライバシー・免責事項</Link></div>
              <div>※ 診断・治療は連携する医療機関が行います。</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
