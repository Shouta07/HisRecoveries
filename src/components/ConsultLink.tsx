"use client";

// 無料相談リンク。相談の入口は「匿名Web相談の予約」= /reserve に集約。
// （/reserve が TimeRex 埋め込み or LINE/フォームのフォールバックを出し分ける）
//
// market を渡すと「どの領域の文脈から相談に進んだか」を記録する（意向シグナル）。
// 6領域のうちどれが勝てる市場かの見極めに使う（/admin/markets）。
import Link from "next/link";
import { track } from "@/lib/analytics";

export default function ConsultLink({
  className = "",
  children,
  market,
}: {
  className?: string;
  children: React.ReactNode;
  /** 領域ID（impression/hair/skin/face/body-hair/mind）。渡すと計測される。 */
  market?: string;
}) {
  return (
    <Link
      href="/reserve"
      className={className}
      onClick={() => {
        if (market) track("market_consult_click", { market });
      }}
    >
      {children}
    </Link>
  );
}
