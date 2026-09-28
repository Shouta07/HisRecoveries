// 売るもの。
//
// ── 「人に聞けること」を売らない ──────────────────
// 売っているのは、本番の前に人で確かめられること。
// 5人の回答が ¥2,980 なのではない。
// 大事な一手を、実際の人で試してから出せることに払ってもらう。
//
// ── 人数で値段を分けない ──────────────────────────
// 「5人 ¥2,980 / 10人 ¥4,980」は、人数を売っている。
// それはアンケートの売り方で、10人を選ぶ理由が
// 「たくさん」以外に無くなる。
// 分けるのは、どこまで仕上げるか。
//   試す → どう見えたか知る → 直す → もう一度試す → 本番へ
// 上の段ほど、後ろの工程まで含む。
//
// ── 金額はサーバーが決める ────────────────────────
// 画面から金額を送らせない。送れる形にすると、
// 1円で Checkout を作られる。
// ここが唯一の正しい値で、API はここだけを見る。
//
// ── 出せないものを売らない ────────────────────────
// available が false のものは、画面に出しても買えない。
// 対面での確認を含む商品は、手順と担当が用意できるまで開けない。
// 買えてしまうと、届けられない約束を売ることになる。

import { isPanelSize, type AttrId, type PanelAge } from "./model";

export type PlanId = "final_check" | "talk" | "improve" | "retest" | "date_ready";

/** どこまで仕上げるか。深いほど後ろの工程まで含む */
export type Depth = 1 | 2 | 3 | 4 | 5;

export type Plan = {
  id: PlanId;
  /** 画面に出す名前 */
  name: string;
  /** 一言。何が違うのかだけ */
  tagline: string;
  yen: number;
  /** 「〜」を付けるか。内容によって上がるもの */
  from?: boolean;
  depth: Depth;
  /** 1回あたり何人に聞くか */
  answers: number;
  /** 同じ条件の別の人へ、もう一度聞く回数（再テスト） */
  rounds: number;
  /** 年代以外の条件を指定できるか */
  targeting: boolean;
  /** 何が返ってくるか。金額だけ見せると高く感じる */
  includes: string[];
  /** どんなときに使うか */
  fits: string[];
  /** いま買えるか。手順が用意できていないものは false */
  available: boolean;
  /** 対面での確認を含むか */
  offline?: boolean;
  /** 実在する人と1対1で話すことを含むか */
  talk?: boolean;
  /** トップの料金に出すか。出さないものは、必要になった場面でだけ出す */
  onTop: boolean;
  /** 一覧で目立たせるか */
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "final_check",
    name: "今すぐ聞く",
    tagline: "相手に近い5人へ、今聞く。",
    yen: 2980,
    depth: 1,
    answers: 5,
    rounds: 1,
    targeting: true,
    includes: [
      "相手に近い実在の5人",
      "反応の分かれ方",
      "一人ひとりのコメント",
      "良かった点と、気になった点",
      "みんなが触れていたこと",
    ],
    fits: ["LINE", "写真", "誘い方", "服装", "店選び"],
    available: true,
    onTop: true,
    featured: true,
  },
  {
    // 書けない人の逃げ道。全員に自分で言語化させない。
    // 実在する人と1対1で話す以上、時間を決めた受け入れ手順と
    // その場を見る体制が要る。用意できるまで available は false。
    id: "talk",
    name: "話す",
    tagline: "20〜30分、実在する人と話す。",
    yen: 4980,
    from: true,
    depth: 2,
    answers: 1,
    rounds: 1,
    targeting: true,
    includes: [
      "実在する人と20〜30分",
      "状況をそのまま話す",
      "相手側から質問してもらう",
      "次の一手の整理",
    ],
    fits: ["うまく書けない", "何を聞けばいいか分からない", "考えが回っている"],
    available: false,
    talk: true,
    onTop: false,
  },
  {
    id: "improve",
    name: "一緒に直す",
    tagline: "人の反応を受けて、改善まで。",
    yen: 5980,
    from: true,
    depth: 3,
    answers: 5,
    rounds: 1,
    targeting: true,
    includes: [
      "「確かめる」の内容すべて",
      "どこが引っかかったかの整理",
      "直しどころ",
      "直した案",
      "AとBの比べ方",
    ],
    fits: ["文面を直したい", "写真を選び直したい", "プロフィールを書き直したい"],
    available: true,
    onTop: false,
  },
  {
    id: "retest",
    name: "直して、もう一度聞く",
    tagline: "直したものを、別の人にもう一度見せる。",
    yen: 7980,
    from: true,
    depth: 4,
    answers: 5,
    rounds: 2,
    targeting: true,
    includes: [
      "「直して返す」の内容すべて",
      "直した版を、同じ条件の別の5人へ",
      "前と後の比べ方",
      "最後のまとめ",
    ],
    fits: ["一度しかない一手", "本命への連絡", "勝負のプロフィール"],
    available: true,
    onTop: false,
  },
  {
    id: "date_ready",
    name: "当日までに、ひと通り",
    tagline: "大事な日の前に、必要なところをまとめて。",
    yen: 14800,
    from: true,
    depth: 5,
    answers: 10,
    rounds: 2,
    targeting: true,
    includes: [
      "「直して、もう一度」の内容すべて",
      "LINE・服装・店・当日の流れ",
      "第一印象・話し方・距離感",
      "必要に応じて、オンラインでの確認",
    ],
    fits: ["初めて会う日の前", "大事なデートの前", "勝負の日の前"],
    // 対面での確認を含む。手順と担当が用意できるまで、買えるようにしない。
    // 「買えるが届かない」を作らないため、ここは false のまま。
    available: false,
    offline: true,
    onTop: false,
  },
];

