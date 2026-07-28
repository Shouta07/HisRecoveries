import { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const llmCrawlers = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-Web",
    "anthropic-ai",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
    "Bytespider",
    "CCBot",
    "cohere-ai",
    "Meta-ExternalAgent",
    "Amazonbot",
    "DuckAssistBot",
    "YouBot",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
      ...llmCrawlers.map((ua) => ({
        userAgent: ua,
        allow: "/",
        disallow: ["/api/", "/admin/"],
      })),
    ],
    sitemap: [`${site.url}/sitemap.xml`, `${site.url}/feed.xml`],
    host: site.url,
  };
}
