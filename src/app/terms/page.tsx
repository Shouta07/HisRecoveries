import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { NAME } from "@/lib/voice";
import { ARTICLES, TERMS_INTRO, TERMS_UPDATED } from "@/lib/terms";
import Mark from "@/components/brand/Mark";

// 利用規約。
//
// 中身は lib/terms.ts が持つ。
// ここは並べるだけにして、文言の判定は lib 側に置いてある
// （判定を画面に置くと、画面を作り変えたときに一緒に消える）。

export const metadata: Metadata = {
  title: { absolute: `利用規約 — ${NAME}` },
  description: `${NAME}の利用規約です。契約の相手方、提供内容、回数の有効期限、キャンセルと返金、禁止事項について定めています。`,
  alternates: { canonical: `${site.url}/terms` },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div data-brand className="min-h-screen bg-paper pb-20 text-slate sm:pb-0">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark size={28} />
            <span className="whitespace-nowrap text-[16px] font-black">{NAME}</span>
          </Link>
          <Link
            href="/legal"
            className="text-[13px] text-steel transition-colors hover:text-slate"
          >
            特定商取引法に基づく表記
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <h1 className="text-big font-black">利用規約</h1>
        <p className="mt-3 text-[12.5px] text-steel">最終更新 {TERMS_UPDATED}</p>

        <div className="mt-7 space-y-3.5">
          {TERMS_INTRO.map((t) => (
            <p key={t} className="text-[14.5px] leading-[1.95]">
              {t}
            </p>
          ))}
        </div>

        {/* 目次。16条あるので、探しているところへ飛べるようにする */}
        <nav aria-label="目次" className="mt-9 rounded-card border border-line bg-mist px-5 py-5">
          <p className="text-[12.5px] font-black text-steel">目次</p>
          <ol className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {ARTICLES.map((a) => (
              <li key={a.n} className="text-[13.5px] leading-[1.6]">
                <Link
                  href={`#a${a.n}`}
                  className="text-brand underline decoration-line underline-offset-4 hover:text-slate"
                >
                  第{a.n}条 {a.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 space-y-11">
          {ARTICLES.map((a) => (
            <section key={a.n} id={`a${a.n}`} className="scroll-mt-20">
              <h2 className="text-[19px] font-black leading-[1.45]">
                第{a.n}条（{a.title}）
              </h2>
              {/* 条の中身に入る前に、何の話かを1行で。
                  規約が読まれないのは、読み始めるまでに
                  何の話か分からないから */}
              <p className="mt-2 text-[13.5px] leading-[1.8] text-steel">{a.lead}</p>
              <ol className="mt-4 space-y-3">
                {a.body.map((t, i) => (
                  <li
                    key={t}
                    className="grid grid-cols-[2em_1fr] gap-2 text-[14.5px] leading-[1.95]"
                  >
                    <span aria-hidden className="text-[13px] text-steel">
                      {i + 1}.
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <p className="mt-14 border-t border-line pt-8 text-[13px] leading-[1.9] text-steel">
          販売価格・所在地・電話番号などは{" "}
          <Link href="/legal" className="underline decoration-line underline-offset-4 hover:text-slate">
            特定商取引法に基づく表記
          </Link>
          、個人情報の扱いは{" "}
          <Link href="/privacy" className="underline decoration-line underline-offset-4 hover:text-slate">
            プライバシー・免責事項
          </Link>
          {" "}をご覧ください。
        </p>
      </main>
    </div>
  );
}
