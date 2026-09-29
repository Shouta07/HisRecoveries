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
import { assertWeight, assertWhoReads, assertPlain } from "../voice";

export type PlanId = "standard" | "call" | "date_ready";

/**
 * 何を見てもらうか。
 *
 * 商品は「深さ」で分けるが、使う人が持ってくるものはこの3つ。
 * 自己紹介文 → メッセージ → 電話 の順に、本番へ近づいていく。
 */
export type Subject = "photo" | "message" | "call";

export const SUBJECTS: { id: Subject; label: string; lead: string; body: string }[] = [
  {
    id: "photo",
    label: "自己紹介文",
    lead: "その自己紹介文で、最初から損してない？",
    body: "アプリで写真の次に読まれるのが、自己紹介の文章です。会う前どころか、返信が来る前に決まっています。",
  },
  {
    id: "message",
    label: "メッセージ",
    lead: "そのLINE、送ってから後悔しない？",
    body: "初デートのあと。次の誘い。返信が遅いとき。追いLINE。告白の前。送信ボタンの前で手が止まる瞬間。",
  },
  {
    id: "call",
    label: "会話",
    lead: "大事な電話の前に、一度だけ練習する。",
    body: "声の感じ、話す速さ、間の取り方、質問の仕方。文字では出ないところが、電話には全部出ます。",
  },
];

/** どこまで仕上げるか。深いほど後ろの工程まで含む */
export type Depth = 1 | 2 | 3 | 4 | 5;

export type Plan = {
  id: PlanId;
  /** 画面に出す名前 */
  name: string;
  /** 一言。何が違うのかだけ */
  tagline: string;
  /** 何を買っているのか。個数ではなく場面で言う */
  value: string;
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
  /** 何を見てもらうものか。無ければ全部に使える */
  subjects?: Subject[];
  /**
   * 限界利益率の下限。
   *
   * 入口の商品は、利益を取る商品ではない。
   * 人の反応を一度体験してもらうための商品なので、
   * ここだけ下限を下げる。下げたことは画面ではなく、
   * この行と運営画面で分かるようにしておく。
   */
  marginFloor?: number;
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
    // 売るものは、これ1つ。あとはオプションで足す。
    //
    // ¥980 の入口は畳んだ。安い入口があると「安い恋愛相談」に見えて、
    // ¥2,980 のほうが高く感じる。3人ぶんの反応が ¥2,980、の一本にする。
    id: "standard",
    name: "基本相談",
    tagline: "送る前のものを、実在の女性3人に読んでもらう。",
    value: "送っていいかどうかを、出す前に確かめる。",
    yen: 2980,
    depth: 2,
    answers: 3,
    rounds: 1,
    targeting: true,
    subjects: ["photo", "message"],
    includes: [
      "実在の女性3人が読む",
      "一人ひとりの第一印象",
      "このままでOK / 少し気になる / 変えた方がいい",
      "なぜそう感じたか",
    ],
    fits: ["本命への一手", "次の誘い", "自己紹介文"],
    available: true,
    onTop: true,
    featured: true,
  },

  {
    // 実在の女性と、その場で話す。
    // 時間を決めた受け入れ方と、その場を見る体制が要る。
    // 用意できるまで available は false のまま。
    id: "call",
    name: "電話の練習",
    tagline: "本番の前に、5〜15分だけ話してみる。",
    value: "文字では分からないところを、話す前に確かめておく。",
    // 指定は 6,980〜9,800。
    // 6,980 にすると「直して、もう一度」と同額になり、
    // どちらが深いのか値段から読めなくなる。上限側に置く。
    yen: 9800,
    from: true,
    depth: 4,
    answers: 1,
    rounds: 1,
    targeting: true,
    subjects: ["call"],
    includes: [
      "実在の女性と5〜15分",
      "第一印象と、声の感じ",
      "話す速さと、間の取り方",
      "質問の仕方と、圧を感じたところ",
      "直したほうがいいところ",
    ],
    fits: ["はじめての電話", "告白の前", "関係を確かめる前"],
    available: false,
    talk: true,
    onTop: false,
  },
  {
    id: "date_ready",
    name: "会う日の前に、まとめて",
    tagline: "自己紹介文もメッセージも話し方も、ひと通り見てもらう。",
    value: "会う日の前に、要るところをまとめて見てもらう。",
    yen: 14800,
    from: true,
    depth: 5,
    answers: 10,
    rounds: 2,
    targeting: true,
    includes: [
      "「直して、もう一度」の内容すべて",
      "自己紹介文・メッセージ・当日の流れ",
      "第一印象・話し方・距離感",
      "必要なら、電話の練習も",
    ],
    fits: ["初めて会う日の前", "大事な日の前"],
    available: false,
    offline: true,
    onTop: false,
  },
];

