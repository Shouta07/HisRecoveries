import type { Metadata } from "next";
import Link from "next/link";
import ConsultEntry from "@/components/ConsultEntry";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "相談・予約登録 — 秘密は守ります",
  description:
    "His Recoveries への相談・予約登録。相談は実名不要（ニックネーム可）。相互の秘密保持契約（NDA）と完全守秘のもとで。",
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
          CONTACT · 秘密保持契約 · 完全守秘
        </p>
        <h1 className="text-[2rem] sm:text-[2.6rem] font-bold leading-[1.25] tracking-[-0.01em]">
          ひとりで抱えず、<br />メールで、相談する。
        </h1>
        <p className="mt-5 text-[14.5px] text-[#4b5b47] leading-[2] mb-10">
          何が正解か、いくらかかるか。<strong className="font-bold text-[#1f2a1d]">遠回りせず、あなたのペースで一緒に整理します。</strong>
          気になることは、いくつでも。実名・顔写真は不要です。
          <br />
          いちばん早いのは<Link href="/reserve" className="font-bold text-[#3d5638] underline decoration-[#85AB8B]/60 underline-offset-4">匿名Web相談の予約（15分・無料）</Link>。このフォームからメールでも受け付けます。
          話した内容も、あなたのことも<strong className="font-bold text-[#1f2a1d]">外に出しません（完全守秘）</strong>。
        </p>

        <ConsultEntry />

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
