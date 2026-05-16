import { getAllArticles, getArticle } from "@/lib/articles";
import { categoryLabel, site } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = getAllArticles();
  const updated =
    articles[0]?.publishedAt ?? new Date().toISOString().slice(0, 10);

  const entries = await Promise.all(
    articles.slice(0, 50).map(async (a) => {
      const full = await getArticle(a.slug);
      const url = `${site.url}/articles/${a.slug}`;
      const content = full?.contentHtml ?? "";
      return `  <entry>
    <title>${escapeXml(a.title)}</title>
    <link href="${escapeXml(url)}" />
    <id>${escapeXml(url)}</id>
    <updated>${new Date(a.publishedAt).toISOString()}</updated>
    <published>${new Date(a.publishedAt).toISOString()}</published>
    <author><name>${escapeXml(site.author)}</name></author>
    <category term="${escapeXml(a.category)}" label="${escapeXml(categoryLabel(a.category))}" />
    <summary>${escapeXml(a.excerpt)}</summary>
    <content type="html">${escapeXml(content)}</content>
  </entry>`;
    })
  );

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="ja">
  <title>${escapeXml(`${site.name} — ${site.tagline}`)}</title>
  <subtitle>${escapeXml(site.description)}</subtitle>
  <link href="${site.url}" />
  <link rel="self" href="${site.url}/feed.xml" />
  <id>${site.url}/</id>
  <updated>${new Date(updated).toISOString()}</updated>
  <author><name>${escapeXml(site.author)}</name></author>
  <rights>© ${new Date().getFullYear()} ${escapeXml(site.name)}</rights>
${entries.join("\n")}
</feed>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
