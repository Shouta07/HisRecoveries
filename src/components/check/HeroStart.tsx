"use client";

import Link from "next/link";
import { AREA_LABEL_SHORT, type AreaId } from "@/lib/check";
import { track } from "@/lib/analytics";

// ファーストビューの診断入口。
//
// 「診断する」ボタンを1つ置くのではなく、1問目そのものを出す。
// ボタンは「これから何かが始まる」という約束だが、選択肢は
// もう始まっている。押した時点で診断の中にいる。
//
// 副次的に、この6つが並ぶこと自体が「誰向けのサイトか」を1秒で答える。
// コピーで説明するより、扱っている悩みを見せるほうが速い。

const CHIPS: { id: AreaId; label: string }[] = [
  { id: "impression", label: AREA_LABEL_SHORT.impression },
  { id: "hair", label: AREA_LABEL_SHORT.hair },
  { id: "skin", label: AREA_LABEL_SHORT.skin },
  { id: "face", label: AREA_LABEL_SHORT.face },
  { id: "body-hair", label: AREA_LABEL_SHORT["body-hair"] },
  { id: "mind", label: AREA_LABEL_SHORT.mind },
];

export default function HeroStart() {
  return (
    <div>
      <p className="hr-rise text-[13.5px] font-bold text-sumi" style={{ ["--d" as string]: "820ms" }}>
        いま、いちばん気になっているのは？
      </p>

      {/* 3列 × 2段。1つずつ順に現れる（動きは globals.css 側で
          prefers-reduced-motion のときは全部止まる）。
          PCでも3列のまま——左半分に置くので、6列にすると1つが狭くなりすぎる。 */}
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {CHIPS.map((c, i) => (
          <li key={c.id}>
            <Link
              href={`/check?focus=${c.id}`}
              onClick={() => track("check_open", { from: "hero-chip", focus: c.id })}
              className="hr-rise block border border-shironezu bg-hakuji px-2 py-3.5 text-center text-[13px] sm:text-[13.5px] font-bold leading-[1.4] text-keshizumi transition-[background-color,border-color,color,transform] duration-150 hover:-translate-y-0.5 hover:border-asagi hover:bg-asagi hover:text-shironeri active:translate-y-0 active:bg-asagi active:text-shironeri motion-reduce:hover:translate-y-0"
              style={{ ["--d" as string]: `${900 + i * 70}ms` }}
            >
              {c.label}
            </Link>
          </li>
        ))}
      </ul>

      <p
        className="hr-rise mt-3.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
        style={{ ["--d" as string]: "1340ms" }}
      >
        <Link
          href="/check"
          onClick={() => track("check_open", { from: "hero-all" })}
          className="text-[13.5px] font-bold text-asagi underline decoration-asagi/40 underline-offset-[5px] transition-colors hover:decoration-asagi"
        >
          まとめて診る<span aria-hidden> →</span>
        </Link>
        <span className="text-[11.5px] tabular-nums text-ainezu">
          5問・30秒・登録不要
        </span>
      </p>
    </div>
  );
}
