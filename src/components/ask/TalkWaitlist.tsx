"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

// 「話す」の順番待ち。
//
// ── 買えないものを、買えるように見せない ──────────
// ボタンは「順番待ちに入る」。「今すぐ話す」にしない。
// 押した人が課金画面に行かないことが、押す前に分かるようにする。

export default function TalkWaitlist() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (state !== "idle" || !email.trim()) return;
    setState("sending");
    setError(null);
    try {
      const r = await fetch("/api/talk/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(j.error ?? "登録できませんでした");
        setState("idle");
        return;
      }
      track("talk_waitlist", {});
      setState("done");
    } catch {
      setError("通信できませんでした。もう一度お試しください。");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <p className="mt-5 rounded-card border border-ok bg-ok-tint px-5 py-4 text-[14px] leading-[1.85]">
        順番待ちに入りました。受け付けを始めたらお知らせします。
      </p>
    );
  }

  return (
    <div className="mt-5">
      <label className="block text-[12.5px] font-bold text-steel" htmlFor="talk-email">
        受け付けを始めたら知らせる
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id="talk-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-h-[52px] w-full rounded-pill border border-line bg-paper px-5 text-[15px] text-slate outline-none transition-colors placeholder:text-steel/70 focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
        <button
          type="button"
          onClick={send}
          disabled={state === "sending" || !email.trim()}
          className="inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-pill bg-slate px-6 text-[14.5px] font-bold text-paper transition-opacity hover:opacity-90 disabled:bg-line disabled:text-steel"
        >
          {state === "sending" ? "送っています…" : "順番待ちに入る"}
        </button>
      </div>
      {error && <p className="mt-2.5 text-[13px] text-slate">{error}</p>}
      <p className="mt-2.5 text-[11.5px] leading-[1.75] text-steel">
        いまお金はかかりません。お知らせ以外には使いません。
      </p>
    </div>
  );
}
