// 「女性に聞く」の定義。画面より先に、ここに言葉と規則を置く。
//
// ── AIを前面に出さない ────────────────────────────
// 価値は「生身の人間が実際にどう感じるか」にある。
// AIは 整理・匿名化・振り分け・要約 の裏方だけ。
// 「AIがこう思う」は、この製品のどこにも出さない。
//
// ── 扱わないものを、型で決めておく ────────────────
// 違法・非同意・ハラスメント・個人情報晒しは扱わない。
// 「運用で気をつける」ではなく、投稿の段階で止める。

/* ── 相談のカテゴリ ────────────────────────────── */

export type CategoryId =
  | "message"
  | "signal"
  | "date"
  | "photo"
  | "style"
  | "romance"
  | "distance"
  | "other";

export type Category = {
  id: CategoryId;
  label: string;
  /** 選ぶときの手がかり。カテゴリ名だけだと、どこに入れるか迷う */
  hint: string;
  /** その場で出す例文。空欄を前にして固まるのを防ぐ */
  placeholder: string;
  /**
   * いま受け付けているか。
   *
   * 画像を受け取る口が無いので、写真を見ないと答えられない相談は
   * 受けない。受けると、払った人に「写真をください」と言えないまま
   * 止まる。選ばせないところで止める。
   */
  available: boolean;
};

export const CATEGORIES: Category[] = [
  {
    id: "message",
    label: "LINE・メッセージ",
    hint: "送る前に見てほしい／返信をどう受け取られるか",
    placeholder: "送ろうとしている文面を、そのまま貼ってください。",
    available: true,
  },
  {
    id: "signal",
    label: "脈あり・相手の反応",
    hint: "この反応をどう感じるか",
    placeholder: "相手のどんな反応が気になっているか、書いてください。",
    available: true,
  },
  {
    id: "date",
    label: "デート",
    hint: "誘い方／店選び／当日のふるまい",
    placeholder: "どこに誘おうとしているか、何が不安かを書いてください。",
    available: true,
  },
  {
    id: "photo",
    label: "自己紹介文",
    hint: "アプリのプロフィール文の印象",
    placeholder: "いまの自己紹介文を、そのまま貼ってください。",
    available: true,
  },
  {
    // 服装は、見ないと答えようがない。画像を受け取る口ができるまでは出さない。
    id: "style",
    label: "見た目・服装",
    hint: "服装や身だしなみの印象",
    placeholder: "その日の服装や、迷っている点を書いてください。",
    available: false,
  },
  {
    id: "romance",
    label: "恋愛",
    hint: "関係の進め方／距離の取り方",
    placeholder: "いま迷っていることを、そのまま書いてください。",
    available: true,
  },
  {
    // 言いにくい相談。
    // 受けると決めた女性にだけ回る（responders.takes_sensitive）。
    // 扱うのは相談者と相手の関係で、答える女性本人のことではない。
    // 線は lib/ask/sensitive.ts に置いてある。
    id: "distance",
    label: "距離感・言いにくいこと",
    hint: "距離の縮め方／触れ方／付き合う前の関係／性の価値観",
    placeholder:
      "相手からどう見えるかを聞く形で書いてください。相手を特定できる内容は書かないでください。",
    available: true,
  },
  {
    id: "other",
    label: "その他",
    hint: "上のどれにも当てはまらないもの",
    placeholder: "聞きたいことを、そのまま書いてください。",
    available: true,
  },
];

/**
 * 書き出しの候補。
 *
 * ══════════════════════════════════════════════════
 * 空の箱を見せない
 * ══════════════════════════════════════════════════
 * いちばん手が止まるのは、空の入力欄を前にした瞬間。
 * 「思っていることを書いてください」と言われて書ける人は、
 * そもそもあまり困っていない。
 *
 * よくある書き出しを並べて、押したら入るようにする。
 * 入ったあとは自分の言葉に直せばいい。
 * ゼロから書くのと、直すのとでは、手間がまるで違う。
 *
 * ══════════════════════════════════════════════════
 * 選択肢にしない
 * ══════════════════════════════════════════════════
 * これは「当てはまるものを選ぶ」ではなく、書き出し。
 * 押すと文章の続きを自分で書くことになる。
 * ここで完結させると、その人の事情が何も入らない相談になる。
 *
 * ══════════════════════════════════════════════════
 * 受け取れないものを書かない
 * ══════════════════════════════════════════════════
 * 写真・スクショ・服装は置けない。画像を受け取る口が無い。
 * 下の判定が弾く。
 */
