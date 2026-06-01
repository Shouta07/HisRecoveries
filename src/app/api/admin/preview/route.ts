import { NextRequest, NextResponse } from "next/server";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Render markdown → HTML for the live editor preview.
 * Matches the same remark pipeline used by the article page so
 * what the author sees while editing matches what gets published.
 *
 * Same post-processing as lib/articles.ts: relative <img>/<video>
 * URLs resolve to /media/articles/{slug}/, and bare YouTube URLs
 * become responsive embeds.
 */
function resolveRelativeMedia(html: string, slug: string): string {
  const base = `/media/articles/${slug}/`;
  return html.replace(
    /(<(?:img|source|video|audio|a)\b[^>]*?\s(?:src|href)=")([^"]+)(")/gi,
    (full, prefix: string, url: string, suffix: string) => {
      if (
        url.startsWith("/") ||
        /^https?:/i.test(url) ||
        url.startsWith("data:") ||
        url.startsWith("mailto:") ||
        url.startsWith("#")
      ) {
        return full;
      }
      return `${prefix}${base}${url}${suffix}`;
    }
  );
}

function embedYouTube(html: string): string {
  const ytParaRe =
    /<p>\s*(?:<a[^>]*>)?\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_\-]+(?:[?&][^\s<]*)?)\s*(?:<\/a>)?\s*<\/p>/gi;
  return html.replace(ytParaRe, (_full, url: string) => {
    const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_\-]{6,})/);
    if (!m) return _full;
    return `<figure class="video-embed"><div class="video-embed-frame"><iframe src="https://www.youtube.com/embed/${m[1]}" title="YouTube" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></figure>`;
  });
}

export async function POST(req: NextRequest) {
  let body: { markdown?: string; slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const md = body.markdown ?? "";
  const slug = body.slug ?? "preview";
  if (md.length > 80_000) {
    return NextResponse.json({ error: "too long" }, { status: 413 });
  }
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(md);
  let html = processed.toString();
  html = embedYouTube(resolveRelativeMedia(html, slug));
  return NextResponse.json({ ok: true, html });
}
