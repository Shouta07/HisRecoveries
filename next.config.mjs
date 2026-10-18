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
      /* ══════════════════════════════════════════════
         www を付けない形に寄せる
         ══════════════════════════════════════════════
         正式は tashikame.app。www.tashikame.app は 301 で寄せる。
         2つの住所で同じ中身が出ると、検索の評価が割れる。

         ── 旧ドメイン（hisrecoveries.com）は、ここに書かない ──
         ここに書くと、そのドメインが Vercel のこのプロジェクトに
         繋がっていることが前提になる。繋ぎ替えた日に、黙って効かなくなる。

         2026-10、このプロジェクトから外すことにした。
         301 は Vercel ではなく、レジストラ（または Cloudflare）側で続ける。

         切らずに残すのは、移行が終わっていないため。
         tashikame.app を立てたのが 2026-10-03 で、
         評価が移りきるには数週間から数か月かかる。
         記事55本ぶんの蓄積が、途中で途切れる。

         3〜6か月ほど置いてから、転送も止めること。 */
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.tashikame.app" }],
        destination: "https://tashikame.app/:path*",
        permanent: true,
      },
      // ── 旧 His Recoveries の商品面を畳んだ（タシカメ1本にする）──
      // 消したページは検索に残っている。404 にすると、そのぶんの
      // 評価がそのまま消える。行き先のある面へ 301 で渡す。
      //
      // ── タシカメの面を畳んだぶん（2026-09）──
      // /how     「仕組み」。トップの1画面目が
      //          Before → 相談 → After の3枚で同じことを見せるようになった
      // /safety  「安心・安全」。禁止していることは利用規約 第9条が持つ
      // /join    「答える側になる」。回答者の募集は個別に案内する
      //
      // /join?ref=CODE は、配った紹介リンクの着地先だった。
      // クエリごと拾えるように source は /join のままにしてある
      // （Next.js は既定でクエリを引き継ぐ）。
      { source: "/how", destination: "/", permanent: true },
      { source: "/safety", destination: "/terms", permanent: true },
      { source: "/join", destination: "/", permanent: true },

      // 第一印象改善プラン（¥49,800）と、その申し込み導線
      { source: "/plan", destination: "/", permanent: true },
      { source: "/reserve", destination: "/", permanent: true },
      { source: "/apply", destination: "/", permanent: true },
      // 「男の改善、全部の順番」は記事側のまとめだったので記事一覧へ
      { source: "/order", destination: "/", permanent: true },
      { source: "/skip", destination: "/", permanent: true },
      // 診断（Recovery Assessment）と、その選択肢の面
      { source: "/check", destination: "/", permanent: true },
      { source: "/choices", destination: "/", permanent: true },
      { source: "/choices/:slug*", destination: "/", permanent: true },
      // 記録アプリ（Relationship Companion）
      { source: "/app", destination: "/", permanent: true },
      { source: "/app/:slug*", destination: "/", permanent: true },
      // お便り・提携・調査・取材
      { source: "/letters", destination: "/", permanent: true },
      { source: "/partner", destination: "/legal", permanent: true },
      { source: "/research", destination: "/about", permanent: true },
      { source: "/interview", destination: "/about", permanent: true },
      // 商品は「第一印象改善プラン（30日 ¥49,800）」の1本のみ。
      // 旧パッケージ／旧2商品（Recover・Refine）ページは全廃し、ホームの価格へ集約する。
      { source: "/packages", destination: "/pricing", permanent: true },
      { source: "/packages/:slug*", destination: "/pricing", permanent: true },
      // 記事一覧はトップに統合した（/areas/:id 以下の記事はそのまま）
      { source: "/areas", destination: "/", permanent: true },
      { source: "/situations", destination: "/", permanent: true },
      // 面を減らした（記事に集中する）。削除したページはトップへ。
      { source: "/stages", destination: "/", permanent: true },
      { source: "/stages/:slug*", destination: "/", permanent: true },
      { source: "/business", destination: "/", permanent: true },
      // FAQ は /plan に集約（全件＋FAQPage schema）
      { source: "/faq", destination: "/pricing", permanent: true },
      { source: "/producer", destination: "/", permanent: true },
      // 編集方針は独立ページをやめ、トップの #about に統合
      { source: "/why", destination: "/about", permanent: true },
      { source: "/recover", destination: "/", permanent: true },
      { source: "/refine", destination: "/", permanent: true },
      // /areas は第一印象4領域に特化 → 退避した領域はライブラリ index へ
      { source: "/areas/sweat", destination: "/", permanent: true },
      { source: "/areas/sweat/:slug*", destination: "/", permanent: true },
      { source: "/areas/self", destination: "/", permanent: true },
      { source: "/areas/self/:slug*", destination: "/", permanent: true },
      // オンライン伴走ページは会員ページ(β)に統合（旧コピーがゼロ入力方針と矛盾のため削除）
      { source: "/online", destination: "/", permanent: true },
      { source: "/mechanism", destination: "/", permanent: true },
      { source: "/mechanism/:slug*", destination: "/", permanent: true },
      { source: "/interviews", destination: "/", permanent: true },
      { source: "/interviews/:slug*", destination: "/", permanent: true },
      /* /stories の転送を消した。
         記事の一覧があったころの名残で /articles へ飛ばしていたが、
         いまは実体験の記事を /stories/<slug> に置いている。
         残しておくと、作った面が転送に隠される
         （/en でも同じことが起きた）。 */
      { source: "/recoveries", destination: "/", permanent: true },
      { source: "/recoveries/:slug*", destination: "/", permanent: true },
      { source: "/territories", destination: "/", permanent: true },
      { source: "/territories/:slug*", destination: "/", permanent: true },
      // 旧メディア（記事・コンテンツ）を削除 → 仕組みライブラリ or ホームへ
      // :slug* は0個以上にマッチするので /articles 自身も拾ってしまう。
      // 索引を /articles に置いた結果、自分から自分への308が無限に返っていた。
      // 下の階層だけを拾うよう :slug+（1個以上）にする。
      { source: "/articles/:slug*", destination: "/", permanent: true },
      { source: "/feelings", destination: "/", permanent: true },
      { source: "/feelings/:slug*", destination: "/", permanent: true },
      { source: "/concerns", destination: "/", permanent: true },
      { source: "/concerns/:slug*", destination: "/", permanent: true },
      { source: "/qa", destination: "/", permanent: true },
      { source: "/qa/:slug*", destination: "/", permanent: true },
      // /ask は実在のページ（女性に聞く）になった。転送を外す。
      // 残すと 308 が返り、プロダクトの入口ごと到達できなくなる。
      // この事故はこのプロジェクトで /check・/interview・/articles に続いて4件目。
      { source: "/experts", destination: "/", permanent: true },
      { source: "/experts/:slug*", destination: "/", permanent: true },
      { source: "/services", destination: "/", permanent: true },
      { source: "/services/:slug*", destination: "/", permanent: true },
      { source: "/screen", destination: "/", permanent: true },
      { source: "/screen/:slug*", destination: "/", permanent: true },
      // /check は診断ページとして復活させたので、リダイレクトを外した。
      // 旧 308 をブラウザが覚えている場合があるが、実体のあるページが
      // 返るようになれば再クロールで置き換わる。
      // /feed.xml は実体のある RSS になったのでリダイレクトしない
      // 旧の体験・コミュニティ系 → ホームへ
      { source: "/events", destination: "/", permanent: true },
      { source: "/events/:slug*", destination: "/", permanent: true },
      { source: "/membership", destination: "/", permanent: true },
      { source: "/concierge", destination: "/", permanent: true },
      { source: "/founder", destination: "/", permanent: true },
      { source: "/map", destination: "/", permanent: true },
      { source: "/network", destination: "/", permanent: true },
      { source: "/network/:slug*", destination: "/", permanent: true },
      { source: "/reflect", destination: "/", permanent: true },
      { source: "/submit-story", destination: "/", permanent: true },
      { source: "/subscribe", destination: "/", permanent: true },
      { source: "/animals", destination: "/", permanent: true },
      // /manifesto は思想ページとして復活（リダイレクトを解除）
      // legacy company/legal pages removed — fold into the home / privacy.
      // /legal は特定商取引法に基づく表記の実ページになった。転送を外す。
      // 課金する以上、この表記に到達できないのは法令上まずい。
      // （/check・/interview・/articles・/ask に続いて5件目の同じ事故）
      /* ── /en と /zh は、いま本物の面になった ──────
         ここには前、「/en は廃止」の301が残っていた。
         訪日向けの面を作ったあとも効いていて、
         /en を開くと日本語トップへ飛ばされていた。

         消す。作った面を、古い転送が隠していた。 */
      // /assessment folded into the application form.
      { source: "/assessment", destination: "/", permanent: true },
      // /partners は「現場のプロの方へ」ページとして復活（リダイレクト解除）。
      // 旧サブパスのみ集約（:slug+ で1階層以上。:slug* だと /partners 自身にマッチしてループする）。
      { source: "/partners/:slug*", destination: "/legal", permanent: true },
    ];
  },
};

export default nextConfig;
