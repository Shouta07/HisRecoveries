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
      { source: "/mechanism", destination: "/#mechanism", permanent: true },
      { source: "/mechanism/:slug*", destination: "/#mechanism", permanent: true },
      { source: "/interviews", destination: "/#mechanism", permanent: true },
      { source: "/interviews/:slug*", destination: "/#mechanism", permanent: true },
      // legacy routes also fold into the home's mechanism section.
      { source: "/stories", destination: "/#mechanism", permanent: true },
      { source: "/stories/:slug", destination: "/#mechanism", permanent: true },
      { source: "/recoveries", destination: "/#mechanism", permanent: true },
      { source: "/recoveries/:slug*", destination: "/#mechanism", permanent: true },
      { source: "/territories", destination: "/#mechanism", permanent: true },
      { source: "/territories/:slug*", destination: "/#mechanism", permanent: true },
      { source: "/manifesto", destination: "/", permanent: true },
      // legacy company/legal pages removed — fold into the home / privacy.
      { source: "/about", destination: "/#about", permanent: true },
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
