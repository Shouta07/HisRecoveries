// ロードマップ — 記事を「読むもの」から「プロジェクトの1ステップ」に変える土台。
//
// ■ ここが唯一の真実である理由
// 「Step 3 / 全7ステップ」は記事の属性ではない。1本の記事は複数の目的に属し、
// 目的が変われば順番も変わる（眉の記事は 婚活で2番目・仕事で3番目・結婚式で4番目）。
// 記事側に step を持たせた瞬間、他の目的から来た人には嘘になる。
// だから順番は目的側（ここ）に置き、記事は表示時に文脈から解決する。
//
// ■ impact（★）を順番から自動導出しない理由
// 「土台だから★5」は多くの場合正しいが、常に正しくはない。
// 服のサイズは婚活では終盤でも効きが大きい。効きと順番は別の軸なので、
// 編集判断として明示的に持つ。
//
// ■ task を必ず1つだけにする理由
// 記事末尾で複数の選択肢を出すと、選ぶところで止まる。
// ここは網羅性ではなく実行率を取る場所なので、1つに絞る。
//
// ■ 作る順序
// 全目的を一度に作る必要はない。締切が強く単価も高い bigday / work の
// 2目的から始める。存在しない目的は「ロードマップ未整備」として扱い、
// 記事側は従来どおりの表示にフォールバックする。

import type { OccasionId } from "@/lib/occasions";

export type RoadmapStep = {
  /** 記事の slug（clusters.ts） */
  slug: string;
  /** この目的における効き。★の本数（編集判断） */
  impact: 1 | 2 | 3 | 4 | 5;
  /** 読んだあとに、やること。1つだけ・その日のうちにできる粒度で */
  task: string;
  /** タスクの所要（分） */
  taskMinutes: number;
};

export type Roadmap = {
  id: OccasionId;
  /** 表示名。「結婚式ロードマップ」のように、目的の言葉で */
  label: string;
  steps: RoadmapStep[];
};

export const roadmaps: Roadmap[] = [
  {
    id: "bigday",
    label: "大切な日のロードマップ",
    steps: [
      {
        slug: "mens-skincare-junban",
        impact: 5,
        task: "いま使っているものを並べ、洗顔と保湿だけ残して他は一旦外す。",
        taskMinutes: 10,
      },
      {
        slug: "seiketsukan-tsukurikata",
        impact: 5,
        task: "5要素（髪・眉・肌・服・匂い）のうち、自分で一番弱いと思うものに印をつける。",
        taskMinutes: 5,
      },
      {
        slug: "mayu-totonoe",
        impact: 4,
        task: "鏡で眉頭の位置だけ確認し、正面から写真を1枚撮っておく。",
        taskMinutes: 5,
      },
      {
        slug: "shashin-utsuri",
        impact: 4,
        task: "手持ちの写真を1枚選び、顔の角度と光の向きだけ見直す。",
        taskMinutes: 10,
      },
      {
        slug: "mens-makeup-hajimete",
        impact: 3,
        task: "当日やるかどうかだけ決める。やらない、も正解。",
        taskMinutes: 5,
      },
      {
        slug: "kekkonshiki-mijitaku-men",
        impact: 4,
        task: "当日着るものを一度すべて着てみて、サイズが合っているか確認する。",
        taskMinutes: 20,
      },
      {
        slug: "omiai-fukusou-men",
        impact: 3,
        task: "撮影用の服を1着だけ決め、当日まで触らない。",
        taskMinutes: 15,
      },
    ],
  },
  {
    id: "work",
    label: "仕事の第一印象ロードマップ",
    steps: [
      {
        slug: "eigyou-business-daiichiinsho",
        impact: 5,
        task: "直近の商談・登壇で、自分の何が見られていたかを1つ書き出す。",
        taskMinutes: 5,
      },
      {
        slug: "shisei-insho-neko-ze",
        impact: 5,
        task: "座っているときの肩の位置を、今この場で1回だけ直す。",
        taskMinutes: 2,
      },
      {
        slug: "tsukare-gao-kuma",
        impact: 4,
        task: "今週いちばん疲れて見えた日を思い出し、前夜の睡眠時間をメモする。",
        taskMinutes: 5,
      },
      {
        slug: "mens-hairstyle-seiketsukan",
        impact: 4,
        task: "次のカットの日を、いま予定に入れる（内容は決めなくていい）。",
        taskMinutes: 3,
      },
      {
        slug: "fuku-size-silhouette",
        impact: 4,
        task: "よく着るジャケット1着の肩幅が合っているか、鏡で確認する。",
        taskMinutes: 10,
      },
      {
        slug: "hyoujou-egao-tsukurikata",
        impact: 3,
        task: "真顔のときの口角を、鏡で1回だけ確認する。",
        taskMinutes: 3,
      },
      {
        slug: "nioi-taishu-care-seiketsukan",
        impact: 3,
        task: "今日着たシャツの襟元の匂いを、脱いだときに確認する。",
        taskMinutes: 2,
      },
      {
        slug: "mensetsu-daiichiinsho",
        impact: 3,
        task: "人前に立つ直近の予定を1つ決め、日付を書き留める。",
        taskMinutes: 3,
      },
    ],
  },
];

const byId = new Map(roadmaps.map((r) => [r.id, r]));

export function roadmapById(id: string | null | undefined): Roadmap | undefined {
  if (!id) return undefined;
  return byId.get(id as OccasionId);
}

export type StepPosition = {
  roadmap: Roadmap;
  step: RoadmapStep;
  /** 1始まり */
  index: number;
  total: number;
  /** 次のステップ（最大2件） */
  next: RoadmapStep[];
};

/** 目的 × 記事 から、ロードマップ上の位置を解決する。 */
export function positionOf(goalId: string | null | undefined, slug: string): StepPosition | undefined {
  const roadmap = roadmapById(goalId);
  if (!roadmap) return undefined;
  const i = roadmap.steps.findIndex((s) => s.slug === slug);
  if (i < 0) return undefined;
  return {
    roadmap,
    step: roadmap.steps[i],
    index: i + 1,
    total: roadmap.steps.length,
    next: roadmap.steps.slice(i + 1, i + 3),
  };
}

/**
 * 目的が分からないときの既定値。
 * その記事を含むロードマップのうち、impact がいちばん高いものを既定にする
 * （その記事が最も効く目的＝その人がいる可能性がいちばん高い文脈）。
 */
export function defaultGoalFor(slug: string): OccasionId | undefined {
  let best: { id: OccasionId; impact: number } | undefined;
  for (const r of roadmaps) {
    const s = r.steps.find((x) => x.slug === slug);
    if (!s) continue;
    if (!best || s.impact > best.impact) best = { id: r.id, impact: s.impact };
  }
  return best?.id;
}

/** その記事が載っているロードマップ（目的を選び直すUI用）。 */
export function roadmapsContaining(slug: string): Roadmap[] {
  return roadmaps.filter((r) => r.steps.some((s) => s.slug === slug));
}
