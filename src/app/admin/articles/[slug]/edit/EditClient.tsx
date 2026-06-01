"use client";

import { useCallback, useRef, useState } from "react";
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
  slug: string; // current slug (empty for new)
  initial: Frontmatter;
  initialBody: string;
  categories: CategoryOption[];
  allArticles: ArticleRef[];
  mode: "edit" | "new";
};

export default function EditClient({
  slug,
  initial,
  initialBody,
  categories,
  allArticles,
  mode,
}: Props) {
  const router = useRouter();
  const [fm, setFm] = useState<Frontmatter>(initial);
  const [body, setBody] = useState<string>(initialBody);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = useCallback(
    (text: string) => {
      const el = bodyRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = body.slice(0, start) + text + body.slice(end);
      setBody(next);
      // restore cursor after state updates
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
    setMessage(`画像をアップロード中… ${file.name}`);
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

    if (!fm.title.trim()) {
      setError("title が空です");
      return;
    }
    if (!fm.slug.trim()) {
      setError("slug が空です");
      return;
    }
    if (!body.trim()) {
      setError("本文が空です");
      return;
    }

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
      setMessage(
        `保存しました（commit ${data.commit?.slice(0, 7) ?? "ok"}）— Vercel が 1〜2 分で再デプロイします。`
      );
      if (mode === "new") {
        setTimeout(() => {
          router.push(`/admin/articles/${fm.slug}/edit`);
        }, 1500);
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
        `削除：${fm.title}\nこの操作は GitHub にコミットされて記事ファイルを消します。続けますか？`
      )
    ) {
      return;
    }
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/articles/${slug}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "delete failed");
      setMessage("削除しました。一覧に戻ります。");
      setTimeout(() => router.push("/admin/articles"), 1200);
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      {/* Body editor */}
      <div className="order-2 lg:order-1">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <p className="text-[12px] tracking-[0.1em] uppercase text-sub-gray">
            Body · Markdown
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <ToolbarButton onClick={() => insertAtCursor("\n\n## ")}>
              H2
            </ToolbarButton>
            <ToolbarButton onClick={() => insertAtCursor("\n\n### ")}>
              H3
            </ToolbarButton>
            <ToolbarButton
              onClick={() => insertAtCursor("\n\n---\n\n")}
            >
              区切り
            </ToolbarButton>
            <ToolbarButton
              onClick={() => insertAtCursor("> ")}
            >
              引用
            </ToolbarButton>
            <label className="cursor-pointer border border-hair-line hover:border-gold hover:text-gold px-2 py-1 transition-colors">
              画像/動画を挿入
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
        </div>

        <textarea
          ref={bodyRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full min-h-[60vh] bg-paper border border-hair-line p-5 sm:p-6 font-mincho text-[15px] leading-[2] text-ink focus:outline-none focus:border-gold resize-y"
          placeholder="ここに本文を Markdown で書く…"
          spellCheck={false}
        />

        <p className="mt-3 text-[11px] text-sub-gray leading-[1.85]">
          Markdown:
          <code className="ml-1">## 見出し</code>,
          <code className="ml-1">**太字**</code>,
          <code className="ml-1">![](url)</code>,
          <code className="ml-1">[文字](url)</code>。
          YouTube URL を 1 行で貼ると自動埋め込み。
        </p>

        {message && (
          <p className="mt-4 text-[12px] text-gold tracking-[0.06em]">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-4 text-[12px] text-red-600 tracking-[0.06em]">
            {error}
          </p>
        )}
      </div>

      {/* Sidebar: frontmatter form */}
      <aside className="order-1 lg:order-2">
        <div className="bg-paper border border-hair-line p-5">
          <Field label="Title">
            <input
              type="text"
              value={fm.title}
              onChange={(e) => setFm({ ...fm, title: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Slug" hint="半角小文字 + ハイフン">
            <input
              type="text"
              value={fm.slug}
              onChange={(e) => setFm({ ...fm, slug: e.target.value })}
              className={inputCls}
              disabled={mode === "edit"}
            />
          </Field>

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

          <Field label="Published">
            <input
              type="date"
              value={fm.publishedAt}
              onChange={(e) => setFm({ ...fm, publishedAt: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Status">
            <div className="flex gap-3 text-[13px]">
              {(["draft", "published"] as const).map((s) => (
                <label key={s} className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={fm.status === s}
                    onChange={() => setFm({ ...fm, status: s })}
                  />
                  {s === "draft" ? "下書き" : "公開"}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Excerpt" hint="80–160 字推奨（SEO・OG 用）">
            <textarea
              value={fm.excerpt}
              onChange={(e) => setFm({ ...fm, excerpt: e.target.value })}
              className={`${inputCls} min-h-[80px] resize-y`}
              rows={3}
            />
          </Field>

          <Field
            label="Keywords"
            hint="検索意図・1 行 1 つ or カンマ区切り"
          >
            <textarea
              value={fm.keywords.join("\n")}
              onChange={(e) => setListField("keywords", e.target.value)}
              className={`${inputCls} min-h-[100px] resize-y`}
              rows={4}
            />
          </Field>

          <Field label="Related" hint="他記事の slug を改行 or カンマ区切り">
            <textarea
              value={fm.related.join("\n")}
              onChange={(e) => setListField("related", e.target.value)}
              className={`${inputCls} min-h-[80px] resize-y`}
              rows={3}
            />
            <p className="mt-2 text-[10px] text-sub-gray">
              候補：
              {allArticles
                .filter((a) => a.slug !== fm.slug)
                .slice(0, 6)
                .map((a) => a.slug)
                .join(" · ")}
            </p>
          </Field>

          <Field label="Cover image URL (任意)">
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
            <label className="flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={Boolean(fm.popular)}
                onChange={(e) =>
                  setFm({ ...fm, popular: e.target.checked })
                }
              />
              「よく読まれている記事」に出す
            </label>
          </Field>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-gold justify-center disabled:opacity-50"
          >
            {saving ? "保存中…" : mode === "new" ? "公開（作成）" : "保存"}
          </button>
          {mode === "edit" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="text-[12px] tracking-[0.1em] text-sub-gray hover:text-red-600 transition-colors px-4 py-2 border border-hair-line hover:border-red-600 disabled:opacity-50"
            >
              この記事を削除
            </button>
          )}
        </div>
      </aside>
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
    <label className="block mb-4">
      <span className="text-[11px] tracking-[0.1em] uppercase text-sub-gray">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && (
        <span className="block mt-1 text-[10px] text-sub-gray">{hint}</span>
      )}
    </label>
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
