// ハイエンド会員（Recovery 会員）の専用LP。プレミアム・コンシェルジュ型の
// 構造を、His Recoveries の軸（匿名・中立・伴走・ウェルネス）に置き換えたもの。
import Link from "next/link";
import type { ExperiencePackage } from "@/lib/packages";
import { site } from "@/lib/site";
import BookingCTA from "@/components/BookingCTA";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

const PILLARS = [
  { t: "専属コンシェルジュ", d: "あなたの文脈・履歴・好みを覚えている、専属の窓口。予約も決済も、ひとつに。" },
  { t: "現在地の可視化", d: "セルフ診断・記録、任意で血液などのデータをもとに、いまの状態を見える化。" },
  { t: "中立に束ねて実行", d: "悩みに合う専門家を、中立に選んで手配（紹介手数料ゼロ）。あなたは選ぶだけ。" },
  { t: "Webアプリで伴走", d: "状態を記録し、専属と共有し、変化を見える化。一度で終わらせない。" },
];

const REASONS = [
  { t: "中立", d: "売らない・特定院を推奨しない・紹介手数料ゼロ。" },
  { t: "完全匿名・守秘", d: "本名・顔・実年齢は不要。会員IDで運用。" },
  { t: "限定枠", d: "品質を保つため、枠を限定。完全招待制・選考制。" },
  { t: "定着まで", d: "施術で終わらせず、再現できる状態とつながりまで。" },
];

const TIMELINE = [
  { n: "01", t: "現在地の可視化", d: "守秘確認・診断・ゴール設定（任意で血液）。" },
  { n: "02", t: "ロードマップ設計", d: "領域横断で、優先順位と道筋を一緒に。" },
  { n: "03", t: "中立に束ねて実行", d: "専門家を手配。窓口一本化・決済集約。" },
  { n: "04", t: "伴走・記録", d: "Webアプリ＋定期面談で、生活に根づくまで。" },
  { n: "05", t: "定着・つながり", d: "自分で再現できる状態へ。終わりではなく、つながり続ける。" },
];

const FAQS = [
  { q: "「完全招待制」とは？", a: "枠を限定し、選考のうえでご案内する形です。まずは完全匿名の無料相談から、現在地を一緒に整理します。" },
  { q: "料金はいくらですか？", a: "内容により異なり、選考後に個別でご提示します。価格は目安であり、ヒアリングに基づきます。" },
  { q: "これは医療行為ですか？", a: "いいえ。診断・治療は連携する医療機関が行います。必要な段階のみ、紹介手数料ゼロで中立にご案内します。" },
  { q: "匿名で受けられますか？", a: "はい。本名・顔・実年齢は不要です。会員IDで運用し、完全守秘義務のもとで扱います。" },
  { q: "途中でやめられますか？", a: "無理に続けることはありません。定着を設計に含め、つながり方も選べます。" },
];

