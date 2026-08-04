"use client";

// 記事のシェア。
//
// これまで記事ページにシェア導線が1つもなく、流入が検索だけだった。
//
// 並びは LINE → X → リンクをコピー。この分野の記事は「人に見せる」より
// 「自分で保存する／一人に送る」ほうが多いので、拡散力の順ではなく
// 実際に使われる順に置いている。
// 数字（シェア数）は出さない。0が並ぶだけで逆効果になるため。

import { useState } from "react";

export default function ShareRow({
  url,
  title,
  label = "この記事を送る・残す",
  publicUrl,
  publicTitle,
}: {
  /** 自分に残す・一人に送るためのURL。診断の結果では回答が入っている */
  url: string;
  title: string;
  /** 見出し。記事以外（診断の結果など）でも使うので差し替えられるようにする */
  label?: string;
  /**
   * 公開の場（X）に貼るときのURL。省略時は url を使う。
   *
   * 診断の結果では、url に回答が入っている。
   * それを公開の場に貼ると、年代も予算も悩みも一緒に公開される。
   * 押した本人がそこまで意識しているとは限らないので、
   * 公開の場に出す先は、結果の入っていないURLに差し替える。
   */
  publicUrl?: string;
  /** 公開の場に貼るときの文面。省略時は title を使う */
  publicTitle?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* クリップボードが使えない環境では何もしない（URLは見えている） */
    }
  };

  const base =
    "inline-flex items-center gap-2 rounded-[2px] border border-shironezu bg-hakuji px-4 py-2.5 text-[13.5px] text-keshizumi transition-colors hover:border-asagi hover:text-asagi";

  return (
    <div className="mt-12 border-t border-shironezu pt-7">
      <p className="text-[13px] text-ainezu">{label}</p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <a
          className={base}
          href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          LINEで送る
        </a>
        <a
          className={base}
          href={`https://x.com/intent/post?text=${encodeURIComponent(publicTitle ?? title)}&url=${encodeURIComponent(publicUrl ?? url)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Xに投稿
        </a>
        <button type="button" onClick={copy} className={base} aria-live="polite">
          {copied ? "コピーしました" : "リンクをコピー"}
        </button>
      </div>
    </div>
  );
}
