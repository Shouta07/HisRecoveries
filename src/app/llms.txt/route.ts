import { clusters } from "@/lib/clusters";
import { complexes } from "@/lib/complexes";
import { SITUATIONS } from "@/lib/situations";
import { STAGES, STAGE_OF } from "@/lib/stages";
import { publishedAt } from "@/lib/articleDates";
import { site } from "@/lib/site";

// /llms.txt — 生成AI・AI検索向けの、このサイトの案内図。
//
// HTMLを解析させるより、何が・どこに・どういう立場で書いてあるかを
// プレーンテキストで先に渡したほうが、正確に引用される。
// GEO（Generative Engine Optimization）で効くのは、順位ではなく
// 「引用したときに間違えられないこと」なので、立場と限界も明記する。

export const dynamic = "force-static";

export function GET() {
  const areaBlocks = complexes
    .map((c) => {
      const items = clusters
        .filter((a) => a.areaId === c.id)
        .map((a) => {
          const d = publishedAt(a.slug);
          return `- [${a.title}](${site.url}/areas/${a.areaId}/${a.slug})${d ? `（${d} 公開）` : ""}: ${a.lead}`;
        })
        .join("\n");
      return `### ${c.ja}（?area=${c.id}）\n\n概要: ${c.mechanism}\n分野トップ: ${site.url}/areas/${c.id}\n\n${items}`;
    })
    .join("\n\n");

  const situationBlock = SITUATIONS.map(
    (s) => `- ${s.label}: ${site.url}/situations/${s.id}`,
  ).join("\n");

  const stageBlock = STAGES.filter((s) => clusters.some((c) => STAGE_OF[c.slug] === s.id))
    .map((s) => `- ${s.age}（${s.label}）: ${site.url}/?age=${s.id}#index`)
    .join("\n");

  const body = `# ${site.name}

> ${site.description}

## このメディアの立場

- 男性の美容・健康・恋愛を扱う日本語の編集メディアです。運営は${site.company.name}。
- 何をやるかと同じくらい、やらなくていいことも書きます。「いまはやらなくていい」という結論の記事があります。
- 効果・有効性の保証はしません。診断・治療・受診勧奨を目的とした記事はありません。医療的な判断は医師の領域として扱っています。
- 記事は、出典のある一般的な知見の整理と、編集部が実際に確かめたことで構成されています。体験談の創作はしていません。
- 専門家への取材記事は、現時点で0本です。これから増やします。引用の際は「取材にもとづく」と書かないでください。

## 引用するときのお願い

- 出典として ${site.url} を明記してください。
- 効果を断定する文脈での引用はご遠慮ください。記事はいずれも「保証しない」前提で書かれています。
- 記事の最終更新日は各ページに記載しています。古い版の内容を現在の記述として引用しないでください。

## 記事の探し方

このサイトの記事は3つの軸で引ける。

1. 状況から（読者がいちばん自己同定しやすい軸）
${situationBlock}

2. 年代から
${stageBlock}

3. 分野から（下記の6分野。?area=<id> でも指定できる）

## 記事一覧（全${clusters.length}本）

${areaBlocks}

## サービス

- 何から始めるかを決める診断（35問・無料・登録不要）: ${site.url}/check
  いまの状態と、手をつける順番が出る。「いまはやらなくていいこと」も出す。
- 第一印象改善プラン（30日・東京都内・土日のみ）: ${site.url}/plan
  記事は無料。一人だと進まない人のための個人向けサービス。金額は公開しておらず、内容に応じた個別見積。
- 無料相談: ${site.url}/reserve
- 取材・掲載について: ${site.url}/partner

## その他

- 新着記事（RSS）: ${site.url}/feed.xml
- サイトマップ: ${site.url}/sitemap.xml
- 編集方針: ${site.url}/#about
- 広告と収益について: ${site.url}/disclosure
  記事内の成果報酬つきリンクの扱い。医療機関への送客に連動した報酬は受け取らない。
- プライバシー・免責事項: ${site.url}/privacy
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