const BY_ID = new Map(PLANS.map((p) => [p.id, p]));

export function plan(id: PlanId): Plan {
  const p = BY_ID.get(id);
  if (!p) throw new Error(`未定義のプラン: ${id}`);
  return p;
}

export function isPlanId(x: unknown): x is PlanId {
  return typeof x === "string" && BY_ID.has(x as PlanId);
}

/** いま買えるものだけ */
export function sellable(): Plan[] {
  return PLANS.filter((p) => p.available);
}

/**
 * トップの料金に出すもの。
 *
 * 1つだけにする。
 * 最初から料金表を並べると、選ぶ前に読む量が増えて、
 * 「何に迷っているか」より先に「どれを買うか」を考えさせることになる。
 *
 * ほかの商品は、必要になった場面でだけ出す。
 *   話す      → 回答を見て「もう少し話したい」と思ったとき
 *   直す      → 引っかかった点が出たとき
 *   もう一度  → 直したあと
 * 買う人にファネルを見せない。次に要ることだけが出てくる。
 */
export function topPlans(): Plan[] {
  return PLANS.filter((p) => p.onTop);
}

export function isSellable(id: unknown): id is PlanId {
  return isPlanId(id) && plan(id).available;
}

/** 何も指定されなかったときに選ばれるプラン */
export const DEFAULT_PLAN: PlanId = (
  sellable().find((p) => p.featured) ?? sellable()[0]
).id;

/** いちばん安い、買えるプラン。入口に出す */
export const ENTRY_PLAN: PlanId = [...sellable()].sort((a, b) => a.yen - b.yen)[0].id;

/**
 * 実際に請求する金額。
 * 画面から来た値は一切見ない。プランIDだけを受け取って、ここで引く。
 */
export function priceOf(id: PlanId): number {
  return plan(id).yen;
}

/** そのプランで、年代以外の条件を指定してよいか */
export function allowsTargeting(id: PlanId): boolean {
  return plan(id).targeting;
}

/**
 * 指定された条件を、プランの範囲に丸める。
 * 指定できないプランで条件を送られても、黙って落とす。
 */
export function clampTargeting(
  id: PlanId,
  panelAge: PanelAge,
  attrs: AttrId[],
): { panelAge: PanelAge; attrs: AttrId[] } {
  if (allowsTargeting(id)) return { panelAge, attrs };
  return { panelAge: "any", attrs: [] };
}

/* ── 試す → 知る → 直す → もう一度試す → 本番 ────
   これが商品の骨。単価が上がる理由もここにある。 */

export const FLOW = [
  { tag: "CHECK", label: "人で試す", note: "相手に近い5人に、そのまま見てもらう。" },
  { tag: "UNDERSTAND", label: "どう見えたか知る", note: "何人がどう感じたか。どこが引っかかったか。" },
  { tag: "IMPROVE", label: "直す", note: "引っかかったところを直した案を出す。" },
  { tag: "RE-TEST", label: "もう一度試す", note: "直した版を、同じ条件の別の5人へ。" },
  { tag: "GO", label: "本番へ", note: "良くなったことを確かめてから出す。" },
] as const;

/* ── 使う瞬間 ──────────────────────────────────
   「恋愛相談」と書くと、誰も自分のことだと思わない。
   押す直前に手が止まる、その瞬間だけを書く。 */

export const USE_CASES: {
  tag: string;
  q: string;
  body: string;
  category: string;
}[] = [
  {
    tag: "送る前",
    q: "このLINE、今送っていい？",
    body: "AIにも聞いた。でも、送信ボタンを押す直前になると不安になる。",
    category: "message",
  },
  {
    tag: "誘う前",
    q: "今日、デートに誘っていい？",
    body: "誘い方はAIでも考えられる。でも「この距離感で誘われたらどう感じる？」は、実際の人に聞きたい。",
    category: "signal",
  },
  {
    tag: "会う前",
    q: "あと2時間でデート。この服と店、大丈夫？",
    body: "服も店も決めた。でも最後に「実際どう見える？」を聞いておきたい。",
    category: "style",
  },
  {
    tag: "出す前",
    q: "プロフィール写真、AとBどっち？",
    body: "AIに写真の特徴は説明できる。でも「どっちなら会いたいと思う？」は、実際の相手側に聞く。",
    category: "photo",
  },
  {
    tag: "載せる前",
    q: "このプロフィール、会ってみたいと思う？",
    body: "自分では読み返せない。相手側の目で、一度通して読んでもらう。",
    category: "photo",
  },
];

