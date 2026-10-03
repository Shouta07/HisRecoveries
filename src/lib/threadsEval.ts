// Deterministic, rules-based voice/safety check for Threads posts.
// Catches brand-voice regressions BEFORE posting. Pairs the human editor
// with a fast checklist instead of replacing them. LLM-scoring is left
// to a follow-up — these rules already catch the common drift.
//
// 線引きは apps/threads/accounts/mens-body-lab/persona.json と同じにしてある
// （タシカメ＝送る前の文面を実在の女性に読んでもらうサービス）。
// 以前は旧事業（His Recoveries＝男性ウェルネス。一人称「僕」・過去形の独白）の
// 前提で、一人称と過去形が無いことを info で指摘していた。いまの語り手は
// 一人称を使わず現在形で書くので、良い投稿のたびに指摘が出る状態だった。

export type EvalLevel = "error" | "warn" | "info";
export type EvalRule = {
  id: string;
  level: EvalLevel;
  message: string;
  /** position(s) in the text where the issue occurs */
  matches?: string[];
};
export type EvalResult = {
  score: number; // 0–100
  level: "good" | "review" | "block";
  charCount: number;
  rules: EvalRule[];
};

// 禁止語 — judging the other person / outcome promises / aggression / looking down.
const FORBIDDEN = [
  // 相手の気持ちの判定（売り物ではない）
  { re: /(脈あり|脈なし|本命|キープ|女心|女性心理)/g, msg: "相手の気持ちの判定（脈あり・女心等）は扱わない" },
  // 結果の保証・攻略
  { re: /(モテ|落とす|落とし方|攻略|成功率|必勝|テクニック|裏技)/g, msg: "結果の保証/攻略系の語彙は使わない" },
  // 読む人や相手を見下す
  { re: /(ダサい|痛い|キモい|イタい|地雷|非モテ)/g, msg: "読む人や相手を見下す言葉は使わない" },
  // 励まし・呼びかけ
  { re: /(あなたも|みなさん|あなたへ|頑張ろう|頑張って|乗り越え(よう|ましょう))/g, msg: "励まし/呼びかけ（あなたも・頑張ろう）は使わない" },
  // 断定
  { re: /(必ず|確実に|絶対に|100%|間違いなく)/g, msg: "断定（必ず・絶対・確実）は使わない" },
  // 旧事業の名残（第一印象パッケージ・完全守秘のギフト訴求）
  { re: /(完全守秘|第一印象パッケージ|ギフトでも申し込め)/g, msg: "旧事業（His Recoveries のギフト訴求）の言い方が残っています" },
];

// 女性の反応を、こちらで作らない。実在の回答が集まるまで「女性の声」は出さない。
// それを売っているサービスが、AIの作り話を出したら商品そのものが嘘になる。
const INVENTED_REACTION = /女性(は|が|って)[^。、]{0,12}(思|感じ|考え|言)/g;

// Soft signals.
const FIRST_PERSON_HINTS = /(僕|私は|私が|俺)/;
const OPEN_QUESTION = /(ますか|ですか|どう|どこ|いつ|なに|何)[^。]{0,8}[。？?]?$/;
const CALL_TO_ACTION_AGGRESSIVE = /(今すぐ|今だけ|限定|お急ぎ|残り)/g;
const PRICE_RE = /([0-9０-９][0-9０-９,，]*\s*円|無料|半額|割引|キャンペーン)/g;

// Hashtag & emoji — both discouraged.
const HASHTAG = /#[^\s#]+/g;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;

const URL_RE = /(https?:\/\/[^\s]+)/g;
const UTM_RE = /utm_source=/i;

