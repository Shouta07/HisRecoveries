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
      // /recoveries (and legacy /stories) were folded into the one-page home;
      // send them to the home's interviews section.
      { source: "/stories", destination: "/", permanent: true },
      { source: "/stories/:slug", destination: "/", permanent: true },
      { source: "/recoveries", destination: "/", permanent: true },
      { source: "/recoveries/:slug*", destination: "/", permanent: true },
      { source: "/territories", destination: "/", permanent: true },
      { source: "/territories/:slug*", destination: "/", permanent: true },
      { source: "/manifesto", destination: "/", permanent: true },
      // /partners → /network — the new IA name; old route stays canonical
      // for now so we don't break existing links during the rename window.
      { source: "/partners", destination: "/network", permanent: false },
      { source: "/partners/:slug*", destination: "/network/:slug*", permanent: false },
    ];
  },
};

export default nextConfig;
