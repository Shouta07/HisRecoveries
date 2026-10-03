"use client";

import { useState } from "react";
import {
  PERIODS, perMonth, monthlyTotal, lumpSaves, isFixed, payLabel, perksFor,
  type Pay, type Period,
} from "@/lib/pass/periods";
import { track } from "@/lib/analytics";

/* ══════════════════════════════════════════════════
   期間と、払い方を選ぶ
   ══════════════════════════════════════════════════

   ── 組み合わせを、1枚に全部並べない ──────────────
   期間4つ × 払い方2つで7通り。
   カードを7枚並べると、どれを見ればいいか分からなくなる。

     1  使う期間を選ぶ
     2  払い方を選ぶ

   2段にすると、どの段も選択肢が4つ以下になる。
   マッチングアプリの課金画面と同じ形なので、見慣れている。

   ── 月払いを「いつでも解約」に見せない ──────────
   ここがいちばん苦情になるところ。

   3か月・6か月・12か月の月払いは、期間が決まっていて、
   支払いだけ分けるもの。途中でやめても請求は止まらない。

   だから、
     札には「3か月契約・月払い」と書く（payLabel が作る）
     金額の下に、必ず断りを出す
     「月々2,780円」だけを大きく出さない

   ── 一括を押すが、月払いを隠さない ──────────────
   一括のほうが安いのは本当なので、そう書く。
   ただし月払いを小さくしたり、選びにくくしたりはしない。
   払い方は人の事情なので、こちらが決めることではない。 */

export default function PriceChooser({
  /** 押したときの行き先。期間と払い方を付けて渡す */
  href,
}: {
  href?: (p: Period, pay: Pay) => string;
}) {
  const [months, setMonths] = useState(
    PERIODS.find((p) => p.best)?.months ?? PERIODS[0].months,
  );
  const [pay, setPay] = useState<Pay>("lump");

  const p = PERIODS.find((x) => x.months === months) ?? PERIODS[0];
  const fixed = isFixed(p);
  const saves = lumpSaves(p);
  const perks = perksFor(p);

  // 1か月は払い方が1つしかない。選ばせない
  const effectivePay: Pay = fixed ? pay : "monthly";
  const total = effectivePay === "lump" ? p.lump : monthlyTotal(p);

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. 期間 ────────────────────────────── */}
      <div>
        <p className="text-[12px] font-black text-steel">1. 使う期間を選ぶ</p>
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PERIODS.map((x) => {
            const on = x.months === months;
            return (
              <button
                key={x.months}
                type="button"
                onClick={() => {
                  setMonths(x.months);
                  track("price_period_picked", { months: String(x.months) });
                }}
                aria-pressed={on}
                className={`relative min-h-[64px] rounded-card border px-2 py-2.5 text-center transition-colors ${
                  on ? "border-brand bg-brand text-paper" : "border-line bg-paper text-slate"
                }`}
              >
                {x.best && (
                  <span
                    className={`absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill px-2 py-0.5 text-[9.5px] font-black ${
                      on ? "bg-paper text-brand" : "bg-brand text-paper"
                    }`}
                  >
                    おすすめ
                  </span>
                )}
                <span className="block text-[15px] font-black leading-[1.3]">{x.label}</span>
                <span
                  className={`mt-0.5 block text-[10.5px] font-bold tabular-nums ${
                    on ? "text-paper/80" : "text-steel"
                  }`}
                >
                  月あたり ¥{perMonth(x).toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[12px] leading-[1.75] text-steel">{p.why}</p>
      </div>

      {/* ── 2. 払い方 ──────────────────────────── */}
      {fixed && (
        <div>
          <p className="text-[12px] font-black text-steel">2. 払い方を選ぶ</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {(["lump", "monthly"] as const).map((k) => {
              const on = k === pay;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setPay(k);
                    track("price_pay_picked", { pay: k });
                  }}
                  aria-pressed={on}
                  className={`min-h-[56px] rounded-card border px-3 py-2.5 text-left transition-colors ${
                    on ? "border-brand bg-paper" : "border-line bg-paper"
                  }`}
                >
                  <span
                    className={`block text-[13px] font-black leading-[1.3] ${
                      on ? "text-brand" : "text-slate"
                    }`}
                  >
                    {payLabel(p, k)}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] font-bold tabular-nums text-steel">
                    {k === "lump"
                      ? `¥${p.lump.toLocaleString()}`
                      : `¥${p.monthly.toLocaleString()} × ${p.months}回`}
                  </span>
                </button>
              );
            })}
          </div>
          {saves > 0 && (
            <p className="mt-2 text-[12px] leading-[1.75] text-steel">
              一括のほうが ¥{saves.toLocaleString()} 安くなります。
            </p>
          )}
        </div>
      )}

      {/* ── 選んだもの ─────────────────────────── */}
      <div className="rounded-card border border-brand bg-paper p-5 shadow-card">
        <p className="text-[12px] font-bold text-steel">
          {p.label} ／ {payLabel(p, effectivePay)}
        </p>
        <p className="mt-1.5 text-[30px] font-black leading-none tabular-nums text-slate sm:text-[34px]">
          ¥{(effectivePay === "lump" ? p.lump : p.monthly).toLocaleString()}
          <span className="ml-1.5 align-middle text-[13px] font-bold text-steel">
            {effectivePay === "lump" ? "（税込）" : fixed ? `／月 × ${p.months}回` : "／月（税込）"}
          </span>
        </p>
        {fixed && (
          <p className="mt-1.5 text-[12.5px] font-bold tabular-nums text-steel">
            合計 ¥{total.toLocaleString()}（税込）／ 月あたり ¥
            {Math.round(total / p.months).toLocaleString()}
          </p>
        )}

        {/* ── 誤解させない ────────────────────────
            「月々2,780円」だけを大きく出して、
            いつでもやめられると読ませない。 */}
        <p className="mt-3.5 border-t border-line pt-3 text-[11.5px] leading-[1.8] text-steel">
          {fixed
            ? effectivePay === "monthly"
              ? `${p.label}の契約です。期間中は毎月ご請求します。途中でやめても、残りのご請求は止まりません。`
              : `${p.label}ぶんをまとめてお支払いいただきます。`
            : "1か月ごとに更新します。次の更新日の前なら、いつでもやめられます。"}
          <br />
          途中でやめるときの扱いは、利用規約をご確認ください。
        </p>

        {href && (
          <a
            href={href(p, effectivePay)}
            onClick={() =>
              track("price_cta_click", { months: String(p.months), pay: effectivePay })
            }
            className="mt-4 flex min-h-[54px] items-center justify-center rounded-pill bg-brand px-6 text-[15.5px] font-bold text-paper shadow-card"
          >
            {p.label}で始める <span aria-hidden className="ml-2">&rarr;</span>
          </a>
        )}
      </div>

      {/* ── 先着の特典。値引きではなく、中身を足す ── */}
      {perks.length > 0 && (
        <div className="rounded-soft border border-line bg-mist px-4 py-3.5">
          <p className="text-[12px] font-black text-steel">はじめの100人に付くもの</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {perks.map((k) => (
              <li
                key={k.text}
                className="flex items-start gap-2 text-[12.5px] leading-[1.7] text-steel"
              >
                <span aria-hidden className="mt-[3px] shrink-0 text-[10px] font-black text-brand">
                  ＋
                </span>
                <span className="min-w-0">{k.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
