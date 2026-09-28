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
};

export const CATEGORIES: Category[] = [
  {
    id: "message",
    label: "LINE・メッセージ",
    hint: "送る前に見てほしい／返信をどう受け取られるか",
    placeholder: "送ろうとしている文面を、そのまま貼ってください。",
  },
  {
    id: "signal",
    label: "脈あり・相手の反応",
    hint: "この反応をどう感じるか",
    placeholder: "相手のどんな反応が気になっているか、書いてください。",
  },
  {
    id: "date",
    label: "デート",
    hint: "誘い方／店選び／当日のふるまい",
    placeholder: "どこに誘おうとしているか、何が不安かを書いてください。",
  },
  {
    id: "photo",
    label: "写真・プロフィール",
    hint: "アプリの写真や自己紹介文の印象",
    placeholder: "プロフィール文をそのまま貼るか、どちらの写真か書いてください。",
  },
  {
    id: "style",
    label: "見た目・服装",
    hint: "服装や身だしなみの印象",
    placeholder: "その日の服装や、迷っている点を書いてください。",
  },
  {
    id: "romance",
    label: "恋愛",
    hint: "関係の進め方／距離の取り方",
    placeholder: "いま迷っていることを、そのまま書いてください。",
  },
  {
    id: "distance",
    label: "性・距離感",
    hint: "身体的な距離の取り方について",
    placeholder: "聞きたいことを書いてください。相手を特定できる内容は書かないでください。",
  },
  {
    id: "other",
    label: "その他",
    hint: "上のどれにも当てはまらないもの",
    placeholder: "聞きたいことを、そのまま書いてください。",
  },
];

const BY_CATEGORY = new Map(CATEGORIES.map((c) => [c.id, c]));

export function category(id: CategoryId): Category {
  const c = BY_CATEGORY.get(id);
  if (!c) throw new Error(`未定義のカテゴリ: ${id}`);
  return c;
}

export function isCategoryId(x: unknown): x is CategoryId {
  return typeof x === "string" && BY_CATEGORY.has(x as CategoryId);
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

/** 何人に聞くか。MVP は 3 と 5 だけ出す（招待した回答者がまだ少ないため） */
export const PANEL_SIZES = [3, 5, 10] as const;
export type PanelSize = (typeof PANEL_SIZES)[number];

/**
 * いま実際に募集できる人数。
 *
 * 10人を選べるように見せて集まらないと、待たせたうえで返せない。
 * 招待した回答者が増えたら、ここを上げる。
 */
export const PANEL_SIZES_OPEN: readonly PanelSize[] = [3, 5];

export function isPanelSize(x: unknown): x is PanelSize {
  return typeof x === "number" && (PANEL_SIZES as readonly number[]).includes(x);
}

/* ── 料金 ──────────────────────────────────────
   いまは請求しない。特定商取引法に基づく表記（事業者の氏名・所在地・
   電話番号・価格）が揃っていないため、日本の消費者から代金を受け取れない。
   表を先に持っておくのは、あとで金額を決め直すときに
   画面のあちこちを探さなくて済むようにするため。 */

export const PRICE_YEN: Record<PanelSize, number> = { 3: 490, 5: 890, 10: 1980 };

/** 年齢以外の属性を指定したときの上乗せ。条件に合う人を探す手間の分 */
export const ATTR_SURCHARGE_YEN = 400;

export function priceFor(size: PanelSize, attrs: AttrId[]): number {
  return PRICE_YEN[size] + (attrs.length > 0 ? ATTR_SURCHARGE_YEN : 0);
}

/**
 * 課金しているか。
 * 特商法の4項目が揃い、Stripe の設定が入るまで false のまま。
 * ここが false の間、画面には金額を出さない（出すと請求すると読める）。
 */
export const BILLING_ENABLED = false;

/* ── 相談の状態 ──────────────────────────────── */

export type Status =
  | "draft"
  | "review"
  | "recruiting"
  | "collecting"
  | "completed"
  | "cancelled";

export const STATUS_LABEL: Record<Status, string> = {
  draft: "下書き",
  review: "確認中",
  recruiting: "募集中",
  collecting: "回答が集まっています",
  completed: "回答が揃いました",
  cancelled: "取り下げ",
};

/**
 * review を挟む理由。
 *
 * 画像を添えられる以上、そこに相手の顔・LINE ID・アカウント名が
 * 写っている可能性が常にある。文字なら機械で伏せられるが、
 * 画像の中の文字と顔は、いまのこちらの手当てでは確実に消せない。
 *
 * 消せないものを「たぶん大丈夫」で回答者に配ると、
 * 晒されるのは相談者ではなく、写っている第三者になる。
 * だから画像がある相談は、人が見てから募集に進む。
 *
 * 文字だけの相談は review を通さず、そのまま募集に入る。
 */
export function initialStatus(hasImage: boolean): Status {
  return hasImage ? "review" : "recruiting";
}

/* ── 回答 ────────────────────────────────────── */

export type Verdict = "good" | "ok" | "meh" | "stop";

export const VERDICTS: { id: Verdict; label: string }[] = [
  { id: "good", label: "かなり良い" },
  { id: "ok", label: "良い" },
  { id: "meh", label: "微妙" },
  { id: "stop", label: "やめた方がいい" },
];

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

// 募集できる人数は、必ず選べる人数の一部であること。
// ここがずれると、画面に無い人数が保存され、集まらないまま止まる。
for (const n of PANEL_SIZES_OPEN) {
  if (!(PANEL_SIZES as readonly number[]).includes(n)) {
    throw new Error(`募集中の人数 ${n} が、選択肢に含まれていません`);
  }
}

if (Object.values(PRICE_YEN).some((v) => v <= 0)) {
  throw new Error("料金表の値が不正です");
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
