import type { Metadata } from "next";
import { Suspense } from "react";
import AskFlow from "@/components/ask/AskFlow";


export const metadata: Metadata = {
  // 記事側のテンプレート（%s — His Recoveries）を使わない。
  // プロダクトの名乗りはタシカメなので、ここで完結させる。
  title: { absolute: "今の選択を確かめる — タシカメ" },
  description:
    "自己紹介文、LINE、誘い方、デートの前後。選ぶ前に、実在の女性が実際にどう受け取ったかを匿名で確かめられます。",
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
