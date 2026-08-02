import Image from "next/image";
import type { ClusterSection } from "@/lib/clusters";

// 本文セクションの中身。記事ページと分野ページで共有する。
//
// これまで「見出し＋段落1つ」しか置けなかったので、
// 比較も、順番も、写真も、全部が文章に溶けていた。
// 表はAI検索がいちばん抜き出しやすい形で、箇条書きは読者が拾いやすい形。
// 器がないと、書き手が書けるものが制限される。
//
// 組みはトップと同じ。カードで囲まず、罫線と余白で区切る。

export default function SectionBody({ s }: { s: ClusterSection }) {
  return (
    <>
      <p className="mt-4 text-[15.5px] leading-[2.1] text-keshizumi">{s.body}</p>

      {s.list && s.list.length > 0 && (
        <ul className="mt-5 border-t border-shironezu">
          {s.list.map((x) => (
            <li
              key={x}
              className="flex gap-3 border-b border-shironezu py-3 text-[15px] leading-[1.9] text-keshizumi"
            >
              <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-asagi" />
              <span>{x}</span>
            </li>
          ))}
        </ul>
      )}

      {s.table && (
        <figure className="mt-6">
          {/* 横に長い表は、ページごと横スクロールさせない。
              min-w を広めに取るのは、狭いと「進みやすい」が
              「進み／い」のように途中で折れてしまうため。 */}
          <div className="overflow-x-auto border border-shironezu bg-hakuji">
            <table className="w-full min-w-[560px] border-collapse text-[14px]">
              <thead>
                <tr>
                  {s.table.head.map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="whitespace-nowrap border-b border-shironezu bg-shironeri px-4 py-3 text-left text-[12.5px] font-bold text-ainezu"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.table.rows.map((row) => (
                  <tr key={row.join("|")}>
                    {row.map((cell, i) => (
                      <td
                        key={i}
                        className={`border-b border-shironezu/70 px-4 py-3 leading-[1.8] [word-break:normal] last:border-b-0 ${
                          i === 0 ? "font-bold text-sumi" : "text-keshizumi"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11.5px] text-ainezu sm:hidden" aria-hidden>
            ← 横にスクロールできます
          </p>
          {s.table.caption && (
            <figcaption className="mt-2 text-[12.5px] leading-[1.85] text-ainezu">
              {s.table.caption}
            </figcaption>
          )}
        </figure>
      )}

      {s.figure && (
        <figure className="mt-6">
          <Image
            src={s.figure.src}
            alt={s.figure.alt}
            width={s.figure.width}
            height={s.figure.height}
            sizes="(min-width: 680px) 680px, 100vw"
            className="h-auto w-full"
          />
          {s.figure.caption && (
            <figcaption className="mt-2.5 text-[12.5px] leading-[1.85] text-ainezu">
              {s.figure.caption}
            </figcaption>
          )}
        </figure>
      )}
    </>
  );
}
