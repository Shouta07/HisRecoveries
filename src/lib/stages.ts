// ライフステージ — 記事を横断するもう一本の軸。
//
// 既存の軸は2つあった：領域（髪・肌・顔…）と 目的（自信・選ばれたい…）。
// そこに「いま人生のどこにいるか」を足す。
//
// なぜこの軸が効くか：
//   男性が見た目を気にし始めるのは、年齢そのものではなく
//   「その年代で初めて突きつけられること」がきっかけになる。
//   20代は評価される場に出たとき、30代は昔と違うと気づいたとき。
//   悩みの名前（薄毛・ニキビ）より、この区切りのほうが自己同定が速い。
//
// 記事は書き足していない。既存55本を割り当て直しただけ。
// だから件数の偏り（20代・30代に集中）はそのまま出る。それでいい——
// どこが手薄かが見えるほうが、次に何を書くかが決まる。

import { clusters, type ClusterArticle } from "@/lib/clusters";

export type StageId = "foundation" | "social" | "mature" | "rebuild" | "legacy";

export type Stage = {
  id: StageId;
  /** 通し番号（年代順。順序に意味がある） */
  n: string;
  /** 表示名 */
  label: string;
  /** 年代の目安 */
  age: string;
  /** そのステージのテーマ */
  theme: string;
  /** 何を失う時期か（表層の悩みではなく、その下にあるもの） */
  loss: string;
  /** 読者への呼びかけ（自己同定のトリガー） */
  hook: string;
  /** アクセント色 */
  accent: string;
};

export const STAGES: Stage[] = [
  {
    id: "foundation",
    n: "01",
    label: "土台をつくる",
    age: "10代後半〜20代前半",
    theme: "自分を作る",
    loss: "まだ何も失っていない。何が自分に合うのか、輪郭がないだけ。",
    hook: "何から始めればいいか、分からない。",
    accent: "#7fa088",
  },
  {
    id: "social",
    n: "02",
    label: "評価される場に出る",
    age: "20代",
    theme: "社会と人に、見られる",
    loss: "初めて自分の市場価値を突きつけられ、「選ばれない自分」という像を持ってしまう。",
    hook: "写真、面接、初対面。見られる場面が、急に増えた。",
    accent: "#5c8a6a",
  },
  {
    id: "mature",
    n: "03",
    label: "方向を修正する",
    age: "30代",
    theme: "昔と、同じではない",
    loss: "人生で初めての「昔はこうじゃなかった」。髪、肌、体力、立場。",
    hook: "急にではなく、じわじわ変わってきた気がする。",
    accent: "#8A6A3B",
  },
  {
    id: "rebuild",
    n: "04",
    label: "組み直す",
    age: "40〜50代",
    theme: "第二の人生を作る",
    loss: "役割（肩書き・父・夫）を外したときに、何が残るか分からなくなる。",
    hook: "誰も、見た目のことを言ってくれなくなった。",
    accent: "#8a7a4a",
  },
  {
    id: "legacy",
    n: "05",
    label: "経験を渡す",
    age: "50代以降",
    theme: "経験を価値に変える",
    loss: "積み上げた経験が、誰にも渡っていないこと。",
    hook: "自分が通ってきた道を、下の世代に。",
    accent: "#8A6A3B",
  },
];

export function getStage(id: string): Stage | undefined {
  return STAGES.find((s) => s.id === id);
}

export function isStageId(v: string): v is StageId {
  return STAGES.some((s) => s.id === v);
}

/**
 * 記事 slug → ライフステージ の対応表。
 *
 * clusters.ts を55箇所書き換えずに済むよう、割り当てはここに集約する。
 * 記事を足したらここにも1行足す（未登録の記事は下の UNASSIGNED で拾える）。
 *
 * 割り当ての考え方：「その悩みが本人の前に現れる時期」で決める。
 * 記事の難易度ではなく、読者の年代で切る。
 */
