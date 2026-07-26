import type { RoadmapData, Line } from "./RoadmapVideo";

// ============================================================
// RoadmapData バリデータ。AI に data(JSON) を生成させて量産するとき、
// 動画にする前に「壊れていないか / はみ出さないか / ブランド禁止語が無いか」を
// 機械的に弾く。errors が空なら合格。PROMPT.md の制約と対応。
// ============================================================

// モバイル安全域を守るための文字数目安（大フォントで折り返すと崩れるため）
export const LIMITS = {
  hookLineChars: 12,
  problemPunchChars: 14,
  stepTitleChars: 16,
  stepDescChars: 42,
  closePunchChars: 14,
  minSteps: 3,
  maxSteps: 6,
} as const;

// 断定・医療・煽りなど、ブランドで禁じる語（persona と同趣旨）
const FORBIDDEN = [
  "治る", "治す", "若返る", "必ず", "絶対", "確実",
  "ビフォーアフター", "男はみんな", "どうせ",
  "ダサい", "不潔", "老けてる", "情けない",
];

function textLen(line: Line): number {
  return (line?.text ?? "").length;
}

function checkLines(
  lines: Line[] | undefined,
  label: string,
  max: number,
  errors: string[],
): void {
  if (!Array.isArray(lines) || lines.length === 0) {
    errors.push(`${label}: 行が空です`);
    return;
  }
  lines.forEach((l, i) => {
    if (typeof l?.text !== "string" || !l.text) {
      errors.push(`${label}[${i}]: text がありません`);
      return;
    }
    if (textLen(l) > max) {
      errors.push(`${label}[${i}]: 長すぎ(${textLen(l)}>${max}) 「${l.text}」`);
    }
    if (l.accent && !l.text.includes(l.accent)) {
      errors.push(`${label}[${i}]: accent「${l.accent}」が text に含まれない`);
    }
  });
}

function scanForbidden(text: string, where: string, errors: string[]): void {
  for (const w of FORBIDDEN) {
    if (text.includes(w)) errors.push(`${where}: 禁止語「${w}」`);
  }
}

/** RoadmapData を検証。問題があれば日本語メッセージの配列を返す（空＝合格）。 */
export function validateRoadmapData(data: RoadmapData): string[] {
  const errors: string[] = [];
  if (!data || typeof data !== "object") return ["data がオブジェクトではありません"];

  if (!data.eyebrow) errors.push("eyebrow がありません");

  checkLines(data.hook, "hook", LIMITS.hookLineChars, errors);
  checkLines(data.problem?.lead, "problem.lead", LIMITS.hookLineChars, errors);
  checkLines(data.problem?.punch, "problem.punch", LIMITS.problemPunchChars, errors);
  checkLines(data.close?.lead, "close.lead", LIMITS.hookLineChars, errors);
  checkLines(data.close?.punch, "close.punch", LIMITS.closePunchChars, errors);

  const steps = data.steps ?? [];
  if (steps.length < LIMITS.minSteps || steps.length > LIMITS.maxSteps) {
    errors.push(
      `steps は ${LIMITS.minSteps}〜${LIMITS.maxSteps} 個（現在 ${steps.length}）`,
    );
  }
  steps.forEach((s, i) => {
    if (!s?.n) errors.push(`steps[${i}].n がありません`);
    if (!s?.t) errors.push(`steps[${i}].t がありません`);
    else if (s.t.length > LIMITS.stepTitleChars)
      errors.push(`steps[${i}].t 長すぎ(${s.t.length}>${LIMITS.stepTitleChars})`);
    if (!s?.d) errors.push(`steps[${i}].d がありません`);
    else if (s.d.length > LIMITS.stepDescChars)
      errors.push(`steps[${i}].d 長すぎ(${s.d.length}>${LIMITS.stepDescChars})`);
  });

  // 全テキストを禁止語スキャン
  const allText: string[] = [
    ...(data.hook ?? []).map((l) => l.text ?? ""),
    ...(data.problem?.lead ?? []).map((l) => l.text ?? ""),
    ...(data.problem?.punch ?? []).map((l) => l.text ?? ""),
    ...(data.close?.lead ?? []).map((l) => l.text ?? ""),
    ...(data.close?.punch ?? []).map((l) => l.text ?? ""),
    ...steps.flatMap((s) => [s?.t ?? "", s?.d ?? ""]),
  ];
  allText.forEach((t, i) => scanForbidden(t, `text#${i}`, errors));

  return errors;
}

