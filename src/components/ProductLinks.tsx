import { adCategory, productRel, type ProductRef } from "@/lib/monetization";

// 本文の中に置く、具体的な物・サービス。
//
// カードにして囲まない。記事の組みは罫線と余白でできているので、
// ここだけ広告然とした箱にすると、読み物の途中に別のサイトが挟まったように見える。
//
// 「広告」の表示は、リンクの隣に必ず出す（景表法・ステマ規制）。
// 記事の頭の告知だけでは、途中から読んだ人に届かない。

export default function ProductLinks({ items }: { items: ProductRef[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="mt-6 border-t border-shironezu">
      {items.map((p) => (
        <li key={p.href} className="border-b border-shironezu py-4">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <a
              href={p.href}
              target="_blank"
              rel={productRel(p)}
              className="text-[15.5px] font-bold leading-[1.7] text-asagi underline decoration-asagi/40 underline-offset-[5px] transition-colors hover:decoration-asagi"
            >
              {p.name}
              <span aria-hidden> ↗</span>
            </a>
            {p.sponsored && (
              <span className="shrink-0 border border-shironezu px-1.5 py-0.5 text-[11px] leading-none text-ainezu">
                広告
              </span>
            )}
            {p.price && (
              <span className="text-[12.5px] tabular-nums text-ainezu">{p.price}</span>
            )}
          </div>
          <p className="mt-1.5 text-[14.5px] leading-[1.9] text-keshizumi">{p.note}</p>
          <p className="mt-1 text-[12px] text-ainezu">{adCategory(p.category).label}</p>
        </li>
      ))}
    </ul>
  );
}
