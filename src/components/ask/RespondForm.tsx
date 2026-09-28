"use client";

import { useState } from "react";
import {
  VERDICTS, PICKS, SECONDS, COMMENT_MIN, COMMENT_MAX,
  type Verdict, type Pick, type Second,
} from "@/lib/ask/model";
import { Choice, Action, Note, FieldLabel as Label, inputClass } from "@/components/brand/kit";

// 回答の入力。
//
// ── 選ぶ → 理由を書く、の2つだけ ──────────────────
// ここに項目を足すほど、回答は集まらなくなる。
// 足したくなったら、代わりに何を落とすかを考える場所にする。
//
// ── 理由を必須にする ──────────────────────────────
// 選択肢だけだと、相談者に届くのは数字だけになる。
// この製品の価値は「なぜそう感じたか」のほうにある。
//
// ── 送ったあと、稼げたことが見えること ────────────
// 「ありがとうございました」で終わらせない。
// 確認を通った瞬間に残高へ入るので、その額と今日の合計を出す。
// 答える側から見て「答えたらすぐ稼げた」が手触りとして残る。
//
// 銀行への振り込みは毎回はしない（1件ごとに振り込むと
// 送金の手数料と手間だけが積み上がる）。そのことも書く。
// 「すぐ入った」と「まだ振り込まれていない」を混同させない。

export default function RespondForm({
  token,
  isAb,
  secondAsk,
}: {
  token: string;
  isAb: boolean;
  /** カテゴリごとの2つ目の問い。無いカテゴリでは undefined */
  secondAsk?: string;
}) {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [pick, setPick] = useState<Pick | null>(null);
  const [second, setSecond] = useState<Second | null>(null);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  // 送信の返事に入っていれば出す。入っていなければ額は出さない
  // （金額を勝手に見せると、入っていない報酬を見せることになる）。
  const [paid, setPaid] = useState<{ yen: number; todayYen: number; todayCount: number } | null>(
    null,
  );

  const chosen = isAb ? pick !== null : verdict !== null;
  const long = comment.trim().length >= COMMENT_MIN;
  const canSend = chosen && long && state !== "sending";

  async function send() {
    setState("sending");
    setError(null);
    try {
      const res = await fetch(`/api/respond/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verdict, pick, second, comment: comment.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "送れませんでした");
        setState("error");
        return;
      }
      if (
        typeof json.paidYen === "number" &&
        typeof json.todayYen === "number" &&
        typeof json.todayCount === "number"
      ) {
        setPaid({ yen: json.paidYen, todayYen: json.todayYen, todayCount: json.todayCount });
      }
      setState("done");
    } catch {
      setError("通信できませんでした。もう一度お試しください。");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="mt-10">
        {paid && paid.yen > 0 && (
          <div className="motion-safe:animate-hr-rise rounded-card border border-ok bg-ok-tint p-6">
            <p className="text-[34px] font-black tabular-nums leading-none text-ok-text">
              +¥{paid.yen.toLocaleString()}
            </p>
            <p className="mt-3 text-[13px] font-bold text-slate">
              今日の報酬 ¥{paid.todayYen.toLocaleString()}
              <span className="ml-2 font-normal text-steel">{paid.todayCount}件</span>
            </p>
            <p className="mt-4 text-[12px] leading-[1.85] text-steel">
              残高に入りました。銀行へのお振り込みは、まとまってからまとめて行います
              （1件ずつだと送金の手数料のほうが大きくなるためです）。
            </p>
          </div>
        )}

        <p className="mt-7 text-[16px] font-bold text-slate">ありがとうございました。</p>
        <p className="mt-3 text-[14.5px] leading-[2] text-steel">
          相談した方に、匿名で届きます。お伝えするのは年代だけです。
          新しい相談が来たら、またお知らせします。
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <Label>{isAb ? "どちらがいいと思いますか" : "どう思いますか"}</Label>
      <div className="mt-3 flex flex-col gap-2.5">
        {isAb
          ? PICKS.map((p) => (
              <Choice key={p.id} on={pick === p.id} onClick={() => setPick(p.id)}>
                {p.label}
              </Choice>
            ))
          : VERDICTS.map((v) => (
              <Choice key={v.id} on={verdict === v.id} onClick={() => setVerdict(v.id)}>
                {v.label}
              </Choice>
            ))}
      </div>

      {/* カテゴリごとの、もう1つの問い。
          「良い／微妙」の一歩先が、相談者がいちばん知りたいこと。 */}
      {secondAsk && (
        <div className="mt-9">
          <Label>{secondAsk}</Label>
          <div className="mt-3 flex gap-2.5">
            {SECONDS.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setSecond(second === x.id ? null : x.id)}
                aria-pressed={second === x.id}
                className={`inline-flex min-h-[48px] flex-1 items-center justify-center rounded-[10px] border text-[15px] transition-colors duration-200 ${
                  second === x.id
                    ? "border-slate bg-brand text-paper"
                    : "border-line bg-transparent text-slate hover:border-slate"
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-9">
        <Label>そう思った理由</Label>
        <textarea
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, COMMENT_MAX))}
          placeholder="思ったことを、そのまま書いてください。丁寧に整えなくて構いません。"
          className={`mt-3 ${inputClass}`}
        />
        <p className="mt-2 text-right text-[12px] tabular-nums text-steel">
          {comment.trim().length} / {COMMENT_MIN}文字以上
        </p>
      </div>

      {error && (
        <p className="mt-5 border-l border-slate pl-3.5 text-[14px] leading-[1.9] text-slate">
          {error}
        </p>
      )}

      <div className="mt-6">
        <Action onClick={send} disabled={!canSend}>
          {state === "sending" ? "送っています…" : "回答を送る"}
        </Action>
      </div>

      <div className="mt-5">
        <Note>
          お名前も年齢も相談者には渡しません。伝わるのは年代だけです。
          連絡先が書かれていた場合は、こちらで伏せます。
          謝礼のお支払いは、運営から個別にご連絡します。
        </Note>
      </div>
    </div>
  );
}
