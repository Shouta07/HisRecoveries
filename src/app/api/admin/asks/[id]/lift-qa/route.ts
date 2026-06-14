// Ask → Q&A lift: turn an editor-approved ask into a Markdown draft ready
// to be saved as content/qa/<slug>.md. The actual file write is left to
// the editor (copy → save → commit) so editorial judgment stays in the
// loop. This is GTM-engineering: turn a 30-min manual task into a 5-min
// review-and-publish task without removing the editor.

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

// Map feeling → most likely sibling feelings (lightweight clustering for
// the editor — they can edit the list before publishing).
const FEELING_FROM_TERRITORY: Record<string, string[]> = {
  "sweat-odor": ["cleanliness", "before-meeting"],
  "skin-acne": ["mirror", "photo"],
  "hair-loss": ["photo", "aging"],
  "beard-body-hair": ["mirror", "cleanliness"],
  "face-impression": ["mirror", "photo", "aging"],
  "mind-awareness": ["tired", "aging", "mirror"],
};

type AskRow = {
  id: string;
  question: string;
  context: string | null;
  age_range: string | null;
  territory: string | null;
  feeling: string | null;
  consent_publish: boolean;
  status: string;
};

/** Romanize/sanitize Japanese question into a safe URL slug seed. */
function seedSlug(q: string, territory: string | null): string {
  const base = territory ?? "qa";
  const date = new Date().toISOString().slice(0, 10);
  // The editor will overwrite this anyway; just provide a working stub.
  return `${base}-${date}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Wrap text at ~60 fullwidth chars for readability of the editorial draft. */
function softWrap(text: string, width = 60): string {
  if (text.length <= width) return text;
  const out: string[] = [];
  for (let i = 0; i < text.length; i += width) out.push(text.slice(i, i + width));
  return out.join("\n");
}

function buildMarkdown(row: AskRow): { slug: string; markdown: string } {
  const territory = row.territory ?? "mind-awareness";
  const tLabel = TERRITORY_LABEL[territory] ?? territory;
  const feelings = row.feeling
    ? [row.feeling]
    : FEELING_FROM_TERRITORY[territory] ?? [];
  const slug = seedSlug(row.question, territory);
  const today = new Date().toISOString().slice(0, 10);

  const questionSafe = row.question.replace(/"/g, "''").trim();
  const askerContext = row.context?.trim() ?? "";
  const askerAge = row.age_range?.trim() ?? "";

  const frontmatter = [
    "---",
    `slug: "${slug}"`,
    `question: "${questionSafe}"`,
    `territory: "${territory}"`,
    `feelings: [${feelings.map((f) => `"${f}"`).join(", ")}]`,
    askerAge || askerContext
      ? `asker:\n  ${askerAge ? `ageRange: "${askerAge}"\n  ` : ""}${
          askerContext ? `context: "${askerContext.replace(/"/g, "''")}"` : ""
        }`.trim()
      : "",
    `publishedAt: "${today}"`,
    `status: "draft"`,
    "---",
  ]
    .filter(Boolean)
    .join("\n");

  // Editorial scaffolding — TODOs for the editor, in the brand voice
  // (一人称・過去形・煽らない). The editor rewrites and removes the TODOs.
  const body = [
    "",
    `> Q. ${softWrap(row.question)}`,
    askerContext ? `> 〜 ${softWrap(askerContext)} 〜` : "",
    "",
    "<!-- EDITOR: 以下は下書きの足場です。本人の問いをもとに、半歩先からの観察を、",
    "     一人称・過去形・断定しないトーンで書き直してください。完了形を使わないこと。 -->",
    "",
    "書き手は、この問いに近い場面を、ある時期、自分の中で繰り返していた。",
    "だから、答えられる範囲のことだけを書く。",
    "",
    "---",
    "",
    "**変わったこと。**",
    "",
    "（具体的な場面で、過去形で1〜2段落）",
    "",
    "**変わらなかったこと。**",
    "",
    "（残った自意識や癖を、淡々と1段落）",
    "",
    "**いま思うこと。**",
    "",
    "（断定しない、誰かを救おうとしない、半歩先からの一言）",
    "",
    "---",
    "",
    `※ 個別の症状や治療の判断は、医療機関にご相談ください。本記録は当事者の観察であり、`,
    `医療行為・診断・受診勧奨を行うものではありません。`,
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const markdown = frontmatter + "\n" + body;
  return { slug, markdown };
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

  const rows = await dbSelect<AskRow>(
    `asks?select=id,question,context,age_range,territory,feeling,consent_publish,status&id=eq.${params.id}&limit=1`
  );
  const row = rows[0];
  if (!row) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (!row.consent_publish) {
    return NextResponse.json(
      { error: "公開同意 (consent_publish) が無い ask は Q&A 化できません" },
      { status: 400 }
    );
  }

  const { slug, markdown } = buildMarkdown(row);
  const filepath = `content/qa/${slug}.md`;
  return NextResponse.json({
    ok: true,
    slug,
    filepath,
    markdown,
    suggestion: `保存先候補: ${filepath}\n（編集後、git で追加・コミット・push してください。slug は適切なものに書き換えてください）`,
  });
}
