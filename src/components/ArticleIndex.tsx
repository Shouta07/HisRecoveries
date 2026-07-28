"use client";

// 記事の索引。トップに置く、このメディアの本体。
//
// 探し方を3つ用意する。読者が自分の状態をどう認識しているかは人によって違うため。
//   状況（結婚式に呼ばれた・彼女がほしい）… いちばん自己同定が速い。だから先頭
//   年代（20代・30代）………………………… 悩みの名前を知らなくても選べる
//   分野（肌・髪・睡眠）……………………… 名前が分かっている人向け
// 加えて自由入力。3つは重ねて使える（30代 × 結婚式 × 髪 のように絞れる）。
//
// 選んだものはもう一度押せば外れる。適用中の条件は上に出して、必ず解除できる。
// カードで囲まない。地の上に文字を直接置く。

import { useMemo, useState } from "react";
import Link from "next/link";
import { clusters } from "@/lib/clusters";
import { complexes } from "@/lib/complexes";
import { STAGES, STAGE_OF, type StageId } from "@/lib/stages";
import { SITUATIONS, situationsOf, type SituationId } from "@/lib/situations";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

const AREA_ORDER = ["impression", "skin", "hair", "body-hair", "face", "mind"] as const;

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-[2px] border px-3.5 py-2 text-[13.5px] transition-colors ${
        on
          ? "border-tokiwa bg-tokiwa text-kinari"
          : "border-shironezu bg-hakuji text-keshizumi hover:border-dou hover:text-dou"
      }`}
    >
      {children}
    </button>
  );
}

export default function ArticleIndex() {
  const [q, setQ] = useState("");
  const [situation, setSituation] = useState<SituationId | null>(null);
  const [stage, setStage] = useState<StageId | null>(null);
  const [area, setArea] = useState<string | null>(null);

  const areaName = (id: string) => complexes.find((c) => c.id === id)?.ja ?? "";
  const hasFilter = Boolean(q.trim() || situation || stage || area);

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const match = (a: (typeof clusters)[number]) => {
      if (situation && !situationsOf(a.slug).includes(situation)) return false;
      if (stage && STAGE_OF[a.slug] !== stage) return false;
      if (area && a.areaId !== area) return false;
      if (!needle) return true;
      return (
        a.title.toLowerCase().includes(needle) ||
        a.lead.toLowerCase().includes(needle) ||
        a.keywords.some((k) => k.toLowerCase().includes(needle)) ||
        areaName(a.areaId).includes(needle)
      );
    };
    return AREA_ORDER.map((id) => ({
      id,
      name: areaName(id),
      items: clusters.filter((a) => a.areaId === id && match(a)),
    })).filter((g) => g.items.length > 0);
  }, [q, situation, stage, area]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  const clearAll = () => {
    setQ("");
    setSituation(null);
    setStage(null);
    setArea(null);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 600 }}>
          記事をさがす
        </h2>
        <p className="text-[12.5px] tabular-nums text-ainezu">
          {hasFilter ? `${total}件` : `全${clusters.length}本`}
        </p>
      </div>

      {/* ① 状況から — いちばん自己同定が速いので先頭 */}
      <div className="mt-9">
        <p className="text-[13px] text-dou">いまの状況から</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SITUATIONS.map((s) => (
            <Chip
              key={s.id}
              on={situation === s.id}
              onClick={() => setSituation(situation === s.id ? null : s.id)}
            >
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* ② 年代から */}
      <div className="mt-7">
        <p className="text-[13px] text-dou">年代から</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {STAGES.filter((s) => clusters.some((c) => STAGE_OF[c.slug] === s.id)).map((s) => (
            <Chip key={s.id} on={stage === s.id} onClick={() => setStage(stage === s.id ? null : s.id)}>
              {s.age}
            </Chip>
          ))}
        </div>
      </div>

      {/* ③ 分野から */}
      <div className="mt-7">
        <p className="text-[13px] text-dou">分野から</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {AREA_ORDER.map((id) => (
            <Chip key={id} on={area === id} onClick={() => setArea(area === id ? null : id)}>
              {areaName(id)}
            </Chip>
          ))}
        </div>
      </div>

      {/* ④ 言葉で */}
      <div className="mt-7 max-w-[26rem]">
        <label htmlFor="q" className="block text-[13px] text-dou">
          言葉でさがす
        </label>
        <input
          id="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="AGA、ニキビ、眉、写真 …"
          className="mt-3 h-12 w-full rounded-[2px] border border-shironezu bg-hakuji px-4 text-[16px] text-sumi outline-none transition-colors placeholder:text-ainezu focus:border-dou"
        />
      </div>

      {/* 適用中の条件。必ず解除できるようにしておく */}
      {hasFilter && (
        <p className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-2 border-t border-shironezu pt-5 text-[13.5px] text-keshizumi">
          <span className="text-ainezu">絞り込み中：</span>
          {situation && <span>{SITUATIONS.find((s) => s.id === situation)?.label}</span>}
          {stage && <span>{STAGES.find((s) => s.id === stage)?.age}</span>}
          {area && <span>{areaName(area)}</span>}
          {q.trim() && <span>「{q.trim()}」</span>}
          <button
            type="button"
            onClick={clearAll}
            className="font-semibold text-dou underline decoration-dou/40 underline-offset-[5px] transition-colors hover:decoration-dou"
          >
            すべて解除
          </button>
        </p>
      )}

      {total === 0 ? (
        <div className="mt-12 border border-dashed border-shironezu bg-hakuji/50 px-6 py-8">
          <p className="text-[16px]" style={{ ...MINCHO, fontWeight: 600 }}>
            この条件に当てはまる記事は、まだありません。
          </p>
          <p className="mt-3 text-[14px] leading-[1.95] text-keshizumi">
            数合わせで記事を作ることはしないので、見つからないときは正直にこう出ます。
            条件を1つ外すか、別の言葉でお試しください。
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-5 text-[14px] font-semibold text-dou underline decoration-dou/40 underline-offset-[6px] transition-colors hover:decoration-dou"
          >
            すべて解除する
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
                  className="ml-auto text-[13px] font-semibold text-dou underline decoration-dou/40 underline-offset-[5px] transition-colors hover:decoration-dou"
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
                        className="max-w-[30em] text-[17px] leading-[1.7] sm:text-[19px]"
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
