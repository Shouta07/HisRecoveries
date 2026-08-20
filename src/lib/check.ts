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

export type Stage = "core" | "detail";

export type Block = {
  id: BlockId;
  label: string;
  /**
   * core = 最小診断（これだけでレポートが出る）
   * detail = 任意。精度を上げたい人だけが進む
   */
  stage: Stage;
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

export type BlockId = "core" | "detail";
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
    id: "core",
    label: "5つだけ",
    stage: "core",
    areaId: null,
    questions: [
      {
        id: "c1",
        q: "いま、いちばん気になっているのは",
        choices: [
          { value: "impression", label: "清潔感・第一印象" },
          { value: "hair", label: "髪・薄毛" },
          { value: "skin", label: "肌荒れ" },
          { value: "face", label: "疲れて見えること" },
          { value: "body-hair", label: "ヒゲ・体毛" },
          { value: "mind", label: "眠り・体型" },
        ],
      },
      {
        // 理想を訊く。「何を直すか」だけだと、直したあとに何が
        // 起きてほしいのかが分からず、順番の理由が書けない。
        id: "c2",
        q: "どうなりたいですか",
        hint: "いちばん近いものを選んでください",
        choices: [
          { value: "clean", label: "清潔感がある、と思われたい" },
          { value: "young", label: "実年齢より上に見られたくない" },
          { value: "photo", label: "写真に写った自分に、違和感をなくしたい" },
          { value: "calm", label: "人前で、見た目を気にせずいたい" },
          { value: "undecided", label: "まだ決めていない" },
        ],
      },
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
        id: "b4",
        q: "1ヶ月に使える金額は、どのくらいですか",
        choices: [
          { value: "3000", label: "3,000円まで" },
          { value: "10000", label: "10,000円まで" },
          { value: "30000", label: "30,000円まで" },
          { value: "over", label: "それ以上" },
        ],
      },
      {
        id: "b5",
        q: "いつまでに、変化を確かめたいですか",
        hint: "急ぐほど、選べるものは減ります",
        choices: [
          { value: "4", label: "1ヶ月くらい" },
          { value: "12", label: "3ヶ月くらい" },
          { value: "26", label: "半年くらい" },
          { value: "none", label: "決めていない" },
        ],
      },
    ],
  },

  // ── ここから先は任意 ────────────────────────────
  // 5問でレポートは出る。この13問は「精度を上げる」ためのもので、
  // 出さないまま終わってよい。最初から全部訊くと、完了率が落ちる。
  {
    id: "detail",
    label: "もう1分",
    stage: "detail",
    areaId: null,
    questions: [
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
      ...GENTEN.map((g) => ({
        id: g.id,
        q: g.q,
        hint: g.hint,
        choices: YES_NO_SOMETIMES,
      })),
    ],
  },
];

/** その段階の設問数 */
export function questionCount(stage: Stage): number {
  return BLOCKS.filter((b) => b.stage === stage).reduce((n, b) => n + b.questions.length, 0);
}

export const CORE_QUESTIONS = questionCount("core");
export const DETAIL_QUESTIONS = questionCount("detail");

export const TOTAL_QUESTIONS = CORE_QUESTIONS + DETAIL_QUESTIONS;

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

export type CheckResult = {
  /** 減点チェックに答えたか（任意なので、答えていない人がいる） */
  detailed: boolean;
  /** 減点チェック 12項目 × 2点 = 24点満点 */
  score: number;
  scoreMax: number;
  /** 手をつけていない項目（0点）の数 */
  untouched: number;
  /** ときどき抜ける項目（1点）の数 */
  partial: number;
  areas: AreaScore[];
  steps: Step[];
  /**
   * 本人が「いちばん気になる」と答えた場所。
   *
   * 順番を出すだけなら要らない。要るのは、結果の見出しで
   * 「あなたが気にしているのはここ。でも先に手をつけるのは別」
   * と言うため。実測すると67%がこのずれに当たる。
   * この一行が、この診断でいちばん効く。
   */
  concern: AreaId | null;
  /** いまはやらなくていいこと */
  skip: { label: string; reason: string }[];
  /** 今月の3つ。1つ目は必ず「今日中に終わるもの」 */
  thisMonth: { when: string; text: string }[];
  /** 予算・時間の申告（結果の言い回しに使う） */
  budget: string | undefined;
  minutes: string | undefined;
  /**
   * 選択肢を絞るための条件。undefined は「制限しない」。
   * 文字列のままだと使う側で毎回変換することになるので、ここで数値にする。
   */
  limits: { budget?: number; minutes?: number; weeks?: number };
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
export const NOT_YET: Record<AreaId, string> = {
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
  // 領域別の詳細設問（19問）は削った。訊く数を増やすほど完了率が落ち、
  // 完了しない診断はレポートを出せないので、精度より完了を取る。
  // 重みの出どころは3つだけ:
  //   ① いちばん気になると答えた領域（強い）
  //   ② どうなりたいか（弱い。方向づけ）
  //   ③ 減点チェックの欠損（任意で答えた人だけ）
  const focus = answers["c1"];
  const goal = answers["c2"];
  const GOAL_AREAS: Record<string, AreaId[]> = {
    clean: ["impression"],
    young: ["face", "impression"],
    photo: ["impression", "face"],
    calm: ["impression"],
    undecided: [],
  };
  const goalAreas = GOAL_AREAS[goal ?? ""] ?? [];

  const areas: AreaScore[] = (Object.keys(AREA_LABEL) as AreaId[]).map((areaId) => {
    let weight = 0;
    if (focus === areaId) weight += 6;
    const gi = goalAreas.indexOf(areaId);
    if (gi === 0) weight += 2;
    else if (gi > 0) weight += 1;
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
    detailed: GENTEN.some((g) => answers[g.id] !== undefined),
    score,
    scoreMax: GENTEN.length * 2,
    untouched,
    partial,
    areas: areas.filter((a) => a.weight > 0).sort((a, b) => b.weight - a.weight),
    concern: isAreaId(answers.c1) ? answers.c1 : null,
    steps,
    skip,
    thisMonth,
    budget: answers["b4"],
    minutes: answers["b3"],
    limits: {
      // 「それ以上」は上限なしとして扱う（大きい数を置くと表示に出てしまう）
      budget: answers["b4"] && answers["b4"] !== "over" ? Number(answers["b4"]) : undefined,
      minutes: answers["b3"] ? Number(answers["b3"]) : undefined,
      weeks: answers["b5"] && answers["b5"] !== "none" ? Number(answers["b5"]) : undefined,
    },
  };
}

/** 結果の1行まとめ。共有と、結果ページの見出しに使う */
export function summarize(r: CheckResult): string {
  if (r.steps.length === 0) return "いま手をつける順番は、特にありません";
  const head = r.steps[0].label;

  // ── ずれを、先に言う ──────────────────────────
  // これまで見出しは「清潔感・第一印象から。」だけだった。
  // 本人が「髪が気になる」と答えたことに、どこにも触れていなかった。
  //
  // 実測すると、67%の人は気にしている場所と1番目がずれる。
  // そのずれこそが、この診断が渡している唯一のもの。
  // 触れずに結論だけ置くと、ただの一般論に見える。
  if (r.concern && r.concern !== r.steps[0].areaId) {
    return `${AREA_LABEL[r.concern]}が気になる。でも、先に手をつけるのは${head}です。`;
  }

  // ずれていない人には、そう言う。
  // 同じ文面にすると、当たっていたことが伝わらない。
  // 手つかずの数は結果画面の「現在地」に数字で出ているので、
  // 見出しでは繰り返さない。
  return `${head}から。その見立てで合っています。`;
}
