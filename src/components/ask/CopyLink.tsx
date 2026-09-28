"use client";

import { useState } from "react";

// 結果を見るためのリンクを、本人の手元に残す。
//
// ── 登録しない代わりに、これが唯一の入口になる ────────
// アカウントを作らない設計なので、このURLを失うと結果に戻れない。
// 「あとでメールします」もできない（連絡先を受け取っていない）。
// だから、控えることの重さを隠さずに書く。

export default function CopyLink({ token }: { token: string }) {
  const [done, setDone] = useState(false);

  const url =
    typeof window === "undefined" ? "" : `${window.location.origin}/ask/${token}`;

  return (
    <section className="mt-10 border border-void bg-transparent px-4 py-5">
      <p className="text-[14px] font-bold text-void">このリンクを控えてください。</p>
      <p className="mt-2 text-[13px] leading-[1.9] text-ash">
        登録をしていないので、回答が集まったことをこちらからお知らせできません。
        このリンクが、結果に戻れる唯一の場所です。
      </p>
      <p className="mt-3.5 select-all break-all border border-rule bg-transparent px-3 py-2.5 text-[12.5px] text-ash">
        {url || `/ask/${token}`}
      </p>
      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setDone(true);
            } catch {
              // クリップボードが使えない環境では、上のURLを選んで写してもらう
              setDone(false);
            }
          }}
          className="inline-flex min-h-[44px] items-center rounded-[8px] border border-rule px-4 text-[13.5px] text-ash transition-colors hover:border-void hover:bg-void hover:text-bone"
        >
          リンクをコピー
        </button>
        {done && <span className="text-[13px] text-ash">コピーしました。</span>}
      </div>
    </section>
  );
}
