"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

/* AIに渡す文章と、コピーのボタン。
 *
 * ══════════════════════════════════════════════════
 * 渡すものを、見せる
 * ══════════════════════════════════════════════════
 * 中に隠して渡すこともできるが、そうすると
 * 何を渡しているのか分からないまま貼ることになる。
 *
 * 見えていれば、間違っていたら気づける。
 * 恋愛の話なので、何が外へ出るかは本人が見られること。
 *
 * ══════════════════════════════════════════════════
 * コピーできない端末がある
 * ══════════════════════════════════════════════════
 * clipboard が使えない設定の端末がある。
 * そのときは「選んでコピーしてください」と出す。
 * 文章は最初から画面に出ているので、選べば取れる。
 */

export default function BriefCard({
  text,
  /** 押せない見本として出すとき */
  demo = false,
}: {
  text: string;
  demo?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setFailed(false);
      track("koi_brief_copied", {});
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setFailed(true);
    }
  }

  return (
    <div className="rounded-card border border-line bg-paper p-4 shadow-card">
      <p className="text-[11.5px] font-black text-steel">この文章をAIに渡せます</p>
      <p className="mt-2 whitespace-pre-wrap text-[13px] leading-[1.85] text-slate">{text}</p>

      {!demo && (
        <>
          <button
            type="button"
            onClick={copy}
            className="mt-3.5 flex min-h-[48px] w-full items-center justify-center rounded-pill border border-brand bg-paper px-5 text-[14px] font-bold text-brand"
          >
            {copied ? "コピーしました" : "この文章をコピーする"}
          </button>
          {failed && (
            <p className="mt-2 text-[11.5px] leading-[1.7] text-steel">
              コピーできませんでした。上の文を選んでコピーしてください。
            </p>
          )}
        </>
      )}
    </div>
  );
}
