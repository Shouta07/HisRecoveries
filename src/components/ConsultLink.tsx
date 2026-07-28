"use client";

// 無料相談リンク。相談の入口は /reserve（メールでの無料相談）に集約。
// LINE はお支払い後の伴走でのみ使うため、公開サイトには出さない。
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
