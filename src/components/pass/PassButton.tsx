"use client";

import { useEffect, useState } from "react";
import { myToken, DEVICE_WARNING } from "@/lib/pass/me";
import { PAYWALL_CTA, MANAGE_LABEL } from "@/lib/pass/copy";

/* 月額の申し込みボタン。

   ── 口はあったが、押す場所が無かった ──────────────
   /api/pass/checkout も /api/pass/portal も作ってあるのに、
   画面に繋がっていなかった。ここがその接続。

   ── 値段を画面で決めない ────────────────────────
   いくらになるかはサーバーが決める（枠が残っていれば β 価格）。
   ここは聞いて出すだけ。画面に決めさせると、枠が埋まったあとも
   β 価格で表示できてしまう。

   ── 入っている人には、申し込みを見せない ──────────
   代わりに「プランを管理」を出す。二重に契約させない。 */

type Standing =
  | { active: false; yen: number; beta: boolean; seatsLeft: number; seatLine: string | null }
  | { active: true; left: { humanLeft: number; voiceLeft: number }; notice: string | null };

export default function PassButton() {
  const [state, setState] = useState<Standing | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = myToken();
    if (!t) return;
    fetch(`/api/pass/standing?t=${encodeURIComponent(t)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setState(j))
      .catch(() => setState(null));
  }, []);

  async function go(path: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userToken: myToken() }),
      });
      const j = await res.json();
      if (j?.url) {
        window.location.href = j.url as string;
        return;
      }
      // すでに入っている人は、管理画面へ回す
      if (res.status === 409 && j?.manage) {
        return go(j.manage as string);
      }
      setError(typeof j?.error === "string" ? j.error : "いまお手続きできませんでした");
    } catch {
      setError("通信できませんでした。少し時間をおいてお試しください");
    } finally {
      setBusy(false);
    }
  }

  // 入っている人
  if (state?.active) {
    return (
      <div className="mt-4">
        {state.notice && (
          <p className="mb-3 rounded-soft bg-mist px-3 py-2.5 text-[12.5px] leading-[1.75] text-steel">
            {state.notice}
          </p>
        )}
        <p className="mb-3 text-[13px] text-steel">
          今月の残り — 確カメる {state.left.humanLeft}回 ／ 恋亀と話す {state.left.voiceLeft}分
        </p>
        <button
          type="button"
          onClick={() => go("/api/pass/portal")}
          disabled={busy}
          className="min-h-[48px] w-full rounded-pill border border-line bg-paper px-5 text-[14px] font-bold text-slate disabled:opacity-60"
        >
          {busy ? "開いています…" : MANAGE_LABEL}
        </button>
        {error && <p className="mt-2 text-[12.5px] text-steel">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-4">
      {state && !state.active && state.seatLine && (
        <p className="mb-3 rounded-soft bg-mist px-3 py-2.5 text-[12.5px] font-bold leading-[1.75] text-slate">
          {state.seatLine}
        </p>
      )}
      <button
        type="button"
        onClick={() => go("/api/pass/checkout")}
        disabled={busy}
        className="min-h-[52px] w-full rounded-pill bg-brand px-5 text-[15px] font-black text-paper disabled:opacity-60"
      >
        {busy ? "お手続きへ進んでいます…" : PAYWALL_CTA}
      </button>
      <p className="mt-2.5 text-[11.5px] leading-[1.75] text-steel">{DEVICE_WARNING}</p>
      {error && <p className="mt-2 text-[12.5px] text-steel">{error}</p>}
    </div>
  );
}
