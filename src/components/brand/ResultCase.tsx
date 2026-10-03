"use client";

import { useEffect, useRef, useState } from "react";
import type { Case } from "@/lib/ask/cases";
import { VERDICTS } from "@/lib/ask/model";

// 返ってくるものを、そのままの形で見せる。
//
// ══════════════════════════════════════════════════
// チャットをやめた
// ══════════════════════════════════════════════════
// ここは吹き出しのやりとりだった（ChatCase）。
// 自分が書いたものを右、返ってきたものを左に置いて、
// 「入力中…」を挟みながら順番に出していた。
//
// やめた理由は2つ。
//
// 1 売っているものと、形が合っていない
//   吹き出しが並ぶ画面は、相談員と話す場所に見える。
//   買うと来るのは会話ではなく、1回ぶんの結果。
//     読んだ人の判定 → そう思った理由 → そのまま送れる文
//   会話に見せると、何回やりとりできるのかを考えさせてしまう。
//   実際は1往復なので、期待と違うものが届くことになる。
//
// 2 縦に長い
//   吹き出しは幅を 82〜90% に絞るので、同じ文でも行数が増える。
//   状況の長文が、それだけで画面半分を使っていた。
//   1,231px あって、トップでいちばん高い部品だった。
//
// ══════════════════════════════════════════════════
// 順番は変えていない
// ══════════════════════════════════════════════════
// 伝えたい順番は、吹き出しのときと同じ。
//   状況（長文）→ 文面 → 判定と理由 → そのまま送れる文 → 決めたこと
//
// 変えたのは入れ物だけ。横幅をいっぱいに使い、
// 段ごとに区切る。読む順番は上から下で変わらない。
//
// ══════════════════════════════════════════════════
// 動きは残す
// ══════════════════════════════════════════════════
// 順番があることは、動かすといちばん早く伝わる。
// 吹き出しのような一言ずつではなく、段ごとに出す。
//
// 出る前の場所も高さを取っておく（下が飛ばない）。
// prefers-reduced-motion のときは最初から全部出す。
//
// ══════════════════════════════════════════════════
// 1行の文面に、一言が返る絵にしない
// ══════════════════════════════════════════════════
// 前はこうだった。
//   「明日楽しみにしてる！お店は19時でどう？」
//   → 「自然でいいと思います」
//
// これは無料で誰にでも言えることで、払う理由にならない。
// 実際に来る相談には、そこに至るまでが付いている。
// どこで知り合って、何往復目で、何を気にしているか。
// そこまで渡すから、返ってくるものが変わる。
// 見本でも、その形のまま見せる。
//
// ══════════════════════════════════════════════════
// 実際のやりとりではない
// ══════════════════════════════════════════════════
// 画面の見本。実在の誰かのLINEではない。
// 見本だと分かる札は、この部品の外（page.tsx）で必ず付ける。

/** 段を1つずつ出す間隔（ミリ秒） */
const STEP_MS = 700;

/** 判定の色。言葉だけだと、ぱっと見でどちら寄りか分からない */
function tone(v: string): string {
  if (v === "as_is") return "bg-ok-tint text-ok-text";
  if (v === "change") return "bg-warn-tint text-warn-text";
  return "bg-mist text-steel";
}

/** 段の見出し。小さく、太く。中身と大きさを争わせない */
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-black tracking-[0.04em] text-steel">{children}</p>;
}

/**
 * compact … 出したもの（長い状況）と、そのまま送れる形を出さない。
 *
 * トップで恋亀が主役になってから、ここは「3人に聞ける」を見せる節になった。
 * 深さ（状況を渡すから返ってくるものが変わる）は、恋亀の会話が見せている。
 * 同じ役を2回やらない。
 */
