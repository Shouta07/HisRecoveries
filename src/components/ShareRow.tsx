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
}: {
  url: string;
  title: string;
  /** 見出し。記事以外（診断の結果など）でも使うので差し替えられるようにする */
  label?: string;
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
          href={`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
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
