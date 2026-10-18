import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { NAME } from "@/lib/voice";
import { PRIVACY_ARTICLES, PRIVACY_INTRO, PRIVACY_UPDATED } from "@/lib/privacy";
import Mark from "@/components/brand/Mark";

// プライバシー・免責事項。
//
// 中身は lib/privacy.ts が持つ（判定も向こう）。
// ここは並べるだけ。
//
// ══════════════════════════════════════════════════
// 前は、別の事業の方針が載っていた
// ══════════════════════════════════════════════════
// 「第一印象改善サービス」「医療行為は行いません」
// 「お申し込みの段階でお名前・ご連絡先の確認を行います」。
// タシカメは氏名も連絡先も取らないし、医療にも関わらない。
//
// 見た目だけでなく、中身がまるごと別の事業のものだった。
// 個人情報の扱いは「何を集めているか」を書く文書なので、
// そこが違うのは体裁の問題ではない。

export const metadata: Metadata = {
  title: { absolute: `プライバシー・免責事項 — ${NAME}` },
  description: `${NAME}における個人情報の取扱いと免責事項です。氏名・電話番号・住所は取得しません。`,
  alternates: { canonical: `${site.url}/privacy` },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div data-brand className="min-h-screen bg-paper pb-20 text-slate sm:pb-0">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark size={28} />
            <span className="whitespace-nowrap text-[16px] font-black">{NAME}</span>
          </Link>
          <Link
            href="/terms"
            className="text-[13px] text-steel transition-colors hover:text-slate"
          >
            利用規約
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px] px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <h1 className="text-big font-black">プライバシー・免責事項</h1>
        <p className="mt-3 text-[12.5px] text-steel">最終更新 {PRIVACY_UPDATED}</p>

        <div className="mt-7 space-y-3.5">
          {PRIVACY_INTRO.map((t) => (
            <p key={t} className="text-[14.5px] leading-[1.95]">
              {t}
            </p>
          ))}
        </div>

        {/* いちばん聞かれることを、頭に出す。
            条を1つずつ読ませないと分からない状態にしない */}
        <div className="mt-8 rounded-card border border-brand bg-brand-tint px-5 py-5">
          <p className="text-[14.5px] font-black leading-[1.6] text-brand-deep">
            お名前も、電話番号も、住所も、いただきません。
          </p>
          <p className="mt-2 text-[13px] leading-[1.85] text-slate">
            会員登録もありません。ご相談ごとに発行されるリンクだけで結果をご覧いただけます。
            カード番号は決済代行業者が直接お預かりし、当社は受け取りません。
          </p>
        </div>

        <nav aria-label="目次" className="mt-8 rounded-card border border-line bg-mist px-5 py-5">
          <p className="text-[12.5px] font-black text-steel">目次</p>
          <ol className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {PRIVACY_ARTICLES.map((a) => (
              <li key={a.n} className="text-[13.5px] leading-[1.6]">
                <Link
                  href={`#p${a.n}`}
                  className="text-brand underline decoration-line underline-offset-4 hover:text-slate"
                >
                  {a.n}. {a.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 space-y-11">
          {PRIVACY_ARTICLES.map((a) => (
            <section key={a.n} id={`p${a.n}`} className="scroll-mt-20">
              <h2 className="text-[19px] font-black leading-[1.45]">
                {a.n}. {a.title}
              </h2>
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
          契約の内容と禁止事項は{" "}
          <Link href="/terms" className="underline decoration-line underline-offset-4 hover:text-slate">
            利用規約
          </Link>
          、販売価格・所在地・電話番号などは{" "}
          <Link href="/legal" className="underline decoration-line underline-offset-4 hover:text-slate">
            特定商取引法に基づく表記
          </Link>
          {" "}をご覧ください。
        </p>
      </main>
    </div>
  );
}
