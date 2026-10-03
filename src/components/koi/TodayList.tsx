import type { Todo } from "@/lib/koi/board";

/* 今日やること。
 *
 * ══════════════════════════════════════════════════
 * 一覧より先に出す
 * ══════════════════════════════════════════════════
 * 開く理由は「今日は何をすればいいか」なので、
 * 相手の一覧より先に、これを出す。
 *
 * ══════════════════════════════════════════════════
 * 待つことも、やること
 * ══════════════════════════════════════════════════
 * 次の一手が無い人を落とさない。「今日は待つ」と出す。
 * 落とすと、待つと決めたことまで忘れる。
 *
 * 待つ人は薄くするが、消さない。
 * 「対応不要」とは書かない。何もしないと決めたのは本人なので。
 */

export default function TodayList({ items }: { items: Todo[] }) {
  if (items.length === 0) return null;

  return (
    <ol className="flex flex-col gap-2">
      {items.map((t, i) => (
        <li
          key={t.id}
          className="flex items-start gap-3 rounded-soft bg-paper px-3.5 py-3 shadow-card"
        >
          <span
            aria-hidden
            className={`mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
              t.waiting ? "bg-mist text-steel" : "bg-brand text-paper"
            }`}
          >
            {i + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-[13.5px] font-bold leading-[1.6] text-steel">{t.who}</span>
            <span
              className={`ml-2 text-[14px] leading-[1.6] ${
                t.waiting ? "text-steel" : "font-bold text-slate"
              }`}
            >
              {t.what}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
