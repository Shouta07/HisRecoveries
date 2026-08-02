import Link from "next/link";
import { clusters } from "@/lib/clusters";
import { complexes } from "@/lib/complexes";
import { AREA_ORDER } from "@/lib/searchIndex";

// 全記事の一覧。サーバーで書き出す。
//
// 以前はクライアント側で描いていたので、記事データをJSかRSCのどちらかで
// ブラウザまで運ぶ必要があった。絞り込みをしていない状態——つまり
// ほとんどの訪問——では、それは要らない。
// 絞り込みが始まったら、クライアント側が索引を取りに行って描き直す。

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function ArticleList() {
  const areaName = (id: string) => complexes.find((c) => c.id === id)?.ja ?? "";
  const groups = AREA_ORDER.map((id) => ({
    id,
    name: areaName(id),
    items: clusters.filter((a) => a.areaId === id),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-[72px] sm:gap-[96px]">
      {groups.map((g) => (
        <section key={g.id}>
          <div className="flex items-baseline gap-4 border-b-2 border-sumi pb-3">
            <h3 className="text-[17px] sm:text-[19px]" style={{ ...MINCHO, fontWeight: 700 }}>
              {g.name}
            </h3>
            <span className="text-[12.5px] tabular-nums text-ainezu">{g.items.length}</span>
            <Link
              href={`/areas/${g.id}`}
              className="ml-auto text-[13px] font-bold text-asagi underline decoration-asagi/40 underline-offset-[5px] transition-colors hover:decoration-asagi"
            >
              この分野について
            </Link>
          </div>

          <ul className="lg:grid lg:grid-cols-2 lg:gap-x-12">
            {g.items.map((a) => (
              <li key={a.slug} className="border-b border-shironezu">
                <Link
                  href={`/areas/${a.areaId}/${a.slug}`}
                  className="group block py-7 transition-colors hover:text-asagi"
                >
                  <h4
                    className="text-[17px] leading-[1.7] sm:text-[19px]"
                    style={{ ...MINCHO, fontWeight: 700 }}
                  >
                    {a.title}
                  </h4>
                  <p className="mt-2.5 text-[14px] leading-[1.95] text-keshizumi">
                    {a.lead}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
