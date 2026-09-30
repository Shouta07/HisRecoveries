"use client";

import { useState } from "react";
import {
  OUTCOMES,
  ASK_OUTCOME,
  WHY_ASK,
  NOTE_MAX,
  outcomeLabel,
  type OutcomeId,
} from "@/lib/ask/outcome";
import { track } from "@/lib/analytics";

// その後どうなったか。
//
// ══════════════════════════════════════════════════
// 一度で終わらせる
// ══════════════════════════════════════════════════
// 押したら、その場で終わり。
// 「送信」をもう1回押させない。ひとことは、押したあとの任意。
//
// 手数を1つ足すごとに、答える人は半分になる。
// ここで取りたいのは回収率ではなく、次の相談のための続きなので、
// 押した時点で用は足りている。
//
// ══════════════════════════════════════════════════
// 良い結果だけを集めない
// ══════════════════════════════════════════════════
// 「返信がなかった」を押しにくい見た目にしない。
// 色も大きさも、6つとも同じにする。
// 押しやすさで差を付けた時点で、集まるのは良い話だけになる。
//
// ══════════════════════════════════════════════════
// 書き換えさせない
// ══════════════════════════════════════════════════
// 一度教えてもらったら、選び直せない。
// 書き換えられると、何が起きたかの記録ではなく、
// あとからの感想になる。

export default function Outcome({
  token,
  already,
}: {
  token: string;
  /** すでに教えてもらっているなら、その中身 */
  already?: { outcome: string; note: string | null } | null;
}) {
  const [done, setDone] = useState<OutcomeId | null>(
    already ? (already.outcome as OutcomeId) : null,
  );
  const [note, setNote] = useState("");
  const [noteSent, setNoteSent] = useState(Boolean(already?.note));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(outcome: OutcomeId, withNote?: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/outcome/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome, note: withNote ?? null }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "書けませんでした");
      setDone(outcome);
      track("outcome_recorded", { outcome });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-card border border-line bg-paper px-5 py-5 shadow-card">
        <p className="text-[13.5px] font-bold leading-[1.7] text-slate">
          ありがとうございます。「{outcomeLabel(done)}」として残しました。
        </p>
        <p className="mt-1.5 text-[12.5px] leading-[1.8] text-steel">
          次に相談するとき、ここから続けられます。
        </p>

        {/* ひとことは、押したあとの任意。先に出すと手数が増える */}
        {!noteSent && (
          <div className="mt-4 border-t border-line pt-4">
            <label className="block text-[12.5px] font-bold text-steel">
              何か一言あれば（任意）
            </label>
            <textarea
              rows={2}
              value={note}
              maxLength={NOTE_MAX}
              onChange={(e) => setNote(e.target.value)}
              placeholder="相手を特定できることは書かないでください。"
              className="mt-2 w-full rounded-card border border-line bg-paper px-3.5 py-2.5 text-[13.5px] leading-[1.7] text-slate"
            />
            <button
              type="button"
              disabled={busy || !note.trim()}
              onClick={() => {
                void send(done, note.trim()).then(() => setNoteSent(true));
              }}
              className="mt-2 inline-flex min-h-[44px] items-center rounded-pill border border-line bg-paper px-4 text-[13px] font-bold text-slate disabled:opacity-40"
            >
              これも残す
            </button>
          </div>
        )}
        {error && <p className="mt-2 text-[12.5px] text-rose-text">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-card border border-line bg-paper px-5 py-5 shadow-card">
      <p className="text-[15px] font-black leading-[1.6] text-slate">{ASK_OUTCOME}</p>
      <p className="mt-1.5 text-[12.5px] leading-[1.8] text-steel">{WHY_ASK}</p>

      {/* 6つとも同じ見た目にする。
          押しやすさで差を付けると、集まるのは良い話だけになる */}
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {OUTCOMES.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              disabled={busy}
              onClick={() => void send(o.id)}
              className="min-h-[48px] w-full rounded-card border border-line bg-paper px-4 py-2.5 text-left text-[13.5px] font-bold leading-[1.6] text-slate transition-shadow hover:shadow-card disabled:opacity-40"
            >
              {o.label}
            </button>
          </li>
        ))}
      </ul>

      {error && <p className="mt-3 text-[12.5px] leading-[1.8] text-rose-text">{error}</p>}
    </div>
  );
}
