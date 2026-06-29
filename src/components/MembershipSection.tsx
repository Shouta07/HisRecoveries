// ハイエンド会員（Recovery 会員）をホームに統合したセクション。
// プレミアム・コンシェルジュ型の要素を凝縮（完全招待制・匿名・中立・伴走）。
import { packages } from "@/lib/packages";
import BookingCTA from "@/components/BookingCTA";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const PILLARS = [
  { t: "専属コンシェルジュ", d: "文脈・履歴を覚えている専属の窓口。予約も決済も、ひとつに。" },
  { t: "現在地の可視化", d: "セルフ診断・記録、任意で血液などのデータで、いまを見える化。" },
  { t: "中立に束ねて実行", d: "悩みに合う専門家を中立に手配（紹介手数料ゼロ）。" },
  { t: "Webアプリで伴走", d: "記録し、共有し、変化を見える化。一度で終わらせない。" },
];

const STEPS = ["現在地の可視化", "ロードマップ設計", "中立に束ねて実行", "伴走・記録", "定着・つながり"];

export default function MembershipSection() {
  const p = packages.find((x) => x.id === "membership");
  if (!p) return null;

  return (
    <section id="membership" className="relative z-10 scroll-mt-24">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pb-20 md:pb-28">
        <div className="rounded-[2rem] bg-[#16241a] text-[#EDF1E8] overflow-hidden">
          <div className="relative p-7 sm:p-10 md:p-12">
            <div aria-hidden className="absolute -top-20 -right-12 w-80 h-80 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.16)" }} />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#85AB8B]">By invitation only</span>
                <span className="inline-flex items-center rounded-full bg-[#85AB8B]/20 text-[#85AB8B] px-2.5 py-0.5 text-[10.5px] font-bold">完全招待制</span>
              </div>

              <h2 className="text-[1.9rem] md:text-[2.4rem] leading-[1.35] max-w-3xl" style={{ ...MINCHO, fontWeight: 800 }}>
                コンプレックスから自信まで、<br className="hidden sm:block" />
                <span className="text-[#85AB8B]">専属が、一気通貫で伴走する。</span>
              </h2>
              <p className="mt-5 text-[14px] text-[#C9D2C4] leading-[2] max-w-xl">
                {p.name}は、複数の悩みを根本から・継続的に整える年間伴走プログラム。
                完全匿名・完全守秘義務のもと、中立に専門家を束ねて、定着までご一緒します。
              </p>

              {/* pillars */}
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {PILLARS.map((x, i) => (
                  <div key={x.t} className="rounded-[1.2rem] bg-white/[0.05] border border-white/10 p-5">
                    <div className="font-mono text-[11px] text-[#85AB8B] mb-1.5">{String(i + 1).padStart(2, "0")}</div>
                    <h3 className="text-[14.5px] font-bold text-[#EDF1E8] mb-1" style={MINCHO}>{x.t}</h3>
                    <p className="text-[12.5px] text-[#9FB0A0] leading-[1.85]">{x.d}</p>
                  </div>
                ))}
              </div>

              {/* flow */}
              <div className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-2 text-[12px] text-[#C9D2C4]">
                {STEPS.map((s, i) => (
                  <span key={s} className="inline-flex items-center gap-2">
                    <span>{s}</span>
                    {i < STEPS.length - 1 && <span aria-hidden className="text-[#85AB8B]">→</span>}
                  </span>
                ))}
              </div>

              {/* reasons + CTA */}
              <div className="mt-8 flex flex-wrap gap-2">
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

              <p className="mt-6 text-[11px] text-[#9FB0A0] leading-[1.8] max-w-2xl">
                ※ 本プログラムは医療行為ではありません。診断・治療は連携する医療機関が行います。特定の医療機関・商品を推奨せず、紹介手数料は受け取りません（中立）。効果・成果を保証するものではありません。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
