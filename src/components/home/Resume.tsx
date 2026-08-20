"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { lastCode, getDone, daysSince } from "@/lib/progress";
import { decodeAnswers, isComplete } from "@/lib/checkLink";
import { evaluate } from "@/lib/check";
import { track } from "@/lib/analytics";

// 一度使った人に、続きを出す。
//
// ── なぜ要るか ────────────────────────────────
// トップは、診断を終えて行動に印をつけた人にも、
// 初回とまったく同じ「変わりたい。でも……」を出していた。
//
// 全員に同じ面を見せるのがメディアで、
// 本人の状態を見せるのがプロダクト。分かれ目はここにある。
// 記事の数でも、配色でも、写真でもない。
//
// ── 何を出すか ────────────────────────────────
// 3つだけ。いまの1番目、残っている行動の数、続きへの導線。
// ここに順番を全部並べると、結果ページの縮小版になってしまう。
// トップに要るのは「どこまで来ていたか」の思い出しであって、
// 内容そのものではない。
//
// ── 出さない条件 ──────────────────────────────
// ・記録が無い（初めての人）
// ・コードが壊れている
// ・本体5問がそろっていない
// このどれかなら、何も描かない。初めての人の面を汚さない。
//
// ── ずれを出さない ────────────────────────────
// 記録は端末の中にあるので、サーバーでは分からない。
// 最初の描画では何も出さず、画面に出てから読み込んで差し込む。
// ヒーローの下に置いているのは、いちばん上に後から差し込むと
// 読み始めた行が動くため。

export default function Resume() {
  const [state, setState] = useState<{
    code: string;
    first: string;
    left: number;
    total: number;
    since: number | null;
  } | null>(null);

  useEffect(() => {
    const code = lastCode();
    if (!code) return;
    const answers = decodeAnswers(code);
    if (!isComplete(answers)) return;

    const r = evaluate(answers);
    const done = getDone(code);
    const total = r.thisMonth.length;
    setState({
      code,
      first: r.steps[0]?.label ?? "",
      left: Math.max(0, total - done.filter((t) => r.thisMonth.some((m) => m.text === t)).length),
      total,
      since: daysSince(code),
    });
  }, []);

  if (!state) return null;

  const href = `/check?r=${encodeURIComponent(state.code)}`;

  return (
    <section className="border-b border-shironezu bg-hakuji">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-3 px-5 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:px-8 sm:py-7 lg:px-12">
        <div className="min-w-0">
          <p className="text-[12.5px] text-asagi">前回の続き</p>
          <p className="mt-1.5 text-[16px] leading-[1.75] text-sumi sm:text-[17px]">
            <span className="font-bold">{state.first}</span>
            から。
            {state.left > 0 ? (
              <span className="text-keshizumi">
                　今月やること、あと{state.left}つ残っています。
              </span>
            ) : (
              <span className="text-keshizumi">　今月の3つは、終わっています。</span>
            )}
          </p>
          {state.since !== null && state.since > 0 && (
            <p className="mt-1 text-[12.5px] text-ainezu">
              前に開いたのは{state.since}日前です。
            </p>
          )}
        </div>

        <Link
          href={href}
          onClick={() => track("resume_click", { left: state.left })}
          className="shrink-0 whitespace-nowrap border border-asagi bg-asagi px-5 py-2.5 text-center text-[14px] font-bold text-shironeri transition-colors hover:bg-transparent hover:text-asagi"
        >
          続きを見る
        </Link>
      </div>
    </section>
  );
}
