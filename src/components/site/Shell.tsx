import type { Metadata, Viewport } from "next";
// ── Webフォントを積むのをやめた ─────────────────────────────
//
// 以前は Noto Sans JP を5ウェイト＋Cormorant を4ウェイト読んでいて、
// 記事1ページが 2.2MB・96リクエストだった。本文600字の記事に載せる重さではない。
//
// ウェイトを 400/700 の2つに絞ってもフォントは 730KB のままだった。
// 実測すると、日本語のサブセット分割で 69ファイル に分かれて落ちてくる
// （119番のブロックだけで 43KB × 2ウェイト）。ウェイトを減らしても、
// ページに出る漢字の種類が減るわけではないので、ここは削れない。
//
// なので端末のフォントで組む。iOS/Mac は ヒラギノ角ゴ、Windows は 游ゴシック。
// どちらも日本語メディアで広く使われている本文書体で、Noto Sans JP と
// 大きく印象が変わらない。転送量は 730KB → 0KB、リクエストは 69 → 0。
//
// もしブランド書体を戻すなら、fontsource ではなく
// 「実際に使う文字だけを含むサブセットを1ファイル作って自前で置く」形にすること。
// fontsource のサブセット分割は、日本語ではこの症状が必ず出る。
import Analytics from "@/components/Analytics";
import { site } from "@/lib/site";
import { FULL } from "@/lib/voice";




/* ══════════════════════════════════════════════════
   面の外側。言語を受け取る
   ══════════════════════════════════════════════════
   面は3つあり、対象も言語も違う。
     /     ja       海外へ一人旅に行く日本人
     /en   en       日本へ一人旅に来る人
     /zh   zh-Hans  同上

   App Router で html を描けるのはルートのレイアウトだけ。
   言語ごとにルートのレイアウトを分けて、どれもここを呼ぶ。

   middleware で header を立てて読む手もあるが、
   それだと全部の面が動的になって、静的に出せなくなる。
   面が7つしかないので、素直に分ける。 */
export default function Shell({
  lang,
  children,
}: {
  lang: "ja" | "en" | "zh-Hans";
  children: React.ReactNode;
}) {
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    alternateName: site.tagline,
    description: site.description,
    inLanguage: site.language,
    publisher: { "@id": `${site.url}/#publisher` },
    /* ── できない操作を、宣言しない ──────────────────
       ここに SearchAction があった。?q= でサイト内を絞り込める、
       という宣言。記事の一覧があったときは本当だった。

       いまのトップは面が1枚で、?q= を読む場所が無い。
       検索エンジンに「ここで検索できます」と言ったまま、
       入口が無い状態になっていた。外す。 */
  };

  // 出版者。メディアなので Organization ではなく NewsMediaOrganization…ではなく、
  // 報道機関ではないため Organization のまま publishingPrinciples を持たせる。
  // 編集方針は独立ページを持たないので、トップの #about を指す。
  const publisherLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#publisher`,
    name: site.name,
    /* ここに旧ブランドと旧カテゴリを残していた。
       検索エンジンに「別名はこれです」と伝える欄なので、
       残すと旧ブランドで引き続き紐づく。

       「男性ウェルネスメディア」は、男性限定に見える表現でもある。
       サービスは男女どちらでも使える形にしたので、両方外す。 */
    /* ── 使っていない名前を、別名として出さない ──────
       ここは「別名はこれです」と検索エンジンに伝える欄。

       「旅亀」と書いてあったが、この名前は画面のどこにも出していない。
       使っていない名前で紐づけても、誰もその名前で探さない。

       出すのは、実際に名乗っている形だけ（voice.ts が持つ）。 */
    alternateName: FULL,
    url: site.url,
    logo: {
      "@type": "ImageObject",
      url: `${site.url}/icon.png`,
      width: 256,
      height: 256,
    },
    /* ── 他の事業のSNSを、ここのものとして出さない ───
       sameAs に His Recoveries（記事事業）の Threads・X・note・
       Substack を並べていた。

       sameAs は「この組織の、公式のアカウントです」という宣言。
       旅の相談を売っている面から、髪や肌の記事を出している
       アカウントを公式として指していた。別の事業のものなので外す。

       このサービス自身のアカウントは、まだ無い。
       無いので、何も書かない（site.social には残してある。
       記事事業の面で使う値で、消すと別の場所が壊れる）。 */
    description: site.description,
    slogan: site.promise,
    foundingDate: "2026",
    publishingPrinciples: `${site.url}/about`,
    // サイトの主題。プロダクトが変わったので、ここも合わせる。
    // 記事の主題（薄毛・肌など）は、各記事のメタデータ側に残っている。
    /* サイトの主題。題材が旅に変わったので、ここも入れ替えた。
       ここが古いままだと、検索エンジンは恋愛相談のサイトとして
       紐づけ続ける。画面を全部直しても、ここだけ残る。 */
    knowsAbout: [
      "海外一人旅",
      "はじめての海外一人旅",
      "出発前の準備",
      "空港から宿までの移動",
      "現地での過ごし方",
      "行った人の実感",
    ],

    knowsLanguage: ["ja"],
    areaServed: { "@type": "Country", name: "Japan" },
    contactPoint: {
      "@type": "ContactPoint",
      /* 記事の編集部ではなく、相談を受ける窓口になった。 */
      contactType: "customer support",
      email: site.company.email,
      /* ── 対応できる言語を、増やして書かない ────────
         ここは "Japanese", "English" だった。
         英語と中国語の面はあるが、その言語で相談を受けられるかは
         まだ確認できていない。だから保証するのは日本語だけ。

         面があることと、その言語で答えられることは別。 */
      availableLanguage: ["Japanese"],
    },
  };

  return (
    <html lang={lang}>
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(publisherLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-ink focus:px-3 focus:py-2 focus:text-off-white"
        >
          {lang === "ja" ? "本文へスキップ" : lang === "en" ? "Skip to content" : "跳到正文"}
        </a>
          
          <main id="main" className="flex-1">
            {children}
          </main>
          {/* 購入率の分母。1来訪につき1回だけ数える */}
          
          {/* 広告と解析のタグ。鍵を入れた分だけ動く */}
          
        
        <Analytics />
      </body>
    </html>
  );
}
