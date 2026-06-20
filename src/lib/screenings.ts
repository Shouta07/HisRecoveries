// 5問軽診断のデータモデル。Web (LINE login 不要・匿名) で完結する
// "状態の言語化" レイヤー。本診断 (30問) は /check または LINE で。
//
// 設計原則:
// - 質問は YES/NO のみ（迷う設問は別質問に分解）
// - 各質問は scoreWeight: 1 か 2（重要因子に重みづけ）
// - cause は質問の組合せから条件式で判定（医療断定はしない・「可能性」止まり）
// - recommendation は 1 つに絞る（重度→医療相談 / 中度→相談検討 / 軽度→経過観察+生活）
//
// 内部に閉じた静的データ。LINE 詳細診断は別系統。

export type ScreeningQuestion = {
  id: string;
  prompt: string;
  scoreWeight?: number; // default 1
};

export type SeverityBand = "mild" | "moderate" | "severe";

export type Screening = {
  slug: string;            // territory slug と同じ
  title: string;
  category: string;        // "薄毛・AGA" 等
  intro: string;
  durationMinutes: number; // 表示用 (3分 等)
  questions: ScreeningQuestion[];
  /** 合計スコアからの severity 判定 (合計重みで割って正規化) */
  thresholds: { moderate: number; severe: number };
  /** severity ごとの解釈 */
  bands: Record<
    SeverityBand,
    {
      label: string;       // "軽度" / "中度" / "重度"
      reading: string;     // 編集者からの一言の所見
      action: string;      // 推奨する次の半歩（1つだけ）
      links: { label: string; href: string; external?: boolean }[];
    }
  >;
  /** 質問の組合せから "原因の可能性" を返す（断定しない） */
  causeHints: {
    label: string;
    description: string;
    /** 指定した question id がすべて yes の場合に該当 */
    when: { allYes: string[] };
  }[];
};

const SCREENINGS: Record<string, Screening> = {
  "hair-loss": {
    slug: "hair-loss",
    title: "薄毛・AGA の軽診断",
    category: "薄毛・AGA",
    intro: "5問で、いまの状態と次の半歩を返します。生え際・つむじの後退、抜け毛の変化、家族の傾向などをもとに、軽度／中度／重度の目安を出します。",
    durationMinutes: 3,
    questions: [
      {
        id: "front_crown_thin",
        prompt: "鏡で生え際またはつむじを見て、後退や薄さを感じることがある。",
        scoreWeight: 2,
      },
      {
        id: "shed_increased",
        prompt: "ここ半年で、抜け毛の量が増えたと感じる（枕・排水溝・ブラシ）。",
      },
      {
        id: "hair_thinner_shorter",
        prompt: "髪が、以前より細く・短くなってきたと感じる。",
      },
      {
        id: "family_history",
        prompt: "家族（父・母方の祖父など）に、薄毛の人がいる。",
        scoreWeight: 2,
      },
      {
        id: "over_30",
        prompt: "30歳以上である。",
      },
    ],
    // 合計重みは 1+2+1+1+2 = 7。
    // moderate = 3+, severe = 5+ (重要因子をふくむ重度推定)
    thresholds: { moderate: 3, severe: 5 },
    bands: {
      mild: {
        label: "軽度の可能性",
        reading: "いまの段階では、強い進行のサインは出ていないと読めます。ただし AGA は進行性のため、半年〜1年単位で経過を見ることに意味があります。",
        action: "生活側（睡眠・喫煙・ストレス）の整えを 3〜6 ヶ月続け、変化があれば再度この診断を。",
        links: [
          { label: "「薄毛・AGA」の原因を読む", href: "/territories/hair-loss" },
          { label: "30問の Recovery Check で深く観察する", href: "/check" },
        ],
      },
      moderate: {
        label: "中度の可能性",
        reading: "いくつかの進行サインが重なっています。AGA は進行性なので、いま動くほど選べる手段が多い領域です。断定はしませんが、皮膚科 or AGAクリニックでの初診相談を一度検討してよい段階です。",
        action: "皮膚科または AGA クリニックで、1 度だけ初診相談を受ける（治療開始の判断はしない、状態確認のみ）。",
        links: [
          { label: "「薄毛・AGA」の原因を読む", href: "/territories/hair-loss" },
          { label: "編集者が選定中（Services）", href: "/services" },
          { label: "30問の Recovery Check で深く観察する", href: "/check" },
        ],
      },
      severe: {
        label: "進行している可能性が高い",
        reading: "進行性サインが複数重なっています。時間が選択肢を狭める領域なので、診断はしませんが、早めに医療機関で確認するのが合理的です。HR は治療を売りませんし、紹介手数料も取りません。",
        action: "今月中に、皮膚科または AGA クリニックで初診相談の予約を取る。",
        links: [
          { label: "「薄毛・AGA」の原因を読む", href: "/territories/hair-loss" },
          { label: "編集者が選定中（Services）", href: "/services" },
        ],
      },
    },
    causeHints: [
      {
        label: "AGA（進行性脱毛）の可能性",
        description: "家族歴と年代が重なる場合、DHT（5αリダクターゼによる代謝物）の影響を受けやすい体質と読めます。前頭部・頭頂部に偏るのが特徴。",
        when: { allYes: ["family_history", "over_30", "front_crown_thin"] },
      },
      {
        label: "生活要因による一時的な抜け毛の可能性",
        description: "家族歴がなく、抜け毛だけが増えている場合、季節性・ストレス・睡眠負債・栄養の影響が背景にあることもあります。",
        when: { allYes: ["shed_increased"] },
      },
    ],
  },
};

export function getAllScreenings(): Screening[] {
  return Object.values(SCREENINGS);
}

export function getScreening(slug: string): Screening | undefined {
  return SCREENINGS[slug];
}

/** Public meta — used by /screen index for "coming soon" cards. */
export const ALL_TERRITORIES: { slug: string; category: string }[] = [
  { slug: "hair-loss", category: "薄毛・AGA" },
  { slug: "sweat-odor", category: "汗・におい" },
  { slug: "skin-acne", category: "肌・ニキビ" },
  { slug: "face-impression", category: "顔の印象" },
  { slug: "beard-body-hair", category: "髭・体毛" },
  { slug: "mind-awareness", category: "心と自意識" },
];

export function severityFromAnswers(
  s: Screening,
  yes: Set<string>
): { score: number; band: SeverityBand } {
  let score = 0;
  for (const q of s.questions) {
    if (yes.has(q.id)) score += q.scoreWeight ?? 1;
  }
  const band: SeverityBand =
    score >= s.thresholds.severe
      ? "severe"
      : score >= s.thresholds.moderate
        ? "moderate"
        : "mild";
  return { score, band };
}

export function activeCauseHints(s: Screening, yes: Set<string>) {
  return s.causeHints.filter((h) =>
    h.when.allYes.every((id) => yes.has(id))
  );
}
