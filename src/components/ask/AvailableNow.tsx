"use client";

import { useEffect, useState } from "react";
import type { AttrId, PanelAge } from "@/lib/ask/model";

// 今、この条件で答えられる人。
//
// ── いる数しか出さない ────────────────────────────
// 「27歳・Helpful 96%」のようなカードは作らない。
//   ・まだ登録が0なので、出したら作り話になる
//   ・一人ずつ出すと、条件を変えて叩くことで個人が絞り込める
// 出すのは人数と年代の並びだけ。
//
// ── 0人のときは0人と書く ──────────────────────────
// 「今は少なめです」でごまかさない。
// 0人のまま買わせると、払ったのに誰も来ない。

const AGE: Record<string, string> = {
  "20-24": "20代前半",
  "25-29": "25〜29歳",
  "30s": "30代",
  "30-34": "30代前半",
  "35-39": "30代後半",
  "40-49": "40代",
};

export default function AvailableNow({
  age,
  attrs,
  need,
}: {
  age: PanelAge;
  attrs: AttrId[];
  /** 何人ほしいか */
  need: number;
}) {
  const [state, setState] = useState<
    { configured: boolean; n: number; ages: string[] } | null
  >(null);

  const key = `${age}|${attrs.join(",")}`;

  useEffect(() => {
    let alive = true;
    const p = new URLSearchParams({ age });
    if (attrs.length) p.set("attrs", attrs.join(","));
    fetch(`/api/responders/available?${p.toString()}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && j && setState(j))
      .catch(() => {});
    return () => {
      alive = false;
    };
    // key で条件の変化を拾う（配列をそのまま依存に置くと毎回変わる）
  }, [key, age, attrs]);

  if (!state) {
    return (
      <div className="mt-4 h-[58px] rounded-card border border-line bg-mist" aria-hidden />
    );
  }

  if (!state.configured) return null;

  const enough = state.n >= need;

  return (
    <div
      className={`mt-4 rounded-card border p-4 ${
        enough ? "border-ok bg-ok-tint" : "border-line bg-mist"
      }`}
    >
      <p className="flex items-center gap-2.5">
        {enough && (
          <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-ok opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ok" />
          </span>
        )}
        <span className="text-[14.5px] font-bold">
          {state.n > 0
            ? `この条件で、いま${state.n}人が答えられます`
            : "この条件で、いま答えられる人がいません"}
        </span>
      </p>

      {state.n > 0 && state.ages.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {state.ages.map((a) => (
            <li
              key={a}
              className="rounded-pill bg-paper px-2.5 py-1 text-[11.5px] text-steel"
            >
              {AGE[a] ?? a}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-2.5 text-[12px] leading-[1.75] text-steel">
        {state.n === 0
          ? "条件をゆるめるか、少し時間をおいてみてください。集まらなかった分はご返金します。"
          : enough
            ? "そのまま進めます。"
            : `${need}人には届かないかもしれません。集まらなかった分はご返金します。`}
      </p>
    </div>
  );
}
