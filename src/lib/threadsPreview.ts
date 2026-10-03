// Threads 投稿プレビュー — 「どんな投稿がされる予定か」を事前に見るためのデータ層。
// apps/threads の設定（ペルソナのスケジュール、仮説＝投稿タイプ、連投テンプレ＝実例）を
// サーバー側で読む。承認キュー(approvals.json)は readThreadsSnapshot() 側。
//
// これは「リポジトリの最終スナップショット」。実生成は Gemini 実行時。

import fs from "node:fs";
import path from "node:path";

const DIR = "apps/threads/accounts/mens-body-lab";

function readJson<T>(rel: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), rel), "utf-8")) as T;
  } catch {
    return fallback;
  }
}

export type Slot = { time: string; types: string[] };

export type PlannedType = {
  id: string;
  type: string;
  name: string;
  slug: string;
  topics: string[];
  status: string;
  /** 出る時間帯（朝/夜）。slot_type_map から判定。 */
  when: string[];
  /** 連投の実例（thread_templates.json）。無ければ空。 */
  sample: string[];
};

export type ThreadsPlan = {
  available: boolean;
  slots: Slot[];
  types: PlannedType[];
};

// 内部タイプ名 → 場面ラベル。
// hypotheses.json の type（= slug）に対応する。
// 旧事業（gift/mother/urgent/areas/biz/b2b/fan = 読者4層＋事業仮説）のラベルを
// タシカメの5場面に置き換えた。
const TYPE_LABELS: Record<string, string> = {
  message: "送る前のLINE",
  photo: "自己紹介文・プロフィール",
  date: "誘うタイミング",
  signal: "デートのあと",
  distance: "距離感・言いにくいこと",
};

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

const SLOT_LABELS: Record<string, string> = { morning: "朝 9:00", night: "夜 21:00" };

export function readThreadsPlan(): ThreadsPlan {
  const persona = readJson<{
    posting?: { time_slots?: string[]; slot_type_map?: Record<string, string[]> };
  }>(`${DIR}/persona.json`, {});
  const hyp = readJson<{
    hypotheses?: Array<{
      id: string;
      type: string;
      name: string;
      slug: string;
      topics?: string[];
      status?: string;
    }>;
  }>(`${DIR}/hypotheses.json`, {});
  const templates = readJson<Record<string, string[]>>(`${DIR}/thread_templates.json`, {});

  const slotMap = persona.posting?.slot_type_map ?? {};

  // slot（morning/night）ラベル×types
  const slots: Slot[] = Object.entries(slotMap).map(([key, types]) => ({
    time: SLOT_LABELS[key] ?? key,
    types: (types ?? []).map(typeLabel),
  }));

  // どの type がどの slot に出るか
  const typeToWhen = (t: string): string[] => {
    const out: string[] = [];
    for (const [key, types] of Object.entries(slotMap)) {
      if ((types ?? []).includes(t)) out.push(SLOT_LABELS[key] ?? key);
    }
    return out;
  };

  const hyps = hyp.hypotheses ?? [];
  const types: PlannedType[] = hyps
    .filter((h) => (h.status ?? "active") === "active")
    .map((h) => ({
      id: h.id,
      type: h.type,
      name: h.name,
      slug: h.slug,
      topics: h.topics ?? [],
      status: h.status ?? "active",
      when: typeToWhen(h.type),
      sample: templates[h.slug] ?? [],
    }));

  const available = types.length > 0 || slots.length > 0;
  return { available, slots, types };
}