export const STARTERS: Record<CategoryId, string[]> = {
  message: [
    "この文面で送っていいか、見てほしいです。",
    "返信が遅いので、追って送っていいか迷っています。",
    "デートのあと、なんと送ればいいか決められません。",
  ],
  signal: [
    "相手の返事がそっけない気がして、どう受け取ればいいか分かりません。",
    "返信は来るけれど、質問が返ってこないのが気になっています。",
    "会ったあとの反応が読めず、次に動いていいか迷っています。",
  ],
  date: [
    "この誘い方で、重く思われないか気になっています。",
    "次に会う約束を、どう切り出すか迷っています。",
    // 文字だけの書き出しにしない。
    // 電話の前と、会って話す前は、困り方がまるで違う。
    // 文面なら書き直せるが、声はその場で返すしかない。
    "電話することになったのですが、何を話せばいいか分かりません。",
    "会ったときに黙ってしまいそうで、それが不安です。",
  ],
  photo: [
    "いまの自己紹介文が、どう読まれているか知りたいです。",
    "書き出しの一行を、どちらにするか決められません。",
    "趣味をどこまで書くか迷っています。",
  ],
  style: ["その日の服装で、迷っているところがあります。"],
  romance: [
    "関係を進めたいのですが、切り出し方が分かりません。",
    "告白していいのか、もう少し待つべきか迷っています。",
    "いまの距離感のまま進めていいか、気になっています。",
    "そろそろ電話に誘いたいのですが、切り出し方が分かりません。",
  ],
  distance: [
    "この距離感が、相手からどう見えているか知りたいです。",
    "どのくらいの間柄なら自然なのか分かりません。",
    "この話題を、どう切り出せば嫌ではないか知りたいです。",
  ],
  other: [
    "いま迷っていることがあります。",
    "どう動けばいいか決められずにいます。",
  ],
};

/** そのカテゴリの書き出し。受け付けていないカテゴリでは空 */
export function startersFor(id: CategoryId): string[] {
  return category(id).available ? (STARTERS[id] ?? []) : [];
}

/* ── 公開の前に止めること ─────────────────────────
   書き出しは、そのまま相談の1行目になる。
   ここに置けないものが混ざると、そのまま画面に出る。 */
{
  const asksForImage = /写真|画像|スクショ|スクリーンショット|添付/;
  for (const [id, list] of Object.entries(STARTERS)) {
    const c = CATEGORIES.find((x) => x.id === id);
    if (!c) throw new Error(`書き出しのカテゴリ「${id}」がありません`);
    if (!c.available) continue;
    if (list.length < 2) {
      throw new Error(`「${c.label}」の書き出しが少なすぎます（2つ以上）`);
    }
    for (const t of list) {
      if (asksForImage.test(t)) {
        throw new Error(`「${c.label}」の書き出しが画像を前提にしています（${t}）`);
      }
      // 選択肢ではなく書き出し。文として終わっていること。
      if (!t.endsWith("。")) {
        throw new Error(`書き出し「${t}」が文になっていません`);
      }
      // 相手の気持ちを当てる形にしない。
      if (/脈あり|本命|好きかどうか/.test(t)) {
        throw new Error(`書き出し「${t}」が、相手の気持ちの判定になっています`);
      }
    }
  }

  // 書き出しが、文字のことばかりにならないこと。
  //
  // 全部が「この文面で…」だと、開いた人は
  // 「送る前のLINEを見てもらう場所」としか思わない。
  // 電話の前や、会って話す前の不安は、そもそも相談できると思われない。
  {
    // 「話す」「話せ」は入れない。文字の相談でも普通に出てくる言葉で、
    // それで通ると、この判定は何も守らなくなる
    const VOICE = /電話|声|沈黙|黙っ/;
    const all = Object.entries(STARTERS)
      .filter(([id]) => CATEGORIES.find((x) => x.id === id)?.available)
      .flatMap(([, list]) => list);
    if (!all.some((t) => VOICE.test(t))) {
      throw new Error("書き出しが、文字の相談だけになっています（電話や会話の場面も置いてください）");
    }
  }

  // 受け付けているカテゴリには、必ず書き出しがあること。
  //
  // ここで startersFor() を呼ぶと、その中の category() が
  // この下で作られる BY_CATEGORY を読みに行って、読み込み時に落ちる。
  // 見るのは表そのものにする。
  for (const c of CATEGORIES.filter((x) => x.available)) {
    if ((STARTERS[c.id] ?? []).length === 0) {
      throw new Error(`「${c.label}」に書き出しがありません（空の箱を見せることになります）`);
    }
  }
}

