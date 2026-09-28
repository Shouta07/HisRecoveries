"use client";

import { useEffect, useRef, useState } from "react";
import {
  headline, subline, progress, type LiveCounts, type Phase,
} from "@/lib/ask/live";

// 届くまでの画面。
//
// ── 一件ずつ増える ────────────────────────────────
// まとめて出さない。届いた順に、1枚ずつ増える。
// 「次なんて返ってくるんだろう」が、この製品のいちばん面白いところ。
//
// ── 数を盛らない ──────────────────────────────────
// 出している数は全部サーバーから来た実数。
// 進み具合のバーも、届いた数からしか動かさない。
// 動いているように見せるために足したら、この画面は全部うそになる。
//
// ── 終わったら聞きにいくのをやめる ────────────────
// live:false が返ったら止める。
// 画面を開きっぱなしにする作りなので、止めないと叩き続ける。
//
// ── 見えないところで静かに待つ ────────────────────
// タブが裏にある間は問い合わせない。戻ってきたら、すぐ1回聞く。

type Answer = { id: string; ageBand: string; comment: string };

type Snapshot = {
  live: boolean;
  configured: boolean;
  phase?: Phase;
  counts?: LiveCounts;
  answers?: Answer[];
};

const AGE: Record<string, string> = {
  "20-24": "20代前半",
  "25-29": "25〜29歳",
  "30s": "30代",
  "30-34": "30代前半",
  "35-39": "30代後半",
  "40-49": "40代",
  any: "",
};

const EVERY_MS = 6000;

export default function LiveAnswers({
  token,
  panel,
  onDone,
}: {
  token: string;
  panel: number;
  /** 全部そろったときに1回だけ呼ぶ */
  onDone?: () => void;
}) {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [shown, setShown] = useState<Answer[]>([]);
  const doneRef = useRef(false);
  const stopRef = useRef(false);

  useEffect(() => {
    let timer: number | undefined;

    async function tick() {
      if (stopRef.current) return;
      // 裏にいる間は聞かない。戻ってきたら visibilitychange で拾う。
      if (document.visibilityState === "hidden") {
        timer = window.setTimeout(tick, EVERY_MS);
        return;
      }
      try {
        const r = await fetch(`/api/consult/${token}/live`, { cache: "no-store" });
        if (r.ok) {
          const j: Snapshot = await r.json();
          setSnap(j);
          if (j.answers) setShown(j.answers);
          if (!j.live) {
            stopRef.current = true;
            if (!doneRef.current && j.phase === "done") {
              doneRef.current = true;
              onDone?.();
            }
            return;
          }
        }
      } catch {
        // 通信が切れただけかもしれない。黙って次の回で拾う。
      }
      timer = window.setTimeout(tick, EVERY_MS);
    }

    tick();
    const wake = () => {
      if (document.visibilityState === "visible" && !stopRef.current) {
        window.clearTimeout(timer);
        tick();
      }
    };
    document.addEventListener("visibilitychange", wake);
    return () => {
      stopRef.current = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [token, onDone]);

  const counts: LiveCounts = snap?.counts ?? {
    panel,
    sent: 0,
    opened: 0,
    answered: 0,
  };
  const phase: Phase = snap?.phase ?? "sending";
  const pct = Math.round(progress(counts) * 100);
  const sub = subline(counts, phase);

  return (
    <div>
      {/* いまどこ */}
      <div className="flex items-start gap-3">
        {phase !== "done" && (
          <span className="relative mt-2 flex h-3 w-3 shrink-0" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-brand" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-huge font-black leading-[1.3]">{headline(counts, phase)}</p>
          {sub && <p className="mt-3 text-[14.5px] leading-[1.85] text-steel">{sub}</p>}
        </div>
      </div>

      {/* 進み具合。届いた数からしか動かさない */}
      <div className="mt-7">
        <div
          className="h-2 w-full overflow-hidden rounded-pill bg-mist"
          role="progressbar"
          aria-valuenow={counts.answered}
          aria-valuemin={0}
          aria-valuemax={counts.panel}
          aria-label="届いた回答"
        >
          <span
            className="block h-full rounded-pill bg-brand transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2.5 text-[12.5px] font-bold tabular-nums text-steel">
          {counts.answered} / {counts.panel}
        </p>
      </div>

      {/* 届いた順に1枚ずつ */}
      {shown.length > 0 && (
        <ul className="mt-8 flex flex-col gap-3">
          {shown.map((a, i) => (
            <li
              key={a.id}
              className="motion-safe:animate-hr-rise rounded-card border border-line bg-paper p-5 shadow-card"
              style={{ animationDelay: `${Math.min(i, 4) * 60}ms` }}
            >
              <p className="text-[11.5px] font-bold tabular-nums text-brand">
                {i + 1} / {counts.panel}
              </p>
              <p className="mt-1.5 text-[12.5px] font-bold text-slate">
                {AGE[a.ageBand] ? `${AGE[a.ageBand]}・女性` : "女性"}から届きました
              </p>
              <p className="mt-2.5 text-[16px] leading-[1.85]">「{a.comment}」</p>
            </li>
          ))}
        </ul>
      )}

      {/* まだ1件も無いとき。空白にしない */}
      {shown.length === 0 && phase !== "paying" && (
        <ul className="mt-8 flex flex-col gap-3" aria-hidden>
          {Array.from({ length: Math.min(3, panel) }).map((_, i) => (
            <li
              key={i}
              className="rounded-card border border-dashed border-line bg-paper p-5"
              style={{ opacity: 1 - i * 0.28 }}
            >
              <span className="block h-2.5 w-16 rounded-pill bg-mist" />
              <span className="mt-3.5 block h-3 w-full rounded-pill bg-mist" />
              <span className="mt-2 block h-3 w-2/3 rounded-pill bg-mist" />
            </li>
          ))}
        </ul>
      )}

      {snap && !snap.configured && (
        <p className="mt-8 rounded-card border border-line bg-mist px-5 py-4 text-[13.5px] leading-[1.85] text-steel">
          いまこの環境はデータベースに接続されていません。接続されると、ここに回答が届きます。
        </p>
      )}
    </div>
  );
}
