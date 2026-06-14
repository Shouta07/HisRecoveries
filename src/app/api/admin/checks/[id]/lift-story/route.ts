// Check → Recovery Story lift: when a Check respondent later shares
// "その後どうなったか" with the editor (typically via email reply), the
// editor lifts that exchange into a Recovery Story draft. The actual
// publication is left to the editor: this endpoint outputs the Markdown
// scaffold ready to save as content/stories/<slug>.md. Editorial judgment
// stays in the loop — the operator anonymizes, rewrites in the brand
// voice, and commits.

import { NextRequest, NextResponse } from "next/server";
import { dbSelect, dbAdminEnabled } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TERRITORY_LABEL: Record<string, string> = {
  "sweat-odor": "汗とにおい",
  "skin-acne": "肌とニキビ跡",
  "hair-loss": "薄毛とAGA",
  "beard-body-hair": "髭と体毛",
  "face-impression": "顔の印象",
  "mind-awareness": "心と自意識",
};

// Map a Check concern slug → its territory + likely sibling feelings.
const CONCERN_TO_TERRITORY: Record<string, { territory: string; feelings: string[] }> = {
  sweat: { territory: "sweat-odor", feelings: ["cleanliness", "before-meeting"] },
  odor: { territory: "sweat-odor", feelings: ["cleanliness", "before-meeting"] },
  skin: { territory: "skin-acne", feelings: ["mirror", "photo"] },
  hair: { territory: "hair-loss", feelings: ["photo", "aging"] },
  beard: { territory: "beard-body-hair", feelings: ["mirror", "cleanliness"] },
  body: { territory: "beard-body-hair", feelings: ["mirror"] },
  face: { territory: "face-impression", feelings: ["mirror", "photo", "aging"] },
  sleep: { territory: "mind-awareness", feelings: ["tired", "aging"] },
  confidence: { territory: "mind-awareness", feelings: ["mirror"] },
  other: { territory: "mind-awareness", feelings: ["mirror"] },
};

type CheckRow = {
  id: string;
  responses: Record<string, unknown>;
  status: string;
  story_slug: string | null;
  created_at: string;
};

function pickTerritory(responses: Record<string, unknown>): {
  territory: string;
  feelings: string[];
} {
  const concerns = responses["concerns"];
  if (Array.isArray(concerns)) {
    for (const c of concerns) {
      const hit = CONCERN_TO_TERRITORY[String(c)];
      if (hit) return hit;
    }
  }
  return { territory: "mind-awareness", feelings: ["mirror"] };
}

function safeSlug(territory: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${territory}-${date}-${Math.random().toString(36).slice(2, 7)}`;
}

function spanFromCreatedAt(createdAt: string): string {
  const months = Math.max(
    0,
    Math.round(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
  );
  if (months < 3) return "数ヶ月後";
  if (months < 9) return "半年後";
  if (months < 15) return "1年後";
  return `${Math.round(months / 12)}年後`;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!dbAdminEnabled) {
    return NextResponse.json(
      { error: "admin db not configured" },
      { status: 500 }
    );
  }
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const rows = await dbSelect<CheckRow>(
    `checks?select=id,responses,status,story_slug,created_at&id=eq.${params.id}&limit=1`
  );
  const row = rows[0];
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.story_slug) {
    return NextResponse.json(
      { error: `この Check は既に /stories/${row.story_slug} に紐づいています` },
      { status: 400 }
    );
  }

  const { territory, feelings } = pickTerritory(row.responses ?? {});
  const tLabel = TERRITORY_LABEL[territory] ?? territory;
  const slug = safeSlug(territory);
  const today = new Date().toISOString().slice(0, 10);
  const span = spanFromCreatedAt(row.created_at);
  const firstStep = String(row.responses?.["first_step"] ?? "");
  const duration = String(row.responses?.["duration"] ?? "");

  const frontmatter = [
    "---",
    `slug: "${slug}"`,
    `title: "（編集が一行タイトルを書き直す：例『${tLabel}と、${span}の朝のこと』）"`,
    `territory: "${territory}"`,
    `feelings: [${feelings.map((f) => `"${f}"`).join(", ")}]`,
    `span: "${span}"`,
    `publishedAt: "${today}"`,
    `status: "draft"`,
    "---",
  ].join("\n");

  const body = [
    "",
    `<!-- EDITOR: 以下は Check (${row.created_at.slice(0, 10)}) からの足場です。`,
    `     当事者の "その後" の便りに基づき、一人称・過去形で書き直してください。`,
    `     完了形（治った/克服した）は使わない。診断・断定はしない。 -->`,
    "",
    `> 元 Check: 経過 ${span}・最初の半歩は「${firstStep || "（未回答）"}」・`,
    `> 意識し始めてからの期間「${duration || "（未回答）"}」`,
    "",
    "書き手は、当時このページに辿り着いた一人だった。",
    `${span}の朝に、何か小さなことが書き換わった、その記録を置いておく。`,
    "",
    "---",
    "",
    "**変わったこと。**",
    "",
    "（具体的な場面で、過去形で 1〜2 段落）",
    "",
    "**手術／施術／生活の調整の直後ではなかった。**",
    "",
    "（時間軸で「何ヶ月目に何が変わったか」を淡々と）",
    "",
    "**変わらなかったことも、書いておく。**",
    "",
    "（残った自意識や癖を、否定せず）",
    "",
    "---",
    "",
    "（最後の段落：完了ではなく、半歩進んだ時間の記録として、静かに閉じる）",
    "",
    "---",
    "",
    `※ 治療の適応・副反応・費用は人によって異なります。個別の判断は医療機関にご相談ください。`,
    `本記録は当事者の観察であり、医療行為・診断・受診勧奨を行うものではありません。`,
    "",
  ].join("\n");

  const filepath = `content/stories/${slug}.md`;
  return NextResponse.json({
    ok: true,
    slug,
    filepath,
    markdown: frontmatter + "\n" + body,
    suggestion: `保存先候補: ${filepath}\n（編集後、PATCH /api/admin/checks/${params.id} で story_slug を上書きし、status を replied/archived に進めてください）`,
  });
}
