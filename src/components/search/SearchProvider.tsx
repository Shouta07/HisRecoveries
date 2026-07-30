"use client";

// 記事の検索。状態はここに1つだけ置く。
//
// 検索窓をファーストビューに常設していたが、写真の下に4つの入力と
// ボタンが並ぶぶん、1画面目が「探させる画面」になっていた。
// 右上のアイコンから開く形にして、1画面目は写真だけに戻した。
//
// 置き場所をレイアウト直下にしているのは、ナビのボタン（GlassNav / Header）と
// トップの記事一覧が、同じ状態を見る必要があるため。
// おまけに、記事ページからでも検索を開けるようになる（以前はトップ限定だった）。
//
// ── データを import しない・最初は読み込まない ──────────────
// このファイルは "use client" なので、ここで clusters を import すると
// 記事の本文・FAQ・出典まで全部（230KB）がブラウザ向けのJSに焼き込まれる。
// 実際そうなっていた。
//
// かといって props で渡すと、今度は RSC のペイロードに焼き込まれて、
// 検索を1度も開かないページ（/plan・記事）にも索引が乗る。
// 実測で /plan の HTML が 180KB になった。
//
// なので索引は /search-index.json に置き、必要になった時だけ取りに行く。
//  ・検索を開いたとき
//  ・トップに絞り込み条件つきで来たとき（?s=... など）
// 初回表示では1バイトも読まない。トップの記事一覧はサーバーが書き出した
// HTML をそのまま使う（絞り込みが始まるまで、この索引は要らない）。
//
// 探し方は3つ。読者が自分の状態をどう認識しているかは人によって違うため。
//   状況（結婚式に呼ばれた・彼女がほしい）… いちばん自己同定が速い。だから先頭
//   年代（20代・30代）………………………… 悩みの名前を知らなくても選べる
//   分野（肌・髪・睡眠）……………………… 名前が分かっている人向け
// 加えて自由入力。3つは重ねて使える（30代 × 結婚式 × 髪 のように絞れる）。
//
// 選んだ条件は URL に載せる（?s=deai&age=mature&area=hair&q=眉）。
// 静的書き出しを壊さないよう、URL の読み書きは history API で行う（Suspense 不要）。

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { SearchIndex, SearchItem } from "@/lib/searchIndex";
import type { SituationId } from "@/lib/situations";
import type { StageId } from "@/lib/stages";
import SearchSheet from "./SearchSheet";

export type Option = { value: string; label: string; count: number };
export type Group = { id: string; name: string; items: SearchItem[] };

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  q: string;
  setQ: (v: string) => void;
  situation: SituationId | null;
  setSituation: (v: SituationId | null) => void;
  stage: StageId | null;
  setStage: (v: StageId | null) => void;
  area: string | null;
  setArea: (v: string | null) => void;
  hasFilter: boolean;
  clearAll: () => void;
  groups: Group[];
  total: number;
  /** 絞り込みなしの総数（索引が来る前はサーバーが渡した数） */
  allCount: number;
  /** 索引が届いていて、絞り込んだ一覧を出せる状態か */
  ready: boolean;
  situationOptions: Option[];
  stageOptions: Option[];
  areaOptions: Option[];
  labels: string[];
};

const SearchCtx = createContext<Ctx | null>(null);

export function useSearch(): Ctx {
  const c = useContext(SearchCtx);
  if (!c) throw new Error("useSearch must be used inside <SearchProvider>");
  return c;
}

