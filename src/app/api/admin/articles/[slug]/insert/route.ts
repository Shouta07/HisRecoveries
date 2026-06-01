import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import { readFile, writeFile, githubEnabled } from "@/lib/github";
import {
  serializeArticle,
  validateSlug,
  EditableFrontmatter,
} from "@/lib/articleSource";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Action = "append" | "cover";

type Body = {
  url: string;
  action: Action;
};

function isVideoUrl(url: string): boolean {
  return /\.(mp4|mov|webm|ogv)(\?|$)/i.test(url);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  if (!githubEnabled) {
    return NextResponse.json(
      { error: "GitHub env not configured" },
      { status: 500 }
    );
  }
  const v = validateSlug(params.slug);
  if (!v.ok) {
    return NextResponse.json({ error: v.error }, { status: 400 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.url || !/^https?:\/\//.test(body.url)) {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }
  if (body.action !== "append" && body.action !== "cover") {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  const path = `content/articles/${params.slug}.md`;
  const existing = await readFile(path);
  if (!existing.ok || !existing.sha || !existing.content) {
    return NextResponse.json(
      { error: existing.error ?? "article not found" },
      { status: 404 }
    );
  }

  const parsed = matter(existing.content);
  const data = parsed.data as Record<string, unknown>;
  const fm: EditableFrontmatter = {
    title: (data.title as string) ?? params.slug,
    slug: params.slug,
    category: (data.category as string) ?? "philosophy",
    publishedAt:
      (data.publishedAt as string) ??
      new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    excerpt: (data.excerpt as string) ?? "",
    status: ((data.status as string) ?? "published") as
      | "draft"
      | "published",
    related: (data.related as string[]) ?? [],
    keywords: (data.keywords as string[]) ?? [],
    cover: data.cover as string | undefined,
    coverAlt: data.coverAlt as string | undefined,
    popular: data.popular === true,
  };

  let newBody = parsed.content;
  let commitMessage = "";

  if (body.action === "cover") {
    fm.cover = body.url;
    commitMessage = `Set cover for ${fm.title}`;
  } else {
    // append
    const snippet = isVideoUrl(body.url)
      ? `\n\n<video src="${body.url}" controls preload="metadata"></video>\n`
      : `\n\n![](${body.url})\n`;
    newBody = parsed.content.replace(/\s+$/, "") + snippet;
    commitMessage = `Add media to ${fm.title}`;
  }

  const newContent = serializeArticle(fm, newBody);
  const result = await writeFile(path, newContent, commitMessage, {
    sha: existing.sha,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "write failed" },
      { status: 500 }
    );
  }
  return NextResponse.json({
    ok: true,
    commit: result.commit,
    action: body.action,
  });
}
