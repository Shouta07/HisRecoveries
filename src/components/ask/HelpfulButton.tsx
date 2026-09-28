"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

// 「役に立った」を押す。
//
// ── 押さなくていい ────────────────────────────────
// 必須にしない。押さなかったことを責めない。
// 未評価のままでも、回答者の側で不利にならないようにしてある
// （割合は、評価が付いた分だけで計算する）。
//
// ── 押したあとは静かに ────────────────────────────
// ありがとうの演出は出さない。押した印が残るだけ。

export default function HelpfulButton({
  token,
  responseId,
  initial,
}: {
  token: string;
  responseId: string;
  initial: boolean | null;
}) {
  const [value, setValue] = useState<boolean | null>(initial);
  const [busy, setBusy] = useState(false);

  async function send(next: boolean) {
    if (busy) return;
    setBusy(true);
    const before = value;
    setValue(next); // 押した感じを先に返す
    try {
      const res = await fetch("/api/helpful", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, responseId, helpful: next }),
      });
      if (!res.ok) {
        setValue(before); // 戻す。押せたように見せたまま記録されない、をなくす
      } else {
        track("helpful_marked", { helpful: next });
      }
    } catch {
      setValue(before);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        type="button"
        onClick={() => send(true)}
        aria-pressed={value === true}
        className={`inline-flex min-h-[40px] items-center px-3 text-[10.5px] font-bold uppercase tracking-[0.12em] transition-colors ${
          value === true
            ? "bg-lime text-void"
            : "border border-rule text-ash hover:border-void hover:text-void"
        }`}
      >
        役に立った
      </button>
      <button
        type="button"
        onClick={() => send(false)}
        aria-pressed={value === false}
        className={`inline-flex min-h-[40px] items-center px-3 text-[10.5px] font-bold uppercase tracking-[0.12em] transition-colors ${
          value === false
            ? "bg-void text-bone"
            : "border border-rule text-ash hover:border-void hover:text-void"
        }`}
      >
        そうでもない
      </button>
    </div>
  );
}
