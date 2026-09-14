"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addEntry, load, FEEL_LABEL, NATURAL_LABEL, type Feel, type Natural } from "@/lib/relationship";
import { Choice, Action, Ask, Note } from "@/components/app/system";
import { track } from "@/lib/analytics";

// 記録（§11・§12）。ここがこのプロダクトで最も磨く画面。
//
// ── フォームにしない ──────────────────────────────
// 入力欄が並ぶ画面を出すと、「何を書こう」を先に考えることになる。
// 一画面に問いを1つだけ置けば、考える前に終わる。
//
// ── 選ぶだけで終われる ────────────────────────────
// 自由入力は3問目以降、どちらも任意。書かなくても記録は成立する。
// 「書けなかった日」を失敗にしない。
//
// ── 相手のことを聞かない ────────────────────────
// 名前も、何回目かも、どんな人かも聞かない。
// 聞いた瞬間に、これは相手の記録になる。主語は自分だけ。
//
// ── 進捗率を出さない ──────────────────────────────
// 「2/5」も「40%」も出さない。上の線が少しずつ伸びるだけにする。

const FEELS: Feel[] = ["fun", "again", "unsure", "off"];
const NATURALS: Natural[] = ["yes", "some", "little"];
const STEPS = 4;

export default function NewRecord() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [feel, setFeel] = useState<Feel | null>(null);
  const [natural, setNatural] = useState<Natural | null>(null);
  const [noticed, setNoticed] = useState("");
  const [note, setNote] = useState("");

  // 途中でやめた地点を残す。始めた数と終えた数だけでは、どこで折れたかが出ない。
  const saved = useRef(false);
  const at = useRef(0);
  at.current = i;
  useEffect(
    () => () => {
      if (!saved.current) track("app_record_abandon", { at: at.current });
    },
    [],
  );

  function save() {
    const e = addEntry({
      feel: feel ?? undefined,
      natural: natural ?? undefined,
      noticed: noticed.trim() || undefined,
      note: note.trim() || undefined,
    });
    saved.current = true;
    const n = [feel, natural, noticed.trim(), note.trim()].filter(Boolean).length;
    track("app_record_saved", { n, first: load().entries.length === 1 });
    router.replace(`/app/record/${e.id}?new=1`);
  }

  const back = () => (i === 0 ? router.push("/app") : setI(i - 1));

  return (
    <div className="pb-12">
      {/* 進み具合。数字にしない。線が伸びるだけ（§28）*/}
      <div className="h-px w-full bg-hairline">
        <div
          className="h-px bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${((i + 1) / STEPS) * 100}%` }}
        />
      </div>

      <button
        type="button"
        onClick={back}
        className="mt-4 inline-flex min-h-[44px] items-center text-[13.5px] text-faint transition-colors hover:text-accent"
      >
        ← {i === 0 ? "やめる" : "ひとつ戻る"}
      </button>

      <div key={i} className="motion-safe:animate-hr-rise mt-5">
        {i === 0 && (
          <>
            <Ask>今日は、どうでしたか？</Ask>
            <div className="mt-8 flex flex-col gap-2.5">
              {FEELS.map((f) => (
                <Choice
                  key={f}
                  on={feel === f}
                  onClick={() => {
                    setFeel(f);
                    setI(1);
                  }}
                >
                  {FEEL_LABEL[f]}
                </Choice>
              ))}
            </div>
            <div className="mt-8">
              <Note>相手のことは聞きません。残すのは、自分がどうだったかだけです。</Note>
            </div>
          </>
        )}

        {i === 1 && (
          <>
            <Ask>自然体で、いられましたか？</Ask>
            <div className="mt-8 flex flex-col gap-2.5">
              {NATURALS.map((n) => (
                <Choice
                  key={n}
                  on={natural === n}
                  onClick={() => {
                    setNatural(n);
                    setI(2);
                  }}
                >
                  {NATURAL_LABEL[n]}
                </Choice>
              ))}
            </div>
          </>
        )}

        {i === 2 && (
          <>
            <Ask>何か、気になったことは？</Ask>
            <textarea
              rows={4}
              autoFocus
              value={noticed}
              onChange={(e) => setNoticed(e.target.value)}
              placeholder="話していて気になったこと、嬉しかったことなど"
              className="mt-7 w-full rounded-[8px] border border-hairline bg-surface px-4 py-3.5 text-[15px] leading-[1.95] text-charcoal outline-none transition-colors duration-200 placeholder:text-faint/70 focus:border-accent"
            />
            <div className="mt-5 flex flex-col gap-2">
              <Action onClick={() => setI(3)}>次へ</Action>
              <button
                type="button"
                onClick={() => setI(3)}
                className="min-h-[44px] text-[13.5px] text-faint transition-colors hover:text-accent"
              >
                書かずに進む
              </button>
            </div>
          </>
        )}

        {i === 3 && (
          <>
            <Ask>残しておきたいことは？</Ask>
            <textarea
              rows={5}
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="あとで読み返したときに、その日のことが思い出せる程度で"
              className="mt-7 w-full rounded-[8px] border border-hairline bg-surface px-4 py-3.5 text-[15px] leading-[1.95] text-charcoal outline-none transition-colors duration-200 placeholder:text-faint/70 focus:border-accent"
            />
            <div className="mt-5 flex flex-col gap-2">
              <Action onClick={save}>残す</Action>
              <button
                type="button"
                onClick={save}
                className="min-h-[44px] text-[13.5px] text-faint transition-colors hover:text-accent"
              >
                書かずに残す
              </button>
            </div>
            <div className="mt-7">
              <Note>この端末の中にだけ保存します。送信はしません。</Note>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
