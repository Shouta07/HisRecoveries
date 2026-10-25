import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/* 検索に出す面。

 * ── 4枚になった ──────────────────────────────
 * 相談サービスを畳んだので、/pricing /about /cities /stories
 * /en /zh が無くなった。残るのは構想の面と、法務の3枚。
 *
 * 英語・中国語の面は、訪日の相談サービスのものだった。
 * 構想の英語版が要るかどうかは、構想が固まってから決める。 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const at = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  });
  return [
    at("", 1),
    at("/terms", 0.2),
    at("/privacy", 0.2),
    at("/legal", 0.2),
  ];
}
