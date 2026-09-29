import type { Metadata } from "next";
import { Suspense } from "react";
import AskFlow from "@/components/ask/AskFlow";


export const metadata: Metadata = {
  // 記事側のテンプレート（%s — His Recoveries）を使わない。
  // プロダクトの名乗りはタシカメなので、ここで完結させる。
  title: { absolute: "女性に聞く — タシカメ" },
  description: "LINE、デート、写真、恋愛。自分では分からないことを、実際の女性に匿名で聞けます。",
  robots: { index: false, follow: true },
};

export default function AskPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Suspense
        fallback={<div className="h-[60vh]" />}
      >
        <AskFlow />
      </Suspense>
    </div>
  );
}
