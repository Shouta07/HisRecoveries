import type { BoardCard } from "@/lib/koi/board";
import { boardLine } from "@/lib/koi/board";

/* 相手の一覧。
 *
 * ══════════════════════════════════════════════════
 * 1画面で、現在地が分かること
 * ══════════════════════════════════════════════════
 * 困っているのは「恋愛相談がしたい」ではない。
 *   withのAさん、昨日何話したっけ
 *   PairsのBさん、電話いつするんやっけ
 * アプリが複数、相手が複数。そのたびに判断が増える。
 *
 * だから1枚に、誰と・どのアプリで・どこまで・次に何を、を入れる。
 *
 * ══════════════════════════════════════════════════
 * 業務ツールに見せない
 * ══════════════════════════════════════════════════
 * 表（テーブル）で並べると、恋愛が案件になる。
 * カードを縦に積む。スマホで1枚ずつ読める形にする。
 *
 * NEXT だけ色を変える。開いた人が最初に見るのはそこ。
 *
 * ══════════════════════════════════════════════════
 * 急かさない
 * ══════════════════════════════════════════════════
 * 「3日連絡していません」は出さない。赤くしない。
 * 次にやることが無い人は「いまは待つ」と出す。
 * 待つと決めたことも、立派な判断なので消さない。
 */

export default function PersonBoard({
  cards,
  /** 押せるようにするか。見本として出すときは押せない */
  hrefOf,
}: {
  cards: BoardCard[];
  hrefOf?: (c: BoardCard) => string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12.5px] font-bold leading-[1.7] text-steel">{boardLine(cards)}</p>

      <ul className="flex flex-col gap-2.5">
        {cards.map((c) => {
          const inner = (
            <>
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-[15.5px] font-black leading-[1.3] text-slate">{c.who}</span>
                {c.app && (
                  <span className="rounded-pill bg-mist px-2 py-0.5 text-[10.5px] font-bold text-steel">
                    {c.app}
                  </span>
                )}
                {c.stage && (
                  <span className="text-[12px] font-bold text-steel">{c.stage}</span>
                )}
              </div>

              {/* 開いた人が最初に見るのはここ。ここだけ色を変える */}
              <div className="mt-2.5 flex items-start gap-2 border-t border-line pt-2.5">
                <span
                  aria-hidden
                  className="mt-[1px] shrink-0 text-[10px] font-black tracking-wide text-brand"
                >
                  NEXT
                </span>
                <span
                  className={`min-w-0 text-[13.5px] font-bold leading-[1.6] ${
                    c.next ? "text-slate" : "text-steel"
                  }`}
                >
                  {c.next ?? "いまは待つ"}
                </span>
              </div>
            </>
          );

          return (
            <li key={c.id}>
              {hrefOf ? (
                <a
                  href={hrefOf(c)}
                  className="block rounded-card border border-line bg-paper p-4 shadow-card transition-shadow hover:shadow-card-hover"
                >
                  {inner}
                </a>
              ) : (
                <div className="rounded-card border border-line bg-paper p-4 shadow-card">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
