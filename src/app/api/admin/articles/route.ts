import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, githubEnabled } from "@/lib/github";
import {
  serializeArticle,
  validateSlug,
  EditableFrontmatter,
} from "@/lib/articleSource";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateBody = {
  frontmatter: EditableFrontmatter;
  body: string;
};

/** Create a new article (PUT — fails if file already exists). */
export async function POST(req: NextRequest) {
  if (!githubEnabled) {
    return NextResponse.json(
      { error: "GitHub env not configured" },
      { status: 500 }
    );
  }

  let payload: CreateBody;
  try {
    payload = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { frontmatter: fm, body } = payload;
  const v = validateSlug(fm.slug);
  if (!v.ok) {
    return NextResponse.json({ error: v.error }, { status: 400 });
  }

  const path = `content/articles/${fm.slug}.md`;
  const existing = await readFile(path);
  if (existing.ok) {
    return NextResponse.json(
      { error: "同じ slug の記事がすでにあります" },
      { status: 409 }
    );
  }

  const content = serializeArticle(fm, body);
  const result = await writeFile(
    path,
    content,
    `Add article: ${fm.title}`
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "create failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, slug: fm.slug, commit: result.commit });
}
