"use client";

import { track } from "@/lib/analytics";
import { lineReady, lineUrl } from "@/lib/contact";

/* ══════════════════════════════════════════════════
   LINE へ送るボタン
   ══════════════════════════════════════════════════

   ── 押されたことだけを、数える ──────────────────
   ここで数えるのは「押された」まで。

   押した人が、実際に LINE を送ったかどうかは
   こちらからは見えない。追加して、何も書かずに閉じる人がいる。

   そこが落ちているのかを知りたいのに、
   クリックを「相談が届いた」と同じ数字にしてしまうと、
   永久に分からなくなる。

   届いた数は、運営者が手元で数える（docs/運用メモ.md）。

   ── 中身は送らない ──────────────────────────────
   送るのは、押された場所（where）だけ。
   行き先も日程も相談内容も、解析には入れない。

   ── URL が無いときは、押せる形にしない ────────────
   「準備中」にリンクを張るのも同じ。
   押せる見た目をしている時点で、動くと約束している。 */

export default function LineCta({
  where,
  label,
  notReady,
  className,
  notReadyClassName,
}: {
  /** 押された場所。hero / been / pricing / city / final */
  where: string;
  label: string;
  notReady: string;
  className: string;
  notReadyClassName: string;
}) {
  if (!lineReady) {
    return <p className={notReadyClassName}>{notReady}</p>;
  }
  return (
    <a
      href={lineUrl ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => track("line_cta_click", { where })}
    >
      {label}{" "}
      <span aria-hidden className="ml-2">
        ↗
      </span>
    </a>
  );
}