export default function MembershipLanding({ p }: { p: ExperiencePackage }) {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="bg-[#f4f6f2] text-[#1f2a1d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* ===== Hero ===== */}
      <section className="relative bg-[#16241a] text-[#EDF1E8] overflow-hidden">
        <div aria-hidden className="absolute -top-24 -right-16 w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.18)" }} />
        <div className="relative max-w-[1000px] mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-16 sm:pb-20">
          <nav aria-label="パンくず" className="text-[12px] text-[#9FB0A0] mb-8">
            <Link href="/" className="hover:text-[#EDF1E8]">ホーム</Link>
            <span className="mx-1.5">/</span>
            <Link href="/#packages" className="hover:text-[#EDF1E8]">改善プログラム</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[#EDF1E8]">{p.name}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#85AB8B]">By invitation only</span>
            <span className="inline-flex items-center rounded-full bg-[#85AB8B]/20 text-[#85AB8B] px-2.5 py-0.5 text-[10.5px] font-bold">完全招待制</span>
          </div>

          <h1 className="text-[2.1rem] sm:text-[3rem] leading-[1.3] max-w-3xl" style={HEAD}>
            コンプレックスから自信まで、<br className="hidden sm:block" />
            <span className="text-[#85AB8B]">専属が、一気通貫で伴走する。</span>
          </h1>
          <p className="mt-6 text-[14.5px] sm:text-[16px] text-[#C9D2C4] leading-[2] max-w-xl">
            {p.name}は、複数の悩みを根本から・継続的に整えるための、年間伴走プログラム。
            完全匿名・完全守秘義務のもと、中立に専門家を束ねて、定着までご一緒します。
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {(p.highlights ?? []).map((h) => (
              <span key={h} className="text-[11.5px] text-[#D7DED2] bg-white/[0.07] border border-white/10 rounded-full px-3 py-1">{h}</span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <BookingCTA className="bg-[#EDF1E8] hover:bg-white text-[#16241a] text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">
              招待をリクエストする（完全匿名）
            </BookingCTA>
            <span className="text-[12.5px] text-[#9FB0A0]">{p.duration}・{p.price}</span>
          </div>
        </div>
      </section>

      <div className="max-w-[1000px] mx-auto px-6 sm:px-10 py-16 sm:py-24 space-y-20">
        {/* ===== なぜ会員か ===== */}
        <section className="max-w-2xl">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#3d5638] font-medium mb-4">Why membership</div>
          <h2 className="text-[1.7rem] sm:text-[2.1rem] leading-[1.4]" style={HEAD}>
            単発では、続かない。
          </h2>
          <p className="mt-5 text-[14.5px] text-[#4b5b47] leading-[2]">
            悩みは縦割りで、どこに相談していいか分かりにくい。人に言うのも、ためらう。
            だから「理解 → 整理 → 選ぶ → 実行 → 定着」を、ひとりの専属が、匿名のまま一気通貫で。
          </p>
        </section>

        {/* ===== プログラムの柱 ===== */}
        <section>
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#3d5638] font-medium mb-6">Program</div>
          <div className="grid sm:grid-cols-2 gap-5">
            {PILLARS.map((x, i) => (
              <div key={x.t} className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 p-7">
                <div className="font-mono text-[12px] text-[#85AB8B] mb-2">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="text-[1.15rem] font-bold text-[#1f2a1d] mb-2" style={HEAD}>{x.t}</h3>
                <p className="text-[13.5px] text-[#4b5b47] leading-[1.95]">{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 選ばれる理由 ===== */}
        <section>
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#3d5638] font-medium mb-6">Why us</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {REASONS.map((x) => (
              <div key={x.t} className="rounded-[1.2rem] bg-[#eef1ea] p-5">
                <div className="text-[14px] font-bold text-[#1f2a1d] mb-1.5" style={HEAD}>{x.t}</div>
                <p className="text-[12px] text-[#4b5b47] leading-[1.8]">{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== 1年の流れ ===== */}
        <section>
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#3d5638] font-medium mb-6">The Journey</div>
          <ol className="relative border-l border-[#1f2a1d]/12 ml-2 space-y-7">
            {TIMELINE.map((s) => (
              <li key={s.n} className="relative pl-7">
                <span className="absolute -left-[9px] top-1 grid place-items-center w-[18px] h-[18px] rounded-full bg-[#16241a] text-[#EDF1E8] font-mono text-[9px] font-bold">{s.n}</span>
                <h3 className="text-[1.05rem] font-bold text-[#1f2a1d]" style={HEAD}>{s.t}</h3>
                <p className="mt-1 text-[13.5px] text-[#4b5b47] leading-[1.9]">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ===== 会員・料金 ===== */}
        <section className="rounded-[1.6rem] bg-[#16241a] text-[#EDF1E8] p-8 sm:p-10 text-center">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#85AB8B] mb-3">Membership</div>
          <h2 className="text-[1.5rem] sm:text-[1.9rem] leading-[1.4]" style={HEAD}>完全招待制・選考制。</h2>
          <p className="mt-4 text-[13.5px] text-[#C9D2C4] leading-[1.95] max-w-md mx-auto">
            品質を保つため、枠を限定しています。料金は内容により異なり、選考後に個別でご提示します。
            まずは完全匿名の無料相談から。
          </p>
          <div className="mt-6">
            <BookingCTA className="bg-[#EDF1E8] hover:bg-white text-[#16241a] text-sm font-semibold px-8 py-4 rounded-full transition-colors">
              招待をリクエストする（完全匿名）
            </BookingCTA>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section>
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#3d5638] font-medium mb-6">FAQ</div>
          <dl className="rounded-[1.4rem] bg-white border border-[#1f2a1d]/10 px-6 divide-y divide-[#1f2a1d]/10">
            {FAQS.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="text-[14px] font-bold text-[#1f2a1d] mb-1.5">{f.q}</dt>
                <dd className="text-[13px] text-[#4b5b47] leading-[1.95]">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="text-[12px] text-[#6b7a66] leading-[1.9]">
          ※ 本プログラムは医療行為ではありません。診断・治療は連携する医療機関が行います。
          特定の医療機関・商品を推奨せず、紹介手数料は受け取りません（中立）。効果・成果を保証するものではありません。
        </p>

        <div>
          <Link href="/#packages" className="text-[13px] text-[#3d5638] font-semibold hover:opacity-70 transition-opacity">
            ← すべてのパッケージ
          </Link>
        </div>
      </div>
    </div>
  );
}
