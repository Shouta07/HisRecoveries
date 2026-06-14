import type { Metadata } from "next";
import LetterClient from "./LetterClient";

export const metadata: Metadata = {
  title: "Recoveries Letter — 下書きジェネレータ — Admin",
  robots: { index: false, follow: false },
};

export default function LetterToolPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 sm:px-10 pt-12 sm:pt-16 pb-24">
      <header className="mb-10">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          Admin · Tools
        </p>
        <h1 className="mt-3 font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          Recoveries Letter — 下書きジェネレータ
        </h1>
        <p className="mt-4 text-[13px] text-sub-gray leading-[1.95] max-w-[40rem]">
          直近の Check 回答と Ask の匿名集計から、今週の手紙のテーマと足場を生成します。
          編集者が声で書き直してから Substack に貼ってください。集計だけで投稿はしません。
        </p>
      </header>

      <LetterClient />
    </div>
  );
}