export function evaluateThreadsPost(text: string): EvalResult {
  const rules: EvalRule[] = [];
  const trimmed = text.trim();
  const charCount = [...trimmed].length;

  // Length
  if (charCount === 0) {
    rules.push({ id: "empty", level: "error", message: "本文が空です" });
  } else if (charCount > 480) {
    rules.push({
      id: "too-long",
      level: "error",
      message: `${charCount} 字 — Threads 上限 500 字に近い。280 字以内推奨`,
    });
  } else if (charCount > 280) {
    rules.push({
      id: "long",
      level: "warn",
      message: `${charCount} 字 — 推奨 280 字を超えています`,
    });
  }

  // Forbidden vocabulary
  for (const f of FORBIDDEN) {
    const hits = trimmed.match(f.re);
    if (hits && hits.length > 0) {
      rules.push({
        id: `forbidden:${f.msg.slice(0, 16)}`,
        level: "error",
        message: f.msg,
        matches: Array.from(new Set(hits)),
      });
    }
  }

  // Inventing what women think
  const invented = trimmed.match(INVENTED_REACTION);
  if (invented) {
    rules.push({
      id: "invented-reaction",
      level: "error",
      message: "女性の反応を創作しない（実在の回答が集まるまで「女性の声」は書かない）",
      matches: Array.from(new Set(invented)),
    });
  }

  // 価格・割引（persona の forbidden_topics）
  const price = trimmed.match(PRICE_RE);
  if (price) {
    rules.push({
      id: "price",
      level: "warn",
      message: "価格・割引には触れない（投稿では金額を出さない）",
      matches: Array.from(new Set(price)),
    });
  }

  // Aggressive CTA
  const aggressive = trimmed.match(CALL_TO_ACTION_AGGRESSIVE);
  if (aggressive) {
    rules.push({
      id: "aggressive-cta",
      level: "warn",
      message: "煽る CTA（今すぐ／限定／残り）は使わない",
      matches: Array.from(new Set(aggressive)),
    });
  }

  // Hashtags
  const tags = trimmed.match(HASHTAG);
  if (tags && tags.length > 1) {
    rules.push({
      id: "hashtags",
      level: "warn",
      message: `ハッシュタグ ${tags.length} 個 — 0〜1 個推奨`,
      matches: tags,
    });
  }

  // Emoji — persona は0〜2個まで
  const emojis = trimmed.match(EMOJI);
  if (emojis && emojis.length > 2) {
    rules.push({
      id: "emoji",
      level: "warn",
      message: `絵文字 ${emojis.length} 個 — 0〜2 個まで`,
      matches: Array.from(new Set(emojis)),
    });
  }

  // 語り手の手がかり（soft）。一人称は使わない語り手なので、
  // 「僕/私」が出てきたら当事者の独白に戻っていないか確認する。
  if (FIRST_PERSON_HINTS.test(trimmed)) {
    rules.push({
      id: "first-person",
      level: "info",
      message: "一人称（僕・私）があります。運営の語り手は一人称を使いません",
    });
  }
  // 連投の最終投稿は開いた問いで閉じる（返信＝伸びる信号）
  if (!OPEN_QUESTION.test(trimmed) && charCount > 120) {
    rules.push({
      id: "no-open-question",
      level: "info",
      message: "問いで閉じていません（最終投稿は開いた問いで終える）",
    });
  }

  // URL + UTM
  const urls = trimmed.match(URL_RE);
  if (urls && urls.length > 0) {
    const missingUtm = urls.filter((u) => !UTM_RE.test(u));
    if (missingUtm.length > 0) {
      rules.push({
        id: "missing-utm",
        level: "warn",
        message: "リンクに UTM が付いていません（計測が落ちます）",
        matches: missingUtm,
      });
    }
  }

  // Score
  const errors = rules.filter((r) => r.level === "error").length;
  const warns = rules.filter((r) => r.level === "warn").length;
  const score = Math.max(0, 100 - errors * 25 - warns * 8);
  const level: EvalResult["level"] =
    errors > 0 ? "block" : warns >= 2 ? "review" : "good";

  return { score, level, charCount, rules };
}
