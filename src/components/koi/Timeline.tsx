import type { TimelineItem } from "@/lib/koi/timeline";

/* 相手ごとの、ここまで。
 *
 * ══════════════════════════════════════════════════
 * 縦の線で、進んできたことを見せる
 * ══════════════════════════════════════════════════
 * 「毎回、最初から説明しなくていい」を文字で主張しても伝わらない。
 * いつ何があったかが並んでいれば、見れば分かる。
 *
 * 最後の1件だけ色を付ける。いまここ、が分かるように。
 * それ以外は同じ太さにする。どれが重要かは、こちらが決めない。
 */

export default function Timeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) return null;

  return (
    <ol className="flex flex-col">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <li key={`${it.date}-${it.what}`} className="flex gap-3">
            {/* 日付と線 */}
            <div className="flex shrink-0 flex-col items-end">
              <span className="w-[3.2em] pt-[1px] text-right text-[11.5px] font-bold tabular-nums text-steel">
                {it.date}
              </span>
            </div>

            <div className="flex shrink-0 flex-col items-center">
              <span
                aria-hidden
                className={`mt-[6px] h-2 w-2 shrink-0 rounded-full ${
                  last ? "bg-brand" : "bg-line"
                }`}
              />
              {/* 最後の行には線を引かない（続きがあるように見える） */}
              {!last && <span aria-hidden className="w-px flex-1 bg-line" />}
            </div>

            <div className={`min-w-0 flex-1 ${last ? "pb-0" : "pb-4"}`}>
              <p
                className={`text-[13.5px] leading-[1.6] ${
                  last ? "font-black text-slate" : "font-bold text-steel"
                }`}
              >
                {it.what}
              </p>
              {it.next && (
                <p className="mt-0.5 text-[12px] leading-[1.6] text-steel">
                  <span className="font-black text-brand">NEXT</span> {it.next}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
