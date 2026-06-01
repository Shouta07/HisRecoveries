import { NextRequest, NextResponse } from "next/server";
import {
  readFile,
  writeFile,
  deleteFile,
  githubEnabled,
} from "@/lib/github";
import {
  serializeArticle,
  validateSlug,
  EditableFrontmatter,
} from "@/lib/articleSource";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UpdateBody = {
  frontmatter: EditableFrontmatter;
  body: string;
};

function safePath(slug: string): string | null {
  const v = validateSlug(slug);
  if (!v.ok) return null;
  return `content/articles/${slug}.md`;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!githubEnabled) {
    return NextResponse.json(
      { error: "GitHub env not configured" },
      { status: 500 }
    );
  }
  const path = safePath(params.slug);
  if (!path) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }

  let payload: UpdateBody;
  try {
    payload = (await req.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const existing = await readFile(path);
  if (!existing.ok || !existing.sha) {
    return NextResponse.json(
      { error: existing.error ?? "file not found" },
      { status: 404 }
    );
  }

  // updatedAt stamp on every save
  const fm: EditableFrontmatter = {
    ...payload.frontmatter,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
  const content = serializeArticle(fm, payload.body);
  const result = await writeFile(
    path,
    content,
    `Update article: ${fm.title}`,
    { sha: existing.sha }
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "save failed" },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, commit: result.commit });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!githubEnabled) {
    return NextResponse.json(
      { error: "GitHub env not configured" },
      { status: 500 }
    );
  }
  const path = safePath(params.slug);
  if (!path) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }
  const existing = await readFile(path);
  if (!existing.ok || !existing.sha) {
    return NextResponse.json(
      { error: existing.error ?? "file not found" },
      { status: 404 }
    );
  }
  const result = await deleteFile(
    path,
    existing.sha,
    `Delete article: ${params.slug}`
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "delete failed" },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