export default function SearchProvider({
  allCount,
  children,
}: {
  /** 記事の総数。索引を読む前でも件数を出せるように、サーバーから数だけ受け取る */
  allCount: number;
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const loading = useRef(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [situation, setSituation] = useState<SituationId | null>(null);
  const [stage, setStage] = useState<StageId | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [urlRead, setUrlRead] = useState(false);

  /** 索引を1度だけ取りに行く */
  const ensureIndex = useCallback(() => {
    if (index || loading.current) return;
    loading.current = true;
    fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j: SearchIndex | null) => j && setIndex(j))
      .catch(() => {
        /* 取れなくても、サーバーが書き出した一覧はそのまま読める */
      })
      .finally(() => {
        loading.current = false;
      });
  }, [index]);

  // URL → 状態（初回のみ）。条件が付いていれば、そのぶん索引も要る。
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = p.get("s");
    const age = p.get("age");
    const ar = p.get("area");
    const qq = p.get("q") ?? "";
    if (s) setSituation(s as SituationId);
    if (age) setStage(age as StageId);
    if (ar) setArea(ar);
    setQ(qq);
    if (s || age || ar || qq) ensureIndex();
    setUrlRead(true);
  }, [ensureIndex]);

  // 検索を開いたら索引を取る
  useEffect(() => {
    if (open) ensureIndex();
  }, [open, ensureIndex]);

  // 状態 → URL（トップだけ。記事ページのURLに検索条件を足しても意味がない）
  useEffect(() => {
    if (!urlRead || window.location.pathname !== "/") return;
    const p = new URLSearchParams();
    if (situation) p.set("s", situation);
    if (stage) p.set("age", stage);
    if (area) p.set("area", area);
    if (q.trim()) p.set("q", q.trim());
    const qs = p.toString();
    window.history.replaceState(null, "", `/${qs ? `?${qs}` : ""}`);
  }, [urlRead, q, situation, stage, area]);

  const hasFilter = Boolean(q.trim() || situation || stage || area);

  const matches = useCallback(
    (x: SearchItem, s: SituationId | null, g: StageId | null, a: string | null, needle: string) => {
      if (s && !x.situations.includes(s)) return false;
      if (g && x.stage !== g) return false;
      if (a && x.areaId !== a) return false;
      if (!needle) return true;
      return x.haystack.includes(needle);
    },
    [],
  );

  // 条件を1つ差し替えた状態での件数。0件の選択肢を押させないため。
  const countIf = useCallback(
    (over: { situation?: SituationId | null; stage?: StageId | null; area?: string | null }) => {
      const s = over.situation !== undefined ? over.situation : situation;
      const g = over.stage !== undefined ? over.stage : stage;
      const a = over.area !== undefined ? over.area : area;
      const needle = q.trim().toLowerCase();
      return (index?.items ?? []).filter((x) => matches(x, s, g, a, needle)).length;
    },
    [index, q, situation, stage, area, matches],
  );

  const situationOptions = useMemo<Option[]>(
    () => (index?.situations ?? []).map((s) => ({ value: s.id, label: s.label, count: countIf({ situation: s.id }) })),
    [index, countIf],
  );
  const stageOptions = useMemo<Option[]>(
    () => (index?.stages ?? []).map((s) => ({ value: s.id, label: s.label, count: countIf({ stage: s.id }) })),
    [index, countIf],
  );
  const areaOptions = useMemo<Option[]>(
    () => (index?.areas ?? []).map((a) => ({ value: a.id, label: a.label, count: countIf({ area: a.id }) })),
    [index, countIf],
  );

  const groups = useMemo<Group[]>(() => {
    const needle = q.trim().toLowerCase();
    if (!index) return [];
    return index.areas
      .map((a) => ({
        id: a.id,
        name: a.label,
        items: index.items.filter((x) => x.areaId === a.id && matches(x, situation, stage, area, needle)),
      }))
      .filter((g) => g.items.length > 0);
  }, [index, q, situation, stage, area, matches]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  /** 適用中の条件を、そのまま読める言葉で */
  const labels = useMemo(() => {
    const out: string[] = [];
    if (situation) out.push(index?.situations.find((s) => s.id === situation)?.label ?? "");
    if (stage) out.push(index?.stages.find((s) => s.id === stage)?.label ?? "");
    if (area) out.push(index?.areas.find((a) => a.id === area)?.label ?? "");
    if (q.trim()) out.push(`「${q.trim()}」`);
    return out.filter(Boolean);
  }, [index, situation, stage, area, q]);

  const clearAll = useCallback(() => {
    setQ("");
    setSituation(null);
    setStage(null);
    setArea(null);
  }, []);

  // 開いている間は背面をスクロールさせない
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const value: Ctx = {
    open,
    setOpen,
    q,
    setQ,
    situation,
    setSituation,
    stage,
    setStage,
    area,
    setArea,
    hasFilter,
    clearAll,
    groups,
    total,
    allCount,
    ready: Boolean(index),
    situationOptions,
    stageOptions,
    areaOptions,
    labels,
  };

  return (
    <SearchCtx.Provider value={value}>
      {children}
      <SearchSheet />
    </SearchCtx.Provider>
  );
}
