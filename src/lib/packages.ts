// 体験パッケージ — experiences bundled into journeys (not à la carte points).
// Each package: 現在地を知る診断 → 複数の体験 → 定着/ふりかえり、を1本の線に。

export type ExperiencePackage = {
  id: string;
  name: string;
  /** short theme label */
  theme: string;
  tagline: string;
  /** the journey, in order */
  steps: string[];
  duration: string;
  /** price label (guide or 選考後) */
  price: string;
  forWhom: string;
  /** flagship gets the large card */
  flagship?: boolean;
  /** short selling points for the featured card */
  highlights?: string[];
  /** 現在受付中か（false/未設定は「準備中・今後ご案内」） */
  available?: boolean;
  /** 完全招待制（ハイエンド）。available より優先して扱う */
  invitation?: boolean;
};

export const packages: ExperiencePackage[] = [
  {
    id: "journey",
    name: "リカバリー・ジャーニー",
    theme: "旗艦 / 総合",
    tagline: "総合診断から、悩み別の体験、専属の伴走、そして卒業まで。",
    steps: ["総合診断（現在地）", "悩み別の体験を組み合わせ", "専属担当の伴走", "定着・卒業"],
    duration: "6ヶ月",
    price: "完全招待制（選考後にご提示）",
    forWhom: "複数の悩みを、根本から整えたい方へ。",
    flagship: true,
  },
  {
    id: "membership",
    name: "Recovery 会員（年間伴走）",
    theme: "ハイエンド / 年間伴走",
    tagline: "コンプレックス全体から自信まで。専属が、定着まで一気通貫で伴走する。",
    steps: [
      "現在地の可視化（任意で血液診断）",
      "領域横断のロードマップ設計",
      "中立に専門家を束ねて実行",
      "Webアプリで記録・定期面談",
      "定着、そしてつながり続ける",
    ],
    duration: "6ヶ月〜",
    price: "完全招待制（選考後にご提示）",
    forWhom: "複数の悩みを、根本から・継続的に整えたい方へ。",
    highlights: ["専属コンシェルジュ", "中立に束ねる", "完全匿名・守秘", "限定枠・優先予約"],
    invitation: true,
  },
  {
    id: "first-impression",
    name: "第一印象パッケージ",
    theme: "顔・自意識 / 1日完結",
    tagline: "カウンセリング＋メイク＋服選びを、1日で。印象を、再現できる型に。",
    steps: ["印象カウンセリング", "メイク", "服選び（手持ち＋提案）", "撮影（ビフォーアフター）"],
    duration: "1日完結",
    price: "予算に合わせて組み合わせ（目安 ¥38,000〜）",
    forWhom: "結婚式前・駆け込み・第一印象を変えたい方へ。ギフトにも。",
    highlights: ["1日完結", "予約・決済は窓口ひとつ", "予算に合わせて組み合わせ", "ギフト・結婚式前にも"],
    available: true,
  },
  {
    id: "cleanliness",
    name: "清潔感パッケージ",
    theme: "汗・におい・肌",
    tagline: "気になっていた距離を、もう計算しない。",
    steps: ["汗・においの見立て", "サウナ×コンディショニング", "スキンケアの型", "定着チェック"],
    duration: "1ヶ月",
    price: "¥34,000〜",
    forWhom: "汗ジミ・におい・テカリが気になる方へ。",
  },
  {
    id: "hair",
    name: "ヘアパッケージ",
    theme: "薄毛・AGA",
    tagline: "気づいた時間を、選択肢に変える。",
    steps: ["頭皮の診断（医療連携・中立）", "スタイリング＋撮影", "定点観察"],
    duration: "2〜3ヶ月",
    price: "相談でご提示",
    forWhom: "生え際・つむじが気になり始めた方へ。",
  },
  {
    id: "future",
    name: "未来の自分パッケージ",
    theme: "予防 / 将来",
    tagline: "今の悩みの先、将来の自分に投資する。",
    steps: ["血液診断（現在地）", "睡眠・代謝の体験", "予防習慣（運動・自然）", "再診断でふりかえり"],
    duration: "3ヶ月",
    price: "相談でご提示",
    forWhom: "今だけでなく、これからを整えたい方へ。",
  },
  {
    id: "animals",
    name: "動物と過ごすパッケージ",
    theme: "つながり / 予防",
    tagline: "犬や猫と過ごす時間で、静かに整える。",
    steps: ["現在地の確認", "犬と歩く・猫と過ごす体験", "暮らしの中で続ける", "ふりかえり"],
    duration: "継続 / 月1〜",
    price: "相談でご提示",
    forWhom: "孤立感や将来の不安を、やわらげたい方へ。",
  },
];

export function flagshipPackage() {
  return packages.find((p) => p.flagship) ?? packages[0];
}

export function themePackages() {
  return packages.filter((p) => !p.flagship);
}
