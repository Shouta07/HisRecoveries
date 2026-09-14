"use client";

import { useState } from "react";
import Link from "next/link";
import { FEEL_LABEL, type Feel } from "@/lib/relationship";
import { questionFor } from "@/lib/reflection";
import { track } from "@/lib/analytics";

// トップのヒーローで、その場で触れる記録（§7・§8）。
//
// ── スマホのモックアップを置かない ────────────────
// 画面の絵を見せても、何が起きるかは伝わらない。押せるものを置く。
// 「説明 → 理解 → クリック」ではなく「触る → 理解する → 続きをやりたくなる」。
//
// ── 2問目はデモ用に書かない ────────────────────────
// ここで返す問いは、アプリの中で使っている questionFor() そのもの。
// デモ専用の文言を別に持つと、押した先で言うことが変わる。
// 「ここで見たものが、そのまま出てくる」ことのほうが、うまい文言より効く。
//
// ── ここで全部は記録させない ──────────────────────
// 1〜2回触ってもらって、続きはアプリへ。
// 押した答えは URL で引き継ぐので、同じ問いを二度見せない。

const FEELS: Feel[] = ["fun", "again", "unsure", "off"];

export default function RecordDemo() {
  const [feel, setFeel] = useState<Feel | null>(null);

  if (!feel) {
    return (
      <div className="rounded-[14px] border border-hairline bg-surface p-5 sm:p-6">
        <p className="text-[11.5px] font-medium tracking-[0.12em] text-faint">きょうの記録</p>
        <p className="mt-3 font-display text-[19px] font-bold leading-[1.6] text-charcoal">
          今日は、どうでしたか？
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          {FEELS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFeel(f);
                track("hero_option_selected", { feel: f });
              }}
              className="flex min-h-[52px] w-full items-center rounded-[12px] border border-hairline bg-ground px-4 text-left text-[15px] text-charcoal transition-colors duration-200 hover:border-faint/50"
            >
              {FEEL_LABEL[f]}
            </button>
          ))}
        </div>
        <p className="mt-5 text-[12.5px] leading-[1.8] text-faint">
          押すと、続きが出ます。ここでは何も保存されません。
        </p>
      </div>
    );
  }

  const q = questionFor({ id: "demo", date: "", feel });

  return (
    <div className="motion-safe:animate-hr-rise rounded-[14px] border border-hairline bg-surface p-5 sm:p-6">
      <p className="text-[11.5px] font-medium tracking-[0.12em] text-faint">きょうの記録</p>

      {/* 押したものを、そのまま返す。ここが「残る」の最初の体験になる */}
      <p className="mt-3 border-l border-accent pl-3.5 text-[16px] font-bold leading-[1.8] text-charcoal">
        {FEEL_LABEL[feel]}
      </p>

      <p className="mt-6 text-[11.5px] font-medium tracking-[0.12em] text-faint">
        少し振り返ってみる
      </p>
      <p className="mt-2.5 font-display text-[18px] font-bold leading-[1.75] text-charcoal">
        {q.q}
      </p>
      {q.why && <p className="mt-2 text-[13px] text-faint">{q.why}</p>}

      <div className="mt-6 flex flex-col gap-2.5">
        <Link
          href={`/app/new?feel=${feel}`}
          onClick={() => track("hero_continue_click", { feel })}
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[8px] bg-accent px-5 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-accent/90"
        >
          続きを記録する
        </Link>
        <button
          type="button"
          onClick={() => setFeel(null)}
          className="min-h-[44px] text-[13px] text-faint transition-colors hover:text-accent"
        >
          選び直す
        </button>
      </div>

      <p className="mt-4 text-[12.5px] leading-[1.8] text-faint">
        登録は要りません。記録はあなたの端末の中だけに残ります。
      </p>
    </div>
  );
}
