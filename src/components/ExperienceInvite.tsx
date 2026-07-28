// 記事内の主力コンバージョンブロック — 検索/AIで記事に来た読者を、
// 記事の文脈から地続きに、低摩擦（まず無料・匿名の相談）で体験へ橋渡しする。
// 煽らず・断定せず・寄り添う。価格は前に出さず、まず"相談"の関係から。
import Link from "next/link";
import BookingCTA from "@/components/BookingCTA";
import ConsultLink from "@/components/ConsultLink";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

// 商品は「第一印象改善プラン（30日 ¥49,800 税込）」の1本のみ。
// ここに別プランを増やさないこと（増やすと記事からの導線が割れる）。
const STEPS = ["カウンセリング", "改善プラン", "1日で整える", "30日の伴走"];

/** 記事の文脈に合わせた一言（省略時は汎用）。 */
export default function ExperienceInvite({ context }: { context?: string }) {
  return (
    <aside className="my-12 rounded-[1.6rem] bg-[#16241a] text-[#EDF1E8] p-7 sm:p-9 overflow-hidden relative">
      <div aria-hidden className="absolute -top-16 -right-10 w-60 h-60 rounded-full blur-3xl" style={{ background: "rgba(133,171,139,0.18)" }} />
      <div className="relative">
        <div className="hr-eyebrow hr-eyebrow-on-dark mb-3">Experience</div>
        <h3 className="text-[1.3rem] sm:text-[1.55rem] font-bold text-[#EDF1E8] leading-[1.45] mb-3" style={MINCHO}>
          {context ? <>{context}。<br /></> : null}
          ひとりで抱えず、<span className="text-[#85AB8B]">30日で整える。</span>
        </h3>
        <p className="text-[14.5px] text-[#C9D2C4] leading-[1.95] max-w-[34rem] mb-4">
          読んで分かっても、自分に合う形にするのは難しいもの。His Recoveries は、
          何をやるかを決めて、眉・メイク・服・髪型・撮影を1日で整え、自分で再現できるまで見届けます。
          プランは<span className="text-[#EDF1E8] font-semibold">30日 ¥49,800（税込・先着10名）</span>の1本だけです。
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {STEPS.map((s, i) => (
            <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.07] border border-white/10 px-3 py-1 text-[12.5px] text-[#D7DED2]">
              <span className="text-[#85AB8B] font-mono text-[10px]">{String(i + 1).padStart(2, "0")}</span>
              {s}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BookingCTA className="bg-[#EDF1E8] hover:bg-white text-[#16241a] text-sm font-semibold px-7 py-3.5 rounded-full transition-colors">
            無料で相談する
          </BookingCTA>
          <Link href="/#pricing" className="inline-flex items-center gap-2 rounded-full border border-white/25 hover:border-white/60 text-[#EDF1E8] text-sm font-semibold px-6 py-3.5 transition-colors">
            プランの中身を見る <span aria-hidden>→</span>
          </Link>
        </div>

        <p className="mt-4 text-[12px] text-[#9FB0A0] leading-[1.8]">
          はじめの相談は無料・完全守秘。実名・顔写真は不要です。実施は東京都内・土日のみ。整えるかどうかは、読んでから決めていただけます。
        </p>
      </div>
    </aside>
  );
}

/** 本文の途中に差し込む、低摩擦の"そっと相談"ナッジ（離脱前の受け皿）。 */
export function InlineConsult() {
  return (
    <div className="my-9 flex flex-col sm:flex-row sm:items-center gap-3 rounded-[1.1rem] border border-[#3d5638]/20 bg-[#eef3ea]/70 px-5 py-4">
      <p className="text-[14px] text-[#3a423a] leading-[1.75] flex-1">
        読むだけでも大丈夫。でも「自分に合う形」が知りたくなったら、いつでも無料で相談できます。
      </p>
      <ConsultLink className="shrink-0 inline-flex items-center gap-1 text-[14px] font-semibold text-[#3d5638] hover:opacity-70 transition-opacity whitespace-nowrap">
        無料で相談する <span aria-hidden>→</span>
      </ConsultLink>
    </div>
  );
}
