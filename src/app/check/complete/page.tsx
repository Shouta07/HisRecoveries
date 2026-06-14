import type { Metadata } from "next";
import Link from "next/link";
import TrackedCTA from "@/components/TrackedCTA";
import ShareCheck from "@/components/ShareCheck";
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

      {/* Primary funnel terminus — Recoveries Letter (Substack) */}
      <div className="mt-12 border border-hair-line bg-paper p-6 sm:p-8">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-3">
          レポートが届くまでに
        </p>
        <p className="font-mincho text-xl sm:text-2xl text-ink leading-[1.5]">
          毎週日曜日、続きを受け取る。
        </p>
        <p className="mt-4 font-mincho text-[14px] text-sub-gray leading-[2.05]">
          Recoveries Letter は、編集者から日曜日に届く手紙です。
          男性の身体と自意識について、広告のない場所で。
          季節ごとに、今回の自己観察の続きの問いも送ります。
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <TrackedCTA
            href={`${site.social.substack}/subscribe`}
            event="membership_subscribe_click"
            eventProps={{ location: "check_complete" }}
            className="btn-gold justify-center"
          >
            日曜日の手紙を受け取る
            <span aria-hidden>→</span>
          </TrackedCTA>
          <Link
            href="/membership"
            className="text-sm tracking-[0.12em] text-ink border border-ink/40 hover:border-gold hover:text-gold transition-colors px-6 py-3.5 text-center"
          >
            内容を詳しく見る
          </Link>
        </div>
        <p className="mt-4 text-[11px] text-sub-gray leading-[1.95]">
          無料で読める便りもあります。読まない日曜日は、読まないでください。
        </p>
      </div>

      {/* Pass-it-on share — viral seed for more Checks */}
      <ShareCheck />

      <div className="mt-10 pt-8 border-t border-hair-line">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          While you wait
        </p>
        <ul className="font-mincho text-[14.5px] leading-[2.1] text-ink/85 space-y-2">
          <li>
            ・{" "}
            <Link
              href="/stories"
              className="border-b border-hair-line hover:border-gold transition-colors"
            >
              回復の記録を読む
            </Link>
            （同じ悩みを通過した人の記録）
          </li>
          <li>
            ・{" "}
            <Link
              href="/territories"
              className="border-b border-hair-line hover:border-gold transition-colors"
            >
              原因を読む
            </Link>
            （その悩みが、なぜ起こるのか）
          </li>
        </ul>
      </div>

      {/* Improvement-case loop — the defensible data asset */}
      <div className="mt-10 pt-8 border-t border-hair-line">
        <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold mb-4">
          いつか、変化があったら
        </p>
        <p className="font-mincho text-[14px] text-ink/85 leading-[2.05]">
          半年後でも、一年後でも構いません。何かが少しでも変わったとき、その記録を
          置いていってください。あなたの「その後」が、いま同じ場所にいる誰かの
          地図になります。
        </p>
        <div className="mt-5">
          <Link
            href="/submit-story"
            className="text-[13px] tracking-[0.1em] text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-4 py-2.5 inline-flex"
          >
            回復の途中を記録する →
          </Link>
        </div>
      </div>
    </div>
  );
}
