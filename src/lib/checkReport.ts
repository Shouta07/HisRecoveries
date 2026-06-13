// Generate a draft Recovery Check report (Markdown) from a submission.
// The editor reads, edits, and copies. Saves ~30 minutes per reply.

import {
  CHECK_QUESTIONS,
  type CheckQuestion,
} from "./checkQuestions";
import { getAllConcerns, type ConcernFrontmatter } from "./concerns";
import { getAllArticles, type ArticleSummary } from "./articles";

type Responses = Record<string, unknown>;

// Map Check concern slugs → site territory slugs
const CONCERN_TO_TERRITORY: Record<string, string> = {
  hair: "hair-loss",
  skin: "skin-acne",
  sweat: "sweat-odor",
  odor: "sweat-odor",
  beard: "beard-body-hair",
  face: "face-impression",
  sleep: "mind-awareness",
  body: "mind-awareness",
  confidence: "mind-awareness",
  other: "mind-awareness",
};

// Map territory → article category names (used to find relevant Records)
const TERRITORY_TO_CATEGORIES: Record<string, string[]> = {
  "sweat-odor": ["hyperhidrosis", "bromhidrosis"],
  "skin-acne": ["acne"],
  "face-impression": ["face"],
  "hair-loss": ["hair-loss"],
  "beard-body-hair": ["body-hair"],
  "mind-awareness": ["philosophy"],
};

function labelOf(q: CheckQuestion, v: unknown): string {
  if (v === undefined || v === null || v === "") return "";
  if (q.kind === "single") {
    return q.options.find((o) => o.value === v)?.label ?? String(v);
  }
  if (q.kind === "multi" && Array.isArray(v)) {
    return v
      .map((val) => q.options.find((o) => o.value === val)?.label ?? String(val))
      .join("・");
  }
  if (q.kind === "scale") return `${v} / ${q.max}`;
  return String(v);
}

function q(id: string): CheckQuestion {
  const found = CHECK_QUESTIONS.find((q) => q.id === id);
  if (!found) throw new Error(`unknown question ${id}`);
  return found;
}

