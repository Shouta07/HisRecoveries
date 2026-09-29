"use client";

import { useEffect, useState } from "react";
import { latestThread, shortDate, type Thread } from "@/lib/myasks";
import { track } from "@/lib/analytics";

// 前回の続きとして相談する。
//
// ══════════════════════════════════════════════════
// 毎回ゼロから説明させない
// ══════════════════════════════════════════════════
// 単発の相談を並べるだけだと、2回目から面倒になる。
// 「前に写真を見てもらった人です」を毎回書くのは、書くほうが疲れる。
//
// 同じ相手についての相談をまとめておいて、
// 次に開いたときに「前回の続き」から入れるようにする。
//
// ══════════════════════════════════════════════════
// 相手の情報は持たない
// ══════════════════════════════════════════════════
// 名前もアプリ名も保存しない。端末の中でも持たない。
// 持つのは、本人が自分で付けた短いラベルだけ。
// サーバーには送らない（送ると誰がどの相談を出したかの対応表になる）。

export default function Continue({
  onPick,
}: {
  /** 続きとして選んだとき。まとまりのIDを渡す */
  onPick: (thread: Thread) => void;
}) {
  const [t, setT] = useState<Thread | null>(null);

  useEffect(() => {
    setT(latestThread());
  }, []);

  if (!t || t.items.length === 0) return null;

  return (
    <button
      type="button"
      onClick={() => {
        track("continue_picked", { n: t.items.length });
        onPick(t);
      }}
      className="mt-5 flex w-full items-center justify-between gap-3 rounded-card border border-brand bg-brand-tint px-5 py-4 text-left transition-shadow hover:shadow-card"
    >
      <span className="min-w-0">
        <span className="block text-[12px] font-bold text-brand-deep">前回の続きとして相談する</span>
        <span className="mt-1 block truncate text-[14.5px] font-bold text-slate">
          {t.label}
          <span className="ml-2 font-normal text-steel">
            {t.items.length}回目 · {shortDate(t.at)}
          </span>
        </span>
      </span>
      <span aria-hidden className="shrink-0 text-[15px] text-brand">
        →
      </span>
    </button>
  );
}