/**
 * その人数を配るのに、最低いくら必要か。
 *
 * 回答者への下限（1人150円）×人数を、売価の6割以内に収める。
 * ここを割ると、売った時点で決済手数料と返金引当を賄えない。
 *
 * 980円 × 3人 なら 750円。通る。
 * 980円 × 5人 なら 1,250円。通らない（だから入口は3人）。
 */
export function MIN_PLAN_YEN(answers: number): number {
  return Math.ceil((150 * answers) / 0.6 / 10) * 10;
}

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

/** 何も指定されなかったときに選ばれるプラン（主力） */
export const DEFAULT_PLAN: PlanId = (
  sellable().find((p) => p.featured) ?? sellable()[0]
).id;

/** いちばん安い、買えるプラン。入口に出す */
export const ENTRY_PLAN: PlanId = [...sellable()].sort((a, b) => a.yen - b.yen)[0].id;

/* ══════════════════════════════════════════════════
   オプション
   ══════════════════════════════════════════════════

   プランを何本も並べない。基本相談 ¥2,980 から始めて、
   減らしたい不安のぶんだけ足す。

   ── 「追加で払わせる」の形にしない ──────────────
   どれも「不安をもう一段減らす」ものとして並べる。
   増やすのは金額ではなく、確かめられる範囲。

   ── 速さは約束しない ────────────────────────────
   優先対応は「先に回す」であって「何分で返る」ではない。
   実測で速さを担保できるまで、時間を書かない（supply.ts の判定）。 */

export type OptionId = "more" | "write" | "rush" | "recheck";

export type Option = {
  id: OptionId;
  name: string;
  yen: number;
  /** どんな不安のときに選ぶか。売り文句ではなく、選ぶ理由 */
  why: string;
  /** 何が変わるか */
  effect: string;
  /** 読む人数が増えるぶん */
  addAnswers?: number;
  /** もう一度確かめる工程が付くか */
  extraRound?: boolean;
  available: boolean;
};

export const OPTIONS: Option[] = [
  {
    id: "more",
    name: "女性5人に増やす",
    yen: 1000,
    why: "意見の偏りを減らしたい",
    effect: "3人ではなく5人の反応を見る",
    addAnswers: 2,
    available: true,
  },
  {
    id: "write",
    name: "文章まで作ってもらう",
    yen: 1500,
    why: "自分で直すのが不安",
    effect: "どう直すかだけでなく、そのまま送れる文章まで",
    available: true,
  },
  {
    id: "rush",
    name: "優先して回す",
    yen: 1000,
    why: "今日中に送りたい",
    effect: "ほかの相談より先に、回答をお願いする",
    available: true,
  },
  {
    id: "recheck",
    name: "直して、もう一度確かめる",
    yen: 4000,
    why: "直したあとも本当に大丈夫か確かめたい",
    effect: "直した案を、別の女性3人にもう一度読んでもらう",
    extraRound: true,
    available: true,
  },
];

const BY_OPTION = new Map(OPTIONS.map((o) => [o.id, o]));

export function option(id: OptionId): Option {
  const o = BY_OPTION.get(id);
  if (!o) throw new Error(`未定義のオプション: ${id}`);
  return o;
}

export function isOptionId(x: unknown): x is OptionId {
  return typeof x === "string" && BY_OPTION.has(x as OptionId);
}

/** 画面から来た配列を、受け付けてよいものだけに絞る（重複も落とす） */
export function cleanOptions(x: unknown): OptionId[] {
  if (!Array.isArray(x)) return [];
  const ok = x.filter(isOptionId).filter((id) => option(id).available);
  return OPTIONS.filter((o) => ok.includes(o.id)).map((o) => o.id);
}

/**
 * 実際に請求する金額。
 *
 * 画面から来た金額は一切見ない。プランIDとオプションIDだけを受け取って、
 * ここで引く。金額を受け取れる形にすると、1円で Checkout を作られる。
 */
export function priceOf(id: PlanId, options: OptionId[] = []): number {
  return cleanOptions(options).reduce((n, o) => n + option(o).yen, plan(id).yen);
}

/** 何人が読むか。オプションで増えるぶんを足す */
export function answersFor(id: PlanId, options: OptionId[] = []): number {
  return cleanOptions(options).reduce((n, o) => n + (option(o).addAnswers ?? 0), plan(id).answers);
}

/* ── 買いやすい組み合わせ ────────────────────────
   オプションを1つずつ選ばせるだけだと、何を足せばいいか決まらない。
   よく効く組み合わせを、先に3つだけ見せる。

   「人気No.1」とは書かない。まだ1件も売れていないので、
   それは実績の捏造になる（monetization.ts の判定が落とす）。 */

