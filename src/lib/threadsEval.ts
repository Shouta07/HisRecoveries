// Deterministic, rules-based voice/safety check for Threads posts.
// Catches brand-voice regressions BEFORE posting. Pairs the human editor
// with a fast checklist instead of replacing them. LLM-scoring is left
// to a follow-up — these rules already catch the common drift.

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

// 禁止語 — completion / motivational / aggression / clinical-claim.
const FORBIDDEN = [
  // 完了形・断定
  { re: /(治った|治る|克服した|完治|完全に消えた|消滅した|根治)/g, msg: "完了形/断定（治った・克服した等）は使わない" },
  // 励まし・呼びかけ
  { re: /(あなたも|みなさん|あなたへ|頑張ろう|頑張って|乗り越え(よう|ましょう))/g, msg: "励まし/呼びかけ（あなたも・頑張ろう）は使わない" },
  // モテ・派手系
  { re: /(モテ|イケメン化|ハイスペ|無双|最強|爆速|速攻)/g, msg: "モテ/派手/煽り系の語彙は使わない" },
  // 医療断定
  { re: /(必ず効く|確実に|絶対に|100%|エビデンス通り|科学的に証明)/g, msg: "医療的・絶対的断定は使わない（薬機/景表リスク）" },
  // 生産性ノリ
  { re: /(自己肯定感アップ|ライフハック|時短|生産性|テストステロン)/g, msg: "生産性/テストステロン語彙は使わない" },
];

// Soft signals — quiet voice cues we EXPECT.
const PAST_TENSE_HINTS = /(していた|だった|あった|していた頃|していた時期|思っていた|感じていた|していた時)/;
const FIRST_PERSON_HINTS = /(自分|書き手|私|僕)/;
const CALL_TO_ACTION_AGGRESSIVE = /(今すぐ|今だけ|限定|お急ぎ|残り)/g;

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

  // Emoji
  const emojis = trimmed.match(EMOJI);
  if (emojis && emojis.length > 0) {
    rules.push({
      id: "emoji",
      level: "warn",
      message: `絵文字 ${emojis.length} 個 — ブランドの register では原則使わない`,
      matches: Array.from(new Set(emojis)),
    });
  }

  // First-person / past-tense hints (soft)
  if (!FIRST_PERSON_HINTS.test(trimmed) && charCount > 60) {
    rules.push({
      id: "no-first-person",
      level: "info",
      message: "一人称（自分・書き手・私）の手がかりが見つかりません",
    });
  }
  if (!PAST_TENSE_HINTS.test(trimmed) && charCount > 80) {
    rules.push({
      id: "no-past-tense",
      level: "info",
      message: "過去形の手がかりが見つかりません（〜していた・〜だった）",
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
