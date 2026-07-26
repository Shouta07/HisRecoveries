import Link from "next/link";
import Image from "next/image";
import GlassNav from "@/components/GlassNav";
import SceneFlow from "@/components/SceneFlow";
import StepsSection from "@/components/StepsSection";
import ExperiencesSection from "@/components/ExperiencesSection";
import FeaturesSection from "@/components/FeaturesSection";
import FaqSection from "@/components/FaqSection";
import StickyConsultBar from "@/components/StickyConsultBar";
import { clusters } from "@/lib/clusters";

// パッケージ編成ツールに渡す、領域ごとの記事（重い clusters は server 側で軽い形に畳んでから props で渡す）。
const DIAG_AREAS = ["impression", "hair", "skin", "face", "body-hair", "mind"] as const;
const diagnosisArticles: Record<string, { slug: string; title: string }[]> = Object.fromEntries(
  DIAG_AREAS.map((area) => [
    area,
    clusters
      .filter((c) => c.areaId === area && c.kind !== "interview")
      .slice(0, 3)
      .map((c) => ({ slug: c.slug, title: c.title })),
  ]),
);

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
  { k: "明朗会計", t: "売り込まれない。", d: "必要な分だけ・中立。費用は先に。" },
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
          {/* 何のサービスか、を最初のひと言で */}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-[11.5px] sm:text-[12.5px] font-semibold tracking-[0.04em] text-[#C9D2C4]">
            <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-[#9ec4a3]" />
            男の「変わりたい」に、伴走する。
          </span>

          {/* 人物画を画面幅いっぱい（フルブリード）に敷き、見出しをオーバーレイ */}
          <div className="relative w-screen h-[44vh] sm:h-[52vh] mt-5 mb-6 overflow-hidden">
            <Image
              src="/media/hero/portrait.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[50%_30%]"
            />
            {/* 上下スクリム：上は深緑へ馴染ませ、下は見出しの可読性を確保 */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, rgba(15,26,16,0.72) 0%, rgba(15,26,16,0.12) 22%, rgba(15,26,16,0.08) 46%, rgba(15,26,16,0.6) 76%, rgba(15,26,16,0.97) 100%)" }}
            />
            {/* 見出しを画像の上に */}
            <h1
              className="absolute inset-x-0 bottom-0 px-5 pb-7 text-center text-[#EDF1E8] text-[2.1rem] sm:text-[3.2rem] leading-[1.25]"
              style={{ ...HERO_HEAD, fontWeight: 800 }}
            >
              <span className="block max-w-[640px] mx-auto">
                理想の男に、<br /><span className="text-[#9ec4a3]">最短距離</span>で。
              </span>
            </h1>
          </div>

          {/* サービスの定義＝「悩み」ではなく「なりたい姿」から逆算するコンシェルジュ。
              改行は文節単位（inline-block）で、狭い画面でも語の途中で折れないようにする。 */}
          <p className="text-[#D7DED2] text-[13px] sm:text-[15px] leading-[1.95] max-w-[33rem]">
            <span className="inline-block">恋愛、仕事、人生の節目。</span>{" "}
            <span className="inline-block">あなたが<span className="font-semibold text-[#EDF1E8]">叶えたい未来から逆算</span>し、</span>{" "}
            <span className="inline-block">必要な変化の順番を設計する</span>{" "}
            <span className="inline-block"><span className="font-semibold text-[#EDF1E8]">男性ウェルネスコンシェルジュ</span>。</span>
          </p>

          {/* メカニズムを3ステップでスキャンできるように */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-[11.5px] sm:text-[13px] font-semibold">
            {["診断", "整える順番を設計", "つないで、伴走"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span className="rounded-full bg-white/[0.07] border border-white/12 px-3 py-1.5 text-[#C9D2C4]">
                  <span className="text-[#9ec4a3] font-bold mr-1">{i + 1}</span>{s}
                </span>
                {i < 2 && <span aria-hidden className="text-[#85AB8B]">→</span>}
              </div>
            ))}
          </div>

          {/* 一次CTA＝診断ツールへ（相談は下部の追従バーに集約） */}
          <a href="#occasions" className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#9ec4a3]/40 bg-white/[0.06] hover:bg-white/[0.12] text-[#EDF1E8] text-[13.5px] font-semibold px-7 py-3 transition-colors">
            30秒で「あなたのパッケージ」を組む <span aria-hidden>→</span>
          </a>

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

          {/* こんなお悩み、ないですか？ — 男性の内なる声（2本のマーキー） */}
          <div className="mt-11 sm:mt-14 w-full">
            <p className="text-[#9ec4a3] text-[13px] sm:text-[14px] font-medium tracking-[0.04em] mb-4 sm:mb-5" style={MINCHO}>
              こんなお悩み、ないですか？
            </p>
            <div aria-hidden className="w-screen overflow-hidden space-y-2.5 sm:space-y-3 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
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
          </div>
        </div>
      </section>

      {/* ============ Lower sections — 明るいクリームのキャンバス ============ */}
      <div className="relative z-10 overflow-hidden bg-[#f4f6f2]">
        {/* ① 入口 — 人生シーン（目的）→ パッケージ編成 の一続き。
            悩みではなく「何のために整えるか」から入り、住まい・年齢・（締切）を足して
            構成＋日程プラン＋各ステップの記事をその場で返す。相談でパーソナライズ。 */}
        <SceneFlow articles={diagnosisArticles} />

        {/* はじめかた — 匿名Web相談から記録まで5ステップ */}
        <StepsSection />

        {/* できること — 5ステップの③〜④の具体（体験）。はじめかたの後に置く */}
        <ExperiencesSection />

        {/* His Recoveries の特徴 — 機能価値を2×2で（Oh my teeth 型） */}
        <FeaturesSection />

        {/* FAQ — 予約直前の不安を潰す */}
        <FaqSection />

        {/* ===== Footer — ⑤ リンク網（SEO＋回遊）。悩み別・コンテンツ・運営で整理 ===== */}
        <footer className="relative z-10 border-t border-[#1f2a1d]/10 bg-[#eef1ea]">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-12 pb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8">
              {/* 悩みから探す */}
              <div className="col-span-2 sm:col-span-2">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#85AB8B] mb-3.5">悩みから探す</div>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] text-[#4b5b47]">
                  {[
                    ["impression", "清潔感・第一印象"],
                    ["hair", "薄毛・髪"],
                    ["skin", "肌・ニキビ"],
                    ["face", "老け見え・疲れ顔"],
                    ["body-hair", "ヒゲ・体毛"],
                    ["mind", "睡眠・気分・習慣"],
                  ].map(([id, label]) => (
                    <li key={id}>
                      <Link href={`/areas/${id}`} className="hover:text-[#1f2a1d] transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* サービス */}
              <div>
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#85AB8B] mb-3.5">サービス</div>
                <ul className="space-y-2 text-[13px] text-[#4b5b47]">
                  <li><a href="#occasions" className="hover:text-[#1f2a1d] transition-colors">目的から始める</a></li>
                  <li><a href="#diagnosis" className="hover:text-[#1f2a1d] transition-colors">パッケージを組む（無料）</a></li>
                  <li><Link href="/recover" className="hover:text-[#1f2a1d] transition-colors">Recover｜取り戻す</Link></li>
                  <li><Link href="/refine" className="hover:text-[#1f2a1d] transition-colors">Refine｜深める</Link></li>
                  <li><Link href="/areas" className="hover:text-[#1f2a1d] transition-colors">記事をすべて見る</Link></li>
                </ul>
              </div>

              {/* His Recoveries */}
              <div>
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#85AB8B] mb-3.5">His Recoveries</div>
                <ul className="space-y-2 text-[13px] text-[#4b5b47]">
                  <li><Link href="/why" className="hover:text-[#1f2a1d] transition-colors">なぜ、やるのか</Link></li>
                  <li><Link href="/partner" className="hover:text-[#1f2a1d] transition-colors">提携パートナー募集</Link></li>
                  <li><Link href="/privacy" className="hover:text-[#1f2a1d] transition-colors">プライバシー・免責事項</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-[#1f2a1d]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Link href="/" className="logo-type text-xl font-semibold tracking-tight text-[#1f2a1d]">His Recoveries</Link>
              <span className="text-[12px] text-[#6b7a66]">© 2026 His Recoveries — 男の「変わりたい」に、伴走する。</span>
            </div>
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
