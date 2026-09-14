import { clusters } from "./clusters";
import { STAGES, type StageId } from "./journey";
import type { AgeGroup } from "./journey";

// Knowledge — Journey の上に置く「読むもの」の共通の器。
//
// ── なぜ記事と別の型にするか ─────────────────────
// v2 が扱うのは記事だけではない。実際の男性の経験、女性の経験、専門家、
// 調査データ、外部の良質な記事——性質が違うものを同じ棚に並べる必要がある。
// 「記事」の型のままだと、経験談とデータの区別が付かなくなる。
//
// ── 経験と根拠を混ぜない ────────────────────────
// EXPERIENCE（一人の経験）を EVIDENCE（調査・研究）と同じ見た目で出すと、
// 一人の話が全員の正解に見える。type を必ず持たせ、画面で書き分ける。
//
// ── 外部のものを無断で載せない ───────────────────
// source と sourceUrl が無い外部由来のものは、ビルドで止める。
// 短い引用・編集コメント・出典・元リンク、の形しか許さない。

export type KnowledgeType =
  | "EXPERIENCE" // 一人の経験。正解ではない
  | "DATA" // 集計された数字
  | "EXPERT" // 専門家の見解
  | "RESEARCH" // 調査・研究
  | "GUIDE" // 手順・考え方
  | "EDITORIAL"; // 編集部の整理

export type Perspective = "male" | "female" | "expert" | "data" | "editorial";

export type Knowledge = {
  id: string;
  title: string;
  /** 一覧に出す1〜2文 */
  summary: string;
  stage: StageId;
  type: KnowledgeType;
  perspective: Perspective;
  /** 年代。特定の年代の話でなければ null */
  age: AgeGroup | null;
  /** 内部の記事なら、その導線。外部なら null */
  href: string | null;
  /** 外部由来のときだけ。どちらも無いものは公開しない */
  source?: { name: string; url: string };
  /** いつ時点の情報か */
  asOf?: string;
  /** 編集部の一言。転載ではないことの実体 */
  editorNote?: string;
};

/**
 * 既存記事55本を Knowledge に変換する。
 *
 * 実測では、55本すべてが「自分を整える」の話だった。
 * 他の7段階に主題の記事は1本も無い。
 * ここで無理に振り分けると、空の棚が埋まっているように見えてしまう。
 * だから全部 prepare に置く。空いている棚は、空いていると出す。
 */
export function fromArticles(): Knowledge[] {
  return clusters.map((a) => ({
    id: `article:${a.slug}`,
    title: a.title,
    summary: a.summary[0] ?? a.lead,
    stage: "prepare" as StageId,
    type: "GUIDE" as KnowledgeType,
    perspective: "editorial" as Perspective,
    age: null,
    href: `/areas/${a.areaId}/${a.slug}`,
  }));
}

/**
 * 記事以外の Knowledge。
 * 経験・専門家・調査は、取材が入るまで0件。
 * 0件を0件として持つ。それらしい中身を置かない。
 */
export const CURATED: Knowledge[] = [];

export function all(): Knowledge[] {
  return [...fromArticles(), ...CURATED];
}

/** 段階ごとの在庫数。空の段階を画面で正直に出すために使う */
export function countByStage(): Record<StageId, number> {
  const out = {} as Record<StageId, number>;
  for (const s of STAGES) out[s.id] = 0;
  for (const k of all()) out[k.stage] = (out[k.stage] ?? 0) + 1;
  return out;
}

export function byStage(id: StageId): Knowledge[] {
  return all().filter((k) => k.stage === id);
}

export const PERSPECTIVE_LABEL: Record<Perspective, string> = {
  male: "男性の経験",
  female: "女性の経験",
  expert: "専門家",
  data: "データ・研究",
  editorial: "編集部",
};

export const TYPE_LABEL: Record<KnowledgeType, string> = {
  EXPERIENCE: "経験",
  DATA: "データ",
  EXPERT: "専門家",
  RESEARCH: "調査",
  GUIDE: "考え方",
  EDITORIAL: "編集部",
};

// ── 公開の前に止めること ───────────────────────────
for (const k of CURATED) {
  // 外部由来なら、出典とリンクが要る。無断転載をしないための線。
  const external = k.href === null;
  if (external && (!k.source?.name || !k.source?.url)) {
    throw new Error(`Knowledge「${k.id}」: 外部由来なのに出典がありません`);
  }
  // 一人の経験に、全員の正解のような書き方をさせない。
  if (k.type === "EXPERIENCE" && !/一人|その人|この方|個人/.test(k.summary + (k.editorNote ?? ""))) {
    throw new Error(
      `Knowledge「${k.id}」: 経験には「一人の話である」ことが分かる書き方が要ります`,
    );
  }
  // データには、いつ時点かが要る。日付の無い数字は使えない。
  if ((k.type === "DATA" || k.type === "RESEARCH") && !k.asOf) {
    throw new Error(`Knowledge「${k.id}」: 調査・データには時点（asOf）が要ります`);
  }
}
