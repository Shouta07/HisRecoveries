"use client";

// 記事の索引。トップに置く、このメディアの本体。
//
// もともと /areas という一覧ページを別に持っていたが、
// 「記事が主役」なのに記事が別ページにあるのは筋が通らないので、
// トップに統合した。ここが読者にとっての目次になる。
//
// 検索は、入力すると下の一覧がその場で絞り込まれるだけ。
// 候補を浮かせるドロップダウンは出さない（読み手を急かさない）。
//
// カードで囲まない。地の上に文字を直接置く。

import { useMemo, useState } from "react";
import Link from "next/link";
import { clusters } from "@/lib/clusters";
import { complexes } from "@/lib/complexes";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

// 領域の並び。読者の入りやすい順。
const ORDER = ["impression", "skin", "hair", "body-hair", "face", "mind"] as const;

export default function ArticleIndex() {
  const [q, setQ] = useState("");

  const areaName = (id: string) => complexes.find((c) => c.id === id)?.ja ?? "";

  // 検索対象はタイトル・リード・キーワード。全部ひらがな/カタカナの揺れは見ない。
  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const match = (a: (typeof clusters)[number]) => {
      if (!needle) return true;
      return (
        a.title.toLowerCase().includes(needle) ||
        a.lead.toLowerCase().includes(needle) ||
        a.keywords.some((k) => k.toLowerCase().includes(needle)) ||
        areaName(a.areaId).includes(needle)
      );
    };
    return ORDER.map((id) => ({
      id,
      name: areaName(id),
      items: clusters.filter((a) => a.areaId === id && match(a)),
    })).filter((g) => g.items.length > 0);
  }, [q]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div>
      {/* 検索 — 目立たせない。一覧の上に静かに置く */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 600 }}>
          記事をさがす
        </h2>
        <p className="text-[12.5px] text-ainezu tabular-nums">
          {q.trim() ? `${total}件` : `全${clusters.length}本`}
        </p>
      </div>

      <div className="mt-6 max-w-[26rem]">
        <label htmlFor="q" className="sr-only">
          記事を検索
        </label>
        <input
          id="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="AGA、ニキビ、眉、写真 …"
          className="h-12 w-full rounded-[2px] border border-shironezu bg-hakuji px-4 text-[16px] text-sumi outline-none transition-colors placeholder:text-ainezu focus:border-dou"
        />
      </div>

      {total === 0 ? (
        <div className="mt-12 border border-dashed border-shironezu bg-hakuji/50 px-6 py-8">
          <p className="text-[16px]" style={{ ...MINCHO, fontWeight: 600 }}>
            「{q.trim()}」に当てはまる記事はありませんでした。
          </p>
          <p className="mt-3 text-[14px] leading-[1.95] text-keshizumi">
            まだ書いていない分野かもしれません。数合わせで記事を作ることはしないので、
            見つからないときは正直にこう出ます。別の言葉で探すか、下の年代別からご覧ください。
          </p>
          <button
            type="button"
            onClick={() => setQ("")}
            className="mt-5 text-[14px] font-semibold text-dou underline decoration-dou/40 underline-offset-[6px] hover:decoration-dou transition-colors"
          >
            検索を消す
          </button>
        </div>
      ) : (
        <div className="mt-14 flex flex-col gap-[72px] sm:gap-[96px]">
          {groups.map((g) => (
            <section key={g.id}>
              <div className="flex items-baseline gap-4 border-b-2 border-sumi pb-3">
                <h3 className="text-[17px] sm:text-[19px]" style={{ ...MINCHO, fontWeight: 600 }}>
                  {g.name}
                </h3>
                <span className="text-[12.5px] tabular-nums text-ainezu">{g.items.length}</span>
                <Link
                  href={`/areas/${g.id}`}
                  className="ml-auto text-[13px] font-semibold text-dou underline decoration-dou/40 underline-offset-[5px] hover:decoration-dou transition-colors"
                >
                  この分野について
                </Link>
              </div>

              <ul>
                {g.items.map((a) => (
                  <li key={a.slug} className="border-b border-shironezu">
                    <Link
                      href={`/areas/${a.areaId}/${a.slug}`}
                      className="group block py-7 transition-colors hover:text-dou"
                    >
                      <h4
                        className="max-w-[30em] text-[17px] sm:text-[19px] leading-[1.7]"
                        style={{ ...MINCHO, fontWeight: 600 }}
                      >
                        {a.title}
                      </h4>
                      <p className="mt-2.5 max-w-[38em] text-[14px] leading-[1.95] text-keshizumi">
                        {a.lead}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
