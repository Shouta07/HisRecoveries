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
    id: "first-impression",
    name: "第一印象パッケージ",
    theme: "顔・自意識",
    tagline: "印象を、再現できる型に。",
    steps: ["肌・印象の診断", "メイク＋服選び＋撮影", "1ヶ月後の再撮影"],
    duration: "1ヶ月",
    price: "¥38,000〜",
    forWhom: "写真・人前が苦手／老け見えが気になる方へ。",
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
