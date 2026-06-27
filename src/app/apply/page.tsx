import type { Metadata } from "next";
import ApplyForm from "@/components/ApplyForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "参加を申し込む — 完全招待制",
  description:
    "His Recoveries の改善プログラムへの参加申し込み。完全招待制・選考制。お申し込みには秘密保持への同意が必要です。",
  alternates: { canonical: `${site.url}/apply` },
  robots: { index: true, follow: true },
};

export default function ApplyPage() {
  return (
    <div className="bg-[#f7f8f5] text-[#1f2a1d] min-h-screen">
      <div className="mx-auto max-w-[640px] px-6 sm:px-8 pt-16 sm:pt-24 pb-24">
        <p className="text-xs tracking-[0.22em] text-[#3d5638] font-semibold mb-4">
          APPLY · 完全招待制
        </p>
        <h1 className="text-[2rem] sm:text-[2.6rem] font-bold leading-[1.25] tracking-[-0.01em]">
          参加を申し込む。
        </h1>
        <p className="mt-5 text-[14.5px] text-[#4b5b47] leading-[2] mb-10">
          まずは対話から。いまの悩みを聞かせてください。私たちが力になれると判断したとき、
          ご招待をお送りします。お申し込みには、秘密保持への同意が必要です。
        </p>

        <ApplyForm />
      </div>
    </div>
  );
}
