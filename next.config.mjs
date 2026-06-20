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
      // /stories → /recoveries — same content under the brand-aligned URL.
      // The src/app/stories/ pages remain in the repo only as historical
      // artifacts; this redirect makes them unreachable in production.
      { source: "/stories", destination: "/recoveries", permanent: true },
      { source: "/stories/:slug", destination: "/recoveries/:slug", permanent: true },
      // /partners → /network — the new IA name; old route stays canonical
      // for now so we don't break existing links during the rename window.
      { source: "/partners", destination: "/network", permanent: false },
      { source: "/partners/:slug*", destination: "/network/:slug*", permanent: false },
    ];
  },
};

export default nextConfig;
