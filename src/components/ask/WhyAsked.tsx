"use client";

import { useState } from "react";
import { WHY_REASONS, type WhyReason } from "@/lib/ask/why";
import { AttributeChip as Chip } from "@/components/brand/kit";

// 結果を見たあとの1問。任意。
//
// ── 邪魔をしない ──────────────────────────────────
// 結果より先に出さない。閉じられるようにする。
// 答えないまま閉じた人を追いかけない。

export default function WhyAsked({ token }: { token: string }) {
  const [picked, setPicked] = useState<WhyReason[]>([]);
  const [state, setState] = useState<"open" | "sent" | "closed">("open");

  if (state === "closed") return null;

  if (state === "sent") {
    return (
      <p className="mt-12 rounded-card border border-line bg-mist px-5 py-4 text-[13.5px] text-steel">
        ありがとうございます。
      </p>
    );
  }

  async function send() {
    if (picked.length === 0) return;
    setState("sent");
    // 失敗しても画面は戻さない。答えた人にやり直しを求める種類の情報ではない。
    await fetch("/api/consult/why", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, reasons: picked }),
    }).catch(() => {});
  }

  return (
    <section className="mt-12 rounded-card border border-line bg-mist p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[14.5px] font-bold">
          なぜ、人にも聞きましたか？
          <span className="ml-2 text-[12px] font-normal text-steel">任意・複数可</span>
        </p>
        <button
          type="button"
          onClick={() => setState("closed")}
          aria-label="閉じる"
          className="-m-2 shrink-0 p-2 text-[13px] text-steel transition-colors hover:text-slate"
        >
          閉じる
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {WHY_REASONS.map((r) => (
          <Chip
            key={r.id}
            on={picked.includes(r.id)}
            onClick={() =>
              setPicked((prev) =>
                prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id],
              )
            }
          >
            {r.label}
          </Chip>
        ))}
      </div>

      <button
        type="button"
        onClick={send}
        disabled={picked.length === 0}
        className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-pill bg-brand px-6 text-[14px] font-bold text-paper shadow-card transition-shadow hover:shadow-card-hover disabled:bg-line disabled:text-steel disabled:shadow-none"
      >
        送る
      </button>
    </section>
  );
}
