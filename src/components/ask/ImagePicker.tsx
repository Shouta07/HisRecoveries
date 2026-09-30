"use client";

import { useEffect, useRef, useState } from "react";
import {
  IMAGE_COPY,
  MAX_BYTES,
  MAX_FILES,
  TYPES,
  isAllowedType,
} from "@/lib/ask/images";
import { track } from "@/lib/analytics";

// 判断材料を足す。
//
// ══════════════════════════════════════════════════
// 送る前に、何に使われるのかを言う
// ══════════════════════════════════════════════════
// ここに来る画像には、相談者だけでなく相手が写っている。
// その人はこのサービスに同意していない。
//
// 「写真を追加」とだけ書いて受け取らない。
// 誰に見えるのか、いつ消えるのかを、押す前に書く。
//
// ══════════════════════════════════════════════════
// 並び順を、自分で直せるようにする
// ══════════════════════════════════════════════════
// LINEのやりとりは、順番が意味を持つ。
// 選んだ順が前後すると、読む人が話を追えない。
// 上げる・下げるを付ける（ドラッグは指では外しやすい）。
//
// ══════════════════════════════════════════════════
// 枚数と大きさで、黙って落とさない
// ══════════════════════════════════════════════════
// 10枚を超えたぶん、大きすぎるものは、理由を出して弾く。
// 黙って無くすと、送ったつもりのものが届かない。

export type Picked = {
  /** ブラウザの中だけのID */
  id: string;
  file: File;
  /** 見せるための一時URL。送信とは関係ない */
  preview: string;
};

export default function ImagePicker({
  items,
  onChange,
}: {
  items: Picked[];
  onChange: (next: Picked[]) => void;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 一時URLは、使い終わったら返す。返さないと、
  // 10枚選び直すたびにメモリに残り続ける
  useEffect(() => {
    return () => {
      for (const it of items) URL.revokeObjectURL(it.preview);
    };
    // 画面を離れるときだけ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function add(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const room = MAX_FILES - items.length;
    if (room <= 0) {
      setError(`${MAX_FILES}枚までです`);
      return;
    }

    const next: Picked[] = [];
    const skipped: string[] = [];

    for (const f of Array.from(files)) {
      if (next.length >= room) {
        skipped.push(`${MAX_FILES}枚を超えたぶん`);
        break;
      }
      if (!isAllowedType(f.type)) {
        skipped.push(`${f.name}（この形式は送れません）`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        skipped.push(`${f.name}（${Math.round(MAX_BYTES / 1024 / 1024)}MBを超えています）`);
        continue;
      }
      next.push({
        id: `${Date.now()}-${next.length}-${f.name}`,
        file: f,
        preview: URL.createObjectURL(f),
      });
    }

    if (skipped.length > 0) setError(`送れなかったもの: ${skipped.join(" / ")}`);
    if (next.length > 0) {
      onChange([...items, ...next]);
      track("image_added", { n: next.length });
    }
    // 同じファイルをもう一度選べるようにする
    if (input.current) input.current.value = "";
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function remove(i: number) {
    URL.revokeObjectURL(items[i].preview);
    onChange(items.filter((_, k) => k !== i));
  }

  return (
    <div className="rounded-card border border-line bg-paper p-4">
      <p className="text-[13.5px] font-black text-slate">{IMAGE_COPY.add}</p>
      <p className="mt-1 text-[12px] leading-[1.7] text-steel">{IMAGE_COPY.hint}</p>

      {/* 押す前に、誰に見えて、いつ消えるのかを書く */}
      <p className="mt-2.5 rounded-soft bg-mist px-3.5 py-2.5 text-[12px] leading-[1.8] text-steel">
        {IMAGE_COPY.warn}
      </p>

      <input
        ref={input}
        type="file"
        accept={TYPES.join(",")}
        multiple
        onChange={(e) => add(e.target.files)}
        className="sr-only"
        id="hr-images"
      />
      <label
        htmlFor="hr-images"
        className="mt-3 flex min-h-[52px] cursor-pointer items-center justify-center rounded-pill border border-brand bg-paper px-5 text-[14px] font-bold text-brand"
      >
        ＋ 選ぶ（{items.length} / {MAX_FILES}）
      </label>

      {error && (
        <p className="mt-2.5 rounded-soft bg-rose-tint px-3.5 py-2.5 text-[12.5px] leading-[1.8] text-rose-text">
          {error}
        </p>
      )}

      {items.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {items.map((it, i) => (
            <li
              key={it.id}
              className="flex items-center gap-3 rounded-card border border-line bg-paper p-2"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[11px] font-black tabular-nums text-brand-deep">
                {i + 1}
              </span>
              {/* 中身は見せる。何を送ろうとしているか分からないまま押させない */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.preview}
                alt={`${i + 1}枚目`}
                className="h-14 w-14 shrink-0 rounded-soft border border-line object-cover"
              />
              <span className="min-w-0 flex-1 truncate text-[12px] text-steel">
                {it.file.name}
              </span>
              <span className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`${i + 1}枚目を前へ`}
                  className="flex h-9 w-9 items-center justify-center rounded-soft border border-line text-[13px] text-steel disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  aria-label={`${i + 1}枚目を後ろへ`}
                  className="flex h-9 w-9 items-center justify-center rounded-soft border border-line text-[13px] text-steel disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`${i + 1}枚目を外す`}
                  className="flex h-9 min-w-9 items-center justify-center rounded-soft border border-line px-2 text-[12px] font-bold text-steel"
                >
                  {IMAGE_COPY.remove}
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
