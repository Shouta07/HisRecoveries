import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Recovery Check — 受け取りました",
  description: "Recovery Check の観察を受け取りました。",
  robots: { index: false, follow: false },
  alternates: { canonical: `${site.url}/check/complete` },
};

export default function CheckCompletePage() {
  return (
    <div className="mx-auto max-w-[680px] px-6 sm:px-10 pt-20 sm:pt-32 pb-24">
      <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
        Recovery Check · Received
      </p>
      <h1 className="mt-6 font-mincho text-3xl sm:text-4xl text-ink leading-[1.45]">
        観察を、受け取りました。
      </h1>
      <p className="mt-8 font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.1]">
        ありがとうございます。
        編集者があなたの 30 問を読み、24 時間以内にメールでレポートを送ります。
      </p>
      <p className="mt-6 font-mincho text-[14px] text-sub-gray leading-[2.05]">
        週末・祝日の場合は、休日明けの返信になります。
        メールが届かない場合は、迷惑メールフォルダの確認のうえ
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
          A next half-step
        </p>
        <p className="font-mincho text-[14.5px] text-ink/85 leading-[2.05]">
          編集者から月に二度、私的なクローズドレターが届く Recovery Letters もあります。
          季節ごとに、自己観察の続きの問いも送ります。
        </p>
        <div className="mt-5">
          <Link
            href="/membership"
            className="text-[13px] tracking-[0.1em] text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-4 py-2.5 inline-flex"
          >
            Recovery Letters を見る →
          </Link>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-hair-line">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          While you wait
        </p>
        <ul className="font-mincho text-[14.5px] leading-[2.1] text-ink/85 space-y-2">
          <li>
            ・{" "}
            <Link
              href="/concerns"
              className="border-b border-hair-line hover:border-gold transition-colors"
            >
              悩み票を読む
            </Link>
            （あなたの観察に近いものが、すでに置かれているかもしれません）
          </li>
          <li>
            ・{" "}
            <Link
              href="/articles"
              className="border-b border-hair-line hover:border-gold transition-colors"
            >
              記録を読む
            </Link>
            （一人称・過去形のエッセイ）
          </li>
          <li>
            ・{" "}
            <Link
              href="/subscribe"
              className="border-b border-hair-line hover:border-gold transition-colors"
            >
              便りを受け取る
            </Link>
            （月に一度か二度）
          </li>
        </ul>
      </div>
    </div>
  );
}
