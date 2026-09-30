import type { Metadata } from "next";
import { NAME } from "@/lib/voice";
import Link from "next/link";
import { site } from "@/lib/site";
import { LEGAL, missingLegal } from "@/lib/legal";
import Mark from "@/components/brand/Mark";
import Tashikame from "@/components/brand/Tashikame";

// 特定商取引法に基づく表記。
//
// 通信販売で対価を受け取るには、この表記が要る（特商法11条）。
// 揃っていない項目は「準備中」で埋めず、足りないと出す。
// 埋めた気になると、決済だけ先に開いてしまう。

export const metadata: Metadata = {
  // 記事側のテンプレート（%s — His Recoveries）を使わない。
  // プロダクトの名乗りはタシカメなので、ここで完結させる。
  title: { absolute: "特定商取引法に基づく表記 — タシカメ" },
  alternates: { canonical: `${site.url}/legal` },
  robots: { index: true, follow: true },
};

export default function LegalPage() {
  const missing = missingLegal();

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
        <h1 className="text-big font-black">特定商取引法に基づく表記</h1>

        {missing.length > 0 && (
          <div className="mt-7 rounded-card border-2 border-slate bg-paper p-5 shadow-card">
            <p className="text-[15px] font-bold">
              この表記はまだ完成していません。
            </p>
            <p className="mt-3 text-[14px] leading-[1.9] text-steel">
              {missing.map((m) => m.label).join("・")}が未記入です。
              揃うまで、料金のお支払いは受け付けていません。
              決済そのものを開始できないようにしてあります。
            </p>
          </div>
        )}

        <dl className="mt-10 divide-y divide-line border-y border-line">
          {LEGAL.map((f) => (
            <div key={f.key} className="grid gap-1.5 py-5 sm:grid-cols-[11em_1fr] sm:gap-6">
              <dt className="text-[13.5px] font-bold text-steel">{f.label}</dt>
              <dd className="text-[14.5px] leading-[1.9]">
                {f.value ?? (
                  <span className="rounded-pill bg-mist px-3 py-1 text-[13px] text-steel">
                    未記入
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 max-w-[34em] text-[13px] leading-[1.9] text-steel">
          回答は、条件に合う方へ順次お届けします。規定の人数に達した時点で結果をご覧いただけます。
          個人情報の扱いは{" "}
          <Link href="/privacy" className="underline decoration-line underline-offset-4 hover:text-slate">
            プライバシー・免責事項
          </Link>
          、お受けできない相談は{" "}
          <Link href="/terms" className="underline decoration-line underline-offset-4 hover:text-slate">
            利用規約（第9条）
          </Link>{" "}
          に書いています。
        </p>
      </main>

    </div>
  );
}
