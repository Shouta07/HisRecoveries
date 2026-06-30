import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline';",
  },
  async redirects() {
    return [
      // /packages index folds into the home section; /packages/[id] are real detail pages.
      { source: "/packages", destination: "/#packages", permanent: true },
      // 会員は現在ホームに掲載なし → 改善プログラムへ
      { source: "/packages/membership", destination: "/#packages", permanent: true },
      // 旧パッケージID（3ティアに再編）→ 改善プログラムへ
      { source: "/packages/first-impression", destination: "/#packages", permanent: true },
      { source: "/packages/cleanliness", destination: "/#packages", permanent: true },
      { source: "/packages/hair", destination: "/#packages", permanent: true },
      { source: "/packages/future", destination: "/#packages", permanent: true },
      { source: "/packages/animals", destination: "/#packages", permanent: true },
      { source: "/mechanism", destination: "/areas", permanent: true },
      { source: "/mechanism/:slug*", destination: "/areas", permanent: true },
      { source: "/interviews", destination: "/areas", permanent: true },
      { source: "/interviews/:slug*", destination: "/areas", permanent: true },
      // legacy routes also fold into the mechanism library.
      { source: "/stories", destination: "/areas", permanent: true },
      { source: "/stories/:slug", destination: "/areas", permanent: true },
      { source: "/recoveries", destination: "/areas", permanent: true },
      { source: "/recoveries/:slug*", destination: "/areas", permanent: true },
      { source: "/territories", destination: "/areas", permanent: true },
      { source: "/territories/:slug*", destination: "/areas", permanent: true },
      // 旧メディア（記事・コンテンツ）を削除 → 仕組みライブラリ or ホームへ
      { source: "/articles", destination: "/areas", permanent: true },
      { source: "/articles/:slug*", destination: "/areas", permanent: true },
      { source: "/feelings", destination: "/areas", permanent: true },
      { source: "/feelings/:slug*", destination: "/areas", permanent: true },
      { source: "/concerns", destination: "/areas", permanent: true },
      { source: "/concerns/:slug*", destination: "/areas", permanent: true },
      { source: "/qa", destination: "/areas", permanent: true },
      { source: "/qa/:slug*", destination: "/areas", permanent: true },
      { source: "/ask", destination: "/areas", permanent: true },
      { source: "/experts", destination: "/areas", permanent: true },
      { source: "/experts/:slug*", destination: "/areas", permanent: true },
      { source: "/services", destination: "/areas", permanent: true },
      { source: "/services/:slug*", destination: "/areas", permanent: true },
      { source: "/screen", destination: "/areas", permanent: true },
      { source: "/screen/:slug*", destination: "/areas", permanent: true },
      { source: "/check", destination: "/areas", permanent: true },
      { source: "/feed.xml", destination: "/areas", permanent: true },
      // 旧の体験・コミュニティ系 → ホームへ
      { source: "/events", destination: "/", permanent: true },
      { source: "/events/:slug*", destination: "/", permanent: true },
      { source: "/membership", destination: "/", permanent: true },
      { source: "/concierge", destination: "/", permanent: true },
      { source: "/founder", destination: "/", permanent: true },
      { source: "/interview", destination: "/", permanent: true },
      { source: "/map", destination: "/", permanent: true },
      { source: "/network", destination: "/", permanent: true },
      { source: "/network/:slug*", destination: "/", permanent: true },
      { source: "/reflect", destination: "/", permanent: true },
      { source: "/submit-story", destination: "/", permanent: true },
      { source: "/subscribe", destination: "/", permanent: true },
      { source: "/animals", destination: "/", permanent: true },
      { source: "/manifesto", destination: "/", permanent: true },
      // legacy company/legal pages removed — fold into the home / privacy.
      { source: "/about", destination: "/", permanent: true },
      { source: "/legal", destination: "/privacy", permanent: true },
      // /en mirror removed — Japanese only for now.
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:slug*", destination: "/", permanent: true },
      // /assessment folded into the application form.
      { source: "/assessment", destination: "/apply", permanent: true },
      // /partners → /network — the new IA name; old route stays canonical
      // for now so we don't break existing links during the rename window.
      { source: "/partners", destination: "/network", permanent: false },
      { source: "/partners/:slug*", destination: "/network/:slug*", permanent: false },
    ];
  },
};

export default nextConfig;
