// Recoveries Letter — auto-draft generator. Pulls anonymized aggregates
// from the last N days of Checks + Asks, surfaces the dominant theme,
// and outputs a draft outline in the brand voice that the editor finishes
// by hand. The editor stays in the loop (this never sends or posts).

import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbAdminEnabled } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TERRITORY_LABEL: Record<string, string> = {
  "sweat-odor": "汗とにおい",
  "skin-acne": "肌とニキビ跡",
  "hair-loss": "薄毛とAGA",
  "beard-body-hair": "髭と体毛",
  "face-impression": "顔の印象",
  "mind-awareness": "心と自意識",
};

const CONCERN_TO_TERRITORY: Record<string, string> = {
  sweat: "sweat-odor",
  odor: "sweat-odor",
  skin: "skin-acne",
  hair: "hair-loss",
  beard: "beard-body-hair",
  body: "beard-body-hair",
  face: "face-impression",
  sleep: "mind-awareness",
  confidence: "mind-awareness",
  other: "mind-awareness",
};

type CheckRow = { responses: Record<string, unknown>; created_at: string };
type AskRow = {
  territory: string | null;
  context: string | null;
  created_at: string;
};

function topN<T extends string>(xs: T[], n: number): { value: T; count: number }[] {
  const counts = new Map<T, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([value, count]) => ({ value, count }));
}

export async function GET(req: NextRequest) {
  if (!dbAdminEnabled) {
    return NextResponse.json(
      { error: "admin db not configured" },
      { status: 500 }
    );
  }
  const url = new URL(req.url);
  const days = Math.max(1, Math.min(180, Number(url.searchParams.get("days") ?? "30")));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const [checks, asks] = await Promise.all([
    dbSelect<CheckRow>(
      `checks?select=responses,created_at&created_at=gte.${since}&limit=500`
    ),
    dbSelect<AskRow>(
      `asks?select=territory,context,created_at&created_at=gte.${since}&limit=500`
    ),
  ]);

  // Aggregate concerns → territories from checks
  const territories: string[] = [];
  const firstSteps: string[] = [];
  const durations: string[] = [];
  for (const c of checks) {
    const cs = c.responses?.["concerns"];
    if (Array.isArray(cs)) {
      for (const x of cs) {
        const t = CONCERN_TO_TERRITORY[String(x)];
        if (t) territories.push(t);
      }
    }
    const fs = c.responses?.["first_step"];
    if (typeof fs === "string" && fs) firstSteps.push(fs);
    const dur = c.responses?.["duration"];
    if (typeof dur === "string" && dur) durations.push(dur);
  }
  for (const a of asks) if (a.territory) territories.push(a.territory);

  const topTerritories = topN(territories, 3).map((t) => ({
    ...t,
    label: TERRITORY_LABEL[t.value] ?? t.value,
  }));
  const topFirstSteps = topN(firstSteps, 5);
  const topDurations = topN(durations, 3);

  // Anonymized vignettes — from asks.context only (already user-supplied
  // public-leaning text). Cap length, dedup, drop sensitive markers.
  const vignettes = Array.from(
    new Set(
      asks
        .map((a) => (a.context ?? "").trim())
        .filter((c) => c.length >= 8 && c.length <= 80)
    )
  ).slice(0, 5);

  const dominant = topTerritories[0];
  const today = new Date().toISOString().slice(0, 10);

  const lines: string[] = [];
  lines.push(`# Recoveries Letter — 下書き（${today}・直近 ${days} 日）`);
  lines.push("");
  lines.push(`> 集計対象: Check ${checks.length} 件 / Ask ${asks.length} 件`);
  lines.push("");
  lines.push(`## テーマ案`);
  lines.push(
    dominant
      ? `**${dominant.label}** が直近で最も多く触れられている領域（${dominant.count} 件）。`
      : `直近の集計データから優位な領域は読み取れず。手紙は編集者の任意のテーマで。`
  );
  if (topTerritories.length > 1) {
    lines.push(
      `補助的に: ${topTerritories.slice(1).map((t) => `${t.label}（${t.count}）`).join(" / ")}`
    );
  }
  lines.push("");

  if (vignettes.length > 0) {
    lines.push(`## 直近、Ask に届いた "場面" の断片（匿名）`);
    for (const v of vignettes) lines.push(`- ${v}`);
    lines.push("");
    lines.push(
      `<!-- EDITOR: これらは公開可能性のチェックを通過した本人記入の場面ですが、`
    );
    lines.push(`     固有名詞・特定可能要素が無いか、もう一度読み直してください。 -->`);
    lines.push("");
  }

  if (topFirstSteps.length > 0) {
    lines.push(`## いま、半歩として選ばれているもの（Check）`);
    for (const fs of topFirstSteps) lines.push(`- ${fs.value}（${fs.count}）`);
    lines.push("");
  }

  if (topDurations.length > 0) {
    lines.push(`## 意識し始めてからの期間（Check）`);
    for (const d of topDurations) lines.push(`- ${d.value}（${d.count}）`);
    lines.push("");
  }

  lines.push(`## 手紙の足場（一人称・過去形・煽らない）`);
  lines.push("");
  lines.push(
    `この${days}日、編集者宛に届いた問いの中で、いちばん多かったのは ${dominant?.label ?? "(任意)"} のことだった。`
  );
  lines.push("");
  lines.push(`書き手にとって、その領域は、ある時期、毎朝の所作のなかに住んでいた。`);
  lines.push(`だから、答えられる範囲のことだけを、今週は書きたい。`);
  lines.push("");
  lines.push(`---`);
  lines.push("");
  lines.push(`（本文：300〜500字。完了形を避ける。診断・断定をしない。誰かを救おうとしない。）`);
  lines.push("");
  lines.push(`---`);
  lines.push("");
  lines.push(`日曜日に。`);
  lines.push("");

  return NextResponse.json({
    ok: true,
    days,
    counts: { checks: checks.length, asks: asks.length },
    topTerritories,
    topFirstSteps,
    topDurations,
    vignettes,
    markdown: lines.join("\n"),
  });
}
