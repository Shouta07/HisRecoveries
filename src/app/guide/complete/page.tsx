import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recovery Guide — 受け付けました",
  description: "Recovery Guide のお申し込みを受け付けました。",
  robots: { index: false, follow: false },
  alternates: { canonical: `${site.url}/guide/complete` },
};

export default function GuideCompletePage() {
  return (
    <div className="mx-auto max-w-[680px] px-6 sm:px-10 pt-20 sm:pt-32 pb-24">
      <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
        Recovery Guide · Received
      </p>
      <h1 className="mt-6 font-mincho text-3xl sm:text-4xl text-ink leading-[1.45]">
        申し込みを、受け付けました。
      </h1>
      <p className="mt-8 font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.1]">
        ありがとうございます。
        72 時間以内に、編集者からメールで日程候補のご連絡をお送りします。
        支払い方法は、その際にあわせてご案内します。
      </p>
      <p className="mt-6 font-mincho text-[14px] text-sub-gray leading-[2.05]">
        週末・祝日の場合は、休日明けの返信になります。
        メールが届かない場合は迷惑メールフォルダの確認のうえ
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
          Before we meet
        </p>
        <p className="font-mincho text-[14px] text-ink/85 leading-[2.05]">
          まだ Recovery Check を受けていない場合は、セッション前にぜひ。
          編集者が事前に読むことで、当日 30 分を別のことに使えます。
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-[13px]">
          <Link
            href="/check"
            className="border border-hair-line hover:border-gold hover:text-gold px-3 py-2 transition-colors"
          >
            Recovery Check を見る
          </Link>
          <Link
            href="/concerns"
            className="border border-hair-line hover:border-gold hover:text-gold px-3 py-2 transition-colors"
          >
            悩み票を読む
          </Link>
        </div>
      </div>
    </div>
  );
}
