"use client";

import { useEffect, useState } from "react";
import { statsEnabled, setStatsEnabled } from "@/lib/analytics";

// 計測を止めるための切り替え。
//
// ── なぜ画面に出すか ──────────────────────────────
// プライバシーのページに「いつでも停止できます」と書いてある。
// 切る場所が無ければ、それは嘘になる。
// 切ると、次に読み込んだときから計測タグ自体を読み込まない。
//
// ── サーバーには出さない ──────────────────────────
// 設定はこの端末の中だけ。どの端末が断ったかを、こちらで持たない。

export default function StatsToggle() {
  // サーバーとクライアントで食い違うので、最初は決めない。
  const [on, setOn] = useState<boolean | null>(null);

  useEffect(() => {
    setOn(statsEnabled());
  }, []);

  if (on === null) return null;

  return (
    <div className="mt-5 rounded-[3px] border border-[#D6DCDC] bg-white/60 p-5">
      <p className="text-[14px] leading-[1.9]">
        この端末での計測：
        <strong className="ml-1">{on ? "有効" : "停止中"}</strong>
      </p>
      <button
        type="button"
        onClick={() => {
          const next = !on;
          setStatsEnabled(next);
          setOn(next);
          // タグは読み込み時に判定している。止めた／再開したことを
          // 確実に反映させるため、その場で読み直す。
          window.location.reload();
        }}
        className="mt-3 inline-flex min-h-[44px] items-center rounded-[3px] border border-[#2F6F79] px-5 text-[13.5px] font-bold text-[#2F6F79] transition-colors hover:bg-[#2F6F79] hover:text-white"
      >
        {on ? "計測を停止する" : "計測を再開する"}
      </button>
      <p className="mt-3 text-[12.5px] leading-[1.8] text-[#5E6E76]">
        停止すると、解析・広告の計測タグを読み込まなくなります。設定はこの端末にのみ保存され、
        こちらでは誰が停止したか分かりません。
      </p>
    </div>
  );
}
