"use client";

import { useEffect, useState } from "react";
import { STAGES, type StageId } from "@/lib/journey";
import { countByStage, byStage } from "@/lib/knowledge";
import { load, setStage } from "@/lib/relationship";
import { Card, SectionTitle, Empty, Tag } from "@/components/app/ui";
import { track } from "@/lib/analytics";

// ジャーニー。8段階の「道」。
//
// ── 営業パイプラインにしない ──────────────────────
// 横並びの矢印・達成率・次のアクション数は出さない。
// 縦に置いて、いまいるところだけ色を変える。
// 戻ることも、止まることも、同じ見た目で扱う。
//
// ── 空を空として出す ──────────────────────────────
// 8段階中7段階は在庫0。そこを隠さない。
// 「準備中」ではなく、何が無くて、いつ入るかを書く。

export default function JourneyPage() {
  const [here, setHere] = useState<StageId | null>(null);
  const [open, setOpen] = useState<StageId | null>(null);
  const counts = countByStage();

  useEffect(() => {
    setHere(load().stage);
  }, []);

  return (
    <div className="pb-6">
      <h1 className="mt-4 font-display text-[22px] font-bold text-charcoal">道のり</h1>
      <p className="mt-2 text-[13.5px] leading-[1.85] text-faint">
        順位ではありません。戻ることも、止まることもあります。
      </p>

      <ul className="mt-6 flex flex-col gap-2.5">
        {STAGES.map((s) => {
          const now = here === s.id;
          const isOpen = open === s.id;
          const n = counts[s.id] ?? 0;
          return (
            <li key={s.id}>
              <Card
                as="button"
                selected={now}
                onClick={() => {
                  setOpen(isOpen ? null : s.id);
                  track("app_journey_open", { stage: s.id });
                }}
              >
                <span className="flex items-baseline gap-2.5">
                  <span
                    aria-hidden
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      now ? "bg-coral ring-4 ring-coral-soft" : "bg-hairline"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className="text-[15px] font-bold text-charcoal">{s.label}</span>
                      {now && <span className="text-[11.5px] text-coral">いまここ</span>}
                    </span>
                    <span className="mt-1 block text-[13px] leading-[1.8] text-faint">{s.where}</span>
                  </span>
                  <span className="shrink-0 text-[11.5px] tabular-nums text-faint">{n}</span>
                </span>
              </Card>

              {isOpen && (
                <div className="mt-2 flex flex-col gap-4 rounded-[14px] bg-raised px-4 py-4">
                  <div>
                    <p className="text-[12px] text-faint">よくある迷い</p>
                    <ul className="mt-1.5 flex flex-col gap-1">
                      {s.doubts.map((d) => (
                        <li key={d} className="text-[13.5px] leading-[1.8] text-bodytext">
                          ・{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[12px] text-faint">考えてみること</p>
                    {s.prompts.map((p) => (
                      <p key={p} className="mt-1.5 text-[13.5px] leading-[1.85] text-charcoal">
                        {p}
                      </p>
                    ))}
                  </div>
                  <div>
                    <SectionTitle note={`${n}件`}>読めるもの</SectionTitle>
                    <div className="mt-2.5 flex flex-col gap-2">
                      {n === 0 ? (
                        <Empty
                          title="まだ0件です"
                          body="この段階の経験・専門家の見解・調査は、いま集めているところです。集まっていないものを、それらしく埋めることはしません。"
                        />
                      ) : (
                        byStage(s.id).slice(0, 3).map((k) => (
                          <Card key={k.id} as="link" href={k.href ?? "#"}>
                            <Tag>考え方</Tag>
                            <p className="mt-1.5 text-[14px] font-bold leading-[1.6] text-charcoal">
                              {k.title}
                            </p>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                  {!now && (
                    <button
                      type="button"
                      onClick={() => {
                        setStage(s.id);
                        setHere(s.id);
                        track("app_stage_changed", { stage: s.id });
                      }}
                      className="min-h-[44px] text-[13px] text-coral underline decoration-coral/40 underline-offset-4"
                    >
                      いまはこのあたり、にする
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
