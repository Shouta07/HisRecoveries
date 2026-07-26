import type { Citation } from "@/lib/citations";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontWeight: 800,
  letterSpacing: "0.01em",
  fontFeatureSettings: '"palt" 1',
};

// 出典の種別バッジ。読者が「どのくらい確かな情報源か」を一目で判断できるように。
// 公的機関・学会を上位に置く（docs/CURATION_PLAYBOOK.md §3）。
const KIND_STYLE: Record<Citation["kind"], string> = {
  公的機関: "bg-[#16241A] text-[#EDF1E8]",
  学会: "bg-[#3d5638] text-white",
  医学情報: "bg-[#eef3ea] text-[#3d5638]",
};

/**
 * 出典・参考リンク（キュレーションの「従」）。
 *
 * - quote があるものは、著作権法32条の引用として「」付き・blockquote で明瞭に区別し、
 *   出典名・URL・原文確認日を必ず添える（型で verifiedAt が必須になっている）。
 * - quote が無いものは「参考リンク」として、リンクと中立な一言のみを出す。
 *   要約や言い換えを引用のように見せない。
 * - 外部リンクは別タブ・nofollow。
 */
export default function Citations({
  items,
  heading = "出典・参考リンク",
}: {
  items: Citation[];
  heading?: string;
}) {
  if (items.length === 0) return null;

  const hasQuote = items.some((q) => q.quote);

  return (
    <section className="mt-12">
      <h2 className="text-[1.05rem] font-bold text-[#1f2a1d] mb-1" style={HEAD}>
        {heading}
      </h2>
      <p className="text-[12.5px] text-[#6b7a66] leading-[1.85] mb-4">
        本文は His Recoveries が書いた解説です。その裏づけとして参照した情報源を、
        公的機関・学会を優先して明記します
        {hasQuote ? "（引用は「」で区別し、原文を確認した日を併記しています）" : "（本文は引用ではなく、参照した情報源へのリンクです）"}。
      </p>
      <ul className="space-y-3">
        {items.map((q) => (
          <li key={q.url} className="rounded-[1rem] border border-[#1f2a1d]/10 bg-white p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${KIND_STYLE[q.kind]}`}>
                {q.kind}
              </span>
              {q.verifiedAt && (
                <span className="text-[11px] text-[#9aa79a]">原文確認: {q.verifiedAt}</span>
              )}
            </div>

            {q.quote ? (
              <blockquote className="border-l-2 border-[#85AB8B] pl-3">
                <p className="text-[13.5px] text-[#1f2a1d] leading-[1.95]">「{q.quote}」</p>
                <footer className="mt-2 text-[12px] text-[#6b7a66]">
                  — {q.source}
                  <a
                    href={q.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="ml-2 text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-2 hover:decoration-[#3d5638]"
                  >
                    原文を読む↗
                  </a>
                </footer>
              </blockquote>
            ) : (
              <div className="flex items-start gap-2">
                <span className="text-[#85AB8B] mt-px" aria-hidden>›</span>
                <p className="text-[13px] text-[#3a423a] leading-[1.85]">
                  <a
                    href={q.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="font-semibold text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-2 hover:decoration-[#3d5638]"
                  >
                    {q.source}↗
                  </a>
                  <span className="text-[#6b7a66]"> — {q.note}</span>
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