const BY_CATEGORY = new Map(CATEGORIES.map((c) => [c.id, c]));

/** いま選べるカテゴリ。画面はこれだけ出す */
export const OPEN_CATEGORIES = CATEGORIES.filter((c) => c.available);

/* ── 受け取れないものを、聞かない ─────────────────
   相談に画像を添える口はまだ無い（api/consult は文字だけ受ける）。
   それなのに「写真を送って」と書いてあると、払った人が送れずに止まる。
   受け付けているカテゴリの文面から、画像を求める言葉を禁じる。

   画像を受け取れるようにしたら、この判定を外してよい。
   外すまでは、ここがビルドを落とす。 */
{
  const asksForImage = /写真|画像|スクショ|スクリーンショット|添付/;
  for (const c of OPEN_CATEGORIES) {
    const where = [c.label, c.hint, c.placeholder].find((t) => asksForImage.test(t));
    if (where) {
      throw new Error(
        `「${c.label}」が画像を求めています（${where}）。いまは文字しか受け取れません`,
      );
    }
  }
  if (OPEN_CATEGORIES.length < 3) throw new Error("選べるカテゴリが少なすぎます");
}

export function category(id: CategoryId): Category {
  const c = BY_CATEGORY.get(id);
  if (!c) throw new Error(`未定義のカテゴリ: ${id}`);
  return c;
}

export function isCategoryId(x: unknown): x is CategoryId {
  return typeof x === "string" && BY_CATEGORY.has(x as CategoryId);
}

/** いま受け付けているカテゴリか。API はこちらで判定する */
export function isOpenCategory(x: unknown): x is CategoryId {
  return isCategoryId(x) && category(x).available;
}

/* ── 状況（回答者が判断するのに要る最小限）──────────
   自由入力を増やさない。30秒〜1分で出せることを優先する。
   ここで聞いていないことは、回答者にも分からないままになる。
   だから「これが無いと答えようがない」ものだけを置く。 */

