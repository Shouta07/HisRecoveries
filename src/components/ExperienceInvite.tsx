// 記事内の主力コンバージョンブロック — 検索/AIで記事に来た読者を、
// 記事の文脈から地続きに、低摩擦（まず無料・匿名の相談）で体験へ橋渡しする。
// 煽らず・断定せず・寄り添う。価格は前に出さず、まず"相談"の関係から。
import Link from "next/link";
import BookingCTA from "@/components/BookingCTA";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const STEPS = ["印象カウンセリング", "メイク", "服選び", "撮影"];

/** 記事の文脈に合わせた一言（省略時は汎用）。 */
export default function ExperienceInvite({ context }: { context?: string }) {
  return (
    <aside className="my-12 rounded-[1.6rem] bg-[#16241a] text-[#EDF1E8] p-7 sm:p-9 overflow-hidden relative">
      <div aria-hidden className="absolute -top-16 -right-10 w-60 h-60 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.18)" }} />
      <div className="relative">
        <div className="font-mono text-[10.5px] tracking-[0.2em] uppercase text-[#85AB8B] mb-2.5">Experience</div>
        <h3 className="text-[1.3rem] sm:text-[1.55rem] font-bold text-[#EDF1E8] leading-[1.45] mb-3" style={MINCHO}>
          {context ? <>{context}。<br /></> : null}
          ひとりで抱えず、<span className="text-[#85AB8B]">プロと一日で。</span>
        </h3>
        <p className="text-[13px] text-[#C9D2C4] leading-[1.95] max-w-[34rem] mb-4">
          読んで分かっても、自分に合う形にするのは難しいもの。His Recoveries は、
          メイク・服・写真まで、専属チームがあなたに合わせて一日で整えます。はじめてでも、完全匿名で。
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {STEPS.map((s, i) => (
            <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] border border-white/10 px-3 py-1 text-[11.5px] text-[#D7DED2]">
              <span className="text-[#85AB8B] font-mono text-[10px]">{String(i + 1).padStart(2, "0")}</span>
              {s}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BookingCTA className="bg-[#EDF1E8] hover:bg-white text-[#16241a] text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">
            まずは、そっと相談する
          </BookingCTA>
          <Link href="/packages/first-impression" className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:border-white/60 text-[#EDF1E8] text-sm font-semibold px-6 py-3.5 transition-colors">
            パッケージを見る <span aria-hidden>→</span>
          </Link>
        </div>

        <p className="mt-4 text-[11px] text-[#9FB0A0] leading-[1.8]">
          はじめの相談は無料・完全匿名。実名・顔写真は不要です。整えるかどうかは、読んでから決めて大丈夫。
        </p>
      </div>
    </aside>
  );
}

/** 本文の途中に差し込む、低摩擦の"そっと相談"ナッジ（離脱前の受け皿）。 */
export function InlineConsult() {
  return (
    <div className="my-9 flex flex-col sm:flex-row sm:items-center gap-3 rounded-[1.1rem] border border-[#3d5638]/20 bg-[#eef3ea]/70 px-5 py-4">
      <p className="text-[12.5px] text-[#3a423a] leading-[1.75] flex-1">
        読むだけでも大丈夫。でも「自分に合う形」が知りたくなったら、完全匿名で相談できます。
      </p>
      <Link href="/apply" className="shrink-0 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#3d5638] hover:opacity-70 transition-opacity whitespace-nowrap">
        そっと相談する <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
