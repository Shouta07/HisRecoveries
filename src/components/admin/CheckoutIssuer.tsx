"use client";

// お支払いリンクの発行フォーム（管理画面）。
// 金額はサーバーが決めるので、ここからは送らない（tier だけ選ぶ）。

import { useState } from "react";
import { TIERS, yen, type TierId } from "@/lib/pricing";

type Result = {
  url: string;
  sessionId: string;
  amount: number;
  tierLabel: string;
  expiresAt: number;
  liveMode: boolean;
  warning: string | null;
};

export default function CheckoutIssuer({ seatsLeft }: { seatsLeft: number }) {
  const [tier, setTier] = useState<TierId>(seatsLeft > 0 ? "founder" : "standard");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function issue(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, email, name, scheduledFor, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "発行に失敗しました");
      } else {
        setResult(data as Result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "通信に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full border border-hair-line bg-white px-3 py-2 text-[13px] text-ink outline-none focus:border-gold transition-colors";
  const label = "block text-[11px] tracking-[0.1em] uppercase text-sub-gray mb-1.5";

  return (
    <div>
      <form onSubmit={issue} className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <span className={label}>価格</span>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TIERS) as TierId[]).map((t) => {
              const on = tier === t;
              const sold = t === "founder" && seatsLeft <= 0;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={sold}
                  onClick={() => setTier(t)}
                  className={`px-3 py-2 text-[12px] border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    on ? "border-gold text-gold" : "border-hair-line text-sub-gray hover:border-gold"
                  }`}
                >
                  {TIERS[t].label}　{yen(TIERS[t].amount)}
                  {t === "founder" && `（残 ${seatsLeft}）`}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={label} htmlFor="co-email">
            メールアドレス（必須）
          </label>
          <input
            id="co-email"
            type="email"
            required
            className={field}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className={label} htmlFor="co-name">
            お呼び名
          </label>
          <input
            id="co-name"
            className={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ニックネーム可"
          />
        </div>

        <div>
          <label className={label} htmlFor="co-date">
            実施日（東京・土日）
          </label>
          <input
            id="co-date"
            type="date"
            className={field}
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
          />
        </div>

        <div>
          <label className={label} htmlFor="co-note">
            運用メモ（顧客には出ません）
          </label>
          <input
            id="co-note"
            className={field}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="相談の経緯など"
          />
        </div>

        <div className="sm:col-span-2 flex items-center gap-4">
          <button
            type="submit"
            disabled={busy || !email}
            className="text-[12px] tracking-[0.1em] uppercase text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-4 py-2 disabled:opacity-40"
          >
            {busy ? "発行中…" : "お支払いリンクを発行"}
          </button>
          <span className="text-[11px] text-sub-gray">
            有効期限3日。同じ宛先・同じ価格・同じ実施日なら二重に作られません。
          </span>
        </div>
      </form>

      {error && (
        <p className="mt-4 border border-[#a3402f]/30 bg-[#f7ece9] px-4 py-3 text-[12px] text-[#a3402f]">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5 border border-gold/40 bg-paper/60 p-4">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[12px] text-sub-gray">
            <span className="text-ink font-semibold">
              {result.tierLabel}　{yen(result.amount)}
            </span>
            <span>{result.liveMode ? "本番（LIVE）" : "テストモード"}</span>
            <span>期限 {new Date(result.expiresAt * 1000).toLocaleString("ja-JP")}</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              readOnly
              value={result.url}
              onFocus={(e) => e.currentTarget.select()}
              className="flex-1 border border-hair-line bg-white px-3 py-2 text-[12px] text-ink"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(result.url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}
              className="shrink-0 text-[12px] tracking-[0.1em] uppercase text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-3 py-2"
            >
              {copied ? "コピー済" : "コピー"}
            </button>
          </div>
          <p className="mt-3 text-[11px] text-sub-gray leading-[1.8]">
            このURLをご本人にメールでお送りください。カード情報はStripeの画面で入力され、
            こちらのサーバーを通りません。入金が確認されると、この下の一覧が「入金済」に変わります。
          </p>
          {result.warning && (
            <p className="mt-2 text-[11px] text-[#a3402f]">※ {result.warning}</p>
          )}
        </div>
      )}
    </div>
  );
}
