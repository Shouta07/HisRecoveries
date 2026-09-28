"use client";

import { useEffect, useState } from "react";

// 今、回答できる人。
//
// ── 数は必ず実データ ──────────────────────────────
// ここに固定の数字を書かない。
// まだ登録が0なら0人と出る。それでいい。
// 適当な数を出したら、この画面はその瞬間から全部うそになる。
//
// ── 0人のときは、募集中だと書く ──────────────────
// 「0人」とだけ出して終わらせない。
// いま何が起きているのかが分かるようにする。

export default function OnlineCount() {
  const [n, setN] = useState<number | null>(null);
  const [ok, setOk] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/responders/available?age=any", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive || !j) return;
        setOk(Boolean(j.configured));
        setN(typeof j.n === "number" ? j.n : 0);
      })
      .catch(() => alive && setOk(false));
    return () => {
      alive = false;
    };
  }, []);

  const live = ok && (n ?? 0) > 0;

  return (
    <div className="rounded-card border border-line bg-rose-tint px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-bold text-rose-text">今、回答できる女性</p>
        <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-steel">
          <span
            aria-hidden
            className={`h-2 w-2 rounded-full ${live ? "bg-ok" : "bg-line"}`}
          />
          {live ? "オンライン" : "募集中"}
        </p>
      </div>

      <p className="mt-1.5 text-[30px] font-black tabular-nums leading-none text-slate">
        {n === null ? "—" : n}
        <span className="ml-1 text-[15px]">人</span>
      </p>

      <p className="mt-2 text-[11.5px] leading-[1.7] text-steel">
        {n === null
          ? "確認しています"
          : n > 0
            ? "20代〜30代の女性が中心です"
            : "いま回答できる方を募集しています。集まらなかった分はご返金します。"}
      </p>
    </div>
  );
}