export function generateCheckReport(args: {
  name: string | null;
  responses: Responses;
}): string {
  const { name, responses } = args;
  const display = (name ?? "").trim() || "あなた";

  const concerns =
    (responses["concerns"] as string[] | undefined) ?? [];
  const territories = Array.from(
    new Set(concerns.map((c) => CONCERN_TO_TERRITORY[c]).filter(Boolean))
  );

  const concernsLabel = labelOf(q("concerns"), concerns) || "（未選択）";
  const durationLabel =
    labelOf(q("duration"), responses["duration"]) || "—";
  const mirrorLabel =
    labelOf(q("mirror_time"), responses["mirror_time"]) || "—";
  const sleepLabel = labelOf(q("sleep_hours"), responses["sleep_hours"]);
  const stressLabel = labelOf(q("stress"), responses["stress"]);
  const photoLabel = labelOf(q("photo_resistance"), responses["photo_resistance"]);
  const groupLabel = labelOf(q("group_resistance"), responses["group_resistance"]);
  const halfYearVision =
    typeof responses["half_year_vision"] === "string"
      ? (responses["half_year_vision"] as string).trim()
      : "";
  const triggerMoment =
    typeof responses["trigger_moment"] === "string"
      ? (responses["trigger_moment"] as string).trim()
      : "";
  const feelsAligned =
    typeof responses["feels_aligned"] === "string"
      ? (responses["feels_aligned"] as string).trim()
      : "";
  const firstStepLabel =
    labelOf(q("first_step"), responses["first_step"]) || "—";
  const budgetLabel =
    labelOf(q("budget_6m"), responses["budget_6m"]) || "—";
  const timeLabel =
    labelOf(q("time_per_week"), responses["time_per_week"]) || "—";
  const guideInterest = responses["guide_interest"] as string | undefined;
  const trustedSource = labelOf(q("trusted_source"), responses["trusted_source"]);
  const interventions =
    (responses["interventions"] as string[] | undefined) ?? [];
  const clinicHistory =
    (responses["clinic_history"] as string[] | undefined) ?? [];

  // ─── Related Concerns + Articles ─────────────────────────
  const allConcerns = getAllConcerns();
  const matchedConcerns: ConcernFrontmatter[] = [];
  for (const t of territories) {
    const fits = allConcerns.filter((c) => c.territory === t).slice(0, 2);
    for (const c of fits) {
      if (!matchedConcerns.find((m) => m.slug === c.slug)) {
        matchedConcerns.push(c);
      }
    }
    if (matchedConcerns.length >= 4) break;
  }

  const allArticles = getAllArticles();
  const matchedArticles: ArticleSummary[] = [];
  for (const t of territories) {
    const cats = TERRITORY_TO_CATEGORIES[t] ?? [];
    const fits = allArticles
      .filter((a) => cats.includes(a.category))
      .slice(0, 2);
    for (const a of fits) {
      if (!matchedArticles.find((m) => m.slug === a.slug)) {
        matchedArticles.push(a);
      }
    }
    if (matchedArticles.length >= 4) break;
  }

  // ─── Compose the report ──────────────────────────────────
  const lines: string[] = [];

  lines.push(`# あなたの状態の地形図`);
  lines.push("");
  lines.push(`${display} さま`);
  lines.push("");
  lines.push(
    `Recovery Check を受けていただき、ありがとうございます。`
  );
  lines.push(
    `編集者が 30 問すべてを読みました。以下、観察の地形図としてお返しします。`
  );
  lines.push("");
  lines.push(`---`);
  lines.push("");

  // I. 輪郭
  lines.push(`## I. いまの輪郭`);
  lines.push("");
  lines.push(`観察したいと選んでくださった領域：**${concernsLabel}**`);
  lines.push("");
  lines.push(
    `この領域を意識し始めて **${durationLabel}**。朝の鏡の前で過ごす時間は **${mirrorLabel}**。`
  );
  if (sleepLabel || stressLabel) {
    lines.push("");
    lines.push(
      `睡眠は ${sleepLabel || "—"}、ストレスの自覚は ${stressLabel || "—"}。`
    );
  }
  if (photoLabel || groupLabel) {
    lines.push("");
    lines.push(
      `写真への抵抗 ${photoLabel || "—"}、集団場面への抵抗 ${groupLabel || "—"}。`
    );
  }
  if (feelsAligned) {
    lines.push("");
    lines.push(`「整っている」と感じる瞬間として書いてくださったのは：`);
    lines.push("");
    lines.push(`> ${feelsAligned.split("\n").join("\n> ")}`);
  }
  if (triggerMoment) {
    lines.push("");
    lines.push(`直近で悩みを強く感じた場面として：`);
    lines.push("");
    lines.push(`> ${triggerMoment.split("\n").join("\n> ")}`);
  }
  lines.push("");
  lines.push(`---`);
  lines.push("");

  // II. 半年先の輪郭
  lines.push(`## II. 半年先の、ご自身が書いた輪郭`);
  lines.push("");
  if (halfYearVision) {
    lines.push(`${display} さんご自身が、半年後の理想を、次のように書いてくださっています：`);
    lines.push("");
    lines.push(`> ${halfYearVision.split("\n").join("\n> ")}`);
    lines.push("");
    lines.push(
      `この一文を、観察の地形図の中心に置きます。私たちが提案するのは、ここに近づく半歩の選択肢です。`
    );
  } else {
    lines.push(
      `半年後の輪郭は、まだ言葉になっていない、と回答いただきました。`
    );
    lines.push("");
    lines.push(
      `言葉にしないこと自体が、現時点での選択でもあります。急ぐ必要はありません。`
    );
  }
  lines.push("");
  lines.push(`---`);
  lines.push("");

  // III. 3 つの方向
  lines.push(`## III. 観察したい 3 つの方向`);
  lines.push("");
  lines.push(`いただいた回答の組み合わせから、編集者が並べた 3 つの方向です。`);
  lines.push(`どれを選ばないか、を決めるためにも、3 つを並列に置きます。`);
  lines.push("");

  lines.push(`### 1. 状態を、もう一段、言葉にする`);
  lines.push("");
  if (firstStepLabel === "自分の状態を整理する" || !trustedSource || trustedSource === "持っていない") {
    lines.push(
      `次の半歩として「${firstStepLabel}」を選ばれたこと、編集者として受け止めました。`
    );
    lines.push("");
    lines.push(
      `急いで処置を始めるのではなく、悩みの輪郭をもう一段ほどく時間を、置いてみてください。`
    );
  } else {
    lines.push(
      `観察を続けるための語彙を、ひとつ追加してみてください。「治す」ではなく「整える」、`
    );
    lines.push(`「変える」ではなく「並べる」── 動詞を変えるだけで、見える景色が少し変わります。`);
  }
  lines.push("");

  lines.push(`### 2. 選択肢の地形図を、手元に持つ`);
  lines.push("");
  if (clinicHistory.includes("none") || clinicHistory.length === 0) {
    lines.push(
      `これまで医療機関への受診歴はないとのこと。急ぐ必要はありません。`
    );
    lines.push("");
    lines.push(
      `「いつか受診する」可能性を残したまま、初回相談だけ受ける、という距離の取り方もあります。`
    );
    lines.push(
      `決断は、相談のあとに置けば十分です。`
    );
  } else {
    lines.push(
      `すでに ${labelOf(q("clinic_history"), clinicHistory)} の経験があるとのこと。`
    );
    lines.push("");
    if (interventions.length > 0 && !interventions.includes("none")) {
      lines.push(
        `受けてきた処置（${labelOf(q("interventions"), interventions)}）の効果を、`
      );
      lines.push(`もう一度、自分の中で並べ直してみてください。続ける／一度止める／別を試す、の三択を、`);
      lines.push(`焦らず置くだけで十分です。`);
    }
  }
  lines.push("");

  lines.push(`### 3. 生活の中の、小さな所作を一つ更新する`);
  lines.push("");
  lines.push(
    `予算 ${budgetLabel} / 週に確保できる時間 ${timeLabel} を踏まえると、`
  );
  lines.push(
    `処置の追加よりも、日常の所作を一つだけ更新する、という入口が現実的です。`
  );
  lines.push(`夜の所作・朝の手順・服選びのルールの、どれか一つから始めてみてください。`);
  lines.push("");
  lines.push(`---`);
  lines.push("");

  // IV. 紐づく記録と票
  lines.push(`## IV. 紐づく記録と悩み票`);
  lines.push("");

  if (matchedConcerns.length > 0) {
    lines.push(`整理のための場所（His Recoveries の「悩み票」）：`);
    lines.push("");
    for (const c of matchedConcerns) {
      lines.push(
        `- [#${c.ticketId} ${c.title}](https://www.hisrecoveries.com/concerns/${c.slug})`
      );
    }
    lines.push("");
  }

  if (matchedArticles.length > 0) {
    lines.push(`近い経験を通過した記録（一人称の記録）：`);
    lines.push("");
    for (const a of matchedArticles) {
      lines.push(
        `- [${a.title}](https://www.hisrecoveries.com/articles/${a.slug})`
      );
    }
    lines.push("");
  }
  lines.push(`---`);
  lines.push("");

  // V. Letters / closing
  if (guideInterest === "yes" || guideInterest === "maybe") {
    lines.push(`## V. 次の半歩（任意）`);
    lines.push("");
    lines.push(
      `編集者と続けて関わることに関心を寄せてくださいました。`
    );
    lines.push(
      `Recovery Letters は、月に二度の私的なクローズドレターです。`
    );
    lines.push(
      `季節ごとに、自己観察の続きの問いも送ります。`
    );
    lines.push("");
    lines.push(`月額 ¥500（Substack）、いつでも解約可能。`);
    lines.push(`https://www.hisrecoveries.com/membership`);
    lines.push("");
    lines.push(`---`);
    lines.push("");
  }

  lines.push(`急いで何かを始める必要はありません。`);
  lines.push(`この地形図は、${display} さんの中でゆっくり温めるためのものです。`);
  lines.push("");
  lines.push(`いつでも、Reply で続きを書いてください。`);
  lines.push(`編集者は、必ず読みます。`);
  lines.push("");
  lines.push(`His Recoveries 編集部`);
  lines.push("");

  return lines.join("\n");
}
