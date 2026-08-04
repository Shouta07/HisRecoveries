import Link from "next/link";
import AreaMark from "./AreaMark";
import { complexById } from "@/lib/complexes";

// 一覧の1行。
//
// ── 箱にした理由 ──────────────────────────────
// これまでは地の上に文字を直接置き、下だけ罫線で区切っていた。
// PCではきれいだが、スマホでは押せる範囲が文字の行そのものになり、
// 実測で高さ44px未満の押せる要素が44個あった。親指で外す。
//
// トップの覚え書きには「カードで囲まない」と書いてあった。
// それは影付きの浮いたカードを禁じる意味なので、
// 罫線と余白でつくる箱にする（影は使わない）。
// 分野タイルと同じ組み方（gap-px の上に地色を敷く）なので、
// 見た目は今までのサイトのままで、押せる面積だけ増える。
//
// ── 説明文をスマホで出さない理由 ──────────────────
// 55件それぞれに導入文が付くと、索引だけで12,090px あった。
// 探している人が読みたいのは題で、説明は開いてから読む。
// 画面が広いときだけ出す。

export type RowArticle = {
  slug: string;
  areaId: string;
  title: string;
  lead: string;
  /** 読了の目安（分）。無ければ出さない */
  minutes?: number;
};

const MINCHO: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Mincho ProN', 'Yu Mincho', serif",
  fontFeatureSettings: '"palt" 1',
};

export default function ArticleRow({
  a,
  showArea = false,
}: {
  a: RowArticle;
  /**
   * 分野名を文字でも出すか。
   * 分野ごとにまとめた一覧では、見出しに分野名があり、行頭にも印がある。
   * そこへさらに文字で書くと、同じ分野の行が全部同じ言葉で始まって、
   * 題より先にそれが目に入る。まとめの外で使うときだけ true にする。
   */
  showArea?: boolean;
}) {
  const areaName = complexById(a.areaId)?.ja ?? "";

  return (
    <li className="bg-shironeri">
      <Link
        href={`/areas/${a.areaId}/${a.slug}`}
        className="group flex h-full gap-3.5 px-4 py-4 transition-colors hover:bg-hakuji sm:px-5 sm:py-5"
      >
        <AreaMark areaId={a.areaId} className="mt-[3px] shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2.5 text-[12px] text-ainezu">
            {showArea && <span>{areaName}</span>}
            {a.minutes ? <span className="tabular-nums">約{a.minutes}分</span> : null}
          </span>
          <span
            className="mt-1 block text-[16px] leading-[1.62] transition-colors group-hover:text-asagi sm:text-[17px] sm:leading-[1.68]"
            style={{ ...MINCHO, fontWeight: 700 }}
          >
            {a.title}
          </span>
          <span className="mt-1.5 hidden text-[14px] leading-[1.9] text-keshizumi sm:block">
            {a.lead}
          </span>
        </span>
      </Link>
    </li>
  );
}
