// 記事内の体験提案 — 検索/AI経由で記事にたどり着いた読者を、
// 自然に「第一印象改善パッケージ」へ橋渡しする（SEO/GEO → 記事 → 体験）。
// 煽らず、記事の文脈から地続きに提案する。
import Link from "next/link";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

/** 記事の領域に合わせた一言（省略時は汎用）。 */
export default function ExperienceInvite({ context }: { context?: string }) {
  return (
    <aside className="my-12 rounded-[1.4rem] bg-[#16241a] text-[#EDF1E8] p-6 sm:p-8 overflow-hidden relative">
      <div aria-hidden className="absolute -top-14 -right-8 w-56 h-56 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.16)" }} />
      <div className="relative">
        <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#85AB8B] mb-2">Experience</div>
        <h3 className="text-[1.2rem] sm:text-[1.45rem] font-bold text-[#EDF1E8] leading-[1.4] mb-2.5" style={MINCHO}>
          仕組みを知ったら、<span className="text-[#85AB8B]">整える一日を。</span>
        </h3>
        <p className="text-[13px] text-[#C9D2C4] leading-[1.95] max-w-[34rem] mb-5">
          {context ? `${context}。` : ""}
          His Recoveries では、メイク・服・写真を専属チームと過ごす一日で、第一印象をまるごと整えます。
          完全匿名で、はじめてでも。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/packages/first-impression" className="inline-flex items-center gap-2 rounded-full bg-[#EDF1E8] hover:bg-white text-[#16241a] text-[13px] font-semibold px-6 py-3 transition-colors">
            第一印象改善パッケージを見る <span aria-hidden>→</span>
          </Link>
          <Link href="/apply" className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:border-white/60 text-[#EDF1E8] text-[13px] font-semibold px-6 py-3 transition-colors">
            匿名で相談する
          </Link>
        </div>
      </div>
    </aside>
  );
}
