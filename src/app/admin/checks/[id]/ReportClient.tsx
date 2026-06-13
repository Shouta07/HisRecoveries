"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBar from "@/components/admin/StatusBar";

type Props = {
  id: string;
  email: string | null;
  name: string | null;
  status: string;
  initialDraft: string;
  hasSavedDraft: boolean;
};

const CHECK_STATUSES = [
  { value: "submitted", label: "受付中" },
  { value: "reviewing", label: "確認中" },
  { value: "replied", label: "返信済み" },
  { value: "archived", label: "アーカイブ" },
];

export default function ReportClient({
  id,
  email,
  name,
  status,
  initialDraft,
  hasSavedDraft,
}: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showSource, setShowSource] = useState(false);

  // mark dirty when draft differs from server
  const dirty = useMemo(
    () => draft !== initialDraft,
    [draft, initialDraft]
  );

  // Save draft to notes
  async function save() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/checks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "save failed");
      setSavedAt(new Date());
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "save failed");
    } finally {
      setSaving(false);
    }
  }

  // Reset to a freshly generated draft
  async function resetToGenerated() {
    if (!confirm("自動生成のドラフトに戻します（編集内容は失われます）。続けますか？")) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/checks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "reset failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "reset failed");
    } finally {
      setSaving(false);
    }
  }

  async function copyMarkdown() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("コピーに失敗しました");
    }
  }

  // Live HTML preview — minimal client-side markdown rendering for
  // the editor's eye only. Server-side rendering for the actual email
  // is handled by whatever tool the editor uses to send it.
  const html = useMemo(() => renderMarkdown(draft), [draft]);

  const mailtoBody = encodeURIComponent(draft);
  const mailtoSubject = encodeURIComponent(
    "Recovery Check のご返信 — His Recoveries"
  );
  const mailto =
    email && `mailto:${email}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div className="flex flex-col">
      {/* Action bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px]">
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="btn-gold !py-2 !px-4 !text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "保存中…" : hasSavedDraft || savedAt ? "保存（上書き）" : "下書き保存"}
        </button>
        <button
          type="button"
          onClick={copyMarkdown}
          className="border border-hair-line hover:border-gold hover:text-gold px-3 py-1.5 transition-colors"
        >
          {copied ? "✓ コピー済み" : "Markdown をコピー"}
        </button>
        {mailto && (
          <a
            href={mailto}
            className="border border-hair-line hover:border-gold hover:text-gold px-3 py-1.5 transition-colors"
          >
            メーラで開く
          </a>
        )}
        <button
          type="button"
          onClick={() => setShowSource((v) => !v)}
          className="border border-hair-line hover:border-gold hover:text-gold px-3 py-1.5 transition-colors"
        >
          {showSource ? "プレビューを表示" : "Markdown を表示"}
        </button>
        <button
          type="button"
          onClick={resetToGenerated}
          disabled={saving}
          className="border border-hair-line text-sub-gray hover:border-red-600 hover:text-red-600 px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          自動生成に戻す
        </button>
        <span className="ml-auto inline-flex items-center gap-2">
          <span className="text-sub-gray">Status:</span>
          <StatusBar
            endpoint={`/api/admin/checks/${id}`}
            current={status}
            options={CHECK_STATUSES}
          />
        </span>
      </div>

      {savedAt && !dirty && (
        <p className="mb-2 text-[11px] text-gold">
          ✓ {savedAt.toLocaleTimeString("ja-JP")} に保存しました
        </p>
      )}
      {dirty && !saving && (
        <p className="mb-2 text-[11px] text-sub-gray">未保存の変更があります</p>
      )}
      {error && (
        <p className="mb-2 text-[11px] text-red-600">{error}</p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Source editor */}
        <div className={showSource ? "" : "hidden xl:block"}>
          <p className="text-[10px] tracking-[0.15em] uppercase text-sub-gray mb-2">
            Draft — Markdown
          </p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full min-h-[70vh] bg-paper border border-hair-line p-5 font-mono text-[13px] leading-[1.85] text-ink focus:outline-none focus:border-gold resize-y"
            spellCheck={false}
          />
          <p className="mt-2 text-[11px] text-sub-gray">
            {draft.length} 文字 · {name ?? "（無名）"} / {email ?? "no email"}
          </p>
        </div>

        {/* Live preview */}
        <div className={showSource ? "hidden xl:block" : ""}>
          <p className="text-[10px] tracking-[0.15em] uppercase text-sub-gray mb-2">
            Preview
          </p>
          <div className="bg-cream border border-hair-line min-h-[70vh] overflow-y-auto p-6">
            <div
              className="article-body font-mincho"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Minimal markdown renderer for the editor preview. Not for emailed
// output — the editor copies markdown into whatever sending tool.
function renderMarkdown(src: string): string {
  // Escape HTML, then apply ordered transforms.
  let s = src
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Block patterns first
  s = s.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  s = s.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  s = s.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  s = s.replace(/^---+$/gm, "<hr/>");
  // Blockquote (handle consecutive lines)
  s = s.replace(/(^&gt; .*(?:\n&gt; .*)*)/gm, (block) => {
    const body = block
      .split("\n")
      .map((l) => l.replace(/^&gt; ?/, ""))
      .join("<br/>");
    return `<blockquote>${body}</blockquote>`;
  });
  // Bullet list
  s = s.replace(/(^- .*(?:\n- .*)*)/gm, (block) => {
    const items = block
      .split("\n")
      .map((l) => `<li>${l.replace(/^- /, "")}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  // Inline
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>'
  );

  // Paragraphs: split by blank line, ignore blocks already wrapped
  const parts = s.split(/\n{2,}/).map((part) => {
    const trimmed = part.trim();
    if (!trimmed) return "";
    if (/^<(h[1-6]|ul|ol|blockquote|hr)/.test(trimmed)) return trimmed;
    return `<p>${trimmed.replace(/\n/g, "<br/>")}</p>`;
  });

  return parts.join("\n");
}
