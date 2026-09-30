"use client";

import { useState } from "react";
import { SHORT } from "@/lib/video";

// 30秒の動画。押すまでは表紙の画像だけを出す。
//
// ── なぜ押すまで読まないか ────────────────────────
// 埋め込みを最初から置くと、見ない人にも YouTube の
// スクリプトと Cookie が付き、1画面目が重くなる。
// 押された人にだけ youtube-nocookie を開く。
//
// ── 縦のまま出す ──────────────────────────────────
// ショートは 9:16。横に引き伸ばすと、中の文字が切れる。
// 幅を決めて、高さは比で決める。

export default function ShortVideo() {
  const [playing, setPlaying] = useState(false);
  if (!SHORT.id) return null;

  const src =
    `https://www.youtube-nocookie.com/embed/${SHORT.id}` +
    "?autoplay=1&playsinline=1&rel=0&modestbranding=1&cc_load_policy=0";

  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-card bg-slate shadow-card-hover">
      {playing ? (
        <iframe
          src={src}
          title={SHORT.title}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full"
          aria-label={`${SHORT.title}（動画を再生）`}
        >
          {/* 表紙は動画の1コマ目。next/image を使わない（1枚だけで、並べ替えもしない） */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SHORT.poster}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-paper shadow-card-hover transition-transform group-hover:scale-105"
          >
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor">
              <path d="M7 4.5v15l13-7.5Z" />
            </svg>
          </span>
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-pill bg-paper/95 px-3 py-1.5 text-[12px] font-bold text-slate shadow-card">
            30秒・音が出ます
          </span>
        </button>
      )}
    </div>
  );
}
