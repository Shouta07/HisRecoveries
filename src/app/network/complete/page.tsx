import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recovery Certified — 申請を受け付けました",
  description: "認証申請を受け付けました。",
  robots: { index: false, follow: false },
  alternates: { canonical: `${site.url}/network/complete` },
};

export default function NetworkCompletePage() {
  return (
    <div className="mx-auto max-w-[680px] px-6 sm:px-10 pt-20 sm:pt-32 pb-24">
      <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
        Recovery Certified · Received
      </p>
      <h1 className="mt-6 font-mincho text-3xl sm:text-4xl text-ink leading-[1.45]">
        申請を、受け付けました。
      </h1>
      <p className="mt-8 font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.1]">
        ありがとうございます。
        編集部が内容を確認し、5 営業日以内に最初のご連絡をお送りします。
      </p>
      <p className="mt-6 font-mincho text-[14px] text-sub-gray leading-[2.05]">
        書類審査 → 覆面顧客審査 → 認証委員会、の 3 段階を経て認証判定をお伝えします。
        全工程で平均 4〜8 週間ほどお時間をいただきます。
      </p>
      <p className="mt-6 font-mincho text-[14px] text-sub-gray leading-[2.05]">
        メールが届かない場合は迷惑メールフォルダの確認のうえ、
        <a
          href={`mailto:${site.email}`}
          className="ml-1 border-b border-hair-line hover:border-ink transition-colors"
        >
          {site.email}
        </a>
        までご連絡ください。
      </p>

      <div className="mt-12 pt-8 border-t border-hair-line">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          About the network
        </p>
        <ul className="font-mincho text-[14px] leading-[2.1] text-ink/85 space-y-2">
          <li>
            ・{" "}
            <Link
              href="/network"
              className="border-b border-hair-line hover:border-gold transition-colors"
            >
              5 つの原則を読み直す
            </Link>
          </li>
          <li>
            ・{" "}
            <Link
              href="/recoveries"
              className="border-b border-hair-line hover:border-gold transition-colors"
            >
              His Recoveries の三幕の物語を読む
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
