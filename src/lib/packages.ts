// 改善プログラムは3つの「はじめ方」（価格ティア）。
// 個別ページ /packages/[id] で内容・価格目安・中立の医療連携・HRを通す便益を提示。

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
};

export const packages: ExperiencePackage[] = [
  {
    id: "gift",
    name: "ギフト・お試し",
    theme: "第一印象の改善 / 1日完結",
    tagline: "第一印象を、1日で整える。贈り物にも。",
    steps: [
      "印象カウンセリング",
      "メイク（施術＋再現レッスン）",
      "服選び（スタイリスト同行）",
      "撮影（ビフォーアフター）",
    ],
    duration: "1日完結",
    price: "目安 ¥30,000〜",
    forWhom: "結婚式前・駆け込み・第一印象を変えたい方へ。ギフトにも。",
    highlights: ["医療行為なし", "1日完結", "窓口ひとつ", "ギフト可"],
  },
  {
    id: "standard",
    name: "スタンダード",
    theme: "血液検査・コンプレックス施術",
    tagline: "現在地を知り、悩みに合わせて根本から整える。",
    steps: [
      "血液検査（現在地の可視化）",
      "悩み別のコンプレックス施術（提携クリニック）",
      "スタイリング・ケアの型",
      "記録と伴走",
    ],
    duration: "1〜3ヶ月",
    price: "目安 ¥60,000〜",
    forWhom: "原因から、複数の悩みを整えたい方へ。",
    highlights: ["提携クリニックを中立に紹介", "紹介手数料ゼロ", "窓口ひとつ", "専属が伴走"],
  },
  {
    id: "highend",
    name: "ハイエンド",
    theme: "フルパッケージ / 年間伴走",
    tagline: "全領域を、一気通貫で。専属が、定着まで伴走する。",
    steps: [
      "現在地の総合可視化（血液検査ほか）",
      "領域横断のロードマップ設計",
      "提携クリニック・専門家を中立に束ねて実行",
      "Webアプリ＋専属で伴走",
      "定着、そしてつながり続ける",
    ],
    duration: "6ヶ月〜",
    price: "応相談・完全招待制",
    forWhom: "複数の悩みを、根本から・継続的に整えたい方へ。",
    highlights: ["完全招待制", "専属コンシェルジュ", "中立に束ねる", "完全匿名・守秘"],
    invitation: true,
  },
];
