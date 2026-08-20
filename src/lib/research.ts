// 一次情報（調査）の型。
//
// ── なぜ型から作るか ────────────────────────────
// 「20〜30代男性500人に聞いた」と書ける記事は、この事業の核。
// ただし、その一行はデータが無くても書けてしまう。
// だから先に器を作り、必須項目が欠けたら公開できないようにする。
//
// AIが生成した一般論を「独自調査」に見せないこと。
// 見せた瞬間、このサイトが積み上げてきたものが全部無効になる。
// 出どころ（kind）を必ず持たせ、生成物を入れる区分は用意しない。
//
// ── 何を必須にするか ────────────────────────────
// 読む側とAIが検証できる最小限。
//   誰に（who）何人に（n）いつ（period）どうやって（method）
//   何を聞いて（questions）何が分かったか（findings）
// どれか1つでも書けないなら、それは調査ではなく感想。

/**
 * 出どころ。
 * 生成物のための区分は作らない。作れば、いつか使われる。
 */
export type ResearchKind =
  | "expert" // 専門家への直接取材
  | "field" // 当事者男性への直接取材（街頭・オンライン）
  | "price" // 価格の調査（公開されている価格を集めたもの）
  | "behavior"; // このサイトの利用者の行動・結果データ（匿名の集計）

export const KIND_LABEL: Record<ResearchKind, string> = {
  expert: "専門家への取材",
  field: "当事者への取材",
  price: "価格の調査",
  behavior: "利用者の行動データ",
};

export type Survey = {
  id: string;
  kind: ResearchKind;
  /** 調査のテーマ。記事の題ではなく、何を明らかにしようとしたか */
  theme: string;
  /** 誰に聞いたか。属性で書く。個人が分かる書き方はしない */
  who: string;
  /** 何人・何件か */
  n: number;
  /** いつ（YYYY-MM-DD 〜 YYYY-MM-DD） */
  from: string;
  to: string;
  /** どうやって集めたか。ここが空なら調査として成立しない */
  method: string;
  /** 実際に聞いたこと */
  questions: string[];
  /** 分かったこと。数を伴わない印象は書かない */
  findings: string[];
  /** 限界。答えられていないことを自分から書く */
  limits: string[];
  /** 出典・確認できる場所（あれば） */
  source?: string;
};

/**
 * 調査の一覧。
 *
 * 現時点で0件。取材を始めたところなので、埋まっていない。
 * 空であること自体を /research に出す。
 * 「準備中」と書いて隠すより、0と書くほうが確かめられる。
 */
export const SURVEYS: Survey[] = [];

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 公開できる形になっているかを確かめる。
 * 欠けたまま出ると、検証できない数字がサイトに載る。
 */
export function assertSurveys(surveys: Survey[] = SURVEYS): void {
  const seen = new Set<string>();
  for (const s of surveys) {
    const at = `調査「${s.id || "(id未設定)"}」`;
    if (!s.id) throw new Error(`${at}: id がありません`);
    if (seen.has(s.id)) throw new Error(`${at}: id が重複しています`);
    seen.add(s.id);

    if (!s.theme.trim()) throw new Error(`${at}: テーマが空です`);
    if (!s.who.trim()) throw new Error(`${at}: 誰に聞いたかが空です`);
    if (!s.method.trim()) throw new Error(`${at}: 集め方が空です。書けないなら調査ではありません`);

    if (!Number.isInteger(s.n) || s.n <= 0) {
      throw new Error(`${at}: 人数が不正です（${s.n}）。数えていないなら出せません`);
    }
    if (!ISO.test(s.from) || !ISO.test(s.to)) {
      throw new Error(`${at}: 実施日は YYYY-MM-DD で必要です`);
    }
    if (s.from > s.to) throw new Error(`${at}: 開始日が終了日より後です`);

    if (s.questions.length === 0) throw new Error(`${at}: 聞いたことが1つも書かれていません`);
    if (s.findings.length === 0) throw new Error(`${at}: 分かったことが空です`);

    // 限界を書かせる。書かない調査は、書けることだけを書いた調査になる。
    if (s.limits.length === 0) {
      throw new Error(`${at}: 限界（答えられていないこと）を1つ以上書いてください`);
    }
  }
}

assertSurveys();

/** いま公開している調査があるか。無いことを隠さないために使う */
export const HAS_RESEARCH = SURVEYS.length > 0;

/** 集めた人数の合計。「延べ何人に聞いたか」を出すのに使う */
export function totalRespondents(surveys: Survey[] = SURVEYS): number {
  return surveys.reduce((sum, s) => sum + s.n, 0);
}