export type Set = {
  id: string;
  name: string;
  options: OptionId[];
  /** どんな人向けか */
  fits: string;
  /** いちばん勧めるもの */
  pick?: boolean;
};

export const SETS: Set[] = [
  { id: "base", name: "基本のまま", options: [], fits: "まず一度、反応を見てみる" },
  {
    id: "pick",
    name: "5人に増やして、文章まで",
    options: ["more", "write"],
    fits: "本命への一手。偏りも減らしたい",
    pick: true,
  },
  {
    id: "thorough",
    name: "直して、もう一度",
    options: ["recheck"],
    fits: "一度しかない場面。直したあとも確かめる",
  },
];

export function setPrice(s: Set): number {
  return priceOf(DEFAULT_PLAN, s.options);
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
  { tag: "CHECK", label: "通す", note: "審査を通った女性5人が、相手側の目で読む。" },
  { tag: "UNDERSTAND", label: "どう思われたか読む", note: "何人が大丈夫と言ったか。どこで引っかかったか。" },
  { tag: "IMPROVE", label: "直す", note: "引っかかったところを、直した案にする。" },
  { tag: "RE-TEST", label: "もう一度通す", note: "直した版を、同じ条件の別の5人に。" },
  { tag: "GO", label: "出す", note: "通ったことを確かめてから、本番へ。" },
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
    body: "AIには通した。あとは押すだけ。その直前で手が止まる。",
    category: "message",
  },
  {
    tag: "誘う前",
    q: "今日、デートに誘っていい？",
    body: "文面は作れる。「この距離感で誘われたらどう受け取るか」は、女性側にしか分からない。",
    category: "signal",
  },
  {
    tag: "会う前",
    q: "あと2時間でデート。この服と店、大丈夫？",
    body: "服も店も決めた。最後に、女性の目でどう映るかを通しておく。",
    category: "style",
  },
  {
    tag: "出す前",
    q: "自己紹介文、AとBどっち？",
    body: "特徴は説明できる。「どちらなら会いたいと思うか」は、女性側にしか分からない。",
    category: "photo",
  },
  {
    tag: "載せる前",
    q: "このプロフィール、会ってみたいと思う？",
    body: "自分では読み返せない。女性の目で、一度通しておく。",
    category: "photo",
  },
];

/* ── 公開の前に止めること ───────────────────────── */
{
  if (PLANS.length === 0) throw new Error("プランが1つもありません");
  if (sellable().length === 0) throw new Error("買えるプランが1つもありません");

  for (const p of PLANS) {
    // 実在の人の時間を扱っているので、いくらでも下げてよいわけではない。
    // 下限は「下限の報酬で、人数分を払える額」。
    // ここを割ると、売った時点で回答者に払えない。
    const floor = MIN_PLAN_YEN(p.answers);
    if (p.yen < floor) {
      throw new Error(
        `プラン「${p.id}」が安すぎます（${p.yen}円）。${p.answers}人に払うには ${floor}円 以上が要ります`,
      );
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
  // トップに出すのは3つまで。
  //
  // 一度は1つに絞っていた。ただし商品が「深さ」だけで分かれていたので、
  // 1つに絞ると、深いほうへ行く道が結果の画面にしか無くなっていた。
  //
  // いまは 入口（980円）→ 主力（2,980円）→ 直して再確認（5,980円〜）で、
  // 値段そのものが「どこまでやるか」を表している。
  // 3つ並べても、選ぶのに読む量は増えない。
  //
  // 4つ目からは増やさない。模擬電話と総点検は、必要になった場面で出す。
  if (topPlans().length > 3) {
    throw new Error(`トップの料金が ${topPlans().length} 個あります（3つまで）`);
  }
  if (topPlans().length === 0) throw new Error("トップに出すプランがありません");
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
      throw new Error(`画面の言葉に専門用語「${hit}」が入っています（通す／読まれる／確かめる で書く）`);
    }
    // 値段を否定する言葉を、買う人の画面に出さない。
    assertWeight(t, "商品の説明");
    // 誰が読むのかを濁さない。「人」と書くと、誰でもよくなる。
    assertWhoReads(t, "商品の説明");
    // 硬い言葉を混ぜない。読むのは29歳の会社員。
    assertPlain(t, "商品の説明");
  }

  // 「5回答でいくら」と書かない。個数を売るとアンケートに見える。
  for (const p of PLANS) {
    if (/\d\s*回答/.test(p.tagline)) {
      throw new Error(`プラン「${p.id}」が回答の個数を売っています（仕上げの深さで書いてください）`);
    }
  }
}
