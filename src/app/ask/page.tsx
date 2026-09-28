import type { Metadata } from "next";
import { Suspense } from "react";
import AskFlow from "@/components/ask/AskFlow";


export const metadata: Metadata = {
  title: "女性に聞く — His Recoveries",
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
