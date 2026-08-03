// 診断（35問）。サイトの入口をここに移すための中核。
//
// これまでこのサイトには「読む」しかなかった。記事を55本置いても、
// 読み終えた人が次に進む先が「別の記事」しかないので、関係が一度きりで終わる。
// 診断は、読者に「自分の現在地」を渡して、順番を1本に決めるための道具。
//
// ── 設計の前提 ────────────────────────────────
// ・順番は固定する（減点をなくす → 現在地を知る → 継続ケア → 内側）。
//   分岐は有限で、実用上のルートは10前後に収束する。機械学習は要らない。
// ・スコアは「良い／悪い」ではなく「手をつけている／いない」で測る。
//   人を採点しているように見せない。整っていない項目の数を数えるだけ。
// ・結果には必ず「いまはやらなくていいこと」を出す。
//   これは売っていない主体にしか書けない部分で、この事業の核にあたる。
// ・効果や成果は書かない。「こうすると良くなる」ではなく「この順に手をつける」。

export type Choice = {
  value: string;
  label: string;
  /** 減点チェック用の配点（2=できている / 1=ときどき / 0=手つかず） */
  points?: number;
  /** この選択で領域の関心度に加算する重み */
  weight?: number;
};

export type Question = {
  id: string;
  /** 設問文。「〜していますか」ではなく状態を尋ねる形にする */
  q: string;
  /** 補足。迷わせないための一行。無くてよい場合は付けない */
  hint?: string;
  choices: Choice[];
};

export type Block = {
  id: BlockId;
  label: string;
  /** その領域に対応する areaId。基本ブロックは null */
  areaId: AreaId | null;
  questions: Question[];
  /**
   * 先頭の設問でこの値が選ばれたら、ブロックの残りを飛ばす。
   * 「気になっていない領域について4問答えさせる」のを避けるため。
   * 飛ばしたこと自体が「該当なし」という回答になる。
   */
  skipRestIf?: string;
};

export type BlockId = "basic" | "genten" | "hair" | "skin" | "face" | "bodyhair" | "mind";
export type AreaId = "impression" | "hair" | "skin" | "face" | "body-hair" | "mind";

// ── 質問 ────────────────────────────────────

const YES_NO_SOMETIMES: Choice[] = [
  { value: "yes", label: "できている", points: 2 },
  { value: "some", label: "ときどき抜ける", points: 1 },
  { value: "no", label: "手をつけていない", points: 0 },
];

/** 減点チェックの12項目。どの領域の話かを持たせておく */
const GENTEN: { id: string; q: string; hint?: string; area: AreaId }[] = [
  { id: "g1", q: "髪型を、月に1回は整えている", area: "impression" },
  { id: "g2", q: "眉を整えている", hint: "形を変えるという意味ではなく、はみ出しを取る程度", area: "impression" },
  { id: "g3", q: "髭の剃り残しがない状態を保てている", area: "body-hair" },
  { id: "g4", q: "肌の荒れ（ニキビ・赤み）が目立たない", area: "skin" },
  { id: "g5", q: "爪を短く保っている", area: "impression" },
  { id: "g6", q: "歯みがき以外の口内ケアをしている", hint: "歯間の掃除、舌、歯科の定期受診など", area: "impression" },
  { id: "g7", q: "においの対策をしている", hint: "衣類・体・足のいずれか", area: "impression" },
  { id: "g8", q: "服のサイズが、いまの体に合っている", area: "impression" },
  { id: "g9", q: "靴を手入れしている", area: "impression" },
  { id: "g10", q: "しわ・毛玉のない状態で家を出ている", area: "impression" },
  { id: "g11", q: "姿勢を意識できている", hint: "猫背・巻き肩・前に出た首", area: "impression" },
  { id: "g12", q: "体重が、学生のころから大きく増えていない", area: "mind" },
];

