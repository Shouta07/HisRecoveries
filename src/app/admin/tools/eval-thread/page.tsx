import type { Metadata } from "next";
import EvalClient from "./EvalClient";

export const metadata: Metadata = {
  title: "Threads 投稿の声 eval — Admin",
  robots: { index: false, follow: false },
};

export default function EvalThreadPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 sm:px-10 pt-12 sm:pt-16 pb-24">
      <header className="mb-10">
        <p className="text-[10px] tracking-[0.3em] text-sub-gray uppercase">
          Admin · Tools
        </p>
        <h1 className="mt-3 font-mincho text-3xl sm:text-4xl text-ink leading-[1.4]">
          Threads 投稿の声 eval
        </h1>
        <p className="mt-4 text-[13px] text-sub-gray leading-[1.95] max-w-[40rem]">
          投稿前にブランドの声と禁止事項をチェックします（決定論ルール）。
          完了形・モテ語彙・医療断定・煽る CTA・絵文字・ハッシュタグ・UTM 漏れを検出。
          一人称・過去形・URL の有無も補助的に確認します。
        </p>
      </header>

      <EvalClient />
    </div>
  );
}
