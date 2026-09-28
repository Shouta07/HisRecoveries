"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

// 今、答えられます。
//
// ── これだけで始められる ──────────────────────────
// 予定も、時間帯の設定も、カレンダーも置かない。
// 空いたときに ON、終わったら OFF。それだけ。
//
// ── ONのまま放置させない ──────────────────────────
// 4時間で自動的に戻る。そのことを画面に書く。
// 書かないと「ONにしたのに来ない」と思われる。

export default function AvailableToggle({
  token,
  initial,
  until,
  verified,
}: {
  token: string;
  initial: boolean;
  until: string | null;
  verified: boolean;
}) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endsAt, setEndsAt] = useState<string | null>(until);

  async function toggle() {
    if (busy) return;
    const next = !on;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/responder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, available: next }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(j.error ?? "切り替えられませんでした");
        setBusy(false);
        return;
      }
      setOn(next);
      setEndsAt(j.until ?? null);
      track("responder_available", { on: next });
      setBusy(false);
    } catch {
      setError("通信できませんでした。もう一度お試しください。");
      setBusy(false);
    }
  }

  const time = endsAt
    ? new Date(endsAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div
      className={`rounded-card border p-6 shadow-card ${
        on ? "border-ok bg-ok-tint" : "border-line bg-paper"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2.5 text-[17px] font-black">
            {on && (
              <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
                <span className="absolute inline-flex h-full w-full rounded-full bg-ok opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ok" />
              </span>
            )}
            {on ? "今、答えられます" : "いまは受け取っていません"}
          </p>
          <p className="mt-2 text-[12.5px] leading-[1.75] text-steel">
            {!verified
              ? "年齢の確認が済むと、受け取りを開始できます。"
              : on
                ? `条件に合う相談が届きます。${time ? `${time}に自動で止まります。` : ""}`
                : "オンにすると、条件に合う相談が届きます。"}
          </p>
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={busy || !verified}
          role="switch"
          aria-checked={on}
          aria-label="今、答えられます"
          className={`relative h-[38px] w-[68px] shrink-0 rounded-pill transition-colors disabled:opacity-40 ${
            on ? "bg-ok" : "bg-line"
          }`}
        >
          <span
            className={`absolute top-[4px] h-[30px] w-[30px] rounded-full bg-paper shadow-card transition-[left] ${
              on ? "left-[34px]" : "left-[4px]"
            }`}
          />
        </button>
      </div>

      {error && <p className="mt-4 text-[13px] text-slate">{error}</p>}
    </div>
  );
}