// ============================================================
// BrandReel（30秒リール）用。RoadmapVideo とは版面が違うので上限も別。
// 幅 768px(1080 - 左右156) に収まる1行の文字数目安。
// ============================================================

export const REEL_LIMITS = {
  /** 見出し 76px */
  headlineChars: 10,
  /** 小見出し 58px */
  headlineSmChars: 13,
  /** 本文 34px */
  bodyChars: 20,
  /** 悩みラベル（肌 / 体 / 清潔感） */
  itemLabelChars: 5,
  /** 悩みの一言 29px */
  itemNoteChars: 15,
  concerns: 3,
} as const;

/** BrandReelData を検証。空配列なら合格。 */
export function validateBrandReelData(data: {
  eyebrow?: string;
  desire?: { headline?: Line[]; note?: Line[] };
  concerns?: { lead?: Line[]; items?: { label: string; note: string }[]; punch?: Line[] };
  brand?: { lead?: Line[]; body?: Line[] };
  confidence?: { headline?: Line[]; body?: Line[] };
  cta?: { lead?: Line[]; cta?: Line[]; url?: string; handle?: string };
}): string[] {
  const errors: string[] = [];
  if (!data || typeof data !== "object") return ["data がオブジェクトではありません"];

  if (!data.eyebrow) errors.push("eyebrow がありません");

  checkLines(data.desire?.headline, "desire.headline", REEL_LIMITS.headlineChars, errors);
  checkLines(data.desire?.note, "desire.note", REEL_LIMITS.bodyChars, errors);

  checkLines(data.concerns?.lead, "concerns.lead", REEL_LIMITS.bodyChars, errors);
  checkLines(data.concerns?.punch, "concerns.punch", REEL_LIMITS.headlineSmChars, errors);

  const items = data.concerns?.items ?? [];
  if (items.length !== REEL_LIMITS.concerns) {
    errors.push(`concerns.items は ${REEL_LIMITS.concerns} 個（肌/体/清潔感）。現在 ${items.length}`);
  }
  items.forEach((it, i) => {
    if (!it?.label) errors.push(`concerns.items[${i}].label がありません`);
    else if (it.label.length > REEL_LIMITS.itemLabelChars)
      errors.push(`concerns.items[${i}].label 長すぎ(${it.label.length}>${REEL_LIMITS.itemLabelChars})`);
    if (!it?.note) errors.push(`concerns.items[${i}].note がありません`);
    else if (it.note.length > REEL_LIMITS.itemNoteChars)
      errors.push(`concerns.items[${i}].note 長すぎ(${it.note.length}>${REEL_LIMITS.itemNoteChars})`);
  });

  checkLines(data.brand?.lead, "brand.lead", REEL_LIMITS.headlineSmChars, errors);
  checkLines(data.brand?.body, "brand.body", REEL_LIMITS.bodyChars, errors);

  checkLines(data.confidence?.headline, "confidence.headline", REEL_LIMITS.headlineChars, errors);
  checkLines(data.confidence?.body, "confidence.body", REEL_LIMITS.bodyChars, errors);

  checkLines(data.cta?.lead, "cta.lead", REEL_LIMITS.bodyChars, errors);
  checkLines(data.cta?.cta, "cta.cta", REEL_LIMITS.headlineSmChars, errors);
  if (!data.cta?.url) errors.push("cta.url がありません");

  const allText: string[] = [
    ...(data.desire?.headline ?? []).map((l) => l.text ?? ""),
    ...(data.desire?.note ?? []).map((l) => l.text ?? ""),
    ...(data.concerns?.lead ?? []).map((l) => l.text ?? ""),
    ...(data.concerns?.punch ?? []).map((l) => l.text ?? ""),
    ...items.flatMap((it) => [it?.label ?? "", it?.note ?? ""]),
    ...(data.brand?.lead ?? []).map((l) => l.text ?? ""),
    ...(data.brand?.body ?? []).map((l) => l.text ?? ""),
    ...(data.confidence?.headline ?? []).map((l) => l.text ?? ""),
    ...(data.confidence?.body ?? []).map((l) => l.text ?? ""),
    ...(data.cta?.lead ?? []).map((l) => l.text ?? ""),
    ...(data.cta?.cta ?? []).map((l) => l.text ?? ""),
  ];
  allText.forEach((t, i) => scanForbidden(t, `reel text#${i}`, errors));

  return errors;
}
