"use client";

// 各ステップの選択肢。
//
// 順番だけ出しても、次に何を選ぶかが残る。ここがその1歩。
//
// ── ランキングにしない ────────────────────────────
// 「おすすめ」の順ではなく、①買わずにできる ②物を替える ③人に頼む、
// の順に並べる。安いものが上に来る並びを実装で固定しているので、
// 高いものを上に出す余地がない。
//
// ── 落としたものを隠さない ──────────────────────────
// 予算・時間・期限に合わなかったものも、理由をつけて必ず出す。
// 隠すと「選択肢を整理した」ではなく「絞って見せた」になり、
// 比較にならない。読者が条件を変えれば戻ってくる、と分かる形にする。

import { useState } from "react";
import { costLabel, sortOptions, TIER_LABEL, type Constraints, type Option } from "@/lib/options";
import type { AreaId } from "@/lib/check";

const TIER_TONE: Record<string, string> = {
  self: "text-asagi",
  buy: "text-asagi",
  pro: "text-asagi",
  care: "text-konjo",
};

function Row({ o }: { o: Option }) {
  return (
    <li className="border-b border-shironezu py-5 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className={`text-[11.5px] ${TIER_TONE[o.tier]}`}>{TIER_LABEL[o.tier]}</span>
        <span className="text-[12px] tabular-nums text-ainezu">{costLabel(o)}</span>
        {o.tier !== "care" && (
          <span className="text-[12px] tabular-nums text-ainezu">
            {o.minutesPerDay === 0 ? "毎日の手間なし" : `1日${o.minutesPerDay}分`}
          </span>
        )}
        <span className="text-[12px] tabular-nums text-ainezu">目安{o.weeks}週</span>
      </div>
      <p className="mt-1.5 text-[15.5px] font-bold leading-[1.65] text-sumi">{o.label}</p>
      <p className="mt-1.5 text-[14px] leading-[1.9] text-keshizumi">{o.what}</p>
      <p className="mt-2 text-[13px] leading-[1.85] text-ainezu">
        <span className="text-keshizumi">向いているのは</span> {o.fitsWhen}
      </p>
      {o.notYet && (
        <p className="mt-1 text-[13px] leading-[1.85] text-ainezu">
          <span className="text-keshizumi">まだ早いのは</span> {o.notYet}
        </p>
      )}
    </li>
  );
}

export default function StepOptions({
  area,
  limits,
}: {
  area: AreaId;
  limits: Constraints;
}) {
  const [openOut, setOpenOut] = useState(false);
  const { fits, out } = sortOptions(area, limits);
  if (fits.length === 0 && out.length === 0) return null;

  return (
    <div className="mt-5">
      {fits.length > 0 && (
        <>
          <p className="text-[12.5px] text-ainezu">あなたの条件だと、選べるのはこの{fits.length}つ</p>
          <ul className="mt-2 border-t border-shironezu">
            {fits.map((o) => (
              <Row key={o.id} o={o} />
            ))}
          </ul>
        </>
      )}

      {out.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setOpenOut((v) => !v)}
            className="text-[13px] text-ainezu underline decoration-shironezu underline-offset-[5px] transition-colors hover:text-asagi"
            aria-expanded={openOut}
          >
            条件から外したもの（{out.length}）
            <span aria-hidden className="ml-1">{openOut ? "▴" : "▾"}</span>
          </button>
          {openOut && (
            <ul className="mt-3 border-t border-shironezu">
              {out.map(({ option, reason }) => (
                <li key={option.id} className="border-b border-shironezu py-3.5 last:border-b-0">
                  <p className="text-[14px] leading-[1.75] text-ainezu">{option.label}</p>
                  <p className="mt-1 text-[12.5px] leading-[1.8] text-ainezu">
                    外した理由：{reason}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
