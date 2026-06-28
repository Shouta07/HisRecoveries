// Recovery Stories — 変わった人の記録. A tight three-beat arc:
// Before → 取り組み → After. Punchy, anonymous, observational
// (no completed/efficacy claims, no clinic names). Grow this list over time.

export type Journey = {
  theme: string;
  span: string;
  before: string;
  did: string;
  after: string;
  who: string;
};

export const journeys: Journey[] = [
  {
    theme: "薄毛・AGA",
    span: "1年",
    before: "帽子が、手放せなかった。",
    did: "医療とスタイリングを、中立に選んだ。",
    after: "写真を、避けなくなった。",
    who: "30代前半・法人営業",
  },
  {
    theme: "ニキビ・肌",
    span: "8ヶ月",
    before: "マスクの下で、一日中、頬を気にしていた。",
    did: "「炎症・乾燥・摩擦」を分けてケアした。",
    after: "鏡の前にいる時間が、短くなった。",
    who: "20代後半・歯科衛生士",
  },
  {
    theme: "汗・におい",
    span: "半年",
    before: "夏のグレーを、何年も避けてきた。",
    did: "「量」と「菌」を分け、必要な段階で医療にも相談した。",
    after: "シャツの色を、好みで選べるようになってきた。",
    who: "20代後半",
  },
];
