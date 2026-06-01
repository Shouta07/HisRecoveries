"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ArticleRef = { slug: string; title: string };
type StoredFile = {
  name: string;
  url: string;
  size?: number;
  contentType?: string;
  createdAt?: string;
};

type Props = { articles: ArticleRef[] };

export default function MediaClient({ articles }: Props) {
  const [slug, setSlug] = useState<string>(articles[0]?.slug ?? "");
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const articleTitle = useMemo(
    () => articles.find((a) => a.slug === slug)?.title ?? slug,
    [articles, slug]
  );

  const refresh = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/media?slug=${encodeURIComponent(slug)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "list failed");
      setFiles(data.files ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "list failed");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function uploadOne(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("slug", slug);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? `upload failed (${res.status})`);
    return data as StoredFile & { path: string };
  }

  async function handleFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    if (!incoming.length) return;
    setUploading(true);
    setError("");
    let done = 0;
    for (const f of incoming) {
      setProgress(`${done + 1} / ${incoming.length} — ${f.name}`);
      try {
        await uploadOne(f);
      } catch (e) {
        setError(
          `${f.name}: ${e instanceof Error ? e.message : "upload failed"}`
        );
        break;
      }
      done++;
    }
    setUploading(false);
    setProgress("");
    refresh();
  }

  async function handleDelete(path: string) {
    if (!confirm(`削除：${path}\nこの操作は取り消せません。続けますか？`)) {
      return;
    }
    const res = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "delete failed");
      return;
    }
    refresh();
  }

  function isCoverName(name: string) {
    return /^cover\.(jpg|jpeg|png|webp|avif)$/i.test(name);
  }

  function isImage(file: StoredFile) {
    return (
      file.contentType?.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(file.name)
    );
  }

  function isVideo(file: StoredFile) {
    return (
      file.contentType?.startsWith("video/") ||
      /\.(mp4|mov|webm|ogv)$/i.test(file.name)
    );
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  function markdownSnippet(file: StoredFile) {
    if (isImage(file)) {
      return `![](${file.url})`;
    }
    if (isVideo(file)) {
      return `<video src="${file.url}" controls preload="metadata"></video>`;
    }
    return `[${file.name}](${file.url})`;
  }

  return (
    <>
      {/* Article picker */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-4 items-end">
        <label className="block">
          <span className="text-[12px] tracking-[0.1em] text-sub-gray uppercase">
            Article
          </span>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-2 w-full bg-paper border border-hair-line text-ink px-4 py-3 font-mincho text-[15px] focus:outline-none focus:border-gold"
          >
            {articles.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.title}
              </option>
            ))}
          </select>
          <span className="block mt-2 text-[11px] text-sub-gray">
            アップロード先：{" "}
            <code className="text-ink">articles/{slug}/</code>
          </span>
        </label>
        <button
          type="button"
          onClick={refresh}
          className="text-[12px] tracking-[0.1em] text-ink border border-hair-line hover:border-gold hover:text-gold transition-colors px-4 py-3"
          disabled={loading}
        >
          {loading ? "更新中…" : "再読み込み"}
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed p-10 sm:p-14 text-center transition-colors ${
          dragging
            ? "border-gold bg-paper"
            : "border-hair-line bg-paper/50"
        }`}
      >
        <p className="font-mincho text-lg text-ink">
          ここに画像・動画をドロップ
        </p>
        <p className="mt-2 text-[12px] text-sub-gray">
          または{" "}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="text-ink underline underline-offset-4 decoration-gold hover:text-gold transition-colors"
          >
            ファイルを選択
          </button>
          （画像 / 動画、1 ファイル 4MB まで）
        </p>
        <input
          ref={fileInput}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {uploading && (
          <p className="mt-6 text-[12px] text-gold tracking-[0.06em]">
            アップロード中… {progress}
          </p>
        )}
        {error && (
          <p className="mt-6 text-[12px] text-red-600 tracking-[0.06em]">
            {error}
          </p>
        )}
      </div>

      {/* File list */}
      <section className="mt-12">
        <header className="flex items-end justify-between mb-5">
          <h2 className="font-mincho text-xl text-ink">
            「{articleTitle}」のメディア
          </h2>
          <p className="text-[11px] text-sub-gray">
            {files.length} ファイル
          </p>
        </header>

        {files.length === 0 && !loading && (
          <p className="text-[13px] text-sub-gray border border-hair-line p-6">
            まだ何もアップロードされていません。上のエリアにドロップしてください。
          </p>
        )}

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {files.map((f) => (
            <li
              key={f.name}
              className="bg-paper border border-hair-line flex flex-col"
            >
              <div className="aspect-[4/3] bg-cream-deep border-b border-hair-line flex items-center justify-center overflow-hidden">
                {isImage(f) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.url}
                    alt={f.name}
                    className="w-full h-full object-cover"
                  />
                ) : isVideo(f) ? (
                  <video
                    src={f.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    controls
                  />
                ) : (
                  <span className="text-[11px] tracking-[0.1em] text-sub-gray uppercase">
                    {f.name.split(".").pop()}
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col grow">
                <p className="font-mincho text-[14px] text-ink leading-[1.55] break-all">
                  {f.name}
                </p>
                <p className="mt-1 text-[11px] text-sub-gray">
                  {f.size ? `${(f.size / 1024).toFixed(0)} KB` : ""}
                  {isCoverName(f.name) && (
                    <span className="ml-2 text-gold">· この画像が記事カバーになります</span>
                  )}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => copyText(f.url)}
                    className="border border-hair-line hover:border-gold hover:text-gold px-2 py-1 transition-colors"
                  >
                    URL コピー
                  </button>
                  <button
                    type="button"
                    onClick={() => copyText(markdownSnippet(f))}
                    className="border border-hair-line hover:border-gold hover:text-gold px-2 py-1 transition-colors"
                  >
                    Markdown コピー
                  </button>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-hair-line hover:border-gold hover:text-gold px-2 py-1 transition-colors"
                  >
                    開く
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(`articles/${slug}/${f.name}`)
                    }
                    className="ml-auto border border-hair-line text-sub-gray hover:border-red-600 hover:text-red-600 px-2 py-1 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Help */}
      <section className="mt-16 pt-10 border-t border-hair-line">
        <h2 className="font-mincho text-base text-ink mb-4">
          使い方
        </h2>
        <ol className="font-mincho text-[14px] leading-[2] text-ink/85 list-decimal pl-5 space-y-2 max-w-[40rem]">
          <li>
            上の Article で対象の記事を選ぶ。
          </li>
          <li>
            画像をドロップ。ファイル名を{" "}
            <code>cover.png</code> / <code>cover.jpg</code> / <code>cover.webp</code> にすると、
            自動的にその記事のカバー画像になります（frontmatter 編集不要）。
          </li>
          <li>
            本文に挿入したい場合は、各カードの「Markdown コピー」を押して、
            記事の markdown 本文に貼ってください。
          </li>
          <li>
            長尺動画は YouTube にアップロード → 記事に URL を貼る だけで自動埋め込みになります。
          </li>
        </ol>
      </section>
    </>
  );
}
