// Recovery Check — 30 問の自己観察セット。
// MVP では編集者が手動で 24h 以内にレポートを返す前提のため、
// 「診断」はしない。状態整理のための観察フレームのみ。

export type CheckOption = {
  value: string;
  label: string;
};

export type CheckQuestion =
  | {
      id: string;
      kind: "single";
      section: string;
      prompt: string;
      hint?: string;
      options: CheckOption[];
      required?: boolean;
    }
  | {
      id: string;
      kind: "multi";
      section: string;
      prompt: string;
      hint?: string;
      options: CheckOption[];
      required?: boolean;
    }
  | {
      id: string;
      kind: "scale";
      section: string;
      prompt: string;
      hint?: string;
      min: number;
      max: number;
      labels?: { left: string; right: string };
      required?: boolean;
    }
  | {
      id: string;
      kind: "text";
      section: string;
      prompt: string;
      hint?: string;
      maxLength?: number;
      required?: boolean;
    };

export const CHECK_SECTIONS = [
  { id: "state", label: "I. 状態", description: "いまの自分の温度を、観察するための問い。" },
  { id: "impact", label: "II. 影響", description: "悩みが、日常のどこに触れているか。" },
  { id: "history", label: "III. これまで", description: "通過してきたこと・試してきたこと。" },
  { id: "future", label: "IV. これから", description: "半年先の輪郭を、ゆっくり置いてみる。" },
] as const;

