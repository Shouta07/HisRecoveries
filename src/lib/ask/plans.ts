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

import { isPanelSize, isOpenCategory, type AttrId, type PanelAge } from "./model";
import { assertWeight, assertWhoReads, assertPlain, assertNotCheap, assertNotScary } from "../voice";

/**
 * 売るもの。
 *
 * 値段の差は、聞く人数ではなく「本番にどれだけ近いか」。
 *   見てもらう → 反応を見る → 会話を試す → 一人について決める → 本番を再現する
 */
export type PlanId = "review" | "reaction" | "mockchat" | "call15" | "session" | "mockdate";

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

/**
 * どこまで仕上げるか。深いほど後ろの工程まで含む。
 *
 * 値段の順と同じにすること（下の判定が見ている）。
 * 高いのに浅い商品があると、高いほうを選ぶ理由が無くなる。
 */
export type Depth = 1 | 2 | 3 | 4 | 5 | 6;

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
  /**
   * 声で話す商品なら、その分数。
   *
   * ここに数を書いた商品だけが、通話の仕組み（lib/call）に乗る。
   * 終わる時刻はサーバーが持つので、画面から分数を送らせない。
   * 「30〜45分」のような幅は持たせない。幅があると、
   * 何分で切ってよいのかが決まらない。
   */
  callMinutes?: 15 | 30;
  /** トップの料金に出すか。出さないものは、必要になった場面でだけ出す */
  onTop: boolean;
  /** 一覧で目立たせるか */
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    // いま売れるのはこれだけ。文字で受け取って、文字で返す。
    // ほかの4つは、動画・チャット・通話の受け入れ手順が要る。
    id: "review",
    name: "女性目線レビュー",
    tagline: "女性から見てどう映っているかを、直し方までまとめて返す。",
    value: "感想ではなく、どこをどう直すかまで受け取る。",
    yen: 5980,
    depth: 1,
    answers: 3,
    rounds: 1,
    targeting: true,
    subjects: ["photo", "message"],
    includes: [
      "女性から見た第一印象",
      "良いところ",
      "気になったところ",
      "女性側がそう感じる理由",
      "具体的な改善案",
      "そのまま使える修正文",
      "次にやること",
    ],
    fits: ["プロフィールと自己紹介文", "送る前のLINE", "誘い方", "デートの前後"],
    available: true,
    onTop: true,
    featured: true,
  },
  {
    // 文字では出ない、見た瞬間の顔と声。
    // 収録・保管・再生・確認の仕組みが要る。まだ無い。
    id: "reaction",
    name: "リアル反応レビュー",
    tagline: "見た瞬間の表情と声まで、動画で受け取る。",
    value: "文章では分からない、その瞬間の反応を見る。",
    yen: 9800,
    depth: 3,
    answers: 1,
    rounds: 1,
    targeting: true,
    includes: [
      "見ているところの動画",
      "どこで引っかかったか",
      "どこで良いと思ったか",
      "声のトーンと間",
      "要点のまとめ",
      "改善案と、次の一手",
    ],
    fits: ["何度直しても反応が変わらないとき", "自分では違いが分からないとき"],
    available: false,
    // 動画を撮る・預かる・見せる仕組みが1つも無い。
    // 6つのうち、いちばん遠い。トップの5枠は使わない（/plans には出る）。
    onTop: false,
  },
  {
    // 実在の女性と、その場で文字のやりとりをする。
    // 1対1でつながるので、いまの約束（直接つながらない）を
    // 満たしたまま開くには、中で完結する仕組みと見守りが要る。
    id: "mockchat",
    name: "会話の練習",
    tagline: "本番の前に、一度だけ女性相手にやりとりしてみる。",
    value: "読んで覚えるのではなく、一度やってみる。",
    yen: 12800,
    depth: 4,
    answers: 1,
    rounds: 1,
    targeting: true,
    talk: true,
    includes: [
      "実在の女性とのやりとり",
      "話の間合いと、返す速さ",
      "聞き方と、自分の話の量",
      "相手への興味の示し方",
      "誘うところの切り出し方",
      "実際なら会いたいと思ったか",
    ],
    fits: ["マッチしてからが続かないとき", "会う約束まで進まないとき"],
    available: false,
    onTop: true,
  },
  {
    // いちばん短い通話。次の一手を1つだけ決めるためのもの。
    // 「相談」ではなく「1つ決める」。15分でできることを超えない。
    id: "call15",
    name: "15分だけ、声で聞く",
    tagline: "次の一手を1つだけ、声で決める。",
    value: "書いて待たずに、その場で聞いて決める。",
    yen: 7980,
    depth: 2,
    answers: 1,
    rounds: 1,
    targeting: true,
    talk: true,
    callMinutes: 15,
    includes: [
      "実在の女性と15分",
      "いま迷っていることへの反応",
      "そう感じた理由",
      "次にやること1つ",
    ],
    fits: ["このLINEを送っていいか", "今日誘っていいか", "デートの後どう動くか"],
    available: false,
    onTop: true,
  },
  {
    // 1対1で話す。時間を決めた受け入れ方と、その場を見る体制が要る。
    // 「30〜45分」の幅をやめて30分にした。
    // 幅があると、何分で切ってよいのかが決まらない。
    id: "session",
    name: "作戦会議",
    tagline: "この相手とどうするかを、30分で決める。",
    value: "一般論ではなく、目の前の一人について決める。",
    yen: 14800,
    depth: 5,
    answers: 1,
    rounds: 1,
    targeting: true,
    talk: true,
    callMinutes: 30,
    includes: [
      "実在の女性と30分",
      "いまやること",
      "やらないこと",
      "次に送る内容",
      "次に見るところ",
    ],
    fits: ["告白の前", "2回目の前", "進めるか迷っているとき"],
    available: false,
    onTop: true,
  },
  {
    // 本番を再現する。いちばん深い。
    id: "mockdate",
    name: "デートの練習",
    tagline: "初デートをそのまま一度、通しでやってみる。",
    value: "本番で初めて気づくのを、先に済ませておく。",
    yen: 19800,
    depth: 6,
    answers: 1,
    rounds: 1,
    targeting: true,
    talk: true,
    offline: true,
    includes: [
      "20〜30分の通し",
      "そのあと10分の振り返り",
      "話の流れと、話題の選び方",
      "沈黙のときの振る舞い",
      "距離の取り方",
      "本番でやること / やめること",
      "相手側から見た居心地",
    ],
    fits: ["初めて会う日の前", "一度しかない日の前"],
    available: false,
    onTop: true,
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
/**
 * トップの料金に出すもの。
 *
 * ここを画面が使っていないと、上限の判定が何も守らなくなる。
 * トップは topPlans()、/plans は PLANS を出す。
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

/**
 * 実際に請求する金額。
 *
 * 画面から来た金額は一切見ない。プランIDだけを受け取って、ここで引く。
 * 金額を受け取れる形にすると、1円で Checkout を作られる。
 *
 * オプションは持たない。値段の差は、商品そのものの深さで付ける
 * （見てもらう → 反応を見る → 会話を試す → 一人について決める → 本番を再現する）。
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
  { tag: "CHECK", label: "通す", note: "審査を通った女性5人が、相手側の目で読む。" },
  { tag: "UNDERSTAND", label: "どう思われたか読む", note: "何人が大丈夫と言ったか。どこで引っかかったか。" },
  { tag: "IMPROVE", label: "直す", note: "引っかかったところを、直した案にする。" },
  { tag: "RE-TEST", label: "もう一度通す", note: "直した版を、同じ条件の別の5人に。" },
  { tag: "GO", label: "出す", note: "通ったことを確かめてから、本番へ。" },
] as const;

/* ── 使う瞬間 ──────────────────────────────────
   「恋愛相談」と書くと、誰も自分のことだと思わない。
   押す直前に手が止まる、その瞬間だけを書く。

   ── 受け取れない場面を出さない ──────────────
   服と店（category: "style"）は、見ないと答えようがない。
   画像を受け取る口が無いので、画面に出すのは OPEN_USE_CASES のほう。
   カテゴリが開いたら、自動でここに戻ってくる。

   ── 相手を品定めする言い方にしない ────────────
   「この子、脈あり？」とは書かない。
   返ってくるのは相手の気持ちの判定ではなく、
   同じ側に立つ女性が読んで、実際にどう受け取ったか。
   判定を売ると、当たり外れのある占いになる。 */

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
    q: "この反応、どう見える？ いつ誘う？",
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
    tag: "会ったあと",
    q: "デートで何を話せば？ 次につなげたい",
    body: "話題は用意した。「それを聞かれてどう感じるか」は、女性側にしか分からない。",
    category: "date",
  },
];

