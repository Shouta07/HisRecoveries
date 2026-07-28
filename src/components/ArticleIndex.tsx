"use client";

// トップの1画面目 ＝ 写真 ＋ 記事の検索。
//
// 検索を下に置くと、スマホでは写真をスクロールし切るまで存在に気づかれない。
// なので写真と検索を1つの箱に入れ、その箱の高さを 100svh に固定する。
// svh を使うのは、iOS のアドレスバーが出ている状態（＝いちばん狭いとき）を
// 基準にしないと「全部入る」が成立しないため。
// 写真は flex-1 で残り全部を取るので、画面が高いほど写真が大きくなる。
//
// 探し方は3つ。読者が自分の状態をどう認識しているかは人によって違うため。
//   状況（結婚式に呼ばれた・彼女がほしい）… いちばん自己同定が速い。だから先頭
//   年代（20代・30代）………………………… 悩みの名前を知らなくても選べる
//   分野（肌・髪・睡眠）……………………… 名前が分かっている人向け
// 加えて自由入力。3つは重ねて使える（30代 × 結婚式 × 髪 のように絞れる）。
//
// スマホは2×2、デスクトップは横1列。枠は1つ、罫線で区切る（旅行予約サイトと同じ組み）。
// 上にラベルは置かない。「年代をえらぶ」がそのまま指示になるため。
//
// 選んだ条件は URL に載せる（?s=deai&age=mature&area=hair&q=眉）。
// 静的書き出しを壊さないよう、URL の読み書きは history API で行う（Suspense 不要）。

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

/** 選択中はセルの幅が半分しかないので、長いものだけ短い表記を持つ */
type Option = { value: string; label: string; short?: string; count: number };

const SITUATION_SHORT: Partial<Record<SituationId, string>> = {
  shashin: "写真を撮る",
  hajimete: "何から始めるか",
};
const STAGE_SHORT: Partial<Record<StageId, string>> = {
  foundation: "10〜20代前半",
};

/* ── 1セル＝1条件 ───────────────────────────────────────────────
   ネイティブの <select> ではなく自前にしている理由は、件数を併記したいのと、
   0件になる選択肢を押せなくしたいため（選んでから空振りするのを防ぐ）。
   キーボードとスクリーンリーダーは listbox のロールで担保する。 */
