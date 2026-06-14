"use client";

import { useState } from "react";

type Result = {
  ok: true;
  days: number;
  counts: { checks: number; asks: number };
  topTerritories: { value: string; label: string; count: number }[];
  topFirstSteps: { value: string; count: number }[];
  topDurations: { value: string; count: number }[];
  vignettes: string[];
  markdown: string;
};

export default function LetterClient() {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/letter-draft?days=${days}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成に失敗しました");
      setResult(data as Result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="text-[11px] tracking-[0.1em] uppercase text-sub-gray">
            集計期間（日）
          </span>
          <input
            type="number"
            min={1}
            max={90}
            value={days}
            onChange={(e) => setDays(Math.max(1, Math.min(90, Number(e.target.value) || 7)))}
            className="mt-1 w-24 bg-paper border border-hair-line px-3 py-2 font-mono text-[14px] text-ink focus:outline-none focus:border-gold"
          />
        </label>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="btn-gold !py-2.5 !px-5 text-xs disabled:opacity-50"
        >
          {loading ? "生成中…" : "下書きを生成"}
        </button>
        {error && <p className="text-[12px] text-red-600">{error}</p>}
      </div>

      {result && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-paper border border-hair-line p-4">
              <p className="text-[10px] uppercase tracking-[0.1em] text-sub-gray">
                Check / Ask 件数（{result.days} 日）
              </p>
              <p className="mt-2 font-mincho text-2xl text-ink tabular-nums">
                {result.counts.checks} / {result.counts.asks}
              </p>
            </div>
            <div className="bg-paper border border-hair-line p-4">
              <p className="text-[10px] uppercase tracking-[0.1em] text-sub-gray mb-2">
                Top 領域
              </p>
              <ul className="space-y-1 text-[12.5px]">
                {result.topTerritories.length === 0 && (
                  <li className="text-sub-gray">—</li>
                )}
                {result.topTerritories.map((t) => (
                  <li key={t.value} className="flex justify-between">
                    <span className="text-ink">{t.label}</span>
                    <span className="text-sub-gray tabular-nums">{t.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-paper border border-hair-line p-4">
              <p className="text-[10px] uppercase tracking-[0.1em] text-sub-gray mb-2">
                半歩として選ばれているもの
              </p>
              <ul className="space-y-1 text-[12.5px]">
                {result.topFirstSteps.length === 0 && (
                  <li className="text-sub-gray">—</li>
                )}
                {result.topFirstSteps.map((s) => (
                  <li key={s.value} className="flex justify-between">
                    <span className="text-ink truncate mr-2">{s.value}</span>
                    <span className="text-sub-gray tabular-nums">{s.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <p className="logo-type italic text-[10px] tracking-[0.3em] uppercase text-gold">
                下書き Markdown
              </p>
              <button
                type="button"
                onClick={copyToClipboard}
                className="text-[11px] tracking-[0.1em] uppercase text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-3 py-1.5"
              >
                {copied ? "コピー済" : "Markdownをコピー"}
              </button>
            </div>
            <textarea
              readOnly
              value={result.markdown}
              rows={28}
              className="w-full bg-cream-deep/30 border border-hair-line text-ink px-4 py-3 text-[13px] leading-[1.8] font-mono focus:outline-none focus:border-gold"
            />
            <p className="mt-2 text-[11px] text-sub-gray leading-[1.95]">
              この下書きはあくまで足場です。編集者の声で本文を書き直し、Substack に貼って日曜日に送ってください。
            </p>
          </div>
        </>
      )}
    </div>
  );
}