export const AGE_BANDS = ["18-19", "20-24", "25-29", "30-34", "35-39", "40-49", "50+"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export function isAgeBand(x: unknown): x is AgeBand {
  return typeof x === "string" && (AGE_BANDS as readonly string[]).includes(x);
}

export type RelationId =
  | "matched"
  | "messaging"
  | "met_once"
  | "met_few"
  | "dating"
  | "friend"
  | "colleague"
  | "unknown";

export const RELATIONS: { id: RelationId; label: string }[] = [
  { id: "matched", label: "マッチしたばかり" },
  { id: "messaging", label: "メッセージしている" },
  { id: "met_once", label: "一度会った" },
  { id: "met_few", label: "何度か会っている" },
  { id: "dating", label: "交際している" },
  { id: "friend", label: "友人・知人" },
  { id: "colleague", label: "職場・学校" },
  { id: "unknown", label: "まだ関係と言えるものはない" },
];

export function isRelationId(x: unknown): x is RelationId {
  return typeof x === "string" && RELATIONS.some((r) => r.id === x);
}

/* ── 誰に聞くか ────────────────────────────────
   ここがこの製品のいちばん大事なところ。
   「誰か女性に聞いた」と「気になっている相手に近い5人に聞いた」は、
   同じ回答数でも、受け取る側にとって別のものになる。

   匿名掲示板との違いは、回答者が分からないことではなく、
   回答者が何者かが分かることのほう。 */

export type PanelAge = "20-24" | "25-29" | "30s" | "any";

export const PANEL_AGES: { id: PanelAge; label: string }[] = [
  { id: "20-24", label: "20〜24歳の女性" },
  { id: "25-29", label: "25〜29歳の女性" },
  { id: "30s", label: "30代の女性" },
  { id: "any", label: "年齢の指定なし" },
];

export function isPanelAge(x: unknown): x is PanelAge {
  return typeof x === "string" && PANEL_AGES.some((p) => p.id === x);
}

/**
 * 年齢以外の属性。
 *
 * ── 増やしすぎない ──────────────────────────
 * 指定を細かくするほど、条件に合う回答者がいなくなる。
 * 招待している人数が少ないいまは、2つだけ出す。
 * 回答者が増えたら、下の ATTRS に足していく（型と画面は変えなくて済む）。
 *
 * ── 無いものを選ばせない ──────────────────────
 * open が false のものは画面に出さない。
 * 選べるのに集まらない、がいちばん体験を壊す。
 */
export type AttrId = "app_user" | "single" | "married" | "experienced";

export const ATTRS: { id: AttrId; label: string; open: boolean }[] = [
  { id: "app_user", label: "マッチングアプリ経験あり", open: true },
  { id: "single", label: "いまは恋人がいない", open: true },
  { id: "married", label: "既婚", open: false },
  { id: "experienced", label: "交際経験が多い", open: false },
];

export const ATTRS_OPEN = ATTRS.filter((a) => a.open);

export function isAttrId(x: unknown): x is AttrId {
  return typeof x === "string" && ATTRS.some((a) => a.id === x);
}

/** 画面から来た属性の配列を、選ばせてよいものだけに絞る */
export function cleanAttrs(x: unknown): AttrId[] {
  if (!Array.isArray(x)) return [];
  const ok = new Set(ATTRS_OPEN.map((a) => a.id));
  return [...new Set(x.filter((v): v is AttrId => isAttrId(v) && ok.has(v)))];
}

export function attrLabel(id: string): string {
  return ATTRS.find((a) => a.id === id)?.label ?? id;
}

/* ── 回答する側 ────────────────────────────────
   登録画面（/join）で聞くこと。相談側とは分けて持つ。 */

/**
 * 回答者として登録できる年代。
 *
 * 18-19 を入れていないのは、相談者が指定できる年代（PANEL_AGES）が
 * 20-24 からだから。登録できても一度も依頼が届かないことになる。
 * 選べるのに出番が来ない、を作らない。
 */
export const RESPONDER_AGES = [
  { id: "20-24", label: "20〜24歳" },
  { id: "25-29", label: "25〜29歳" },
  { id: "30-34", label: "30〜34歳" },
  { id: "35-39", label: "35〜39歳" },
  { id: "40-49", label: "40代" },
  { id: "50+", label: "50歳以上" },
] as const;

export type ResponderAge = (typeof RESPONDER_AGES)[number]["id"];

export function isResponderAge(x: unknown): x is ResponderAge {
  return typeof x === "string" && RESPONDER_AGES.some((a) => a.id === x);
}

/**
 * 職業のカテゴリ。
 *
 * ── なぜ聞くか ──────────────────────────────
 * 「女性3人が読みました」と「25〜29歳・医療・福祉の人が読みました」は、
 * 同じ回答でも受け取り方が変わる。誰が読んだのかが分かることが、
 * 匿名掲示板との違いそのもの。
 *
 * ── どこで止めるか ──────────────────────────
 * 会社名も、細かい職種も持たない。
 * 年代・地域・職業が細かいまま3つ揃うと、それで個人が絞れる。
 * だからカテゴリの粗さで止める。任意の項目にする。
 */
export const JOB_BANDS = [
  { id: "office", label: "事務・オフィスワーク" },
  { id: "sales", label: "営業・販売" },
  { id: "medical", label: "医療・福祉" },
  { id: "edu", label: "教育・保育" },
  { id: "beauty", label: "美容・アパレル" },
  { id: "creative", label: "IT・クリエイティブ" },
  { id: "pro", label: "専門職" },
  { id: "student", label: "学生" },
  { id: "other", label: "その他" },
] as const;

export type JobBand = (typeof JOB_BANDS)[number]["id"];

export function isJobBand(x: unknown): x is JobBand {
  return typeof x === "string" && JOB_BANDS.some((j) => j.id === x);
}

export function jobLabel(id: string | null): string | null {
  return JOB_BANDS.find((j) => j.id === id)?.label ?? null;
}

/**
 * 回答の書き方。
 *
 * ── 「恋愛スタイル」は聞かない ──────────────────
 * どんな恋愛をする人かを並べると、回答者を品ぞろえとして見せることになる。
 * ここで売っているのは回答者の恋愛観ではなく、
 * 「読んで、どう感じたかを言葉にして返す」仕事。
 * だから聞くのは、その仕事の癖だけにする。
 */
export const TONES = [
  { id: "straight", label: "はっきり書く" },
  { id: "gentle", label: "やわらかく書く" },
  { id: "reason", label: "理由をていねいに書く" },
] as const;

export type Tone = (typeof TONES)[number]["id"];

export function isTone(x: unknown): x is Tone {
  return typeof x === "string" && TONES.some((t) => t.id === x);
}

export function toneLabel(id: string | null): string | null {
  return TONES.find((t) => t.id === id)?.label ?? null;
}

/* ── 回答者の見せ方で、止めること ─────────────────
   回答者を「品ぞろえ」として見せない。
   ここに色気・癒し・疑似恋愛の言葉が入った時点で、別の商売になる。 */
{
  const WRONG = /色気|セクシー|癒|甘え|かわいい|美人|ギャル|お姉さん|清楚|巨乳|スタイル抜群/;
  for (const t of [...JOB_BANDS.map((j) => j.label), ...TONES.map((x) => x.label)]) {
    if (WRONG.test(t)) {
      throw new Error(`回答者の見せ方が、人を品ぞろえにしています（${t}）`);
    }
  }
  // 会社名・学校名を聞く形になっていないこと。
  for (const j of JOB_BANDS) {
    if (/株式会社|大学名|勤務先|会社名/.test(j.label)) {
      throw new Error(`職業の選択肢が細かすぎます（${j.label}）`);
    }
  }
  if (new Set(JOB_BANDS.map((j) => j.id)).size !== JOB_BANDS.length) {
    throw new Error("職業カテゴリのIDが重複しています");
  }
  if (new Set(TONES.map((t) => t.id)).size !== TONES.length) {
    throw new Error("回答の書き方のIDが重複しています");
  }
}

/**
 * 地域。都道府県より粗くする。
 * 市区町村まで持つと、年代と得意分野と合わせて個人が絞れてしまう。
 */
export const AREAS = [
  "東京", "神奈川・千葉・埼玉", "関西", "東海", "北海道・東北",
  "北陸・甲信越", "中国・四国", "九州・沖縄", "国外",
] as const;
export type Area = (typeof AREAS)[number];

export function isArea(x: unknown): x is Area {
  return typeof x === "string" && (AREAS as readonly string[]).includes(x);
}

/**
 * 登録時に聞く属性。
 *
 * 相談者がまだ指定できないもの（ATTRS の open: false）も聞く。
 * 集まっていないから指定させられないだけなので、
 * 集めるほうを先にやらないと、いつまでも増えない。
 */
export function cleanResponderAttrs(x: unknown): AttrId[] {
  if (!Array.isArray(x)) return [];
  return [...new Set(x.filter((v): v is AttrId => isAttrId(v)))];
}

/** 何人に聞くか。実際に何人になるかはプランが決める（ask/plans.ts） */
/**
 * 何人が担当するか。
 *
 * 1 を足したのは、1人が深く担当する商品ができたため
 * （動画の反応、会話の練習、作戦会議、デートの練習）。
 * これらは人数ではなく、本番への近さで値段が決まる。
 */
export const PANEL_SIZES = [1, 3, 5, 10] as const;
export type PanelSize = (typeof PANEL_SIZES)[number];

export function isPanelSize(x: unknown): x is PanelSize {
  return typeof x === "number" && (PANEL_SIZES as readonly number[]).includes(x);
}

/* ── 料金はここに置かない ──────────────────────
   金額・人数・条件を指定できるかは ask/plans.ts の PLANS が唯一の出どころ。
   ここに表を持つと二重管理になり、画面とサーバーで違う金額を見る日が来る。
   価格を引くのは priceOf(planId)、人数は plan(planId).answers。

   請求できるかどうかは lib/legal.ts の canCharge() が決める。
   特定商取引法に基づく表記が揃い、Stripe の鍵が入るまで false のまま。 */

/* ── 相談の状態 ──────────────────────────────── */

export type Status =
  | "draft"
  | "payment_pending"
  | "review"
  | "recruiting"
  | "collecting"
  | "completed"
  | "refunded"
  | "cancelled";

export const STATUS_LABEL: Record<Status, string> = {
  draft: "お支払い前",
  payment_pending: "お支払いの確認中",
  review: "確認中",
  recruiting: "募集中",
  collecting: "回答が集まっています",
  completed: "回答が揃いました",
  refunded: "返金済み",
  cancelled: "取り下げ",
};

/**
 * 相談を受け取った直後の状態。
 *
 * 有料にしたので、受け取った時点ではまだ何も配らない。
 * 必ず draft から始まり、Stripe の Webhook が支払いを確認してから
 * 募集に進む。ここで recruiting を返すと、払っていない相談が
 * 回答者に配られる。
 */
export function initialStatus(): Status {
  return "draft";
}

/**
 * 人が見てから配るかどうか。
 *
 * 画像を添えられる以上、そこに相手の顔・LINE ID・アカウント名が
 * 写っている可能性が常にある。文字なら機械で伏せられるが、
 * 画像の中の文字と顔は、いまのこちらの手当てでは確実に消せない。
 *
 * 消せないものを「たぶん大丈夫」で回答者に配ると、
 * 晒されるのは相談者ではなく、写っている第三者になる。
 * だから画像がある相談は、支払いのあとも人が見てから募集に進む。
 *
 * 支払いの確認が draft → recruiting を動かすので、
 * この判断は相談を受け取った時点で保存しておく必要がある。
 */
export function needsReview(hasImage: boolean): boolean {
  return hasImage;
}

/* ── 回答 ────────────────────────────────────── */

/**
 * 評価ではなく、次の行動で答えてもらう。
 *
 * ── なぜ「良い／微妙」をやめたか ────────────────
 * 「かなり良い／良い／微妙／やめた方がいい」は、点数を付ける言葉だった。
 * 点数だけ返しても、相談した人は次に何をすればいいか分からない。
 * そして回答する側も、点を付けるつもりになると甘い側に寄る
 * （知らない人に低い点を付けるのは、気が重い）。
 *
 * 聞きたいのは「このまま出していいか」だけ。
 * 3段にして、真ん中に「少し気になる」を置く。
 * ここが押しやすいと、引っかかった点が出てくる。
 */
export type Verdict = "as_is" | "slight" | "change";

export const VERDICTS: { id: Verdict; label: string; hint: string }[] = [
  { id: "as_is", label: "このままでOK", hint: "直さなくていいと思う" },
  { id: "slight", label: "少し気になる", hint: "出せるが、引っかかるところがある" },
  { id: "change", label: "変えた方がいい", hint: "このままだと損をしそう" },
];

/** 直さずに出していい、と言われた側か */
export function isFine(v: Verdict | null): boolean {
  return v === "as_is";
}

export function isVerdict(x: unknown): x is Verdict {
  return typeof x === "string" && VERDICTS.some((v) => v.id === x);
}

/**
 * カテゴリごとの、もう1つの問い。
 *
 * 「良い／微妙」だけだと、相談者が知りたいことに一歩届かない。
 * LINE なら「で、返信したいと思った？」まで聞けて初めて役に立つ。
 *
 * ── 1つだけにする ────────────────────────────
 * 2つ足すと回答の所要時間が倍になり、回答率が落ちる。
 * カテゴリごとに、いちばん効く1問だけを持つ。
 * 無いカテゴリは無いままにする（無理に作らない）。
 */
export const SECOND_ASK: Partial<Record<CategoryId, string>> = {
  message: "あなたなら、返信したいと思いますか？",
  signal: "あなたなら、脈があると受け取りますか？",
  date: "あなたなら、その誘いに乗りますか？",
  photo: "あなたなら、この人と会ってみたいと思いますか？",
  style: "あなたなら、一緒に歩いて気にならないと思いますか？",
};

export type Second = "yes" | "no";

export const SECONDS: { id: Second; label: string }[] = [
  { id: "yes", label: "はい" },
  { id: "no", label: "いいえ" },
];

export function isSecond(x: unknown): x is Second {
  return typeof x === "string" && SECONDS.some((s) => s.id === x);
}

/** A/B のときだけ使う */
export type Pick = "a" | "b" | "neither";

export const PICKS: { id: Pick; label: string }[] = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "neither", label: "どちらでもない" },
];

