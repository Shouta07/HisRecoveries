import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import AskFlow from "@/components/ask/AskFlow";
import { readyToSell } from "@/lib/ready";
import { imagesEnabled } from "@/lib/ask/images";


// 設定は実行時に読む。
// これが無いと、ビルドした時点の状態で固定されてしまい、
// あとから鍵を入れても画面が変わらない
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // 記事側のテンプレート（%s — His Recoveries）を使わない。
  // プロダクトの名乗りはタシカメなので、ここで完結させる。
  title: { absolute: "今の選択を確かめる — タシカメ" },
  description:
    "自己紹介文、LINE、誘い方、デートの前後。選ぶ前に、実在の女性が実際にどう受け取ったかを匿名で確かめられます。",
  robots: { index: false, follow: true },
};

export default function AskPage() {
  // ══════════════════════════════════════════════
  // 書く前に言う
  // ══════════════════════════════════════════════
  // 受け取れない状態のまま書かせると、
  // 300字書いたあとに止まって、その時間が丸ごと無駄になる。
  //
  // 足りないものがあるなら、書き始める前にそう言う。
  // 判定は lib/ready.ts。API と同じものを見ているので、
  // 「画面は出るのに送ると落ちる」が起きない。
  if (!readyToSell()) {
    return (
      <div className="min-h-screen bg-paper">
        <div className="mx-auto w-full max-w-[34em] px-5 py-16 sm:px-8">
          <h1 className="text-[22px] font-black leading-[1.5] text-slate">
            いま、新しい相談を受け付けられません。
          </h1>
          <p className="mt-4 text-[14.5px] leading-[1.9] text-steel">
            受け付けの準備が終わっていません。整い次第、ここから送れるようになります。
            書いていただいた内容は、まだ何も送られていません。
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/talk"
              className="flex min-h-[54px] items-center justify-center rounded-pill bg-brand px-6 text-[15.5px] font-bold text-paper shadow-card"
            >
              開いたら知らせてもらう
            </Link>
            <Link
              href="/"
              className="flex min-h-[48px] items-center justify-center text-[13.5px] font-bold text-steel"
            >
              トップに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Suspense
        fallback={<div className="h-[60vh]" />}
      >
        <AskFlow images={imagesEnabled} />
      </Suspense>
    </div>
  );
}
