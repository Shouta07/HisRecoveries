"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

// A/B の結果を共有する。
//
// ── A/B のときだけ出す ────────────────────────────
// 「このLINE、送っていい？」は晒せない。本文が本人のものだから。
// 「この2枚、5人中4人がB」は晒せる。
// 晒せないものに共有ボタンを出すと、押した人が後悔する。
//
// ── 相談の鍵を渡さない ────────────────────────────
// 共有するのは別の鍵（s...）。
// 開けるのは割れ方とひとことだけで、AとBの中身も本文も出ない。

export default function ShareAb({
  token,
  a,
  b,
  total,
  labelA,
  labelB,
}: {
  token: string;
  a: number;
  b: number;
  total: number;
  labelA: string;
  labelB: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const win = a >= b ? labelA : labelB;
  const n = Math.max(a, b);
  const line = `${total}人中${n}人が${win}。`;

  async function make() {
    if (busy || url) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.token) {
        setError(j.error ?? "リンクを作れませんでした");
        setBusy(false);
        return;
      }
      const made = `${window.location.origin}/s/${j.token}`;
      setUrl(made);
      track("share_created", {});

      // 端末の共有が使えるなら、そのまま渡す。
      if (navigator.share) {
        try {
          await navigator.share({ title: line, text: line, url: made });
          track("share_sent", { how: "native" });
        } catch {
          // 閉じただけ。リンクは残す。
        }
      }
      setBusy(false);
    } catch {
      setError("通信できませんでした。もう一度お試しください。");
      setBusy(false);
    }
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(`${line} ${url}`);
      setCopied(true);
      track("share_sent", { how: "copy" });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("コピーできませんでした。リンクを長押しして選んでください。");
    }
  }

  return (
    <section className="mt-10 rounded-card border border-line bg-mist p-5">
      <p className="text-[14.5px] font-bold">{line}</p>
      <p className="mt-2 text-[12.5px] leading-[1.8] text-steel">
        この結果だけを共有できます。AとBの中身も、聞いた内容も出ません。
      </p>

      {!url ? (
        <button
          type="button"
          onClick={make}
          disabled={busy}
          className="mt-4 inline-flex min-h-[48px] items-center justify-center rounded-pill bg-brand px-6 text-[14px] font-bold text-paper shadow-card transition-shadow hover:shadow-card-hover disabled:bg-line disabled:text-steel disabled:shadow-none"
        >
          {busy ? "作っています…" : "結果を共有する"}
        </button>
      ) : (
        <div className="mt-4">
          <p className="select-all break-all rounded-soft border border-line bg-paper px-3.5 py-2.5 text-[12.5px] text-steel">
            {url}
          </p>
          <button
            type="button"
            onClick={copy}
            className="mt-2.5 inline-flex min-h-[44px] items-center rounded-pill border border-line bg-paper px-4 text-[13px] font-bold text-slate transition-shadow hover:shadow-card"
          >
            {copied ? "コピーしました" : "コピーする"}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-[13px] text-slate">{error}</p>}
    </section>
  );
}