function Cell({
  id,
  placeholder,
  options,
  value,
  onChange,
  column,
}: {
  id: string;
  placeholder: string;
  options: Option[];
  value: string | null;
  onChange: (v: string | null) => void;
  /** スマホは2列。開いたパネルは枠いっぱいに広げるので、
   *  右列のセルは右端を基準にしないと画面からはみ出す。 */
  column: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value) ?? null;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={box} className="relative bg-hakuji sm:flex-1">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-[50px] w-full items-center justify-between gap-2 px-3.5 text-left text-[14px] transition-colors hover:bg-kinari/60 sm:h-[54px] sm:px-4 sm:text-[15px]"
      >
        <span className={`truncate ${selected ? "font-semibold text-sumi" : "text-ainezu"}`}>
          {selected ? (selected.short ?? selected.label) : placeholder}
        </span>
        <span
          aria-hidden
          className={`shrink-0 text-[9px] text-ainezu transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={placeholder}
          className={`absolute z-30 mt-px max-h-[16rem] w-[calc(200%+1px)] overflow-y-auto border border-sumi/15 bg-hakuji shadow-[0_18px_40px_-24px_rgba(31,30,27,0.6)] sm:left-0 sm:right-auto sm:w-full ${
            column === "right" ? "right-0" : "left-0"
          }`}
        >
          {selected && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="block w-full border-b border-shironezu px-4 py-3 text-left text-[13.5px] text-dou hover:bg-kinari"
            >
              指定しない
            </button>
          )}
          {options.map((o) => {
            const on = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={on}
                disabled={o.count === 0 && !on}
                onClick={() => {
                  onChange(on ? null : o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-baseline justify-between gap-3 border-b border-shironezu px-4 py-3 text-left text-[14.5px] transition-colors last:border-b-0 ${
                  on
                    ? "bg-tokiwa text-kinari"
                    : o.count === 0
                      ? "cursor-not-allowed text-ainezu/45"
                      : "text-keshizumi hover:bg-kinari hover:text-dou"
                }`}
              >
                <span>{o.label}</span>
                <span className={`shrink-0 text-[12px] tabular-nums ${on ? "text-kinari/70" : "text-ainezu"}`}>
                  {o.count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ArticleIndex({ hero }: { hero: React.ReactNode }) {
  const [q, setQ] = useState("");
  const [situation, setSituation] = useState<SituationId | null>(null);
  const [stage, setStage] = useState<StageId | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const areaName = useCallback(
    (id: string) => complexes.find((c) => c.id === id)?.ja ?? "",
    [],
  );

  // URL → 状態（初回のみ）
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = p.get("s");
    const age = p.get("age");
    const ar = p.get("area");
    if (s && SITUATIONS.some((x) => x.id === s)) setSituation(s as SituationId);
    if (age && STAGES.some((x) => x.id === age)) setStage(age as StageId);
    if (ar && AREA_ORDER.includes(ar as (typeof AREA_ORDER)[number])) setArea(ar);
    setQ(p.get("q") ?? "");
    setReady(true);
  }, []);

  // 状態 → URL（履歴は汚さない）
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (situation) p.set("s", situation);
    if (stage) p.set("age", stage);
    if (area) p.set("area", area);
    if (q.trim()) p.set("q", q.trim());
    const qs = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [ready, q, situation, stage, area]);

  const hasFilter = Boolean(q.trim() || situation || stage || area);

  // 条件を1つ差し替えた状態での件数。0件の選択肢を押させないため。
  const countIf = useCallback(
    (over: { situation?: SituationId | null; stage?: StageId | null; area?: string | null }) => {
      const s = over.situation !== undefined ? over.situation : situation;
      const g = over.stage !== undefined ? over.stage : stage;
      const a = over.area !== undefined ? over.area : area;
      const needle = q.trim().toLowerCase();
      return clusters.filter((x) => {
        if (s && !situationsOf(x.slug).includes(s)) return false;
        if (g && STAGE_OF[x.slug] !== g) return false;
        if (a && x.areaId !== a) return false;
        if (!needle) return true;
        return (
          x.title.toLowerCase().includes(needle) ||
          x.lead.toLowerCase().includes(needle) ||
          x.keywords.some((k) => k.toLowerCase().includes(needle)) ||
          areaName(x.areaId).includes(needle)
        );
      }).length;
    },
    [q, situation, stage, area, areaName],
  );

  const situationOptions: Option[] = useMemo(
    () =>
      SITUATIONS.map((s) => ({
        value: s.id,
        label: s.label,
        short: SITUATION_SHORT[s.id],
        count: countIf({ situation: s.id }),
      })),
    [countIf],
  );
  const stageOptions: Option[] = useMemo(
    () =>
      STAGES.filter((s) => clusters.some((c) => STAGE_OF[c.slug] === s.id)).map((s) => ({
        value: s.id,
        label: s.age,
        short: STAGE_SHORT[s.id],
        count: countIf({ stage: s.id }),
      })),
    [countIf],
  );
  const areaOptions: Option[] = useMemo(
    () => AREA_ORDER.map((id) => ({ value: id, label: areaName(id), count: countIf({ area: id }) })),
    [countIf, areaName],
  );

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
  }, [q, situation, stage, area, areaName]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  const clearAll = () => {
    setQ("");
    setSituation(null);
    setStage(null);
    setArea(null);
  };

  const toResults = () => {
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ══ 1画面目：写真 ＋ 検索 ══
          minHeight は inline で 100svh を当てる。svh を解さないブラウザでは
          この宣言ごと落ちて、クラスの min-h-screen（100vh）が効く。 */}
      <header
        id="index"
        className="flex min-h-screen flex-col bg-kinari"
        style={{ minHeight: "100svh" }}
      >
        <div className="relative min-h-[220px] flex-1 overflow-hidden bg-tokiwa">{hero}</div>

        <div className="shrink-0 px-4 pb-5 pt-3.5 sm:px-8 sm:pb-7 sm:pt-5 lg:px-12">
          <div className="mx-auto max-w-[1080px]">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-[15px] sm:text-[17px]" style={{ ...MINCHO, fontWeight: 600 }}>
                記事をさがす
              </h2>
              {hasFilter ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[12.5px] text-dou underline decoration-dou/40 underline-offset-[5px] transition-colors hover:decoration-dou"
                >
                  すべて解除
                </button>
              ) : (
                <p className="text-[12px] tabular-nums text-ainezu">全{clusters.length}本</p>
              )}
            </div>

            {/* 枠は1つ。隙間の色が罫線になる（grid でも flex でも同じ組みが作れる） */}
            <div className="mt-2.5 grid grid-cols-2 gap-px rounded-[2px] border border-shironezu bg-shironezu sm:flex sm:items-stretch">
              <Cell
                id="f-situation"
                placeholder="状況をえらぶ"
                options={situationOptions}
                value={situation}
                onChange={(v) => setSituation(v as SituationId | null)}
                column="left"
              />
              <Cell
                id="f-stage"
                placeholder="年代をえらぶ"
                options={stageOptions}
                value={stage}
                onChange={(v) => setStage(v as StageId | null)}
                column="right"
              />
              <Cell
                id="f-area"
                placeholder="分野をえらぶ"
                options={areaOptions}
                value={area}
                onChange={setArea}
                column="left"
              />
              <div className="bg-hakuji sm:flex-1">
                <input
                  id="q"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="言葉でさがす"
                  aria-label="言葉でさがす"
                  className="h-[50px] w-full bg-transparent px-3.5 text-[16px] text-sumi outline-none placeholder:text-ainezu focus:bg-kinari/60 sm:h-[54px] sm:px-4 sm:text-[15px]"
                />
              </div>
            </div>

            {/* 件数つきのボタンを1つ。押すと結果の先頭へ。 */}
            <button
              type="button"
              onClick={toResults}
              className="mt-2.5 flex h-[48px] w-full items-center justify-center gap-2 rounded-[2px] bg-tokiwa text-[15px] font-semibold text-kinari transition-colors hover:bg-tokiwa/90 sm:mt-3.5 sm:h-[52px]"
            >
              <span>
                <span className="tabular-nums">{total}</span>本をみる
              </span>
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </header>

      {/* ══ 検索結果 ══ */}
      <div id="results" className="mx-auto max-w-[1080px] scroll-mt-4 px-5 pt-14 sm:px-8 sm:pt-20 lg:px-12">
        {total === 0 ? (
          <div className="border border-dashed border-shironezu bg-hakuji/50 px-6 py-8">
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
          <div className="flex flex-col gap-[72px] sm:gap-[96px]">
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
    </>
  );
}
