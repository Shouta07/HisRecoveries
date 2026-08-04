import { clusters } from "@/lib/clusters";
import { complexes } from "@/lib/complexes";
import { AREA_ORDER } from "@/lib/searchIndex";
import { readingMinutes } from "@/lib/reading";
import ArticleGroup from "@/components/article/ArticleGroup";

// 全記事の一覧。サーバーで書き出す。
//
// 以前はクライアント側で描いていたので、記事データをJSかRSCのどちらかで
// ブラウザまで運ぶ必要があった。絞り込みをしていない状態——つまり
// ほとんどの訪問——では、それは要らない。
// 絞り込みが始まったら、クライアント側が索引を取りに行って描き直す。
//
// 行の見た目と「残りを畳む」挙動は ArticleGroup / ArticleRow に置いた。
// 絞り込み後の一覧（ArticleResults）と同じものを使う。
// 前は両方に同じ JSX を書いていて、片方だけ直すと見た目がずれた。

export default function ArticleList() {
  const areaName = (id: string) => complexes.find((c) => c.id === id)?.ja ?? "";
  const groups = AREA_ORDER.map((id) => ({
    id,
    name: areaName(id),
    items: clusters
      .filter((a) => a.areaId === id)
      .map((a) => ({
        slug: a.slug,
        areaId: a.areaId,
        title: a.title,
        lead: a.lead,
        minutes: readingMinutes(a),
      })),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-[56px] sm:gap-[80px]">
      {groups.map((g) => (
        <ArticleGroup key={g.id} id={g.id} name={g.name} items={g.items} />
      ))}
    </div>
  );
}