export function isPick(x: unknown): x is Pick {
  return typeof x === "string" && PICKS.some((p) => p.id === x);
}

/** コメントの長さ。短すぎると理由が分からず、長すぎると書かれない */
export const COMMENT_MIN = 20;
export const COMMENT_MAX = 400;

/* ── 扱わないもの ──────────────────────────────
   投稿の段階で止める。運用の心がけにしない。
   ここに並ぶのは「相談として成立しないもの」ではなく、
   「答えると誰かが害を受けるもの」だけ。 */

const BLOCK_PATTERNS: { re: RegExp; why: string }[] = [
  {
    re: /(盗撮|隠し撮り|のぞき|覗き見|寝てる間に|寝ている間に)/,
    why: "同意のない撮影・行為にあたる内容は扱えません。",
  },
  {
    re: /(泥酔させ|酔わせて|薬を盛|睡眠薬|媚薬)/,
    why: "相手の判断力を奪う方法は扱えません。",
  },
  {
    re: /(復讐|晒す|晒して|拡散して|特定して|住所を調べ|身元を調べ|裏垢を探)/,
    why: "特定・晒しにつながる内容は扱えません。",
  },
  {
    re: /(無理やり|むりやり|嫌がって|拒否されて.{0,8}(続け|押し)|断られて.{0,8}(続け|押し))/,
    why: "相手が断っていることを続ける前提の相談は扱えません。",
  },
  { re: /(パパ活|援助交際|売春|買春|港区女子.{0,6}稼)/, why: "対価を伴う性的関係は扱えません。" },
  { re: /(未成年|高校生|中学生|JK|16歳|17歳|15歳)/, why: "18歳未満に関する相談は扱えません。" },
  { re: /(盗聴|GPSを.{0,6}(付|つ)け|位置情報を.{0,8}(監視|追跡)|スマホを勝手に)/, why: "監視にあたる行為は扱えません。" },
];

