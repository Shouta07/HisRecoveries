import Link from "next/link";
import { CATEGORIES, type CategoryId } from "@/lib/ask/model";

// 記事の終わりに置く、プロダクトへの導線。
//
// ── 記事を残したまま、中心から外す ────────────────
// 55本は消さない。URLもそのまま。検索から来た人の受け皿として残す。
// ただし読み終わりを行き止まりにせず、
// 「その写真、本当に女性から見て印象いい？」へつなぐ。
//
// ── 記事の内容に合わせて問いを変える ──────────────
// 全記事に同じ一文を置くと、広告に見えて読み飛ばされる。
// 分野ごとに、その記事を読んだ直後にいちばん出てくる問いを置く。
//
// ── 煽らない ──────────────────────────────────
// 「まだ知らないの？」の類は置かない。
// 読み終わった人に、次の一歩を1つだけ差し出す。

/** 記事の分野 → 聞くカテゴリと、その場の問い */
const BY_AREA: Record<string, { c: CategoryId; q: string }> = {
  impression: { c: "photo", q: "その写真、女性から見て印象はどうなんだろう。" },
  hair: { c: "style", q: "その髪型、女性から見てどう見えているんだろう。" },
  skin: { c: "style", q: "その見た目、女性はどこを見ているんだろう。" },
  face: { c: "photo", q: "その顔写真、女性から見て会いたいと思うだろうか。" },
  "body-hair": { c: "style", q: "そこ、女性は実際どう感じているんだろう。" },
  mind: { c: "romance", q: "その距離の取り方、女性からはどう見えるんだろう。" },
};

const FALLBACK = { c: "romance" as CategoryId, q: "それ、女性から見てどうなんだろう。" };

export default function AskCta({ areaId }: { areaId?: string }) {
  const { c, q } = (areaId && BY_AREA[areaId]) || FALLBACK;
  const label = CATEGORIES.find((x) => x.id === c)?.label ?? "";

  return (
    <aside className="mx-auto mt-16 max-w-reading border-t border-hairline pt-10">
      <p className="text-[11.5px] font-medium tracking-[0.12em] text-faint">
        読んだあとに、確かめる
      </p>
      <p className="mt-3 font-display text-[19px] font-bold leading-[1.7] text-charcoal sm:text-[21px]">
        {q}
      </p>
      <p className="mt-3 max-w-[26em] text-[14.5px] leading-[1.95] text-bodytext">
        記事に書いてあるのは、調べて分かる範囲のことです。
        実際にどう受け取られるかは、その人たちに聞かないと分かりません。
      </p>
      <div className="mt-6">
        <Link
          href={`/ask?c=${c}`}
          className="inline-flex min-h-[52px] items-center justify-center rounded-[8px] bg-accent px-7 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-accent/90"
        >
          女性に聞いてみる
        </Link>
      </div>
      <p className="mt-3.5 text-[12.5px] leading-[1.8] text-faint">
        {label}について、匿名で3人か5人に。登録は要りません。
      </p>
    </aside>
  );
}
