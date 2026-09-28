"use client";

import { useState } from "react";
import { RELATIONS, type RelationId } from "@/lib/ask/model";
import { AttributeChip as Chip, inputClass } from "@/components/brand/kit";
import { track } from "@/lib/analytics";

// うまく書けない人の逃げ道。
//
// ── 全員に、自分で言語化させない ──────────────────
// 自由入力だけにすると、書ける人しか通れない。
// 「何を聞けばいいのか分からない」が、いちばん多い止まり方。
//
// ── 話しながら整理する、の代わり ──────────────────
// 本当は実在の人と話しながら整理してもらうのがいい。
// ただしその商品はまだ受け付けていない（相手も実在の人なので、
// 時間を決めた受け入れ方と、その場を見る体制が要る）。
// それまでのあいだ、3つ聞いて質問を組み立てるところまでをやる。
//
// ── こちらで勝手に送らない ────────────────────────
// 組み立てた文は入力欄に入れるだけ。直せるし、消せる。
// 本人が読んでいない文を、本人の言葉として人に配らない。

const WORRIES = [
  { id: "send", label: "送っていいのか", ask: "これ、送っていいと思いますか？" },
  { id: "heavy", label: "重くないか", ask: "これ、重く感じますか？" },
  { id: "tone", label: "言い方が合っているか", ask: "この言い方、どう感じますか？" },
  { id: "timing", label: "タイミング", ask: "いま送るのは早いと思いますか？" },
  { id: "howseen", label: "どう見えるか", ask: "これ、どう見えますか？" },
] as const;

type WorryId = (typeof WORRIES)[number]["id"];

export default function AskAssist({
  onDone,
  onClose,
}: {
  /** 組み立てた文を入力欄に入れる */
  onDone: (text: string) => void;
  onClose: () => void;
}) {
  const [what, setWhat] = useState("");
  const [worry, setWorry] = useState<WorryId | null>(null);
  const [relation, setRelation] = useState<RelationId | null>(null);

  const answered = [what.trim(), worry, relation].filter(Boolean).length;
  const ready = what.trim().length >= 4 && worry !== null;

  function build() {
    const w = WORRIES.find((x) => x.id === worry);
    const rel = RELATIONS.find((r) => r.id === relation);
    const lines = [
      rel ? `${rel.label}の相手です。` : null,
      what.trim(),
      w?.ask,
    ].filter(Boolean);
    track("assist_done", { n: answered });
    onDone(lines.join("\n"));
  }

  return (
    <div className="motion-safe:animate-hr-rise mt-4 rounded-card border border-brand bg-mist p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15.5px] font-black">一緒に整理しましょう。</p>
          <p className="mt-1.5 text-[12.5px] leading-[1.75] text-steel">
            3つだけ聞きます。うまく言えていなくて大丈夫です。
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-m-2 shrink-0 p-2 text-[13px] text-steel transition-colors hover:text-slate"
        >
          閉じる
        </button>
      </div>

      <div className="mt-5">
        <p className="text-[13px] font-bold">1. 何があった？</p>
        <textarea
          rows={3}
          autoFocus
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          placeholder="例: 3日前に会って、そのあと連絡が空いている"
          className={`mt-2 ${inputClass}`}
        />
      </div>

      <div className="mt-5">
        <p className="text-[13px] font-bold">2. いちばん気になっているのは？</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {WORRIES.map((w) => (
            <Chip key={w.id} on={worry === w.id} onClick={() => setWorry(w.id)}>
              {w.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[13px] font-bold">
          3. 相手とはどんな関係？
          <span className="ml-2 text-[11.5px] font-normal text-steel">任意</span>
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {RELATIONS.map((r) => (
            <Chip
              key={r.id}
              on={relation === r.id}
              onClick={() => setRelation(relation === r.id ? null : r.id)}
            >
              {r.label}
            </Chip>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={build}
        disabled={!ready}
        className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-pill bg-brand px-6 text-[15px] font-bold text-paper shadow-card transition-shadow hover:shadow-card-hover disabled:bg-line disabled:text-steel disabled:shadow-none"
      >
        これで質問をつくる
      </button>
      <p className="mt-3 text-[11.5px] leading-[1.75] text-steel">
        つくった文は入力欄に入るだけです。そのまま送られることはありません。直せます。
      </p>
    </div>
  );
}