export const STAGE_OF: Record<string, StageId> = {
  // ── 01 土台をつくる：何から始めるか・習慣・自己理解 ──
  "otoko-jibunmigaki-hajimekata": "foundation",
  "men-akanuke-junban": "foundation",
  "mens-makeup-hajimete": "foundation",
  "seiketsukan-tsukurikata": "foundation",
  "mens-skincare-junban": "foundation",
  "shukan-shikumi": "foundation",
  "mitame-jishin": "foundation",
  "jiko-toushi-doko-kara": "foundation",

  // ── 02 評価される場に出る：恋愛・就活・写真・身だしなみの実践 ──
  "shashin-utsuri": "social",
  "omiai-fukusou-men": "social",
  "matching-app-shashin": "social",
  "hatsu-date-fukusou": "social",
  "date-zenjitsu-mijitaku": "social",
  "machikon-gokon-midashinami": "social",
  "kanojo-dekinai-mitame": "social",
  "seiketsukan-shoutai-5": "social",
  "mensetsu-daiichiinsho": "social",
  "mens-hairstyle-seiketsukan": "social",
  "fuku-size-silhouette": "social",
  "mayu-totonoe": "social",
  "hyoujou-egao-tsukurikata": "social",
  "shisei-insho-neko-ze": "social",
  "rinkaku-betsu-kamigata": "social",
  "kusege-ikasu-kamigata": "social",
  "kokkaku-ni-awaseru": "social",
  "aohige-genin-taisho": "social",
  "sunege-udege-totonoe": "social",
  "taimou-koi-genin": "social",
  "totonoeru-herasu-erabu": "social",
  "datsumou-hiyou-kangae": "social",
  "otona-nikibi-genin": "social",
  "nikibiato-genin": "social",
  "otoko-kansou-inner-dry": "social",
  "hifuka-biyou-self-seiri": "social",
  "nioi-taishu-care-seiketsukan": "social",

  // ── 03 方向を修正する：30代の節目・薄毛・老け見え・体調 ──
  "30dai-seiketsukan": "mature",
  "kekkonshiki-mijitaku-men": "mature",
  "eigyou-business-daiichiinsho": "mature",
  "dousoukai-mitame-junbi": "mature",
  "fuke-mie-genin": "mature",
  "tsukare-gao-kuma": "mature",
  "kaerareru-yousso-junban": "mature",
  "mukumi-gao-asa": "mature",
  "aga-early-signs": "mature",
  "aga-self-check": "mature",
  "aga-online-nagare": "mature",
  "aga-kensa-wakaru": "mature",
  "aga-counseling-kakunin": "mature",
  "aga-hiyou-kangae": "mature",
  "sleep-totonoe": "mature",
  "tsukare-ketsueki-genchi": "mature",
  "kenkou-shindan-genchi": "mature",
  "tsukare-yasusa-toshi": "mature",

  // ── 04 組み直す：40代以降に現れるもの ──
  "shiraga-bokashi": "rebuild",
  "hourei-sen-kininaru": "rebuild",

  // ── 05 経験を渡す ──
  // まだ0本。取材（当事者インタビュー）で埋める領域。
};

/** そのステージの記事 */
export function clustersByStage(id: StageId): ClusterArticle[] {
  return clusters.filter((c) => STAGE_OF[c.slug] === id);
}

/** 各ステージの本数（0本もそのまま返す。空を隠さない） */
export function stageCounts(): Record<StageId, number> {
  const out = { foundation: 0, social: 0, mature: 0, rebuild: 0, legacy: 0 };
  for (const c of clusters) {
    const s = STAGE_OF[c.slug];
    if (s) out[s] += 1;
  }
  return out;
}

/** 割り当て漏れ（記事を足したときの検出用） */
export function unassignedSlugs(): string[] {
  return clusters.filter((c) => !STAGE_OF[c.slug]).map((c) => c.slug);
}
