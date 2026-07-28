import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    // /admin/studio が apps/threads のスナップショット(承認キュー・履歴)を
    // サーバー側で fs 読みするため、Vercel の関数バンドルに同梱する。
    outputFileTracingIncludes: {
      "/admin/studio": [
        "./apps/threads/accounts/mens-body-lab/approvals.json",
        "./apps/threads/accounts/mens-body-lab/history.json",
      ],
      "/admin/threads": [
        "./apps/threads/accounts/mens-body-lab/approvals.json",
        "./apps/threads/accounts/mens-body-lab/history.json",
        "./apps/threads/accounts/mens-body-lab/persona.json",
        "./apps/threads/accounts/mens-body-lab/hypotheses.json",
        "./apps/threads/accounts/mens-body-lab/thread_templates.json",
      ],
    },
  },
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
      // 商品は「第一印象改善プラン（30日 ¥49,800）」の1本のみ。
      // 旧パッケージ／旧2商品（Recover・Refine）ページは全廃し、ホームの価格へ集約する。
      { source: "/packages", destination: "/#pricing", permanent: true },
      { source: "/packages/:slug*", destination: "/#pricing", permanent: true },
      { source: "/recover", destination: "/", permanent: true },
      { source: "/refine", destination: "/", permanent: true },
      // /areas は第一印象4領域に特化 → 退避した領域はライブラリ index へ
      { source: "/areas/sweat", destination: "/areas", permanent: true },
      { source: "/areas/sweat/:slug*", destination: "/areas", permanent: true },
      { source: "/areas/self", destination: "/areas", permanent: true },
      { source: "/areas/self/:slug*", destination: "/areas", permanent: true },
      // オンライン伴走ページは会員ページ(β)に統合（旧コピーがゼロ入力方針と矛盾のため削除）
      { source: "/online", destination: "/member", permanent: true },
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
      // /manifesto は思想ページとして復活（リダイレクトを解除）
      // legacy company/legal pages removed — fold into the home / privacy.
      { source: "/about", destination: "/", permanent: true },
      { source: "/legal", destination: "/privacy", permanent: true },
      // /en mirror removed — Japanese only for now.
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:slug*", destination: "/", permanent: true },
      // /assessment folded into the application form.
      { source: "/assessment", destination: "/apply", permanent: true },
      // /partners は「現場のプロの方へ」ページとして復活（リダイレクト解除）。
      // 旧サブパスのみ集約（:slug+ で1階層以上。:slug* だと /partners 自身にマッチしてループする）。
      { source: "/partners/:slug+", destination: "/partners", permanent: true },
    ];
  },
};

export default nextConfig;
