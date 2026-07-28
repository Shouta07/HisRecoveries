"use client";

// 記事の索引。トップに置く、このメディアの本体。
//
// 探し方を3つ用意する。読者が自分の状態をどう認識しているかは人によって違うため。
//   状況（結婚式に呼ばれた・彼女がほしい）… いちばん自己同定が速い。だから先頭
//   年代（20代・30代）………………………… 悩みの名前を知らなくても選べる
//   分野（肌・髪・睡眠）……………………… 名前が分かっている人向け
// 加えて自由入力。3つは重ねて使える（30代 × 結婚式 × 髪 のように絞れる）。
//
// 選択肢を全部並べると19個のボタンが積み上がり、記事に着く前に画面が終わる。
// なのでトグルダウン（開いて選ぶ）にした。閉じているときは1行で済む。
//
// 選んだ条件は URL に載せる（?s=deai&age=20s&area=hair&q=眉）。
//  ・絞り込んだ状態をそのまま共有・ブックマークできる
//  ・戻ってきたときに同じ画面が出る
//  ・schema.org の SearchAction を正直に宣言できる
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

type Option = { value: string; label: string; count: number };

/* ── トグルダウン ───────────────────────────────────────────────
   ネイティブの <select> ではなく自前にしている理由は、件数を併記したいのと、
   選択中に「解除」を出したいため。キーボードとスクリーンリーダーは
   listbox のロールで担保する。 */
function Toggle({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: Option[];
  value: string | null;
  onChange: (v: string | null) => void;
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
    <div ref={box} className="relative">
      <label htmlFor={id} className="block text-[12.5px] text-ainezu">
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`mt-2 flex h-12 w-full items-center justify-between gap-3 rounded-[2px] border px-4 text-left text-[14.5px] transition-colors ${
          selected
            ? "border-tokiwa bg-tokiwa text-kinari"
            : "border-shironezu bg-hakuji text-keshizumi hover:border-dou"
        }`}
      >
        <span className="truncate">{selected ? selected.label : "選ぶ"}</span>
        <span
          aria-hidden
          className={`shrink-0 text-[11px] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[19rem] overflow-y-auto border border-sumi/15 bg-hakuji shadow-[0_18px_40px_-28px_rgba(31,30,27,0.55)]"
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
                className={`flex w-full items-baseline justify-between gap-3 border-b border-shironezu px-4 py-3 text-left text-[14.5px] last:border-b-0 transition-colors ${
                  on
                    ? "bg-tokiwa text-kinari"
                    : o.count === 0
                      ? "cursor-not-allowed text-ainezu/50"
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

export default function ArticleIndex() {
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
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}#index`);
  }, [ready, q, situation, stage, area]);

  const hasFilter = Boolean(q.trim() || situation || stage || area);

  // 条件を1つ外した状態での件数を出す。0件の選択肢を押させないため。
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
    () => SITUATIONS.map((s) => ({ value: s.id, label: s.label, count: countIf({ situation: s.id }) })),
    [countIf],
  );
  const stageOptions: Option[] = useMemo(
    () =>
      STAGES.filter((s) => clusters.some((c) => STAGE_OF[c.slug] === s.id)).map((s) => ({
        value: s.id,
        label: s.age,
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

      {/* 絞り込み。閉じているときは1行に収まる */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Toggle
          id="f-situation"
          label="いまの状況から"
          options={situationOptions}
          value={situation}
          onChange={(v) => setSituation(v as SituationId | null)}
        />
        <Toggle
          id="f-stage"
          label="年代から"
          options={stageOptions}
          value={stage}
          onChange={(v) => setStage(v as StageId | null)}
        />
        <Toggle id="f-area" label="分野から" options={areaOptions} value={area} onChange={setArea} />
        <div>
          <label htmlFor="q" className="block text-[12.5px] text-ainezu">
            言葉でさがす
          </label>
          <input
            id="q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="AGA、ニキビ、眉、写真 …"
            className="mt-2 h-12 w-full rounded-[2px] border border-shironezu bg-hakuji px-4 text-[16px] text-sumi outline-none transition-colors placeholder:text-ainezu focus:border-dou"
          />
        </div>
      </div>

      {/* 適用中の条件。必ず解除できるようにしておく */}
      {hasFilter && (
        <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2 border-t border-shironezu pt-5 text-[13.5px] text-keshizumi">
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
        <div className="mt-12 flex flex-col gap-[72px] sm:gap-[96px]">
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
