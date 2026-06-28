// Voices attached to each complex's mechanism: 当事者(patient) / サロン / クリニック.
// Neutral, anonymous — no clinic names, no endorsement, no efficacy claims.
// Replace / extend with real interviews over time (順次公開).

export type VoiceRole = "当事者" | "サロン" | "クリニック";

export type Voice = {
  role: VoiceRole;
  span?: string;
  quote: string;
  who: string;
};

export const voicesByComplex: Record<string, Voice[]> = {
  hair: [
    {
      role: "当事者",
      span: "1年後",
      quote: "名刺を渡す角度を、いつのまにか変えていた。気づいたのは、変えなくてよくなってからでした。",
      who: "30代前半・法人営業",
    },
    {
      role: "クリニック",
      quote: "進行性なので、早い段階で選択肢を中立にお伝えすることを大切にしています。",
      who: "連携医療機関の医師（匿名）",
    },
    {
      role: "サロン",
      quote: "スタイリングと頭皮ケアで、日々の見え方は変えられます。医療とは役割を分けて伴走します。",
      who: "提携サロン（匿名）",
    },
  ],
  sweat: [
    {
      role: "当事者",
      span: "半年後",
      quote: "半年は、シャツの色を自分の好みで選び直せるまでの時間だった。",
      who: "20代後半",
    },
    {
      role: "クリニック",
      quote: "「量」と「菌」を分けて考えると、対処の道筋が見えやすくなります。",
      who: "連携医療機関の医師（匿名）",
    },
  ],
  skin: [
    {
      role: "当事者",
      span: "8ヶ月後",
      quote: "「炎症・乾燥・摩擦」を分けて理解できてから、頬を触る回数が目に見えて減った。",
      who: "20代後半・歯科衛生士",
    },
    {
      role: "クリニック",
      quote: "ニキビとマラセチアの見分けなど、原因を分けることが対処の分かれ目になります。",
      who: "連携医療機関の医師（匿名）",
    },
  ],
  face: [
    {
      role: "サロン",
      quote: "むくみ・表情・肌など、変えられる要素から一緒に整えます。骨格は無理に触りません。",
      who: "提携サロン（匿名）",
    },
  ],
  "body-hair": [
    {
      role: "サロン",
      quote: "整える・減らす・そのまま。正解は一つではないので、ご本人の好みから選びます。",
      who: "提携サロン（匿名）",
    },
  ],
  self: [
    {
      role: "当事者",
      quote: "気にしすぎは性格だと思っていた。仕組みの話だと知って、少し楽になった。",
      who: "20代・会社員",
    },
  ],
};
