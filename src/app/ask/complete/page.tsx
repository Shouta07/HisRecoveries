import type { Metadata } from "next";
import Link from "next/link";
import TrackedCTA from "@/components/TrackedCTA";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "問いを受け取りました — Recovery Q&A",
  description: "Recovery Q&A への問いを受け取りました。",
  robots: { index: false, follow: false },
  alternates: { canonical: `${site.url}/ask/complete` },
};

export default function AskCompletePage() {
  return (
    <div className="mx-auto max-w-[680px] px-6 sm:px-10 pt-20 sm:pt-32 pb-24">
      <p className="logo-type italic text-[11px] tracking-[0.4em] uppercase text-gold">
        Recovery Q&A · Received
      </p>
      <h1 className="mt-6 font-mincho text-3xl sm:text-4xl text-ink leading-[1.45]">
        問いを、受け取りました。
      </h1>
      <p className="mt-8 font-mincho text-[15px] sm:text-base text-ink/85 leading-[2.1]">
        ありがとうございます。編集者が読み、数日以内にメールで返事を書きます。
        週末・祝日の場合は休日明けの返信になります。
      </p>
      <p className="mt-6 font-mincho text-[13.5px] text-sub-gray leading-[2.05]">
        メールが届かない場合は、迷惑メールフォルダの確認のうえ
        <a
          href={`mailto:${site.email}`}
          className="ml-1 border-b border-hair-line hover:border-ink transition-colors"
        >
          {site.email}
        </a>
        までご連絡ください。
      </p>

      <div className="mt-12 border border-hair-line bg-paper p-6 sm:p-8">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
          待つあいだに
        </p>
        <p className="font-mincho text-[14.5px] text-ink/85 leading-[2.05]">
          毎週日曜日、編集者から手紙が届く Recoveries Letter があります。
          男性の身体と自意識について、広告のない場所で。
        </p>
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <TrackedCTA
            href={`${site.social.substack}/subscribe`}
            event="membership_subscribe_click"
            eventProps={{ location: "ask_complete" }}
            className="btn-gold justify-center"
          >
            日曜日の手紙を受け取る <span aria-hidden>→</span>
          </TrackedCTA>
          <Link
            href="/qa"
            className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold transition-colors px-6 py-3.5 text-center"
          >
            ほかの問いを読む
          </Link>
        </div>
      </div>
    </div>
  );
}
