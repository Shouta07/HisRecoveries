"use client";

import { useEffect, useState } from "react";
import {
  load, clearAll, insight, removeEntry,
  KIND_LABEL, FEEL_LABEL, AGAIN_LABEL, type Store,
} from "@/lib/relationship";
import { stage as getStage } from "@/lib/journey";
import { Card, SectionTitle, Empty, Skeleton, Tag, Btn } from "@/components/app/ui";

// 自分。
//
// ── 点数を出さない ────────────────────────────────
// 恋愛偏差値・成功率・達成率は出さない。
// 人を採点する画面にした時点で、このサービスは別のものになる。
// 出すのは、本人が書いた言葉から見えることだけ。
//
// ── 3件たまるまで何も言わない ──────────────────────
// 2件で「傾向」と書いたら、それは傾向ではなく感想。
// 足りないときは、足りないと書く。
//
// ── 消し方を隠さない ──────────────────────────────
// 恋愛の記録は、消したくなる日がある。
// 消す導線を深いところに置かない（§18）。

export default function MePage() {
  const [s, setS] = useState<Store | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { setS(load()); }, []);

  if (!s) return <div className="mt-6"><Skeleton lines={4} /></div>;

  const found = insight(s);
  const st = s.stage ? getStage(s.stage) : null;

  // よく残している感覚。書かれた言葉そのものから数える
  const feels = s.entries.filter((e) => e.feel);
  const tally = new Map<string, number>();
  for (const e of feels) {
    const l = FEEL_LABEL[e.feel!];
    tally.set(l, (tally.get(l) ?? 0) + 1);
  }
  const top = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="flex flex-col gap-7 pb-6">
      <div>
        <h1 className="mt-4 font-display text-[22px] font-bold text-charcoal">自分</h1>
        {st && <p className="mt-2 text-[13.5px] text-faint">いまのあたり：{st.label}</p>}
      </div>

      <section>
        <SectionTitle>最近わかってきたこと</SectionTitle>
        <div className="mt-3">
          {found ? (
            <Card><p className="text-[14.5px] leading-[1.9] text-charcoal">{found}</p></Card>
          ) : (
            <Empty
              title={`記録が${s.entries.length}件です`}
              body="3件たまると、ここに出はじめます。2件で傾向と書いたら、それは傾向ではなく感想になるので、まだ何も言いません。"
            />
          )}
        </div>
      </section>

      {top.length > 0 && (
        <section>
          <SectionTitle>よく残している感覚</SectionTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {top.map(([l, n]) => (
              <span key={l} className="inline-flex items-baseline gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1.5">
                <span className="text-[13px] text-charcoal">{l}</span>
                <span className="text-[11.5px] tabular-nums text-faint">{n}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionTitle note={`${s.entries.length}件`}>記録</SectionTitle>
        <div className="mt-3 flex flex-col gap-2.5">
          {s.entries.length === 0 ? (
            <Empty title="まだありません" body="下の「＋」から、15秒で1件残せます。" />
          ) : (
            s.entries.slice(0, 20).map((e) => (
              <Card key={e.id}>
                <span className="flex items-baseline justify-between gap-3">
                  <span className="flex flex-wrap items-baseline gap-2">
                    <Tag>{KIND_LABEL[e.kind]}</Tag>
                    {e.feel && <span className="text-[12.5px] text-faint">{FEEL_LABEL[e.feel]}</span>}
                    {e.again && <span className="text-[12.5px] text-faint">また会いたい：{AGAIN_LABEL[e.again]}</span>}
                  </span>
                  <span className="shrink-0 text-[11.5px] tabular-nums text-faint">{e.date.replace(/-/g, ".")}</span>
                </span>
                {e.note && <p className="mt-2 text-[13.5px] leading-[1.85] text-bodytext">{e.note}</p>}
                <button
                  type="button"
                  onClick={() => setS(removeEntry(e.id))}
                  className="mt-2 min-h-[44px] self-start text-left text-[12px] text-faint underline decoration-hairline underline-offset-4"
                >
                  この記録を消す
                </button>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="border-t border-hairline pt-6">
        <p className="text-[12.5px] leading-[1.85] text-faint">
          記録はこの端末の中だけにあります。こちらには送られていません。
          端末を変えると、記録は移りません。
        </p>
        <div className="mt-4">
          {!confirm ? (
            <button
              type="button"
              onClick={() => setConfirm(true)}
              className="min-h-[44px] text-[13px] text-faint underline decoration-hairline underline-offset-4"
            >
              すべての記録を消す
            </button>
          ) : (
            <Card className="border-coral">
              <p className="text-[14px] leading-[1.85] text-charcoal">
                記録と現在地を、すべて消します。元に戻せません。
              </p>
              <div className="mt-3 flex gap-2">
                <Btn onClick={() => { clearAll(); setS(load()); setConfirm(false); }}>消す</Btn>
                <Btn variant="ghost" onClick={() => setConfirm(false)}>やめる</Btn>
              </div>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
