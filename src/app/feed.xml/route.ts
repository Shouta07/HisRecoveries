import { clusters, CLUSTER_UPDATED } from "@/lib/clusters";
import { complexById } from "@/lib/complexes";
import { publishedAt } from "@/lib/articleDates";
import { site } from "@/lib/site";

// RSS 2.0。用途は3つ。
//  ① 読者が購読できる（Substack とは別に、記事そのものの購読口）
//  ② アグリゲータ・キュレーションメディアが拾える
//  ③ クローラが「新しい記事が出た」ことを一覧で知れる（発見の速度）
// 全文は出さない。リード（description）までにして、本文は記事ページで読ませる。

export const dynamic = "force-static";

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** 記事ごとの公開日。未登録なら媒体の更新日にフォールバックする */
function pubDate(slug: string): string {
  const d = publishedAt(slug);
  return new Date(`${d ?? "2026-07-22"}T12:00:00+09:00`).toUTCString();
}

export function GET() {
  const updated = new Date(`${CLUSTER_UPDATED}T12:00:00+09:00`).toUTCString();

  const items = clusters
    .map((a) => {
      const url = `${site.url}/areas/${a.areaId}/${a.slug}`;
      const category = complexById(a.areaId)?.ja ?? "";
      return [
        "    <item>",
        `      <title>${escape(a.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escape(a.lead)}</description>`,
        category ? `      <category>${escape(category)}</category>` : "",
        `      <pubDate>${pubDate(a.slug)}</pubDate>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(site.name)} — ${escape(site.tagline)}</title>
    <link>${site.url}</link>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escape(site.description)}</description>
    <language>ja</language>
    <lastBuildDate>${updated}</lastBuildDate>
    <copyright>© 2026 ${escape(site.name)}</copyright>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
