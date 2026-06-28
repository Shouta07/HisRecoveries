// Transformation stories for the Interviews section: the same four-beat arc
// — Before → 気づいたこと → 取り組んだこと → 今 — so a reader thinks
// 「自分もいけるかも」. Anonymous, observational, no completed/efficacy claims.

export type Journey = {
  theme: string;
  span: string;
  before: string;
  noticed: string;
  did: string;
  now: string;
  who: string;
};

export const journeys: Journey[] = [
  {
    theme: "薄毛・AGA",
    span: "1年",
    before: "名刺を渡すたび、相手の視線が生え際に向いている気がしていた。",
    noticed: "進行性だと知り、「気にしない」より「知る」ほうが楽だと気づいた。",
    did: "選択肢を中立に並べ、自分のペースで頭皮ケアとスタイリングを続けた。",
    now: "名刺を渡す角度を、いつのまにか変えなくなっていた。",
    who: "30代前半・法人営業",
  },
  {
    theme: "ニキビ・肌",
    span: "8ヶ月",
    before: "マスクのせいだと後回しにして、一日中、頬を気にしていた。",
    noticed: "「炎症・乾燥・摩擦」を分けて理解できた。",
    did: "原因ごとにケアを変え、頬に触れる回数を減らしていった。",
    now: "鏡の前にいる時間が、目に見えて短くなった。",
    who: "20代後半・歯科衛生士",
  },
  {
    theme: "汗・におい",
    span: "半年",
    before: "夏のグレーを、何年も避けてきた。",
    noticed: "においは汗そのものより、菌の代謝の結果だと知った。",
    did: "「量」と「菌」を分けて対処し、必要な段階では医療にも相談した。",
    now: "シャツの色を、自分の好みで選び直せるようになってきた。",
    who: "20代後半",
  },
];
