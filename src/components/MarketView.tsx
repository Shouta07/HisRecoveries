"use client";

// 関心シグナル: その領域（市場）のページが読まれたことを1回だけ記録する。
// サーバーコンポーネントのページに <MarketView market="hair" /> を置くだけ。
// 需要(market_select) → 関心(market_view) → 意向(market_consult_click) の
// ファネルで、6領域のどれが勝てる市場かを見極める（/admin/markets）。
import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

export default function MarketView({ market }: { market: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current || !market) return;
    sent.current = true; // StrictMode の二重実行でも1回だけ
    track("market_view", { market });
  }, [market]);
  return null;
}
