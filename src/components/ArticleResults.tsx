"use client";

// 全記事の索引。トップのいちばん下に置く。
//
// これまではヒーローの直下にあった。つまり表紙をめくった最初の面が
// 55件の目次で、編集が選んだ「新しい記事」「よく読まれている記事」は
// そのはるか下にあった。読者が最初に受け取るのが目次だと、
// ページは「探す画面」になり、読む動機は生まれない。
//
// 索引そのものは要る（分野語の検索で当たる面であり、回遊の受け皿でもある）。
// 要らないのは、それが先頭にあることのほう。
//
// 記事のデータはここでも import しない。SearchProvider が
// サーバーで作った索引（本文を含まない）を持っているので、そこから取る。

import { useSearch } from "@/components/search/SearchProvider";
import ArticleGroup from "@/components/article/ArticleGroup";

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function ArticleResults({ list }: { list: React.ReactNode }) {
  const s = useSearch();
  // 索引が届いていない間は、絞り込み条件があってもサーバーの一覧を出しておく。
  // 空白を見せるより、全部見えているほうがまし。
  const filtering = s.hasFilter && s.ready;

  return (
    <div
      id="index"
      className="mx-auto max-w-[1080px] scroll-mt-[76px] px-5 pt-20 sm:px-8 sm:pt-28 lg:px-12 lg:scroll-mt-[110px]"
    >
      <div className="flex items-baseline justify-between gap-4 pb-1">
        <h2 className="text-[19px] sm:text-[23px]" style={{ ...MINCHO, fontWeight: 700 }}>
          記事をさがす
        </h2>
        <p className="text-[12.5px] tabular-nums text-ainezu">
          {filtering ? `${s.total}件` : `全${s.allCount}本`}
        </p>
      </div>

      {/* 絞り込み中は、条件と解除をここに出す（シートを開かなくても外せる） */}
      {filtering ? (
        <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-2 border-t border-shironezu pt-4 text-[13.5px] text-keshizumi">
          <span className="text-ainezu">絞り込み中：</span>
          {s.labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
          <button
            type="button"
            onClick={s.clearAll}
            className="font-bold text-asagi underline decoration-asagi/40 underline-offset-[5px] transition-colors hover:decoration-asagi"
          >
            すべて解除
          </button>
        </p>
      ) : (
        <p className="mt-4 border-t border-shironezu pt-4 text-[13.5px] text-keshizumi">
          状況・年代・分野からしぼり込めます。
          <button
            type="button"
            onClick={() => s.setOpen(true)}
            className="ml-1.5 font-bold text-asagi underline decoration-asagi/40 underline-offset-[5px] transition-colors hover:decoration-asagi"
          >
            条件を選ぶ
          </button>
        </p>
      )}

      {!filtering ? (
        list
      ) : s.total === 0 ? (
        <div className="mt-12 border border-dashed border-shironezu bg-hakuji/50 px-6 py-8">
          <p className="text-[16px]" style={{ ...MINCHO, fontWeight: 700 }}>
            この条件に当てはまる記事は、まだありません。
          </p>
          <p className="mt-3 text-[14px] leading-[1.95] text-keshizumi">
            数合わせで記事を作ることはしないので、見つからないときは正直にこう出ます。
            条件を1つ外すか、別の言葉でお試しください。
          </p>
          <button
            type="button"
            onClick={s.clearAll}
            className="mt-5 text-[14px] font-bold text-asagi underline decoration-asagi/40 underline-offset-[6px] transition-colors hover:decoration-asagi"
          >
            すべて解除する
          </button>
        </div>
      ) : (
        <div className="mt-12 flex flex-col gap-[56px] sm:gap-[80px]">
          {s.groups.map((g) => (
            <ArticleGroup key={g.id} id={g.id} name={g.name} items={g.items} />
          ))}
        </div>
      )}
    </div>
  );
}
