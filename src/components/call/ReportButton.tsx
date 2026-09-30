"use client";

import { useState } from "react";
import { REASONS, SAFETY, NOTE_MAX, type ReasonId } from "@/lib/safety/report";
import { track } from "@/lib/analytics";

// 通話中の、報告する場所。
//
// ══════════════════════════════════════════════════
// 常に出しておく
// ══════════════════════════════════════════════════
// メニューの奥に入れない。何かあった瞬間に探させない。
// 「通話を終える」の隣に、同じ大きさで置く。
//
// ══════════════════════════════════════════════════
// 押す前に、損をしないと書く
// ══════════════════════════════════════════════════
// 報酬が引かれると思っている人は、通報しない。
// 我慢したほうが得になる仕組みにしない。
//
// ══════════════════════════════════════════════════
// 出したあと、続けさせない
// ══════════════════════════════════════════════════
// 「受け取りました」で画面を閉じない。
// そのまま通話を終えていいと、はっきり書く。

export default function ReportButton({
  responder,
  callSessionId,
  consultationId,
  onDone,
}: {
  /** 答える側の鍵。これが無ければ出さない */
  responder: string;
  callSessionId?: string | null;
  consultationId?: string | null;
  /** 出したあと、通話を終えるとき */
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState<ReasonId | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!reason) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/safety/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responder,
          call: callSessionId ?? null,
          consultation: consultationId ?? null,
          reason,
          note: note.trim() || null,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "受け取れませんでした");
      setSent(true);
      track("safety_report_submitted", { reason });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          track("safety_report_opened", {});
        }}
        className="inline-flex min-h-[56px] items-center justify-center rounded-pill border border-line bg-paper px-5 text-[13px] font-bold text-steel"
      >
        {SAFETY.open}
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label={SAFETY.head}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate/40 p-4 sm:items-center"
    >
      <div className="max-h-[86vh] w-full max-w-[26em] overflow-y-auto rounded-card bg-paper p-5 shadow-card">
        {sent ? (
          <>
            <p className="text-[15px] font-black leading-[1.6] text-slate">
              {SAFETY.after}
            </p>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDone?.();
              }}
              className="mt-5 min-h-[52px] w-full rounded-pill bg-rose-fill px-6 text-[15px] font-bold text-paper"
            >
              {SAFETY.duringCall}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 min-h-[44px] w-full text-[13px] font-bold text-steel"
            >
              閉じる
            </button>
          </>
        ) : (
          <>
            <p className="text-[16px] font-black text-slate">{SAFETY.head}</p>
            {/* 押す前に必ず読ませる。あとに置くと、読む前に閉じる */}
            <p className="mt-2 rounded-soft bg-mist px-3.5 py-2.5 text-[12.5px] leading-[1.8] text-steel">
              {SAFETY.promise}
            </p>

            <ul className="mt-4 flex flex-col gap-2">
              {REASONS.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setReason(r.id)}
                    aria-pressed={reason === r.id}
                    className={`min-h-[48px] w-full rounded-card border px-4 py-2.5 text-left text-[13.5px] font-bold ${
                      reason === r.id
                        ? "border-brand bg-brand-tint text-brand-deep"
                        : "border-line bg-paper text-slate"
                    }`}
                  >
                    {r.label}
                  </button>
                </li>
              ))}
            </ul>

            <textarea
              rows={2}
              value={note}
              maxLength={NOTE_MAX}
              onChange={(e) => setNote(e.target.value)}
              placeholder="書ける範囲で構いません（任意）"
              className="mt-3 w-full rounded-card border border-line bg-paper px-3.5 py-2.5 text-[13.5px] leading-[1.7] text-slate"
            />

            {error && (
              <p className="mt-2 text-[12.5px] leading-[1.8] text-rose-text">{error}</p>
            )}

            <button
              type="button"
              disabled={!reason || busy}
              onClick={() => void send()}
              className="mt-4 min-h-[52px] w-full rounded-pill bg-brand px-6 text-[15px] font-bold text-paper disabled:opacity-40"
            >
              報告する
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 min-h-[44px] w-full text-[13px] font-bold text-steel"
            >
              やめる
            </button>
          </>
        )}
      </div>
    </div>
  );
}
