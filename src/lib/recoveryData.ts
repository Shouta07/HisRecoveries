// Aggregation helpers for /admin/data — the Recovery Data layer (the
// "知見がたまる" half of the Vitality Design loop). Anonymized counts
// only; no raw email / name is surfaced here.

import { CHECK_QUESTIONS, type CheckQuestion } from "./checkQuestions";

export type CheckRow = {
  responses: Record<string, unknown>;
  created_at: string;
};

export type Tally = { label: string; value: string; count: number };

function q(id: string): CheckQuestion | undefined {
  return CHECK_QUESTIONS.find((x) => x.id === id);
}

function optionLabel(question: CheckQuestion | undefined, value: string): string {
  if (!question) return value;
  if (question.kind === "single" || question.kind === "multi") {
    return question.options.find((o) => o.value === value)?.label ?? value;
  }
  return value;
}

/** Frequency of a single-select question across check rows. */
export function tallySingle(rows: CheckRow[], id: string): Tally[] {
  const question = q(id);
  const counts = new Map<string, number>();
  for (const r of rows) {
    const v = r.responses?.[id];
    if (typeof v === "string" && v) {
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({
      value,
      label: optionLabel(question, value),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Frequency of a multi-select question (each chosen option counts). */
export function tallyMulti(rows: CheckRow[], id: string): Tally[] {
  const question = q(id);
  const counts = new Map<string, number>();
  for (const r of rows) {
    const v = r.responses?.[id];
    if (Array.isArray(v)) {
      for (const val of v) {
        if (typeof val === "string") {
          counts.set(val, (counts.get(val) ?? 0) + 1);
        }
      }
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({
      value,
      label: optionLabel(question, value),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Average of a 1–N scale question. */
export function averageScale(
  rows: CheckRow[],
  id: string
): { avg: number; n: number } {
  let sum = 0;
  let n = 0;
  for (const r of rows) {
    const v = r.responses?.[id];
    if (typeof v === "number") {
      sum += v;
      n += 1;
    }
  }
  return { avg: n ? Math.round((sum / n) * 10) / 10 : 0, n };
}

/** Group rows by month (YYYY-MM) for a simple time series. */
export function byMonth(rows: { created_at: string }[]): Tally[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const m = (r.created_at ?? "").slice(0, 7);
    if (m) counts.set(m, (counts.get(m) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([value, count]) => ({ value, label: value, count }));
}

/** Simple status tally for any { status } rows. */
export function tallyStatus(
  rows: { status: string }[],
  labels: Record<string, string>
): Tally[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    counts.set(r.status, (counts.get(r.status) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({
      value,
      label: labels[value] ?? value,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
