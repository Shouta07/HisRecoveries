"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  addEntry,
  isRecordKind,
  KIND_LABEL,
  FEEL_LABEL,
  AGAIN_LABEL,
  type RecordKind,
  type Feel,
  type Again,
} from "@/lib/relationship";
import { byStage } from "@/lib/knowledge";
import { load } from "@/lib/relationship";
import { Card, Btn, SectionTitle, Empty, Tag } from "@/components/app/ui";
import { track } from "@/lib/analytics";

// 記録。15〜30秒で終わる。
//
// ── フォームにしない ──────────────────────────────
// 入力欄が並ぶ画面にすると、書くことを考える時間が先に来る。
// カードを押していくだけにすれば、考える前に終わる。
//
// ── 自由入力は最後・任意 ────────────────────────
// 先に置くと、そこで手が止まる。
//
// ── 相手のことを聞かない ────────────────────────
// 名前も、どんな人かも、何回目かも聞かない。
// 聞いた瞬間に、これは相手の記録になる。主語は自分だけ。

function RecordFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const seeded = params.get("kind");

  const [kind, setKind] = useState<RecordKind | null>(
    isRecordKind(seeded) ? seeded : null,
  );
  const [feel, setFeel] = useState<Feel | null>(null);
  const [again, setAgain] = useState<Again | null>(null);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  function save() {
    if (!kind) return;
    addEntry({ kind, feel: feel ?? undefined, again: again ?? undefined, note: note.trim() || undefined });
    track("app_record_saved", { kind, hasFeel: Boolean(feel), hasNote: Boolean(note.trim()) });
    setDone(true);
  }

  if (done) {
    const st = load().stage;
    const related = st ? byStage(st).slice(0, 2) : [];
    return (
      <div className="pb-8">
        <h1 className="mt-6 font-display text-[22px] font-bold text-charcoal">記録しました。</h1>
        <p className="mt-2.5 text-[13.5px] leading-[1.85] text-faint">
          この端末の中にだけ残っています。
        </p>

        <div className="mt-7">
          <SectionTitle>あわせて</SectionTitle>
          <div className="mt-3 flex flex-col gap-2.5">
            {related.length === 0 ? (
              <Empty
                title="いまは、出せるものがありません"
                body="この段階の経験や調査は集めているところです。集まったらここに出ます。"
              />
            ) : (
              related.map((k) => (
                <Card key={k.id} as="link" href={k.href ?? "#"}>
                  <Tag>考え方</Tag>
                  <p className="mt-1.5 text-[14.5px] font-bold leading-[1.6] text-charcoal">{k.title}</p>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Btn href="/app">ホームに戻る</Btn>
          <button
            type="button"
            onClick={() => {
              setKind(null);
              setFeel(null);
              setAgain(null);
              setNote("");
              setDone(false);
            }}
            className="min-h-[44px] text-[13.5px] text-faint underline decoration-hairline underline-offset-4"
          >
            もう1件記録する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* 1. 何があったか */}
      {!kind && (
        <>
          <h1 className="mt-4 font-display text-[22px] font-bold leading-[1.5] text-charcoal">
            今日は、何がありましたか？
          </h1>
          <div className="mt-5 flex flex-col gap-2.5">
            {(Object.keys(KIND_LABEL) as RecordKind[]).map((k) => (
              <Card key={k} as="button" onClick={() => setKind(k)}>
                <span className="text-[15px] font-bold text-charcoal">{KIND_LABEL[k]}</span>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-[12.5px] leading-[1.85] text-faint">
            相手のことは聞きません。残すのは、自分がどうだったかだけです。
          </p>
        </>
      )}

      {/* 2. どうだったか → 3. また会いたいか → 4. メモ（任意） */}
      {kind && (
        <>
          <button
            type="button"
            onClick={() => setKind(null)}
            className="mt-2 min-h-[44px] text-[13px] text-faint underline decoration-hairline underline-offset-4"
          >
            ← {KIND_LABEL[kind]}
          </button>

          <h2 className="mt-2 font-display text-[20px] font-bold text-charcoal">どうでしたか？</h2>
          <div className="mt-4 flex flex-col gap-2.5">
            {(Object.keys(FEEL_LABEL) as Feel[]).map((f) => (
              <Card key={f} as="button" selected={feel === f} onClick={() => setFeel(feel === f ? null : f)}>
                <span className="text-[14.5px] text-charcoal">{FEEL_LABEL[f]}</span>
              </Card>
            ))}
          </div>

          {kind === "met" && (
            <>
              <h2 className="mt-8 font-display text-[20px] font-bold text-charcoal">また会いたい？</h2>
              <div className="mt-4 flex flex-col gap-2.5">
                {(Object.keys(AGAIN_LABEL) as Again[]).map((a) => (
                  <Card key={a} as="button" selected={again === a} onClick={() => setAgain(again === a ? null : a)}>
                    <span className="text-[14.5px] text-charcoal">{AGAIN_LABEL[a]}</span>
                  </Card>
                ))}
              </div>
            </>
          )}

          <h2 className="mt-8 font-display text-[16px] font-bold text-charcoal">
            何か残しておきたいことは？
            <span className="ml-2 text-[12px] font-normal text-faint">任意</span>
          </h2>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-3 w-full rounded-[10px] border border-hairline bg-surface px-3.5 py-3 text-[15px] leading-[1.85] text-charcoal outline-none transition-colors duration-[180ms] focus:border-coral"
          />

          <div className="mt-6">
            <Btn onClick={save}>記録する</Btn>
          </div>
          <p className="mt-4 text-[12.5px] leading-[1.85] text-faint">
            この端末の中にだけ保存します。送信はしません。
          </p>
        </>
      )}
    </div>
  );
}

export default function RecordPage() {
  return (
    <Suspense fallback={<p className="mt-6 text-[13.5px] text-faint">読み込み中…</p>}>
      <RecordFlow />
    </Suspense>
  );
}