/* ── 公開の前に止めること ───────────────────────── */
{
  if (PLANS.length === 0) throw new Error("プランが1つもありません");
  if (sellable().length === 0) throw new Error("買えるプランが1つもありません");

  for (const p of PLANS) {
    if (p.yen < 1000) {
      // 缶ジュースの値段にしない。実在の人の時間を扱っている。
      throw new Error(`プラン「${p.id}」が安すぎます（${p.yen}円）`);
    }
    if (!Number.isInteger(p.yen)) throw new Error(`プラン「${p.id}」の金額が整数ではありません`);
    // 保存できない人数を売らない。売ったあとに弾かれると、
    // 払ったのに配られない相談ができる。
    // 1対1で話す商品は、そもそも人数を集めないので対象外。
    if (!p.talk && !isPanelSize(p.answers)) {
      throw new Error(`プラン「${p.id}」の人数 ${p.answers} は保存できません（PANEL_SIZES 外）`);
    }
    if (p.talk && p.answers !== 1) {
      throw new Error(`プラン「${p.id}」は1対1です。人数は1にしてください`);
    }
    if (p.rounds < 1) throw new Error(`プラン「${p.id}」の回数が不正です`);
    // 金額だけ見せると高く感じる。何が返ってくるかを必ず持たせる。
    if (p.includes.length < 3) {
      throw new Error(`プラン「${p.id}」に、何が返ってくるかが書かれていません`);
    }
    // 対面を含むものを、手順が無いまま売らない。
    if (p.offline && p.available) {
      throw new Error(
        `プラン「${p.id}」は対面を含みます。受け入れ手順が用意できるまで available は false にしてください`,
      );
    }
  }

  // 深さが重複していないこと。同じ深さが2つあると、選ぶ理由が消える。
  if (new Set(PLANS.map((p) => p.depth)).size !== PLANS.length) {
    throw new Error("同じ深さのプランが複数あります");
  }
  // 高いほど深いこと。
  const byYen = [...PLANS].sort((a, b) => a.yen - b.yen);
  for (let i = 1; i < byYen.length; i++) {
    if (byYen[i].depth <= byYen[i - 1].depth) {
      throw new Error(
        `「${byYen[i].id}」は「${byYen[i - 1].id}」より高いのに、仕上げが浅くなっています`,
      );
    }
  }
  // トップに出すのは1つだけ。
  // 料金表を並べた時点で、買う人に選択を押し付けることになる。
  if (topPlans().length !== 1) {
    throw new Error(`トップの料金が ${topPlans().length} 個あります（1つだけにしてください）`);
  }
  if (!topPlans()[0].available) {
    throw new Error("トップに出すプランが買えません");
  }
  // 1対1で話すものを、受け入れ手順が無いまま売らない。
  // 相手も実在の人なので、時間を決めた手順とその場を見る体制が要る。
  for (const p of PLANS) {
    if (p.talk && p.available) {
      throw new Error(
        `プラン「${p.id}」は1対1で話す商品です。受け入れ手順が用意できるまで available は false にしてください`,
      );
    }
  }
  // 再テストを謳う以上、2回以上聞くプランが要る。
  if (!PLANS.some((p) => p.rounds >= 2)) {
    throw new Error("もう一度試すプランがありません");
  }
  // 目立たせるプランは1つ。2つあると、どれを選べばいいか分からない。
  if (PLANS.filter((p) => p.featured).length !== 1) {
    throw new Error("おすすめのプランは1つだけにしてください");
  }
  if (!plan(PLANS.find((p) => p.featured)!.id).available) {
    throw new Error("買えないプランをおすすめにしないでください");
  }

  // 専門用語を利用者の画面に出さない。
  // 「Human Validation」「C2C」「マーケットプレイス」は、こちらの説明の言葉。
  // 買う人が3秒で分かる必要があるので、名前と売り文句には入れない。
  const JARGON = [
    "C2C", "Human Validation", "マーケットプレイス", "プラットフォーム",
    "パネル", "アンケート", "リサーチ", "バリデーション", "モニター",
  ];
  const copy = [
    ...PLANS.flatMap((p) => [p.name, p.tagline, ...p.includes, ...p.fits]),
    ...USE_CASES.flatMap((u) => [u.tag, u.q, u.body]),
    ...FLOW.flatMap((f) => [f.label, f.note]),
  ];
  for (const t of copy) {
    const hit = JARGON.find((j) => t.includes(j));
    if (hit) {
      throw new Error(`画面の言葉に専門用語「${hit}」が入っています（人に聞く／反応を見る／自分で決める だけで書く）`);
    }
  }

  // 「5回答でいくら」と書かない。個数を売るとアンケートに見える。
  for (const p of PLANS) {
    if (/\d\s*回答/.test(p.tagline)) {
      throw new Error(`プラン「${p.id}」が回答の個数を売っています（仕上げの深さで書いてください）`);
    }
  }
}