export default function ResultCase({ c, compact = false }: { c: Case; compact?: boolean }) {
  const box = useRef<HTMLDivElement | null>(null);
  // 何段目まで出したか
  const [shown, setShown] = useState(0);
  const total = 4;

  useEffect(() => {
    const el = box.current;
    if (!el) return;

    // 動きを切っている人には、最初から全部。待たせない。
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      setShown(total);
      return;
    }

    const timers: number[] = [];
    // 画面に入ってから始める。入る前に終わっていると、順番が伝わらない。
    const io = new IntersectionObserver(
      (es) => {
        if (!es[0]?.isIntersecting) return;
        io.disconnect();
        for (let i = 1; i <= total; i++) {
          timers.push(window.setTimeout(() => setShown(i), STEP_MS * i));
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, []);

  /** その段が出ているか */
  const at = (n: number) => shown >= n;
  /** 出る前も場所を取っておく。出るたびに下が飛ばないように */
  const step = (n: number) =>
    `transition-all duration-300 ${at(n) ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`;

  return (
    <div ref={box} className="rounded-card border border-line bg-paper p-4 shadow-card sm:p-5">
      <p className="text-[11.5px] font-bold text-steel">{c.scene}</p>
      <h3 className="mt-1 text-[17px] font-black leading-[1.5] text-slate sm:text-[19px]">
        {c.decision}
      </h3>

      {/* ── 1. 出したもの ────────────────────────────
          状況と文面。文面だけ切り出して見せない。
          ここまで渡すから、返ってくるものが変わる */}
      <div className={`mt-4 rounded-card bg-sky px-3.5 py-3.5 sm:px-4 ${step(1)}`}>
        <Label>出したもの</Label>
        {c.context && !compact && (
          <p className="mt-2 text-[12.5px] leading-[1.8] text-steel">{c.context}</p>
        )}
        <p className="mt-2.5 rounded-card bg-brand px-3.5 py-2.5 text-[14px] font-bold leading-[1.7] text-paper">
          {c.draft.text}
        </p>
      </div>

      {/* ── 2. 返ってきたもの ────────────────────────
          判定を先に、理由をその下に。
          判定だけだと次に何をすればいいか分からず、
          理由だけだとどちら寄りの話か分からない */}
      <div className={`mt-3 ${step(2)}`}>
        <Label>返ってきたもの</Label>
        <ul className="mt-2 flex flex-col gap-2.5">
          {c.says.map((s) => {
            const label = VERDICTS.find((v) => v.id === s.verdict)?.label ?? "";
            return (
              <li
                key={s.say}
                className="rounded-card border border-line bg-paper px-3.5 py-3 shadow-card"
              >
                <p className="flex items-center gap-2 text-[11px] font-bold text-steel">
                  <span>{s.age}歳</span>
                  <span className={`rounded-pill px-2 py-0.5 font-black ${tone(s.verdict)}`}>
                    {label}
                  </span>
                </p>
                <p className="mt-1.5 text-[13.5px] leading-[1.8] text-slate">{s.say}</p>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── 3. そのまま送れる形 ──────────────────────
          感想だけ返して終わると、次に何をすればいいか分からない。
          直した文そのものと、どこをなぜ変えたかまで返す */}
      {c.fix && !compact && (
        <div className={`mt-3 ${step(3)}`}>
          <Label>{c.fix.label}</Label>
          <div className="mt-2 rounded-card border border-brand bg-paper shadow-card">
            <p className="px-3.5 py-3 text-[14px] font-bold leading-[1.8] text-slate">
              {c.fix.text}
            </p>
            <ul className="flex flex-col gap-1.5 border-t border-line px-3.5 py-3">
              {c.fix.why.map((w) => (
                <li key={w} className="flex items-start gap-2 text-[11.5px] leading-[1.7]">
                  <span aria-hidden className="mt-[3px] shrink-0 text-[10px] font-black text-brand">
                    ✓
                  </span>
                  <span className="min-w-0 text-steel">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── 4. 決めたこと ────────────────────────────
          返ってきたものを見て、本人が決める。
          決めるのはこちらではない（利用規約 第12条） */}
      <div className={`mt-3.5 flex items-start gap-2.5 border-t border-line pt-3.5 ${step(4)}`}>
        <span
          aria-hidden
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ok-tint text-[11px] font-black text-ok-text"
        >
          ✓
        </span>
        <p className="min-w-0 text-[13.5px] font-bold leading-[1.7] text-slate">
          <span className="text-steel">見て、決めたこと</span>
          <br />
          {c.decided}
        </p>
      </div>
    </div>
  );
}
