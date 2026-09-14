"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_CHOICES, AGE_GROUPS, type AgeGroup, type StageId } from "@/lib/journey";
import { setStage, setAge } from "@/lib/relationship";
import { Card, Btn, Pill } from "@/components/app/ui";
import { track } from "@/lib/analytics";

// オンボーディング。30〜60秒。
//
// ── 読ませない ────────────────────────────────
// 長い説明を先に置かない。1問目から触らせる。
// 何のサービスかは、問いの中身そのもので伝わる。
//
// ── 登録させない ──────────────────────────────
// ここでメールアドレスを聞くと、体験する前に離脱する。
// 記録は端末に置く。価値が分かったあとに、必要なら考える。
//
// ── 2問だけ ───────────────────────────────────
// 現在地と年代。それ以上聞いても、いまは使い道が無い。
// 使わないものを聞くのは、答える側の時間を捨てているのと同じ。

export default function StartPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [where, setWhere] = useState<StageId | null>(null);
  const [age, setAgeState] = useState<AgeGroup | null>(null);

  function finish(a: AgeGroup) {
    if (where) setStage(where);
    setAge(a);
    track("app_onboard_done", { stage: where ?? "none", age: a });
    router.push("/app");
  }

  return (
    <div className="pb-8">
      <p className="text-[12px] tracking-[0.14em] text-coral">STEP {step + 1} / 2</p>

      {step === 0 && (
        <>
          <h1 className="mt-3 font-display text-[22px] font-bold leading-[1.5] text-charcoal">
            いま、どのあたりですか？
          </h1>
          <p className="mt-2 text-[13.5px] leading-[1.85] text-faint">
            あとから変えられます。いまの感じで選んでください。
          </p>
          <div className="mt-5 flex flex-col gap-2.5">
            {ONBOARDING_CHOICES.map((c) => (
              <Card
                key={c.id}
                as="button"
                selected={where === c.id}
                onClick={() => {
                  setWhere(c.id);
                  setStep(1);
                }}
              >
                <span className="text-[15px] font-bold text-charcoal">{c.label}</span>
              </Card>
            ))}
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="mt-3 font-display text-[22px] font-bold leading-[1.5] text-charcoal">
            年代を教えてください。
          </h1>
          <p className="mt-2 text-[13.5px] leading-[1.85] text-faint">
            近い年代の経験から先に出すために使います。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {AGE_GROUPS.map((a) => (
              <Pill key={a} on={age === a} onClick={() => setAgeState(a)}>
                {a}
              </Pill>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Btn onClick={() => age && finish(age)} disabled={!age}>
              はじめる
            </Btn>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="min-h-[44px] text-[13.5px] text-faint underline decoration-hairline underline-offset-4"
            >
              ← ひとつ戻る
            </button>
          </div>
        </>
      )}

      <p className="mt-10 text-[12.5px] leading-[1.85] text-faint">
        登録は要りません。記録はこの端末の中だけに残り、こちらには送られません。
      </p>
    </div>
  );
}
