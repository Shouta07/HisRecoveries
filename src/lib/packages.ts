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
  /** 完全招待制（ハイエンド） */
  invitation?: boolean;
  /** このはじめ方“ならでは”の付加価値 */
  value: { t: string; d: string }[];
};

export const packages: ExperiencePackage[] = [
  {
    id: "first-impression",
    name: "第一印象改善パッケージ",
    theme: "髪・服・肌・写真 / 1日完結",
    tagline: "プロと過ごす一日で、第一印象をまるごと整える。贈り物にも。",
    steps: [
      "印象カウンセリング（似合うを言葉に）",
      "スタイリング（似合う髪へ）",
      "服選び（プロが選ぶ一着）",
      "提携クリニック施術（必要に応じて中立にご紹介）",
      "撮影（ビフォーアフター）",
    ],
    duration: "1日完結",
    price: "目安 ¥30,000〜",
    forWhom: "第一印象を変えたい方へ。大事な日の前にも、ギフトにも。",
    highlights: ["1日完結", "窓口ひとつ", "完全匿名", "ギフト可"],
    value: [
      { t: "一日で、印象が変わる", d: "髪・服・肌・写真を、迷わず一気に。重い決断なしで、まず一歩。" },
      { t: "人に知られない", d: "完全匿名で。恥ずかしい説明を、何度もしなくていい。" },
      { t: "プロが選ぶから、外さない", d: "似合う髪・服・見せ方を、プロの目で。自己流の遠回りをしない。" },
      { t: "贈れる", d: "自分では動かない人へ、第三者からギフトとして届けられる。" },
    ],
  },
];
