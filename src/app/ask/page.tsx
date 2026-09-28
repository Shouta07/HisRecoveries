import type { Metadata } from "next";
import { Suspense } from "react";
import AskFlow from "@/components/ask/AskFlow";
import { Loading } from "@/components/app/system";

export const metadata: Metadata = {
  title: "女性に聞く — His Recoveries",
  description: "LINE、デート、写真、恋愛。自分では分からないことを、実際の女性に匿名で聞けます。",
  robots: { index: false, follow: true },
};

export default function AskPage() {
  return (
    <div className="min-h-screen bg-ground">
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-[560px] px-5 pt-10 sm:px-8">
            <Loading />
          </div>
        }
      >
        <AskFlow />
      </Suspense>
    </div>
  );
}
