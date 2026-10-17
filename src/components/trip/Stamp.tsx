/* 済んだことの印。旅券のスタンプに寄せる。
 *
 * ══════════════════════════════════════════════════
 * ここだけ、色を変える
 * ══════════════════════════════════════════════════
 * ページの主色は青。印だけ accent（既存のトークン）を使う。
 * 新しい色は足していない。使っていなかったものを1か所だけ使う。
 *
 * 理由は2つ。
 *   青のままだと、NEXT（次にやること）と同じ重さに見える
 *   インクの色が違うほうが、押した跡に見える
 *
 * 少し傾ける。まっすぐだと、システムが付けた印に見える。
 * 斜めだと、手で押したものに見える。
 *
 * 傾きは2度まで。それ以上は、ふざけて見える。
 * 初めての一人旅で緊張している人の画面に、おどけた要素は置かない。
 *
 * ── 行の高さに、引き伸ばさない ──────────────────
 * 本文が折り返す行（帰国。両替は空港より街中がよかった）で、
 * 印が2行ぶんの高さの箱になっていた。
 * flex の中で高さを伸ばされるので、self-start と高さで止める。
 */
export default function Stamp({ children = "済" }: { children?: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="mt-[2px] inline-flex h-[17px] shrink-0 self-start -rotate-2 items-center justify-center rounded-[3px] border border-accent px-1.5 text-[10px] font-black leading-none tracking-[0.08em] text-accent"
    >
      {children}
    </span>
  );
}
