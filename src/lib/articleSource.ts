// Serialize an article (frontmatter + body) back to the markdown source.
// Used by /admin to write edits via the GitHub API.

export type EditableFrontmatter = {
  title: string;
  slug: string;
  category: string;
  publishedAt: string;
  updatedAt?: string;
  excerpt: string;
  status: "draft" | "published";
  related: string[];
  keywords: string[];
  cover?: string;
  coverAlt?: string;
  popular?: boolean;
};

function yamlString(s: string): string {
  // Always quote with double quotes and escape backslashes + quotes.
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function yamlList(items: string[]): string {
  if (!items.length) return "[]";
  return items
    .map((it) => `  - ${yamlString(it)}`)
    .join("\n");
}

export function serializeArticle(
  fm: EditableFrontmatter,
  body: string
): string {
  const lines: string[] = ["---"];
  lines.push(`title: ${yamlString(fm.title)}`);
  lines.push(`slug: ${yamlString(fm.slug)}`);
  lines.push(`category: ${yamlString(fm.category)}`);
  lines.push(`publishedAt: ${yamlString(fm.publishedAt)}`);
  if (fm.updatedAt) {
    lines.push(`updatedAt: ${yamlString(fm.updatedAt)}`);
  }
  lines.push(`status: ${yamlString(fm.status)}`);
  lines.push(`excerpt: ${yamlString(fm.excerpt)}`);
  if (fm.cover) lines.push(`cover: ${yamlString(fm.cover)}`);
  if (fm.coverAlt) lines.push(`coverAlt: ${yamlString(fm.coverAlt)}`);
  if (fm.popular) lines.push(`popular: true`);

  if (fm.related.length) {
    lines.push("related:");
    lines.push(yamlList(fm.related));
  } else {
    lines.push("related: []");
  }

  if (fm.keywords.length) {
    lines.push("keywords:");
    lines.push(yamlList(fm.keywords));
  } else {
    lines.push("keywords: []");
  }

  lines.push("---");
  lines.push("");
  lines.push(body.trim());
  lines.push("");
  return lines.join("\n");
}

export function validateSlug(slug: string): { ok: boolean; error?: string } {
  if (!slug) return { ok: false, error: "slug が空です" };
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
    return {
      ok: false,
      error: "slug は半角小文字英数字とハイフンのみ（先頭末尾は英数）",
    };
  }
  if (slug.length > 80) return { ok: false, error: "slug が長すぎます" };
  return { ok: true };
}
