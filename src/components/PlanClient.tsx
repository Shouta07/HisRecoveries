"use client";

// /plan の中身。query から条件を読み、その場で編成して結果を出す。
//
// useSearchParams ではなく location を読むのは、このページを静的なまま
// 保つため（useSearchParams は Suspense 境界を要求し、ページを動的にする）。
// 条件は URL にしかないので、直リンク・再読み込み・共有がそのまま効く。

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PlanResult, { type DiagArticle } from "@/components/PlanResult";
import { composePlan, type PlanInput } from "@/lib/planner";
import { occasionById } from "@/lib/occasions";
import { parsePlanQuery } from "@/lib/planQuery";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function PlanClient({ articles }: { articles: Record<string, DiagArticle[]> }) {
  // query は client でしか読めないので、最初の描画は「読み込み中」になる。
  const [search, setSearch] = useState<string | null>(null);
  useEffect(() => setSearch(window.location.search), []);

  const input = useMemo<PlanInput | null>(() => {
    if (search === null) return null;
    const q = parsePlanQuery(search);
    if (!q.pref || !q.age) return null;
    const o = occasionById(q.occasion);
    return {
      prefectureId: q.pref,
      age: Number(q.age),
      goalKeys: q.goals,
      text: q.text,
      occasion: o ? { label: o.headline, modules: o.modules, flowLead: o.flowLead } : undefined,
      targetDate: q.date || undefined,
    };
  }, [search]);

  const plan = useMemo(() => (input ? composePlan(input) : null), [input]);

  if (search === null) {
    return <div className="min-h-[40vh] grid place-items-center text-[13px] text-[#6b7a66]">読み込んでいます…</div>;
  }

  // 条件が足りない（直リンクなど）ときは、入口へ戻す。
  if (!input || !plan) {
    return (
      <div className="max-w-[560px] mx-auto px-5 py-20 text-center">
        <h1 className="text-[1.3rem] font-bold text-[#1f2a1d] leading-[1.5]" style={MINCHO}>
          条件が見つかりませんでした。
        </h1>
        <p className="mt-3 text-[13px] text-[#4b5b47] leading-[1.9]">
          お住まいと年齢から、あらためて組み直しましょう。30秒で終わります。
        </p>
        <Link
          href="/#diagnosis"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#16241A] hover:bg-[#22331f] text-[#EDF1E8] text-[14px] font-bold px-7 py-3.5 transition-colors"
        >
          パッケージを組む <span aria-hidden>→</span>
        </Link>
      </div>
    );
  }

  return <PlanResult plan={plan} input={input} articles={articles} onReset={() => history.back()} />;
}