export type Block = { ok: true } | { ok: false; why: string };

/** 投稿してよい内容か。止めるときは、理由を必ず返す */
export function screen(text: string): Block {
  for (const b of BLOCK_PATTERNS) {
    if (b.re.test(text)) return { ok: false, why: b.why };
  }
  return { ok: true };
}

/* ── 公開の前に止めること ────────────────────────
   この製品で最も言ってはいけないのは、
   「AIがあなたの恋愛を判定します」の類。
   画面の言葉がそちらへ寄っていないかを、ビルドで確かめる。 */

const BANNED = [
  "AIが診断", "AIが判定", "AIが分析", "AIがアドバイス", "AIの回答",
  "落とす", "攻略", "必ず", "絶対", "成功率", "モテ",
];

{
  const texts = [
    ...CATEGORIES.flatMap((c) => [c.label, c.hint, c.placeholder]),
    ...RELATIONS.map((r) => r.label),
    ...PANEL_AGES.map((p) => p.label),
    ...ATTRS.map((a) => a.label),
    ...Object.values(SECOND_ASK).filter((s): s is string => Boolean(s)),
    ...VERDICTS.map((v) => v.label),
    ...Object.values(STATUS_LABEL),
    ...BLOCK_PATTERNS.map((b) => b.why),
  ];
  for (const t of texts) {
    const hit = BANNED.find((b) => t.includes(b));
    if (hit) {
      throw new Error(`画面の言葉に「${hit}」が入っています（AIを前面に出さない／攻略語を使わない）`);
    }
  }
}

