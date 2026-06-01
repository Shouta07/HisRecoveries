"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CategoryOption = { slug: string; label: string };
type ArticleRef = { slug: string; title: string };

type Frontmatter = {
  title: string;
  slug: string;
  category: string;
  publishedAt: string;
  excerpt: string;
  status: "draft" | "published";
  related: string[];
  keywords: string[];
  cover?: string;
  coverAlt?: string;
  popular?: boolean;
};

type Props = {
  slug: string;
  mode: "new" | "edit";
  initial: Frontmatter;
  initialBody: string;
  categories: CategoryOption[];
  allArticles: ArticleRef[];
  githubReady: boolean;
};

const DRAFT_KEY_PREFIX = "hr_admin_draft_";

export default function EditorClient({
  slug,
  mode,
  initial,
  initialBody,
  categories,
  allArticles,
  githubReady,
}: Props) {
  const router = useRouter();
  const [fm, setFm] = useState<Frontmatter>(initial);
  const [body, setBody] = useState<string>(initialBody);
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const previewTimer = useRef<NodeJS.Timeout | null>(null);

  // Local draft restore — recovers from accidental reload before save.
  const draftKey = `${DRAFT_KEY_PREFIX}${mode === "new" ? "new" : slug}`;
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw) as { fm: Frontmatter; body: string };
      if (draft.body && draft.body !== initialBody) {
        if (
          confirm(
            "前回保存されなかった編集中の下書きが残っています。復元しますか？"
          )
        ) {
          setFm(draft.fm);
          setBody(draft.body);
        } else {
          localStorage.removeItem(draftKey);
        }
      }
    } catch {
      /* ignore */
    }
  }, [draftKey, initialBody]);

  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ fm, body }));
    } catch {
      /* ignore */
    }
  }, [draftKey, fm, body]);

  // Debounced preview via /api/admin/preview
  useEffect(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const res = await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown: body, slug: fm.slug || "preview" }),
        });
        const data = await res.json();
        if (res.ok) setPreviewHtml(data.html ?? "");
      } catch {
        /* ignore */
      } finally {
        setPreviewLoading(false);
      }
    }, 350);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [body, fm.slug]);

  const insertAtCursor = useCallback(
    (text: string) => {
      const el = bodyRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = body.slice(0, start) + text + body.slice(end);
      setBody(next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + text.length, start + text.length);
      });
    },
    [body]
  );

  async function handleImageUpload(file: File) {
    if (!fm.slug) {
      setError("画像をアップする前に slug を入力してください");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    form.append("slug", fm.slug);
    setMessage(`アップロード中… ${file.name}`);
    setError("");
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "upload failed");
      const snippet = file.type.startsWith("video/")
        ? `\n\n<video src="${data.url}" controls preload="metadata"></video>\n\n`
        : `\n\n![](${data.url})\n\n`;
      insertAtCursor(snippet);
      setMessage(`挿入：${file.name}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "upload failed");
      setMessage("");
    }
  }

  async function handleSave() {
    setError("");
    setMessage("");
    if (!fm.title.trim()) return setError("タイトルが空です");
    if (!fm.slug.trim()) return setError("slug が空です");
    if (!body.trim()) return setError("本文が空です");

    setSaving(true);
    try {
      const url =
        mode === "new"
          ? "/api/admin/articles"
          : `/api/admin/articles/${slug}`;
      const method = mode === "new" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frontmatter: fm, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "save failed");
      localStorage.removeItem(draftKey);
      setMessage(
        `保存しました（${data.commit?.slice(0, 7) ?? "ok"}） · Vercel が 1〜2 分で再デプロイ`
      );
      if (mode === "new") {
        setTimeout(() => router.push(`/admin/edit/${fm.slug}`), 1200);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (mode !== "edit") return;
    if (
      !confirm(
        `削除：${fm.title}\nGitHub から記事ファイルを消します。続けますか？`
      )
    ) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/articles/${slug}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "delete failed");
      localStorage.removeItem(draftKey);
      setMessage("削除しました。一覧に戻ります。");
      setTimeout(() => router.push("/admin/articles"), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "delete failed");
    } finally {
      setSaving(false);
    }
  }

  function setListField(key: "related" | "keywords", value: string) {
    setFm({
      ...fm,
      [key]: value
        .split(/[,\n]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    });
  }

  return (
    <>
      {/* Sticky action bar */}
      <div className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-b border-hair-line">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-3 flex items-center gap-3 flex-wrap">
          <Link
            href="/admin/articles"
            className="text-[12px] tracking-[0.1em] text-sub-gray hover:text-ink transition-colors"
          >
            ← 一覧
          </Link>
          <span className="text-[11px] tracking-[0.06em] text-sub-gray">
            {mode === "new" ? "新規" : "編集"}
            {fm.status === "draft" && (
              <span className="ml-2 text-red-600">下書き</span>
            )}
            {previewLoading && (
              <span className="ml-2 text-gold">プレビュー更新中…</span>
            )}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {mode === "edit" && (
              <Link
                href={`/articles/${slug}`}
                target="_blank"
                className="text-[12px] tracking-[0.1em] text-sub-gray hover:text-gold transition-colors px-3 py-1.5 border border-hair-line hover:border-gold"
              >
                本番を見る ↗
              </Link>
            )}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="text-[12px] tracking-[0.1em] text-ink hover:text-gold transition-colors px-3 py-1.5 border border-hair-line hover:border-gold"
            >
              {showSettings ? "設定を閉じる" : "設定"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !githubReady}
              className="btn-gold !py-2 !px-5 !text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              title={!githubReady ? "GitHub 連携が未設定" : undefined}
            >
              {saving ? "保存中…" : mode === "new" ? "公開（作成）" : "保存"}
            </button>
          </div>
        </div>
        {(message || error) && (
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8 pb-3 text-[12px]">
            {message && <p className="text-gold">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}
          </div>
        )}
      </div>

      {/* Settings drawer */}
      {showSettings && (
        <SettingsDrawer
          fm={fm}
          setFm={setFm}
          mode={mode}
          categories={categories}
          allArticles={allArticles}
          setListField={setListField}
          onClose={() => setShowSettings(false)}
          onDelete={mode === "edit" ? handleDelete : undefined}
        />
      )}

      {/* Title input — always shown, looks like the article H1 */}
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 pt-8 sm:pt-10">
        <input
          type="text"
          value={fm.title}
          onChange={(e) => setFm({ ...fm, title: e.target.value })}
          placeholder="記事のタイトル"
          className="w-full bg-transparent border-0 border-b border-hair-line/60 focus:border-gold transition-colors font-mincho text-2xl sm:text-3xl lg:text-[2.25rem] text-ink leading-[1.4] focus:outline-none pb-3"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] tracking-[0.08em] text-sub-gray">
          <span className="text-gold">
            {categories.find((c) => c.slug === fm.category)?.label ?? fm.category}
          </span>
          <span aria-hidden>·</span>
          <input
            type="date"
            value={fm.publishedAt}
            onChange={(e) =>
              setFm({ ...fm, publishedAt: e.target.value })
            }
            className="bg-transparent border-0 text-sub-gray focus:outline-none focus:text-ink"
          />
          <span aria-hidden>·</span>
          <input
            type="text"
            value={fm.slug}
            onChange={(e) => setFm({ ...fm, slug: e.target.value })}
            placeholder="slug-here"
            disabled={mode === "edit"}
            className="bg-transparent border-0 text-sub-gray focus:outline-none focus:text-ink min-w-[8rem] disabled:opacity-70"
          />
        </div>
      </div>

      {/* Two-pane editor */}
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-h-[60vh]">
        {/* Markdown */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap mb-2 text-[11px]">
            <span className="text-[10px] tracking-[0.15em] uppercase text-sub-gray mr-1">
              Markdown
            </span>
            <ToolbarButton onClick={() => insertAtCursor("\n\n## ")}>
              H2
            </ToolbarButton>
            <ToolbarButton onClick={() => insertAtCursor("\n\n### ")}>
              H3
            </ToolbarButton>
            <ToolbarButton onClick={() => insertAtCursor("\n\n---\n\n")}>
              区切り
            </ToolbarButton>
            <ToolbarButton onClick={() => insertAtCursor("> ")}>
              引用
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                const sel = bodyRef.current;
                if (!sel) return;
                const s = sel.selectionStart;
                const e = sel.selectionEnd;
                const selected = body.slice(s, e);
                const text = selected
                  ? `**${selected}**`
                  : "**強調**";
                insertAtCursor(text);
              }}
            >
              太字
            </ToolbarButton>
            <label className="cursor-pointer border border-hair-line hover:border-gold hover:text-gold px-2 py-1 transition-colors">
              画像/動画
              <input
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleImageUpload(f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="本文を Markdown で…"
            spellCheck={false}
            className="w-full grow min-h-[60vh] bg-paper border border-hair-line p-5 sm:p-6 font-mincho text-[15px] leading-[2] text-ink focus:outline-none focus:border-gold resize-y"
          />
          <p className="mt-2 text-[11px] text-sub-gray leading-[1.85]">
            画像はドロップ or ボタンから / YouTube URL を 1 行貼ると自動で埋め込み
          </p>
        </div>

        {/* Live preview — uses .article-body so it matches the live site */}
        <div className="flex flex-col">
          <p className="mb-2 text-[10px] tracking-[0.15em] uppercase text-sub-gray">
            Preview
          </p>
          <div className="grow min-h-[60vh] bg-cream border border-hair-line p-5 sm:p-8 overflow-y-auto">
            <h1 className="font-mincho text-2xl sm:text-[1.75rem] text-ink leading-[1.5] mb-6">
              {fm.title || "（タイトル未入力）"}
            </h1>
            {previewHtml ? (
              <div
                className="article-body font-mincho"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <p className="text-[13px] text-sub-gray">
                本文を入力するとプレビューが表示されます。
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ToolbarButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-hair-line hover:border-gold hover:text-gold px-2 py-1 transition-colors"
    >
      {children}
    </button>
  );
}

function SettingsDrawer({
  fm,
  setFm,
  mode,
  categories,
  allArticles,
  setListField,
  onClose,
  onDelete,
}: {
  fm: Frontmatter;
  setFm: (fm: Frontmatter) => void;
  mode: "new" | "edit";
  categories: CategoryOption[];
  allArticles: ArticleRef[];
  setListField: (key: "related" | "keywords", value: string) => void;
  onClose: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="設定"
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-paper border-l border-hair-line shadow-xl overflow-y-auto"
    >
      <div className="sticky top-0 bg-paper/95 backdrop-blur border-b border-hair-line px-5 py-3 flex items-center justify-between">
        <p className="logo-type italic text-[11px] tracking-[0.3em] uppercase text-gold">
          Settings
        </p>
        <button
          type="button"
          onClick={onClose}
          className="text-sub-gray hover:text-ink transition-colors text-xl"
          aria-label="閉じる"
        >
          ×
        </button>
      </div>
      <div className="p-5 space-y-5">
        <Field label="Category">
          <select
            value={fm.category}
            onChange={(e) => setFm({ ...fm, category: e.target.value })}
            className={inputCls}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <div className="flex gap-4 text-[13px]">
            {(["draft", "published"] as const).map((s) => (
              <label key={s} className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="status"
                  checked={fm.status === s}
                  onChange={() => setFm({ ...fm, status: s })}
                />
                {s === "draft" ? "下書き" : "公開"}
              </label>
            ))}
          </div>
        </Field>

        <Field
          label="Excerpt"
          hint="80–160 字推奨 / SEO・OG 用"
        >
          <textarea
            value={fm.excerpt}
            onChange={(e) => setFm({ ...fm, excerpt: e.target.value })}
            className={`${inputCls} min-h-[80px] resize-y`}
            rows={3}
          />
        </Field>

        <Field
          label="Keywords"
          hint="検索意図・改行 or カンマ区切り"
        >
          <textarea
            value={fm.keywords.join("\n")}
            onChange={(e) => setListField("keywords", e.target.value)}
            className={`${inputCls} min-h-[100px] resize-y`}
            rows={4}
          />
        </Field>

        <Field label="Related" hint="他記事の slug を改行 or カンマ">
          <textarea
            value={fm.related.join("\n")}
            onChange={(e) => setListField("related", e.target.value)}
            className={`${inputCls} min-h-[80px] resize-y`}
            rows={3}
          />
          <p className="mt-2 text-[10px] text-sub-gray break-all">
            候補：
            {allArticles
              .filter((a) => a.slug !== fm.slug)
              .slice(0, 6)
              .map((a) => a.slug)
              .join(" · ")}
          </p>
        </Field>

        <Field label="Cover image URL">
          <input
            type="text"
            value={fm.cover ?? ""}
            onChange={(e) =>
              setFm({ ...fm, cover: e.target.value || undefined })
            }
            className={inputCls}
            placeholder="/path or https://..."
          />
        </Field>

        <Field label="Popular">
          <label className="flex items-center gap-2 text-[13px] text-ink">
            <input
              type="checkbox"
              checked={Boolean(fm.popular)}
              onChange={(e) => setFm({ ...fm, popular: e.target.checked })}
            />
            「よく読まれている記事」に出す
          </label>
        </Field>

        {onDelete && (
          <div className="pt-4 border-t border-hair-line">
            <button
              type="button"
              onClick={onDelete}
              className="w-full text-[12px] tracking-[0.1em] text-sub-gray hover:text-red-600 transition-colors px-4 py-2 border border-hair-line hover:border-red-600"
            >
              この記事を削除
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-cream border border-hair-line text-ink px-3 py-2 font-mincho text-[14px] leading-[1.65] focus:outline-none focus:border-gold";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] tracking-[0.15em] uppercase text-sub-gray">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && (
        <span className="block mt-1 text-[10px] text-sub-gray">{hint}</span>
      )}
    </label>
  );
}