export const BLOCKS: Block[] = [
  {
    id: "basic",
    label: "はじめに",
    areaId: null,
    questions: [
      {
        id: "b1",
        q: "年代を教えてください",
        choices: [
          { value: "20e", label: "20代前半" },
          { value: "20l", label: "20代後半" },
          { value: "30e", label: "30代前半" },
          { value: "30l", label: "30代後半" },
          { value: "40", label: "40代以上" },
        ],
      },
      {
        id: "b2",
        q: "気になったのは、どんな場面でしたか",
        choices: [
          { value: "photo", label: "写真に写った自分を見たとき" },
          { value: "mirror", label: "鏡を見たとき" },
          { value: "first", label: "初対面の人と会うとき" },
          { value: "public", label: "人前で話すとき" },
          { value: "none", label: "特定の場面はない" },
        ],
      },
      {
        id: "b3",
        q: "1日に使える時間は、どのくらいですか",
        hint: "続けられる範囲で答えてください",
        choices: [
          { value: "5", label: "5分まで" },
          { value: "10", label: "10分くらい" },
          { value: "20", label: "20分くらい" },
          { value: "30", label: "それ以上とれる" },
        ],
      },
      {
        id: "b4",
        q: "1ヶ月に使える金額は、どのくらいですか",
        choices: [
          { value: "3000", label: "3,000円まで" },
          { value: "10000", label: "10,000円まで" },
          { value: "30000", label: "30,000円まで" },
          { value: "over", label: "それ以上" },
        ],
      },
    ],
  },
  {
    id: "genten",
    label: "いまの状態",
    areaId: null,
    questions: GENTEN.map((g) => ({
      id: g.id,
      q: g.q,
      hint: g.hint,
      choices: YES_NO_SOMETIMES,
    })),
  },
  {
    id: "hair",
    label: "髪",
    areaId: "hair",
    skipRestIf: "none",
    questions: [
      {
        id: "h1",
        q: "生え際やつむじの変化を感じますか",
        choices: [
          { value: "none", label: "気にならない", weight: 0 },
          { value: "self", label: "自分では少し感じる", weight: 2 },
          { value: "clear", label: "はっきり感じる", weight: 3 },
          { value: "told", label: "人に言われたことがある", weight: 4 },
        ],
      },
      {
        id: "h2",
        q: "抜け毛の量はどうですか",
        choices: [
          { value: "same", label: "変わらない", weight: 0 },
          { value: "more", label: "増えた気がする", weight: 1 },
          { value: "clear", label: "明らかに増えた", weight: 2 },
        ],
      },
      {
        id: "h3",
        q: "ご家族に、薄毛の方はいますか",
        hint: "父方・母方どちらでも",
        choices: [
          { value: "no", label: "いない", weight: 0 },
          { value: "yes", label: "いる", weight: 1 },
          { value: "unknown", label: "わからない", weight: 0 },
        ],
      },
      {
        id: "h4",
        q: "いま、何かしていますか",
        choices: [
          { value: "none", label: "していない" },
          { value: "otc", label: "市販品を使っている" },
          { value: "clinic", label: "医療機関にかかっている" },
        ],
      },
    ],
  },
  {
    id: "skin",
    label: "肌",
    areaId: "skin",
    skipRestIf: "none",
    questions: [
      {
        id: "s1",
        q: "肌で気になっていることはありますか",
        choices: [
          { value: "none", label: "特にない", weight: 0 },
          { value: "acne", label: "ニキビ・吹き出物", weight: 3 },
          { value: "dry", label: "乾燥・粉ふき", weight: 2 },
          { value: "red", label: "赤み・かゆみ", weight: 3 },
        ],
      },
      {
        id: "s2",
        q: "跡（色素沈着・凹凸）はありますか",
        choices: [
          { value: "no", label: "ない", weight: 0 },
          { value: "some", label: "少しある", weight: 1 },
          { value: "yes", label: "気になっている", weight: 2 },
        ],
      },
      {
        id: "s3",
        q: "洗顔のあと、何かつけていますか",
        choices: [
          { value: "yes", label: "つけている", weight: 0 },
          { value: "some", label: "たまに", weight: 1 },
          { value: "no", label: "つけていない", weight: 2 },
        ],
      },
      {
        id: "s4",
        q: "日焼けの対策はしていますか",
        choices: [
          { value: "yes", label: "している", weight: 0 },
          { value: "some", label: "たまに", weight: 1 },
          { value: "no", label: "していない", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "face",
    label: "顔まわり",
    areaId: "face",
    skipRestIf: "none",
    questions: [
      {
        id: "f1",
        q: "「疲れて見える」と言われることはありますか",
        choices: [
          { value: "none", label: "ない", weight: 0 },
          { value: "some", label: "たまに", weight: 2 },
          { value: "often", label: "よく言われる", weight: 3 },
        ],
      },
      {
        id: "f2",
        q: "目の下のくまはどうですか",
        choices: [
          { value: "no", label: "目立たない", weight: 0 },
          { value: "some", label: "ときどき目立つ", weight: 1 },
          { value: "yes", label: "いつもある", weight: 2 },
        ],
      },
      {
        id: "f3",
        q: "顔のむくみはどうですか",
        choices: [
          { value: "no", label: "気にならない", weight: 0 },
          { value: "morning", label: "朝だけ気になる", weight: 1 },
          { value: "allday", label: "一日中気になる", weight: 2 },
        ],
      },
    ],
  },
  {
    id: "bodyhair",
    label: "ヒゲ・体毛",
    areaId: "body-hair",
    skipRestIf: "none",
    questions: [
      {
        id: "y1",
        q: "ヒゲや体毛で困っていることはありますか",
        choices: [
          { value: "none", label: "特にない", weight: 0 },
          { value: "shave", label: "毎日剃るのが負担", weight: 2 },
          { value: "blue", label: "剃っても青く残る・夕方に目立つ", weight: 3 },
          { value: "body", label: "体毛が気になる", weight: 2 },
        ],
      },
      {
        id: "y2",
        q: "肌荒れ（カミソリ負け・埋没毛）はありますか",
        choices: [
          { value: "no", label: "ない", weight: 0 },
          { value: "some", label: "ときどき", weight: 1 },
          { value: "yes", label: "よくある", weight: 2 },
        ],
      },
      {
        id: "y3",
        q: "どうしたいですか",
        hint: "「そのまま」も正当な選択です",
        choices: [
          { value: "keep", label: "いまのまま整えたい" },
          { value: "reduce", label: "減らしたい" },
          { value: "undecided", label: "決めていない" },
        ],
      },
    ],
  },
  {
    id: "mind",
    label: "睡眠・習慣",
    areaId: "mind",
    questions: [
      {
        id: "m1",
        q: "平日の睡眠時間は、だいたいどのくらいですか",
        choices: [
          { value: "7", label: "7時間以上", weight: 0 },
          { value: "6", label: "6時間前後", weight: 1 },
          { value: "5", label: "5時間以下", weight: 3 },
        ],
      },
      {
        id: "m2",
        q: "寝る時刻はどうですか",
        choices: [
          { value: "fixed", label: "だいたい一定", weight: 0 },
          { value: "weekend", label: "平日と休日で2時間以上ずれる", weight: 2 },
          { value: "random", label: "毎日ばらばら", weight: 3 },
        ],
      },
      {
        id: "m3",
        q: "体を動かす習慣はありますか",
        choices: [
          { value: "week", label: "週2回以上", weight: 0 },
          { value: "month", label: "月に数回", weight: 1 },
          { value: "none", label: "ほとんどしない", weight: 2 },
        ],
      },
      {
        id: "m4",
        q: "食事はどうですか",
        choices: [
          { value: "ok", label: "だいたい3食とれている", weight: 0 },
          { value: "skip", label: "抜けることが多い", weight: 1 },
          { value: "late", label: "夜が遅い・重くなりがち", weight: 2 },
        ],
      },
      {
        id: "m5",
        q: "気分の落ち込みはありますか",
        choices: [
          { value: "no", label: "ほとんどない", weight: 0 },
          { value: "some", label: "ときどきある", weight: 1 },
          { value: "cont", label: "続いている", weight: 3 },
        ],
      },
    ],
  },
];

export const TOTAL_QUESTIONS = BLOCKS.reduce((n, b) => n + b.questions.length, 0);

// ── 採点 ────────────────────────────────────

export type Answers = Record<string, string>;

export type AreaScore = {
  areaId: AreaId;
  label: string;
  /** 関心度・該当度。順番の決定に使う */
  weight: number;
  /** 減点チェックのうち、この領域で手つかず／ときどきの項目 */
  gaps: string[];
};

const AREA_LABEL: Record<AreaId, string> = {
  impression: "清潔感・第一印象",
  hair: "髪",
  skin: "肌",
  face: "顔まわり",
  "body-hair": "ヒゲ・体毛",
  mind: "睡眠・習慣",
};

/**
 * 短いほうの呼び名。ファーストビューの選択肢に使う。
 * 3列に並べるので、いちばん長いものが2行に折れない長さで揃える。
 */
export const AREA_LABEL_SHORT: Record<AreaId, string> = {
  impression: "清潔感",
  hair: "髪・薄毛",
  skin: "肌荒れ",
  face: "疲れ顔",
  "body-hair": "ヒゲ・体毛",
  mind: "眠り・体型",
};

/** 悩みの入口として指定された領域か（ファーストビューの選択肢） */
export function isAreaId(x: unknown): x is AreaId {
  return typeof x === "string" && x in AREA_LABEL;
}

export function areaLabel(id: AreaId): string {
  return AREA_LABEL[id];
}

const BLOCK_BY_AREA = new Map<AreaId, Block>(
  BLOCKS.filter((b) => b.areaId).map((b) => [b.areaId as AreaId, b]),
);

function choiceOf(q: Question, value: string | undefined): Choice | undefined {
  return q.choices.find((c) => c.value === value);
}

export type CheckResult = {
  /** 減点チェック 12項目 × 2点 = 24点満点 */
  score: number;
  scoreMax: number;
  /** 手をつけていない項目（0点）の数 */
  untouched: number;
  /** ときどき抜ける項目（1点）の数 */
  partial: number;
  areas: AreaScore[];
  steps: Step[];
  /** いまはやらなくていいこと */
  skip: { label: string; reason: string }[];
  /** 今月の3つ。1つ目は必ず「今日中に終わるもの」 */
  thisMonth: { when: string; text: string }[];
  /** 予算・時間の申告（結果の言い回しに使う） */
  budget: string | undefined;
  minutes: string | undefined;
};

export type Step = {
  n: number;
  areaId: AreaId;
  label: string;
  /** なぜこの順番なのか。順番そのものが商品なので、必ず理由を出す */
  why: string;
  actions: { when: string; text: string }[];
};

/** 領域ごとの打ち手。即日でできるものを必ず1つ含める */
const ACTIONS: Record<AreaId, { when: string; text: string }[]> = {
  impression: [
    { when: "今日", text: "爪を切る。伸びた爪は、どれだけ服を整えても先に目に入る" },
    { when: "今週", text: "髪を切る予約を入れる。日付を決めるところまでを1つの作業にする" },
    { when: "今月", text: "いちばんよく着る服を1枚、サイズの合うものに入れ替える" },
  ],
  hair: [
    { when: "今日", text: "つむじと生え際を、同じ明るさの場所で撮っておく。比べる基準がないと変化は分からない" },
    { when: "今週", text: "いま使っているものの成分表示を確認する。何をしているのかを把握する" },
    { when: "今月", text: "気になるなら、医療機関で現在地を確認する。進行性かどうかは自己判断では分からない" },
  ],
  skin: [
    { when: "今日", text: "洗顔のあと、何かひとつ塗る。種類より、塗ること自体を続けるほうが先" },
    { when: "今週", text: "荒れているのが炎症か乾燥か摩擦かを分ける。原因が違えばやることも違う" },
    { when: "今月", text: "日中に使う日焼け止めを1本決める。跡を増やさないほうが、消すより早い" },
  ],
  face: [
    { when: "今日", text: "寝る時刻を決める。顔まわりは睡眠の影響がいちばん早く出る" },
    { when: "今週", text: "朝の水分と塩分の取り方を1つ変えてみる" },
    { when: "今月", text: "2週間おきに同じ条件で写真を撮り、むくみが時間帯によるものかを確かめる" },
  ],
  "body-hair": [
    { when: "今日", text: "剃る前後の手順を1つ足す。負担の多くは剃り方から来ている" },
    { when: "今週", text: "整える／減らす／そのまま、のどれで行くかを決める。決めないと道具も選べない" },
    { when: "今月", text: "肌荒れが続くなら、頻度と道具を変える。回数を増やすほうに行かない" },
  ],
  mind: [
    { when: "今日", text: "寝る時刻を1つ決める。起きる時刻より、寝る時刻のほうが動かしやすい" },
    { when: "今週", text: "平日と休日の起床時刻の差を、2時間以内に収める" },
    { when: "今月", text: "週2回、20分歩く時間を予定に入れる。運動ではなく予定として入れる" },
  ],
};

const WHY: Record<AreaId, string> = {
  impression:
    "ここは、やれば今日から変わる部分です。しかも他のどれよりも人の目に入りやすい。先にここを埋めないと、他の努力が見えにくいままになります。",
  hair: "進行するかどうかは自己判断では分かりません。だから早いのは対処ではなく、現在地を知ることのほうです。",
  skin: "肌は原因を分けないと、やることが決まりません。炎症・乾燥・摩擦で手当てが変わります。",
  face: "顔まわりは、睡眠とむくみで動く部分が大きい。手をかける前に、その分を切り分けます。",
  "body-hair": "正解がひとつではない領域です。目的を決めてからでないと、道具も頻度も選べません。",
  mind: "いちばん効きますが、いちばん時間がかかります。だから最初にはしません。他が動き出してから、ここを触ります。",
};

/** 領域ごとの「まだ早い理由」。やらなくていいことを言えるのが、この診断の役割 */
const NOT_YET: Record<AreaId, string> = {
  impression: "手をつけていない項目がないので、いま急いで足すものはありません",
  hair: "気になっていないなら、いま何かを始める理由はありません",
  skin: "困っていない状態なら、増やすより今のままを崩さないほうが得です",
  face: "指摘も自覚もないなら、ここに時間を使う番ではありません",
  "body-hair": "困っていないなら、そのままで構いません。減らすことが上位互換ではありません",
  mind: "崩れていないなら、いま整えるものはありません",
};

export function evaluate(answers: Answers): CheckResult {
  // ── 減点チェック ──
  let score = 0;
  let untouched = 0;
  let partial = 0;
  const gapsByArea = new Map<AreaId, string[]>();

  for (const g of GENTEN) {
    const v = answers[g.id];
    if (v === undefined) continue;
    const p = v === "yes" ? 2 : v === "some" ? 1 : 0;
    score += p;
    if (p === 0) untouched++;
    if (p === 1) partial++;
    if (p < 2) {
      const list = gapsByArea.get(g.area) ?? [];
      list.push(g.q);
      gapsByArea.set(g.area, list);
    }
  }

  // ── 領域ごとの該当度 ──
  const areas: AreaScore[] = (Object.keys(AREA_LABEL) as AreaId[]).map((areaId) => {
    let weight = 0;
    const block = BLOCK_BY_AREA.get(areaId);
    if (block) {
      for (const q of block.questions) {
        const c = choiceOf(q, answers[q.id]);
        weight += c?.weight ?? 0;
      }
    }
    // 減点チェックの欠損も、その領域の該当度に足す
    const gaps = gapsByArea.get(areaId) ?? [];
    weight += gaps.length;
    return { areaId, label: AREA_LABEL[areaId], weight, gaps };
  });

  const byId = new Map(areas.map((a) => [a.areaId, a]));
  const w = (id: AreaId) => byId.get(id)?.weight ?? 0;

  // ── 順番 ──
  // 思想の順序は固定する（減点 → 現在地 → 継続ケア → 内側）。
  // 変わるのは「どれを含めるか」だけで、並びそのものは動かさない。
  // 順番が人によって入れ替わると、それは順番ではなく好みになる。
  const order: AreaId[] = [];
  if (w("impression") > 0) order.push("impression");
  if (w("hair") >= 2) order.push("hair"); // 進行性なので、早い段階で現在地を知る
  const care = (["skin", "face", "body-hair"] as AreaId[])
    .filter((a) => w(a) > 0)
    .sort((a, b) => w(b) - w(a));
  order.push(...care);
  if (w("hair") > 0 && !order.includes("hair")) order.push("hair");
  if (w("mind") > 0) order.push("mind");

  const steps: Step[] = order.map((areaId, i) => ({
    n: i + 1,
    areaId,
    label: AREA_LABEL[areaId],
    why: WHY[areaId],
    actions: ACTIONS[areaId],
  }));

  const skip = (Object.keys(AREA_LABEL) as AreaId[])
    .filter((a) => !order.includes(a))
    .map((a) => ({ label: AREA_LABEL[a], reason: NOT_YET[a] }));

  // ── 今月の3つ ──
  // 最初のステップから取る。1つ目は必ず「今日」のものにする。
  // 最初の1つが終わると続く確率が変わるので、そこだけは設計で担保する。
  const first = steps[0];
  const thisMonth = first
    ? first.actions.slice(0, 3)
    : [
        { when: "今日", text: "今日の自分を1枚撮っておく。比べる基準がないと、変化は見えません" },
        { when: "今週", text: "崩れていない状態を、どう保っているかを書き出す" },
        { when: "今月", text: "同じ条件でもう1枚撮る" },
      ];

  return {
    score,
    scoreMax: GENTEN.length * 2,
    untouched,
    partial,
    areas: areas.filter((a) => a.weight > 0).sort((a, b) => b.weight - a.weight),
    steps,
    skip,
    thisMonth,
    budget: answers["b4"],
    minutes: answers["b3"],
  };
}

/** 結果の1行まとめ。共有と、結果ページの見出しに使う */
export function summarize(r: CheckResult): string {
  if (r.steps.length === 0) return "いま手をつける順番は、特にありません";
  const head = r.steps[0].label;
  if (r.untouched === 0) return `${head}から。手つかずの項目はありません`;
  return `${head}から。手つかずが${r.untouched}項目`;
}
