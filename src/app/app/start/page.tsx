"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_CHOICES, AGE_GROUPS, type AgeGroup, type StageId } from "@/lib/journey";
import { setStage, setAge } from "@/lib/relationship";
import { Ask, Choice, Action, Note } from "@/components/app/system";
import { track } from "@/lib/analytics";

// はじめ方（§33・§34）。
//
// ── 説明を読ませない ──────────────────────────────
// 長いLPを先に置かない。1問目から触らせる。
// 何のサービスかは、問いの中身そのもので伝わる。
//
// ── 登録させない ──────────────────────────────
// メールアドレスを聞くと、体験する前に離脱する。
// 記録は端末に置く。価値が分かったあとに、必要なら考える。
//
// ── STEP 1 / 2 を出さない ────────────────────────
// 番号を振ると、残り何問あるかを数えながら答えることになる。
// 上の線が伸びるだけにする。

export default function Start() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [where, setWhere] = useState<StageId | null>(null);
  const [age, setAgeState] = useState<AgeGroup | null>(null);

  function finish(a: AgeGroup) {
    if (where) setStage(where);
    setAge(a);
    track("app_onboard_done", { stage: where ?? "none", age: a });
    router.replace("/app");
  }

  return (
    <div className="pb-12">
      <div className="h-px w-full bg-hairline">
        <div
          className="h-px bg-accent transition-[width] duration-300 ease-out"
          style={{ width: i === 0 ? "50%" : "100%" }}
        />
      </div>

      <button
        type="button"
        onClick={() => (i === 0 ? router.push("/app") : setI(0))}
        className="mt-4 inline-flex min-h-[44px] items-center text-[13.5px] text-faint transition-colors hover:text-accent"
      >
        ← {i === 0 ? "やめる" : "ひとつ戻る"}
      </button>

      <div key={i} className="motion-safe:animate-hr-rise mt-5">
        {i === 0 && (
          <>
            <Ask>いま、どのあたりですか？</Ask>
            <p className="mt-3.5 text-[13.5px] leading-[1.9] text-faint">
              あとから変えられます。いまの感じで選んでください。
            </p>
            <div className="mt-8 flex flex-col gap-2.5">
              {ONBOARDING_CHOICES.map((c) => (
                <Choice
                  key={c.id}
                  on={where === c.id}
                  onClick={() => {
                    setWhere(c.id);
                    setI(1);
                  }}
                >
                  {c.label}
                </Choice>
              ))}
            </div>
          </>
        )}

        {i === 1 && (
          <>
            <Ask>年代を教えてください。</Ask>
            <p className="mt-3.5 text-[13.5px] leading-[1.9] text-faint">
              近い年代の経験から先に出すために使います。それ以外には使いません。
            </p>
            <div className="mt-8 flex flex-col gap-2.5">
              {AGE_GROUPS.map((a) => (
                <Choice
                  key={a}
                  on={age === a}
                  onClick={() => {
                    setAgeState(a);
                    finish(a);
                  }}
                >
                  {a}
                </Choice>
              ))}
            </div>
            <div className="mt-8">
              <Action
                quiet
                onClick={() => {
                  if (where) setStage(where);
                  track("app_onboard_done", { stage: where ?? "none", age: "skip" });
                  router.replace("/app");
                }}
              >
                答えずに進む
              </Action>
            </div>
            <div className="mt-6">
              <Note>18歳未満の方はご利用いただけません。</Note>
            </div>
          </>
        )}
      </div>

      <div className="mt-12">
        <Note>
          登録は要りません。記録はこの端末の中だけに残り、こちらには送られません。
        </Note>
      </div>
    </div>
  );
}