/**
 * 画面に出す「使う瞬間」。
 *
 * 受け付けていないカテゴリのものは出さない。
 * 押した人が行き止まりに当たる。
 */
export const OPEN_USE_CASES = USE_CASES.filter((u) => isOpenCategory(u.category));

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
  // トップに出すのは5つまで。
  //
  // 段そのものが商品になった。
  //   見てもらう → 反応を見る → 会話を試す → 一人について決める → 本番を再現する
  // この並びを見せないと、値段の差が説明できない。
  //
  // 6つ目からは増やさない。増やすなら、どれかを畳む。
  // 実際、通話を15分と30分に分けたときに6つになったので、
  // 動画の商品（reaction）を onTop: false にして5つに戻した。
  if (topPlans().length > 5) {
    throw new Error(`トップの料金が ${topPlans().length} 個あります（5つまで）`);
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
  // 「直して、もう一度」は独立した商品ではなくなった。
  // 直し方と修正文は「女性目線レビュー」に含まれる。
  // 別の人にもう一度見てもらう工程を売るなら、そのときに
  // 値段と原価を作り直すこと（いまの ¥5,980 では原価が出ない）。

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
    // 安さで売らない。原価は答える女性への支払い。
    assertNotCheap(t, "商品の説明");
    // 怖がらせて売らない。渡すのは決めるための材料。
    assertNotScary(t, "商品の説明");
    // 誰が読むのかを濁さない。「人」と書くと、誰でもよくなる。
    assertWhoReads(t, "商品の説明");
    // 硬い言葉を混ぜない。読むのは29歳の会社員。
    assertPlain(t, "商品の説明");
  }

  // 使う瞬間が、受け付けているカテゴリだけで4つ以上あること。
  // ここが減ると「1つのことしかできないサービス」に見える。
  if (OPEN_USE_CASES.length < 4) {
    throw new Error(`画面に出せる場面が${OPEN_USE_CASES.length}個しかありません`);
  }
  // 相手の気持ちを当てる商売にしない。
  for (const u of USE_CASES) {
    if (/脈あり\?|脈あり？|この子|本命|好きかどうか|気持ちを当て/.test(u.q)) {
      throw new Error(`使う瞬間「${u.q}」が、相手の気持ちの判定になっています`);
    }
  }

  // 声で話す商品の決まりごと。
  // 通話は1対1で、分数はサーバーが持つ。ここが崩れると時間を切れない。
  for (const p of PLANS) {
    if (p.callMinutes === undefined) continue;
    if (!p.talk) throw new Error(`プラン「${p.id}」に分数があるのに、話す商品になっていません`);
    if (p.answers !== 1) throw new Error(`プラン「${p.id}」は通話です。人数は1にしてください`);
    if (p.offline) throw new Error(`プラン「${p.id}」は通話です。対面と混ぜないでください`);
    // 何分かを、買う人の画面にも必ず書く。書いていないと、
    // 切れたときに「まだ話せると思っていた」になる。
    if (!p.includes.some((x) => x.includes(`${p.callMinutes}分`))) {
      throw new Error(`プラン「${p.id}」に「${p.callMinutes}分」と書かれていません`);
    }
    // 幅で書かない。幅があると、何分で切ってよいのかが決まらない。
    if (/〜\s*\d+分|\d+\s*〜\s*\d+/.test(p.tagline)) {
      throw new Error(`プラン「${p.id}」の分数が幅になっています（${p.tagline}）`);
    }
  }
  // 通話の商品が2つあること（15分と30分）。
  // 1つだけだと、短く試してから深く、が作れない。
  const mins = PLANS.filter((p) => p.callMinutes).map((p) => p.callMinutes);
  for (const m of [15, 30] as const) {
    if (!mins.includes(m)) throw new Error(`${m}分の通話プランがありません`);
  }

  // 「5回答でいくら」と書かない。個数を売るとアンケートに見える。
  for (const p of PLANS) {
    if (/\d\s*回答/.test(p.tagline)) {
      throw new Error(`プラン「${p.id}」が回答の個数を売っています（仕上げの深さで書いてください）`);
    }
  }
}
