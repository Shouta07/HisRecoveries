"use client";

// 記事の検索。状態はここに1つだけ置く。
//
// 検索窓をファーストビューに常設していたが、写真の下に4つの入力と
// ボタンが並ぶぶん、1画面目が「探させる画面」になっていた。
// 右上のアイコンから開く形にして、1画面目は写真だけに戻す。
//
// 置き場所をレイアウト直下にしているのは、ナビのボタン（GlassNav / Header）と
// トップの記事一覧が、同じ状態を見る必要があるため。
// おまけに、記事ページからでも検索を開けるようになる（以前はトップ限定だった）。
//
// 探し方は3つ。読者が自分の状態をどう認識しているかは人によって違うため。
//   状況（結婚式に呼ばれた・彼女がほしい）… いちばん自己同定が速い。だから先頭
//   年代（20代・30代）………………………… 悩みの名前を知らなくても選べる
//   分野（肌・髪・睡眠）……………………… 名前が分かっている人向け
// 加えて自由入力。3つは重ねて使える（30代 × 結婚式 × 髪 のように絞れる）。
//
// 選んだ条件は URL に載せる（?s=deai&age=mature&area=hair&q=眉）。
// 静的書き出しを壊さないよう、URL の読み書きは history API で行う（Suspense 不要）。

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { clusters, type ClusterArticle } from "@/lib/clusters";
import { complexes } from "@/lib/complexes";
import { STAGES, STAGE_OF, type StageId } from "@/lib/stages";
import { SITUATIONS, situationsOf, type SituationId } from "@/lib/situations";
import SearchSheet from "./SearchSheet";

export const AREA_ORDER = ["impression", "skin", "hair", "body-hair", "face", "mind"] as const;

export type Option = { value: string; label: string; count: number };
export type Group = { id: string; name: string; items: ClusterArticle[] };

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
  situationOptions: Option[];
  stageOptions: Option[];
  areaOptions: Option[];
  areaName: (id: string) => string;
  labels: string[];
};

const SearchCtx = createContext<Ctx | null>(null);

export function useSearch(): Ctx {
  const c = useContext(SearchCtx);
  if (!c) throw new Error("useSearch must be used inside <SearchProvider>");
  return c;
}

export default function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
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

  // 状態 → URL（トップだけ。記事ページのURLに検索条件を足しても意味がない）
  useEffect(() => {
    if (!ready || window.location.pathname !== "/") return;
    const p = new URLSearchParams();
    if (situation) p.set("s", situation);
    if (stage) p.set("age", stage);
    if (area) p.set("area", area);
    if (q.trim()) p.set("q", q.trim());
    const qs = p.toString();
    window.history.replaceState(null, "", `/${qs ? `?${qs}` : ""}`);
  }, [ready, q, situation, stage, area]);

  const hasFilter = Boolean(q.trim() || situation || stage || area);

  const matches = useCallback(
    (
      x: ClusterArticle,
      s: SituationId | null,
      g: StageId | null,
      a: string | null,
      needle: string,
    ) => {
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
    },
    [areaName],
  );

  // 条件を1つ差し替えた状態での件数。0件の選択肢を押させないため。
  const countIf = useCallback(
    (over: { situation?: SituationId | null; stage?: StageId | null; area?: string | null }) => {
      const s = over.situation !== undefined ? over.situation : situation;
      const g = over.stage !== undefined ? over.stage : stage;
      const a = over.area !== undefined ? over.area : area;
      const needle = q.trim().toLowerCase();
      return clusters.filter((x) => matches(x, s, g, a, needle)).length;
    },
    [q, situation, stage, area, matches],
  );

  const situationOptions = useMemo<Option[]>(
    () => SITUATIONS.map((s) => ({ value: s.id, label: s.label, count: countIf({ situation: s.id }) })),
    [countIf],
  );
  const stageOptions = useMemo<Option[]>(
    () =>
      STAGES.filter((s) => clusters.some((c) => STAGE_OF[c.slug] === s.id)).map((s) => ({
        value: s.id,
        label: s.age,
        count: countIf({ stage: s.id }),
      })),
    [countIf],
  );
  const areaOptions = useMemo<Option[]>(
    () => AREA_ORDER.map((id) => ({ value: id, label: areaName(id), count: countIf({ area: id }) })),
    [countIf, areaName],
  );

  const groups = useMemo<Group[]>(() => {
    const needle = q.trim().toLowerCase();
    return AREA_ORDER.map((id) => ({
      id,
      name: areaName(id),
      items: clusters.filter((a) => a.areaId === id && matches(a, situation, stage, area, needle)),
    })).filter((g) => g.items.length > 0);
  }, [q, situation, stage, area, areaName, matches]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  /** 適用中の条件を、そのまま読める言葉で */
  const labels = useMemo(() => {
    const out: string[] = [];
    if (situation) out.push(SITUATIONS.find((s) => s.id === situation)?.label ?? "");
    if (stage) out.push(STAGES.find((s) => s.id === stage)?.age ?? "");
    if (area) out.push(areaName(area));
    if (q.trim()) out.push(`「${q.trim()}」`);
    return out.filter(Boolean);
  }, [situation, stage, area, q, areaName]);

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
    situationOptions,
    stageOptions,
    areaOptions,
    areaName,
    labels,
  };

  return (
    <SearchCtx.Provider value={value}>
      {children}
      <SearchSheet />
    </SearchCtx.Provider>
  );
}
