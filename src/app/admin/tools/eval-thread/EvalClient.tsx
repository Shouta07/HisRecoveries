"use client";

import { useMemo, useState } from "react";
import { evaluateThreadsPost } from "@/lib/threadsEval";

const EXAMPLES = [
  `歯を磨いているあいだ、\n鏡の中央に視線を置けなかった時期がある。\n\n自分の顔の、どこか一点を、毎朝そっと避けていた。`,
  `今すぐ無料診断！🎉 多汗症は必ず治ります！あなたも乗り越えよう #多汗症 #モテ`,
];

export default function EvalClient() {
  const [text, setText] = useState("");
  const result = useMemo(() => evaluateThreadsPost(text), [text]);
  const levelColor: Record<typeof result.level, string> = {
    good: "border-gold text-gold",
    review: "border-gold/50 text-ink",
    block: "border-red-600 text-red-600",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <label className="block">
          <span className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
            投稿本文
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            placeholder="投稿前の本文を貼り付けて評価"
            className="mt-3 w-full bg-paper border border-hair-line text-ink px-4 py-3 font-mono text-[13.5px] leading-[1.85] focus:outline-none focus:border-gold"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setText(ex)}
              className="border border-hair-line hover:border-gold hover:text-gold transition-colors px-3 py-1.5 text-ink"
            >
              例 {i + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setText("")}
            className="border border-hair-line hover:border-gold hover:text-gold transition-colors px-3 py-1.5 text-sub-gray"
          >
            クリア
          </button>
        </div>
      </div>

      <div>
        <div className="bg-paper border border-hair-line p-5">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <p className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
              評価
            </p>
            <span
              className={`text-[11px] tracking-[0.1em] uppercase border px-2 py-0.5 ${levelColor[result.level]}`}
            >
              {result.level}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mincho text-3xl text-ink tabular-nums">
              {result.score}
              <span className="text-[12px] text-sub-gray ml-1">/ 100</span>
            </p>
            <p className="text-[12px] text-sub-gray tabular-nums">
              {result.charCount} 字
            </p>
          </div>
          <div className="mt-3 h-1.5 bg-cream-deep">
            <div
              className="h-1.5 bg-gold"
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
            指摘
          </p>
          {result.rules.length === 0 ? (
            <p className="text-[13px] text-sub-gray border border-hair-line p-4">
              指摘なし。
            </p>
          ) : (
            <ul className="space-y-2">
              {result.rules.map((r) => (
                <li
                  key={r.id}
                  className={`border p-3 text-[12.5px] leading-[1.85] ${
                    r.level === "error"
                      ? "border-red-600/60 bg-red-50"
                      : r.level === "warn"
                        ? "border-gold/50 bg-cream-deep/30"
                        : "border-hair-line bg-paper"
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-[10px] tracking-[0.1em] uppercase px-1.5 py-0.5 border ${
                        r.level === "error"
                          ? "border-red-600 text-red-600"
                          : r.level === "warn"
                            ? "border-gold text-gold"
                            : "border-hair-line text-sub-gray"
                      }`}
                    >
                      {r.level}
                    </span>
                    <span className="text-ink">{r.message}</span>
                  </div>
                  {r.matches && r.matches.length > 0 && (
                    <p className="mt-1 text-sub-gray font-mono text-[11.5px]">
                      → {r.matches.join(" / ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
