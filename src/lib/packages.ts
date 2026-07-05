// 改善プログラムは「第一印象改善パッケージ」1本に特化。
// 個別ページ /packages/[id] で内容・価格目安・中立の医療連携・付加価値を提示。
// （standard / highend は docs/_archive にアーカイブ）

export type ExperiencePackage = {
  id: string;
  name: string;
  /** short theme / subtitle */
  theme: string;
  tagline: string;
  /** 含まれるもの（順序） */
  steps: string[];
  duration: string;
  /** 価格目安 */
  price: string;
  forWhom: string;
  /** バッジ等のハイライト */
  highlights?: string[];
  /** 招待制フラグ（現在未使用。招待制ティアを再導入する場合のみ使用） */
  invitation?: boolean;
  /** このはじめ方“ならでは”の付加価値 */
  value: { t: string; d: string }[];
};

export const packages: ExperiencePackage[] = [
  {
    id: "first-impression",
    name: "第一印象改善パッケージ",
    theme: "メイク・服選び・撮影 / 1日完結",
    tagline: "プロと過ごす一日で、第一印象を整える。メイクも、服も、写真も。贈り物にも。",
    steps: [
      "印象カウンセリング（似合うを言葉に）",
      "完全初心者向けメイク（施術＋自分で再現できるレッスン）",
      "服選び（プロが選ぶ一着）",
      "写真撮影（ビフォーアフター）",
    ],
    duration: "1日完結",
    price: "目安 ¥30,000〜",
    forWhom: "第一印象を変えたい方へ。メイクがはじめてでも。大事な日の前にも、ギフトにも。",
    highlights: ["1日完結", "初心者歓迎", "完全匿名", "ギフト可"],
    value: [
      { t: "一日で、印象が変わる", d: "メイク・服・写真を、迷わず一気に。重い決断なしで、まず一歩。" },
      { t: "はじめてでも、大丈夫", d: "完全初心者向け。プロがやって終わりにせず、自分で再現できるところまで。" },
      { t: "人に知られない", d: "完全匿名で。恥ずかしい説明を、何度もしなくていい。" },
      { t: "贈れる", d: "自分では動かない人へ、第三者からギフトとして届けられる。" },
    ],
  },
];
