import { buildSearchIndex } from "@/lib/searchIndex";

// 検索用の索引を、静的なJSONとして配る。
//
// 最初はサーバーからクライアントへ props で渡していたが、それだと
// RSC のペイロードに焼き込まれて、検索を1度も開かないページ
// （/plan・記事・プライバシー）にも索引が乗ってしまう。実測で
// /plan の HTML が 180KB になっていた。
//
// 索引が要るのは「検索を開いたとき」と「トップで絞り込んだとき」だけ。
// 別ファイルにして、そのときだけ取りに行く。
// ビルド時に固定されるので、実質は静的ファイルと同じ扱いになる。

export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(buildSearchIndex()), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
