"use client";

import { useState } from "react";

type Props = {
  askId: string;
  canPublish: boolean; // mirror consent_publish so the button is honest
};

type LiftResult = {
  ok: true;
  slug: string;
  filepath: string;
  markdown: string;
  suggestion: string;
};

export default function LiftToQA({ askId, canPublish }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LiftResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/asks/${askId}/lift-qa`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "生成に失敗しました");
      setResult(data as LiftResult);
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

  if (!canPublish) {
    return (
      <p className="text-[12px] text-sub-gray leading-[1.9]">
        この ask は公開同意 (consent_publish) が無いため Q&A 化できません。
      </p>
    );
  }

  if (!result) {
    return (
      <div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="text-[12px] tracking-[0.1em] uppercase text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-3 py-1.5 disabled:opacity-50"
        >
          {loading ? "生成中…" : "Q&A 下書きを生成"}
        </button>
        {error && (
          <p className="mt-2 text-[11px] text-red-600 leading-[1.7]">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-3 text-[11px] text-sub-gray">
        <span className="text-[10px] tracking-[0.1em] uppercase text-gold">
          下書き生成済
        </span>
        <span className="font-mono">{result.filepath}</span>
        <button
          type="button"
          onClick={copyToClipboard}
          className="ml-auto text-[11px] tracking-[0.1em] uppercase text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-2 py-1"
        >
          {copied ? "コピー済" : "Markdownをコピー"}
        </button>
      </div>
      <textarea
        readOnly
        value={result.markdown}
        rows={20}
        className="w-full bg-cream-deep/30 border border-hair-line text-ink px-4 py-3 text-[12.5px] leading-[1.7] font-mono focus:outline-none focus:border-gold"
      />
      <p className="text-[11px] text-sub-gray leading-[1.9] whitespace-pre-wrap">
        {result.suggestion}
        {"\n"}
        編集者の声（一人称・過去形・断定しない）で本文を書き直し、status を published に変更後、
        ask 側の status を <code className="font-mono">published</code> に進めてください。
      </p>
    </div>
  );
}
