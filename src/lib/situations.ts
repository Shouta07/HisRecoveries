// 状況から記事を探すための軸。
//
// 読者は「AGA」「スキンケア」という分野名で自分の状態を認識していない。
// 認識しているのは「結婚式に呼ばれた」「彼女がほしい」という状況のほう。
// 分野・年代に加えて、この軸を持つ。
//
// ブランド戦略の「人生のタイミングマップ」12項目を、記事に落としたもの。
// 記事を足したら、該当する状況にも slug を足す（重複してよい）。

export type SituationId =
  | "deai"
  | "kekkonshiki"
  | "shashin"
  | "konkatsu"
  | "mensetsu"
  | "fuke"
  | "kami"
  | "tsukare"
  | "hajimete";

export type Situation = {
  id: SituationId;
  /** 読者が自分の口で言いそうな言い方にする */
  label: string;
  slugs: string[];
};

export const SITUATIONS: Situation[] = [
  {
    id: "deai",
    label: "彼女がほしい",
    slugs: [
      "kanojo-dekinai-mitame",
      "seiketsukan-shoutai-5",
      "matching-app-shashin",
      "hatsu-date-fukusou",
      "date-zenjitsu-mijitaku",
      "machikon-gokon-midashinami",
      "fuku-size-silhouette",
      "nioi-taishu-care-seiketsukan",
    ],
  },
  {
    id: "kekkonshiki",
    label: "結婚式に呼ばれた",
    slugs: [
      "kekkonshiki-mijitaku-men",
      "dousoukai-mitame-junbi",
      "mens-hairstyle-seiketsukan",
      "mayu-totonoe",
      "fuku-size-silhouette",
      "shashin-utsuri",
    ],
  },
  {
    id: "shashin",
    label: "写真を撮る・撮られる",
    slugs: [
      "shashin-utsuri",
      "matching-app-shashin",
      "omiai-fukusou-men",
      "hyoujou-egao-tsukurikata",
      "shisei-insho-neko-ze",
    ],
  },
  {
    id: "konkatsu",
    label: "婚活をはじめる",
    slugs: [
      "omiai-fukusou-men",
      "matching-app-shashin",
      "30dai-seiketsukan",
      "seiketsukan-tsukurikata",
      "mens-makeup-hajimete",
    ],
  },
  {
    id: "mensetsu",
    label: "面接・転職がある",
    slugs: [
      "mensetsu-daiichiinsho",
      "eigyou-business-daiichiinsho",
      "hyoujou-egao-tsukurikata",
      "shisei-insho-neko-ze",
      "mens-hairstyle-seiketsukan",
    ],
  },
  {
    id: "fuke",
    label: "老けたと言われた",
    slugs: [
      "fuke-mie-genin",
      "tsukare-gao-kuma",
      "kaerareru-yousso-junban",
      "hourei-sen-kininaru",
      "shiraga-bokashi",
      "mukumi-gao-asa",
      "30dai-seiketsukan",
    ],
  },
  {
    id: "kami",
    label: "髪が気になってきた",
    slugs: [
      "aga-early-signs",
      "aga-self-check",
      "aga-kensa-wakaru",
      "aga-counseling-kakunin",
      "aga-hiyou-kangae",
      "aga-online-nagare",
      "rinkaku-betsu-kamigata",
      "kusege-ikasu-kamigata",
    ],
  },
  {
    id: "tsukare",
    label: "疲れが取れない",
    slugs: [
      "sleep-totonoe",
      "tsukare-yasusa-toshi",
      "tsukare-ketsueki-genchi",
      "kenkou-shindan-genchi",
      "shukan-shikumi",
      "mukumi-gao-asa",
    ],
  },
  {
    id: "hajimete",
    label: "何から始めるか分からない",
    slugs: [
      "otoko-jibunmigaki-hajimekata",
      "men-akanuke-junban",
      "seiketsukan-tsukurikata",
      "mens-skincare-junban",
      "mens-makeup-hajimete",
      "jiko-toushi-doko-kara",
      "mitame-jishin",
    ],
  },
];

const INDEX: Record<string, SituationId[]> = (() => {
  const m: Record<string, SituationId[]> = {};
  for (const s of SITUATIONS) {
    for (const slug of s.slugs) (m[slug] ??= []).push(s.id);
  }
  return m;
})();

export function situationsOf(slug: string): SituationId[] {
  return INDEX[slug] ?? [];
}
