"use client";

// ナビの右端に置く検索アイコン。
// 絞り込み中は件数を横に出す。開かなくても効いていることが分かるように。

import { useSearch } from "./SearchProvider";

export default function SearchButton({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const s = useSearch();
  const color = tone === "light" ? "text-shironeri" : "text-sumi";

  return (
    <button
      type="button"
      onClick={() => s.setOpen(true)}
      aria-label="記事をさがす"
      aria-haspopup="dialog"
      className={`flex items-center gap-1.5 transition-opacity hover:opacity-70 ${color}`}
    >
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.6-3.6" />
      </svg>
      {s.hasFilter && (
        <span className="text-[12px] tabular-nums">{s.total}</span>
      )}
    </button>
  );
}
