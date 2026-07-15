import type { Metadata } from "next";
import Link from "next/link";
import ApplyForm from "@/components/ApplyForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "相談・予約登録 — 匿名のまま",
  description:
    "His Recoveries への相談・予約登録。相談・印象診断は匿名のまま（実名・顔写真は不要）。ご予約登録には秘密保持への同意が必要です。",
  alternates: { canonical: `${site.url}/apply` },
  robots: { index: true, follow: true },
};

export default function ApplyPage() {
  return (
    <div className="bg-[#f7f8f5] text-[#1f2a1d] min-h-screen">
      {/* minimal logo bar — back to home, no nav/footer on this focused page */}
      <div className="border-b border-[#1f2a1d]/10">
        <div className="mx-auto max-w-[640px] px-6 sm:px-8 py-5">
          <Link href="/" className="logo-type text-lg font-semibold tracking-tight text-[#1f2a1d] hover:opacity-70 transition-opacity">
            His Recoveries
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-[640px] px-6 sm:px-8 pt-12 sm:pt-16 pb-24">
        <p className="text-xs tracking-[0.22em] text-[#3d5638] font-semibold mb-4">
          CONTACT · 完全匿名 · 完全守秘
        </p>
        <h1 className="text-[2rem] sm:text-[2.6rem] font-bold leading-[1.25] tracking-[-0.01em]">
          無料で、相談する。
        </h1>
        <p className="mt-4 text-[15px] font-semibold text-[#3d5638]">予約登録する。</p>
        <p className="mt-4 text-[14.5px] text-[#4b5b47] leading-[2] mb-10">
          流れは3つ。<strong className="font-bold text-[#1f2a1d]">①無料の匿名相談（このフォーム）→ ②印象診断（90分・¥22,000。パッケージお申し込みで全額充当）→ ③第一印象改善パッケージ</strong>。
          すべて<strong className="font-bold text-[#1f2a1d]">完全匿名・完全守秘義務</strong>のもとで扱います。
          実名・顔写真は不要です。ご予約登録には、秘密保持への同意が必要です。
        </p>

        <ApplyForm />

        <div className="mt-8 flex items-start gap-2.5 text-[13px] text-[#4b5b47] leading-[1.9]">
          <span aria-hidden className="text-[#85AB8B] mt-px">→</span>
          <p>
            送信いただいた内容は{" "}
            <a
              href={`mailto:${site.email}`}
              className="text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-4 hover:decoration-[#3d5638] transition-colors"
            >
              {site.email}
            </a>{" "}
            宛に届きます。3営業日目処で返信いたします。
          </p>
        </div>
      </div>
    </div>
  );
}