// 受け取った直後に配れる状態になっていないこと。
// ここが recruiting に戻ると、払っていない相談が回答者に流れる。
if (initialStatus() !== "draft") {
  throw new Error("相談は必ず draft から始めてください（支払い前に配らない）");
}

// もう1つの問いは、必ず実在するカテゴリに付いていること。
// カテゴリ名を変えたときに、問いだけ取り残されると、
// 誰にも出ないまま残り続ける。
for (const id of Object.keys(SECOND_ASK)) {
  if (!BY_CATEGORY.has(id as CategoryId)) {
    throw new Error(`もう1つの問いが、存在しないカテゴリ「${id}」に付いています`);
  }
}

// 回答者として登録できる年代が、相談者が指定できる年代と噛み合っているか。
// ここがずれると、登録しても一度も依頼が届かない人が出る。
{
  const panel = new Set(PANEL_AGES.filter((p) => p.id !== "any").map((p) => p.id));
  const reachable = RESPONDER_AGES.filter(
    (a) => panel.has(a.id as never) || (a.id.startsWith("3") && panel.has("30s" as never)),
  );
  if (reachable.length === 0) {
    throw new Error("登録できる年代のうち、相談者が指定できるものが1つもありません");
  }
}

// 画面に出す属性が1つも無い状態にしない。
// 「誰に聞くか」を選べないなら、この製品は掲示板と変わらない。
if (ATTRS_OPEN.length === 0) {
  throw new Error("指定できる属性が1つもありません（誰に聞くかが、この製品の価値です）");
}
