// Relationship Journey の8段階。
//
// ── 直線の達成ゲームにしない ────────────────────────
// 「STEP 4/7」「進捗57%」は出さない。恋愛は前に進むほど良いものではなく、
// 戻ることも、止まることも、やめることも等しく正当な選択。
// だから段階は「順位」ではなく「いまどのあたりか」を指す言葉として持つ。
//
// ── 相手を管理しない ──────────────────────────────
// 段階は本人の現在地であって、特定の相手の攻略度ではない。
// 相手ごとに段階を持たせると、その瞬間にCRMになる。
// 持つのは「自分がいま、だいたいどのあたりにいるか」1つだけ。
//
// ── 既存の資産との接続 ────────────────────────────
// 記事55本は全部「自分を整える」に乗る（実測で、他7段階に主題の記事は0本）。
// 空の段階を埋まっているように見せない。0件は0件と書く。

export type StageId =
  | "prepare"
  | "meet"
  | "talk"
  | "date"
  | "again"
  | "know"
  | "consider"
  | "grow";

export type Stage = {
  id: StageId;
  /** タブやカードに出す短い名前 */
  label: string;
  /** その段階が、どういう時期かを1文で。説明ではなく描写にする */
  where: string;
  /** この段階でよくある迷い。断定しない書き方にそろえる */
  doubts: string[];
  /** 「いま、考えてみること」の候補。命令しない */
  prompts: string[];
};

export const STAGES: Stage[] = [
  {
    id: "prepare",
    label: "自分を整える",
    where: "誰かに会う前に、自分の側を整えているところ。",
    doubts: ["何から手をつければいいか分からない", "やることが多すぎて続かない"],
    prompts: [
      "気になっている場所と、先に手をつける場所は、同じとはかぎりません。",
      "いま気にしていないものは、そのままで構いません。",
    ],
  },
  {
    id: "meet",
    label: "出会う",
    where: "これから出会おうとしているところ。",
    doubts: ["写真をどうすればいいか分からない", "何を書けばいいか分からない"],
    prompts: ["実物と離れるほど、会ったあとで不利になります。"],
  },
  {
    id: "talk",
    label: "話す",
    where: "やりとりが始まって、まだ会っていないところ。",
    doubts: ["話が続かない", "どこで会う話を切り出すか分からない"],
    prompts: ["続かないのは相性の問題とはかぎりません。話題の設計の話かもしれません。"],
  },
  {
    id: "date",
    label: "会う",
    where: "会う予定があるか、一度会ったところ。",
    doubts: ["何を話せばいいか", "緊張してうまく話せなかった"],
    prompts: ["相手がどう思ったかの前に、自分がどうだったかを先に書いておくと、あとで読み返せます。"],
  },
  {
    id: "again",
    label: "また会う",
    where: "一度会って、これからを考えているところ。",
    doubts: ["また誘っていいのか分からない", "脈があるのか分からない"],
    prompts: [
      "相手の気持ちは分かりません。分かるのは、自分がもう一度会いたいかどうかです。",
      "そこが決まっていないまま誘うと、返事のほうに振り回されます。",
    ],
  },
  {
    id: "know",
    label: "相手を知る",
    where: "何度か会って、相手のことが少しずつ分かってきたところ。",
    doubts: ["合っているのか分からない", "無理に合わせていないか不安"],
    prompts: ["自然体でいられた日と、そうでない日を分けて残しておくと、あとで効いてきます。"],
  },
  {
    id: "consider",
    label: "関係を考える",
    where: "この関係をどうするか、考えているところ。",
    doubts: ["進めるべきか迷っている", "自分の気持ちがはっきりしない"],
    prompts: ["急いで決めなくて構いません。決めないことも、いまの選択です。"],
  },
  {
    id: "grow",
    label: "関係を育てる",
    where: "続いている関係を、これからも続けていくところ。",
    doubts: ["最初のころと変わってきた気がする"],
    prompts: ["変わったこと自体は、悪いことではありません。"],
  },
];

const BY_ID = new Map(STAGES.map((s) => [s.id, s]));

export function stage(id: StageId): Stage {
  const s = BY_ID.get(id);
  if (!s) throw new Error(`未定義の段階: ${id}`);
  return s;
}

export function isStageId(x: unknown): x is StageId {
  return typeof x === "string" && BY_ID.has(x as StageId);
}

/** オンボーディングで出す順。現在地を選んでもらうだけで、順位は付けない */
export const ONBOARDING_CHOICES: { id: StageId; label: string }[] = [
  { id: "prepare", label: "これから出会いたい" },
  { id: "meet", label: "最近マッチした" },
  { id: "talk", label: "メッセージしている" },
  { id: "date", label: "会う予定がある" },
  { id: "again", label: "一度会った" },
  { id: "know", label: "何度か会っている" },
  { id: "consider", label: "関係について考えている" },
];

export const AGE_GROUPS = ["18-19", "20代", "30代", "40代", "50代"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

// 命令形・断定・攻略語が入っていないかを、公開の前に確かめる。
// ここは本人がいちばん弱っているときに読む文章なので、
// 「こうしてください」「相手はこう思っています」を一度でも通すと質が崩れる。
const BANNED = [
  "落とせ", "攻略", "テクニック", "脈あり", "脈なし", "必ず", "絶対",
  "してください", "すべきです", "相手はこう思って", "間違いありません",
];
for (const s of STAGES) {
  for (const t of [s.where, ...s.doubts, ...s.prompts]) {
    const hit = BANNED.find((b) => t.includes(b));
    if (hit) {
      throw new Error(`段階「${s.id}」の文面に「${hit}」が入っています（命令・断定・攻略の語は使いません）`);
    }
  }
}