export const CHECK_QUESTIONS: CheckQuestion[] = [
  // ── I. 状態（10）
  {
    id: "concerns",
    kind: "multi",
    section: "state",
    prompt: "いま、観察したい領域を選んでください（複数可）",
    options: [
      { value: "hair", label: "髪" },
      { value: "skin", label: "肌・ニキビ" },
      { value: "sweat", label: "汗" },
      { value: "odor", label: "におい" },
      { value: "beard", label: "ヒゲ・体毛" },
      { value: "face", label: "顔の印象" },
      { value: "sleep", label: "睡眠" },
      { value: "body", label: "体型・姿勢" },
      { value: "confidence", label: "自信・自意識" },
      { value: "other", label: "その他" },
    ],
    required: true,
  },
  {
    id: "duration",
    kind: "single",
    section: "state",
    prompt: "この領域を意識し始めてから、どれくらい経ちますか",
    options: [
      { value: "lt1", label: "1 年未満" },
      { value: "1to3", label: "1〜3 年" },
      { value: "3to7", label: "3〜7 年" },
      { value: "7to15", label: "7〜15 年" },
      { value: "gt15", label: "15 年以上" },
    ],
    required: true,
  },
  {
    id: "mirror_time",
    kind: "single",
    section: "state",
    prompt: "朝、鏡の前に立つ時間は",
    options: [
      { value: "short", label: "短い・必要分だけ" },
      { value: "normal", label: "普通" },
      { value: "long", label: "長く確認してしまう" },
      { value: "avoid", label: "見るのを避けている" },
    ],
    required: true,
  },
  {
    id: "sleep_hours",
    kind: "single",
    section: "state",
    prompt: "平均的な睡眠時間",
    options: [
      { value: "lt5", label: "5 時間未満" },
      { value: "5to6", label: "5〜6 時間" },
      { value: "6to7", label: "6〜7 時間" },
      { value: "7to8", label: "7〜8 時間" },
      { value: "gt8", label: "8 時間以上" },
    ],
    required: true,
  },
  {
    id: "sleep_quality",
    kind: "single",
    section: "state",
    prompt: "寝つき・眠りの質は",
    options: [
      { value: "good", label: "良い" },
      { value: "ok", label: "普通" },
      { value: "poor", label: "悪い" },
      { value: "varies", label: "波がある" },
    ],
    required: true,
  },
  {
    id: "stress",
    kind: "scale",
    section: "state",
    prompt: "ストレスの自覚（直近 1 ヶ月）",
    min: 1,
    max: 5,
    labels: { left: "ほぼない", right: "強い" },
    required: true,
  },
  {
    id: "weight_change",
    kind: "single",
    section: "state",
    prompt: "直近半年での体重の変化",
    options: [
      { value: "down", label: "減った" },
      { value: "same", label: "変わらない" },
      { value: "up", label: "増えた" },
      { value: "unknown", label: "把握していない" },
    ],
  },
  {
    id: "vitality",
    kind: "single",
    section: "state",
    prompt: "体力・気力の変化（直近半年）",
    options: [
      { value: "up", label: "上がった" },
      { value: "same", label: "横ばい" },
      { value: "down", label: "下がった" },
      { value: "unknown", label: "把握していない" },
    ],
  },
  {
    id: "skin_cycles",
    kind: "single",
    section: "state",
    prompt: "肌・身体の調子は、時期や季節で変わりますか",
    options: [
      { value: "yes", label: "はっきり変わる" },
      { value: "some", label: "少し変わる" },
      { value: "no", label: "ほとんど変わらない" },
      { value: "unknown", label: "把握していない" },
    ],
  },
  {
    id: "feels_aligned",
    kind: "text",
    section: "state",
    prompt: "「整っている」と感じる瞬間が、もしあれば書いてください",
    hint: "短文で構いません。たとえば「湯上がりに本を読んでいるとき」のように",
    maxLength: 400,
  },

  // ── II. 影響（8）
  {
    id: "work_impact",
    kind: "single",
    section: "impact",
    prompt: "仕事・商談の場で、悩みが気になる瞬間がある",
    options: [
      { value: "often", label: "よくある" },
      { value: "sometimes", label: "ときどき" },
      { value: "rare", label: "稀にある" },
      { value: "never", label: "ない" },
    ],
    required: true,
  },
  {
    id: "relationship_impact",
    kind: "single",
    section: "impact",
    prompt: "恋愛・婚活・親しい関係の場で、悩みが気になる瞬間がある",
    options: [
      { value: "often", label: "よくある" },
      { value: "sometimes", label: "ときどき" },
      { value: "rare", label: "稀にある" },
      { value: "never", label: "ない" },
    ],
    required: true,
  },
  {
    id: "photo_resistance",
    kind: "scale",
    section: "impact",
    prompt: "写真に写ることへの抵抗",
    min: 1,
    max: 5,
    labels: { left: "ない", right: "強い" },
    required: true,
  },
  {
    id: "group_resistance",
    kind: "scale",
    section: "impact",
    prompt: "集合場面（食事・温泉・スポーツ）への抵抗",
    min: 1,
    max: 5,
    labels: { left: "ない", right: "強い" },
    required: true,
  },
  {
    id: "clothing_constraint",
    kind: "single",
    section: "impact",
    prompt: "服選びに制約を感じていますか",
    options: [
      { value: "always", label: "常にある" },
      { value: "summer", label: "夏だけある" },
      { value: "rare", label: "稀にある" },
      { value: "none", label: "ない" },
    ],
  },
  {
    id: "distance_taking",
    kind: "single",
    section: "impact",
    prompt: "悩みのために、人との距離を取ってきた数年がある",
    options: [
      { value: "yes_long", label: "長くあった" },
      { value: "yes_brief", label: "短い時期があった" },
      { value: "uncertain", label: "わからない" },
      { value: "no", label: "ない" },
    ],
  },
  {
    id: "talked_to",
    kind: "multi",
    section: "impact",
    prompt: "この悩みについて、これまでに話した相手は",
    options: [
      { value: "family", label: "家族" },
      { value: "partner", label: "恋人・配偶者" },
      { value: "friend", label: "友人" },
      { value: "doctor", label: "医師・専門家" },
      { value: "internet", label: "ネット上の匿名" },
      { value: "nobody", label: "誰にも話していない" },
    ],
  },
  {
    id: "trigger_moment",
    kind: "text",
    section: "impact",
    prompt: "悩みを強く感じた、最近のひとつの場面を書いてください",
    hint: "情景でも、出来事でも、一行でも構いません",
    maxLength: 600,
  },

  // ── III. これまで（7）
  {
    id: "clinic_history",
    kind: "multi",
    section: "history",
    prompt: "受診したことのある医療機関",
    options: [
      { value: "derm", label: "一般皮膚科" },
      { value: "aesthetic", label: "美容皮膚科" },
      { value: "aga", label: "AGA クリニック" },
      { value: "sweat", label: "多汗症・ワキガクリニック" },
      { value: "psych", label: "心療内科・精神科" },
      { value: "sleep", label: "睡眠外来" },
      { value: "none", label: "なし" },
    ],
    required: true,
  },
  {
    id: "interventions",
    kind: "multi",
    section: "history",
    prompt: "これまで受けた処置（複数可）",
    options: [
      { value: "topical", label: "外用薬" },
      { value: "oral", label: "内服薬" },
      { value: "botox", label: "ボトックス" },
      { value: "laser", label: "レーザー" },
      { value: "peel", label: "ピーリング・ダーマペン" },
      { value: "surgery", label: "手術" },
      { value: "none", label: "なし" },
    ],
  },
  {
    id: "intervention_outcome",
    kind: "single",
    section: "history",
    prompt: "これまでの処置への満足度（受けたことがある場合）",
    options: [
      { value: "satisfied", label: "概ね満足" },
      { value: "partial", label: "部分的に満足" },
      { value: "unsatisfied", label: "満足していない" },
      { value: "na", label: "受けたことがない" },
    ],
  },
  {
    id: "self_care",
    kind: "text",
    section: "history",
    prompt: "現在、自宅でやっているケア・所作があれば書いてください",
    hint: "「朝のスキンケア」「夜の湯船」など、短文で構いません",
    maxLength: 500,
  },
  {
    id: "monthly_spend",
    kind: "single",
    section: "history",
    prompt: "1 ヶ月にこの領域へかけている費用",
    options: [
      { value: "0", label: "0 円" },
      { value: "lt5k", label: "〜5,000 円" },
      { value: "5to15k", label: "5,000〜15,000 円" },
      { value: "15to30k", label: "15,000〜30,000 円" },
      { value: "gt30k", label: "30,000 円以上" },
    ],
  },
  {
    id: "search_topic",
    kind: "text",
    section: "history",
    prompt: "夜、検索で一番調べていることを、ひとつ",
    hint: "例：「ワキガ 手術 した方がいいか」「30代 老け顔 男」",
    maxLength: 200,
  },
  {
    id: "trusted_source",
    kind: "single",
    section: "history",
    prompt: "信頼できる情報源を、現在持っていますか",
    options: [
      { value: "yes", label: "持っている" },
      { value: "looking", label: "探している" },
      { value: "no", label: "持っていない" },
    ],
  },

  // ── IV. これから（5）
  {
    id: "half_year_vision",
    kind: "text",
    section: "future",
    prompt: "半年後の自分が、どんな状態になっていたら「整った」と感じますか",
    hint: "派手な変化でなくて構いません。「白いシャツが気軽に着られる」「夜眠れている」など",
    maxLength: 600,
    required: true,
  },
  {
    id: "budget_6m",
    kind: "single",
    section: "future",
    prompt: "今後半年で、この領域に投資できる予算",
    options: [
      { value: "lt10k", label: "〜10,000 円" },
      { value: "10to50k", label: "10,000〜50,000 円" },
      { value: "50to200k", label: "50,000〜200,000 円" },
      { value: "gt200k", label: "200,000 円以上" },
      { value: "undecided", label: "決めていない" },
    ],
    required: true,
  },
  {
    id: "time_per_week",
    kind: "single",
    section: "future",
    prompt: "週に確保できる、整えるための時間",
    options: [
      { value: "lt30", label: "30 分未満" },
      { value: "30to120", label: "30 分〜2 時間" },
      { value: "120to300", label: "2〜5 時間" },
      { value: "gt300", label: "5 時間以上" },
    ],
    required: true,
  },
  {
    id: "first_step",
    kind: "single",
    section: "future",
    prompt: "次の半歩として、まずやりたいことに近いのは",
    options: [
      { value: "organize", label: "自分の状態を整理する" },
      { value: "expert", label: "信頼できる専門家を探す" },
      { value: "compare", label: "選択肢を並べて比較する" },
      { value: "lifestyle", label: "生活・所作を見直す" },
      { value: "undecided", label: "まだ決められない" },
    ],
    required: true,
  },
  {
    id: "guide_interest",
    kind: "single",
    section: "future",
    prompt: "Recovery Guide（編集者との 90 分のオンライン対話）への興味",
    hint: "今すぐ決める必要はありません",
    options: [
      { value: "yes", label: "受けてみたい" },
      { value: "maybe", label: "話を聞いてから決めたい" },
      { value: "no", label: "いまは結構です" },
    ],
    required: true,
  },
];

export function questionsInSection(sectionId: string): CheckQuestion[] {
  return CHECK_QUESTIONS.filter((q) => q.section === sectionId);
}
