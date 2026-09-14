"use client";

import { useEffect, useMemo, useState } from "react";
import { STAGES, AGE_GROUPS, type StageId, type AgeGroup } from "@/lib/journey";
import { all, PERSPECTIVE_LABEL, TYPE_LABEL, type Perspective } from "@/lib/knowledge";
import { load } from "@/lib/relationship";
import { Card, Pill, Empty, Tag } from "@/components/app/ui";
import { track } from "@/lib/analytics";

// 見つける。
//
// ── 検索画面にしない ──────────────────────────────
// 入力欄と「検索」ボタンを置くと、条件を組む作業が先に来る。
// チップを押した瞬間に結果が変わる形にすれば、探す作業が消える。
//
// ── 初期値を本人に合わせる ────────────────────────
// 年代は本人のものを最初から選んでおく。
// 全件から自分で絞らせるのは、こちらの仕事を渡しているのと同じ。

const PERSPECTIVES: Perspective[] = ["male", "female", "expert", "data", "editorial"];

export default function DiscoverPage() {
  const [age, setAge] = useState<AgeGroup | "all">("all");
  const [stage, setStage] = useState<StageId | "all">("all");
  const [persp, setPersp] = useState<Perspective | "all">("all");

  useEffect(() => {
    const s = load();
    if (s.age) setAge(s.age);
    if (s.stage) setStage(s.stage);
  }, []);

  const items = useMemo(() => {
    return all().filter(
      (k) =>
        (stage === "all" || k.stage === stage) &&
        (persp === "all" || k.perspective === persp) &&
        (age === "all" || k.age === null || k.age === age),
    );
  }, [age, stage, persp]);

  return (
    <div className="pb-6">
      <h1 className="mt-4 font-display text-[22px] font-bold text-charcoal">
        どんな経験を見たい？
      </h1>

      <div className="mt-5 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Pill on={age === "all"} onClick={() => setAge("all")}>すべての年代</Pill>
          {AGE_GROUPS.map((a) => (
            <Pill key={a} on={age === a} onClick={() => setAge(a)}>{a}</Pill>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill on={stage === "all"} onClick={() => setStage("all")}>すべての段階</Pill>
          {STAGES.map((s) => (
            <Pill key={s.id} on={stage === s.id} onClick={() => setStage(s.id)}>{s.label}</Pill>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill on={persp === "all"} onClick={() => setPersp("all")}>すべての視点</Pill>
          {PERSPECTIVES.map((p) => (
            <Pill key={p} on={persp === p} onClick={() => setPersp(p)}>{PERSPECTIVE_LABEL[p]}</Pill>
          ))}
        </div>
      </div>

      <p className="mt-5 text-[12.5px] tabular-nums text-faint">{items.length}件</p>

      <div className="mt-3 flex flex-col gap-2.5">
        {items.length === 0 ? (
          <Empty
            title="この条件に当てはまるものは、まだありません"
            body="男性の経験・女性の経験・専門家・データは、いま集めているところです。数を揃えるために、それらしいものを置くことはしません。条件を1つ外すと見つかるかもしれません。"
          />
        ) : (
          items.slice(0, 30).map((k) => (
            <Card
              key={k.id}
              as="link"
              href={k.href ?? "#"}
            >
              <span className="flex flex-wrap gap-1.5">
                <Tag>{TYPE_LABEL[k.type]}</Tag>
                <Tag>{PERSPECTIVE_LABEL[k.perspective]}</Tag>
              </span>
              <p className="mt-2 text-[14.5px] font-bold leading-[1.6] text-charcoal">{k.title}</p>
              <p className="mt-1 line-clamp-2 text-[13px] leading-[1.8] text-faint">{k.summary}</p>
            </Card>
          ))
        )}
      </div>

      {items.length > 0 && (
        <p className="mt-6 text-[12.5px] leading-[1.85] text-faint">
          いま出ているのは、すべて「自分を整える」の話です。
          出会ったあとの段階については、まだ集まっていません。
        </p>
      )}
    </div>
  );
}
