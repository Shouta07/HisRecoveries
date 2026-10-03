// Threads 投稿プレビュー — 「どんな投稿がされる予定か」を事前に見るためのデータ層。
// apps/threads の設定（ペルソナのスケジュール、仮説＝テーマ、post_forms＝型と実例）を
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

/** 投稿の型（post_forms.json の forms）。A/B/C/D のどれで、どういう形か。 */
export type PlannedForm = {
  id: string;
  label: string;
  /** 属するカテゴリのラベル（A 共感・あるある など） */
  category: string;
  /** そのカテゴリが全体に占める割合 */
  ratio: number;
  /** リンクを置く型か */
  link: boolean;
  structure: string;
  rule: string;
  examples: string[];
};

export type PlannedType = {
  id: string;
  type: string;
  name: string;
  slug: string;
  topics: string[];
  status: string;
  /** 出る時間帯。恋亀はテーマを時間帯で縛らないので、常に全スロット。 */
  when: string[];
  /** 実例。型ごとに持つので、テーマ側は空（forms を見る）。 */
  sample: string[];
};

export type ThreadsPlan = {
  available: boolean;
  slots: Slot[];
  types: PlannedType[];
  forms: PlannedForm[];
};

// 内部タイプ名 → 場面ラベル。
// hypotheses.json の type（= slug）に対応する。
// 旧事業（gift/mother/urgent/areas/biz/b2b/fan = 読者4層＋事業仮説）のラベルを
// タシカメの5場面に置き換えた。
// 恋亀の13テーマ（apps/threads/accounts/mens-body-lab/hypotheses.json）。
// ここに無い id はそのまま出す。テーマを足したときに画面が落ちないように。
const TYPE_LABELS: Record<string, string> = {
  "before-line": "送る前のLINE",
  "slow-reply": "返信が遅い",
  "when-to-ask": "次に誘うタイミング",
  "after-first": "初デートのあと",
  "second-date": "2回目デート",
  "they-asked": "相手からの誘い",
  "warm-cold": "会うと優しいのにLINEが冷たい",
  "many-at-once": "複数人と進行中",
  "not-sure": "確信が持てない",
  "polite-no": "社交辞令",
  "before-ask": "告白の前",
  distance: "距離感",
  temperature: "相手の温度感",
};

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}


export function readThreadsPlan(): ThreadsPlan {
  const persona = readJson<{
    posting?: { time_slots?: string[] };
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
  const formsFile = readJson<{
    categories?: Array<{
      id: string;
      label: string;
      ratio: number;
      link?: boolean;
      forms?: string[];
    }>;
    forms?: Record<
      string,
      { label?: string; structure?: string; rule?: string; examples?: string[] }
    >;
  }>(`${DIR}/post_forms.json`, {});

  // 恋亀はテーマを時間帯で縛らない。縛ると、夜のテーマが朝に出せなくなって
  // 同じ話が続く（persona.posting.slot_type_map_note）。
  // だから slot は「いつ出るか」だけを出し、テーマとは掛けない。
  const times = persona.posting?.time_slots ?? [];
  const slots: Slot[] = times.map((t) => ({ time: t, types: [] }));
  const allWhen = times.length ? times : [];

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
      when: allWhen,
      sample: [],
    }));

  // 型。どのカテゴリに属するかを引けるようにしてから並べる。
  const categoryOf = new Map<string, { label: string; ratio: number; link: boolean }>();
  for (const c of formsFile.categories ?? []) {
    for (const fid of c.forms ?? []) {
      categoryOf.set(fid, {
        label: c.label,
        ratio: c.ratio,
        link: Boolean(c.link),
      });
    }
  }
  const forms: PlannedForm[] = Object.entries(formsFile.forms ?? {}).map(
    ([id, f]) => {
      const c = categoryOf.get(id);
      return {
        id,
        label: f.label ?? id,
        category: c?.label ?? "—",
        ratio: c?.ratio ?? 0,
        link: c?.link ?? false,
        structure: f.structure ?? "",
        rule: f.rule ?? "",
        examples: f.examples ?? [],
      };
    },
  );

  const available = types.length > 0 || forms.length > 0;
  return { available, slots, types, forms };
}
