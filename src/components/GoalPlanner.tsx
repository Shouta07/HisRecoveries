"use client";

// ゴール起点のプランナー。サイトの軸を「悩み → 施術」から
// 「迎えたい日 → その日までにやること」へ移すための中核。
//
// 流れ: 目的を選ぶ → 期日を選ぶ → ロードマップ完成 → 今週やること →
//       関連記事 → （必要なら）相談。相談は最後に置く。
//
// チェックは localStorage に保存し、「一つずつ終わらせる」体験にする。

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ConsultLink from "@/components/ConsultLink";
import { GOALS, DAY_OPTIONS, getGoal } from "@/lib/goals";
import { track } from "@/lib/analytics";

const HEAD: React.CSSProperties = {
  fontFamily: "var(--font-shippori), 'Hiragino Sans', system-ui, sans-serif",
  fontFeatureSettings: '"palt" 1',
  letterSpacing: "-0.01em",
};

const STORE_KEY = "hr_goal_plan";

type Saved = { goal: string; days: number; done: string[] };

export default function GoalPlanner() {
  const [goalId, setGoalId] = useState<string | null>(null);
  const [days, setDays] = useState<number>(30);
  const [done, setDone] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 前回の続きから再開できるようにする（PMとしての体験）
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Saved;
        if (s.goal && getGoal(s.goal)) {
          setGoalId(s.goal);
          setDays(s.days ?? 30);
          setDone(Array.isArray(s.done) ? s.done : []);
        }
      }
    } catch {
      /* localStorage 不可でも動く */
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: Partial<Saved>) => {
    try {
      const cur: Saved = { goal: goalId ?? "", days, done };
      localStorage.setItem(STORE_KEY, JSON.stringify({ ...cur, ...next }));
    } catch {
      /* ignore */
    }
  }, [goalId, days, done]);

  function chooseGoal(id: string) {
    const g = getGoal(id);
    const d = g?.defaultDays ?? 30;
    setGoalId(id);
    setDays(d);
    setDone([]);
    persist({ goal: id, days: d, done: [] });
    track("goal_select", { goal: id, days: d });
  }

  function chooseDays(d: number) {
    setDays(d);
    persist({ days: d });
  }

  function toggleStep(stepId: string) {
    const isDone = done.includes(stepId);
    const next = isDone ? done.filter((x) => x !== stepId) : [...done, stepId];
    setDone(next);
    persist({ done: next });
    if (!isDone && goalId) track("goal_step_done", { goal: goalId, step: stepId });
  }

  function reset() {
    setGoalId(null);
    setDone([]);
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      /* ignore */
    }
  }

  const goal = goalId ? getGoal(goalId) : undefined;
  const total = goal?.steps.length ?? 0;
  const doneCount = goal ? goal.steps.filter((s) => done.includes(s.id)).length : 0;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const nextStep = goal?.steps.find((s) => !done.includes(s.id));

  return (
    <section id="plan" className="relative z-10 scroll-mt-20 bg-[#F1F3F3]">
      <div className="max-w-[880px] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-4">
        <div className="rounded-[1.6rem] bg-white border border-[#1B2024]/10 shadow-[0_24px_60px_-40px_rgba(20,32,26,0.55)] overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-[#2E4A66] text-[#F1F3F3] px-6 sm:px-9 py-6 sm:py-7">
            <div className="font-mono text-[11px] tracking-[0.24em] uppercase text-[#70B0B0]">
              30秒・無料・匿名
            </div>
            <h2
              className="mt-2.5 text-[1.35rem] sm:text-[1.7rem] font-[800] leading-[1.4] text-[#F1F3F3]"
              style={HEAD}
            >
              {goal ? (
                <>
                  {goal.label}まで
                  <span className="text-[#70B0B0]">あと{days}日</span>のプラン。
                </>
              ) : (
                <>
                  迎えたい日は？ <span className="text-[#70B0B0]">プランを作ります。</span>
                </>
              )}
            </h2>
            <p className="mt-2 text-[14px] sm:text-[15px] text-[#C3D3D6] leading-[1.8]">
              {goal
                ? goal.outcome + "ために、その日までにやることを順番に並べました。"
                : "その日までにやることを、順番に。一つずつ終わらせれば間に合います。"}
            </p>
          </div>

          <div className="px-6 sm:px-9 py-7">
            {/* ステップ1: 目的を選ぶ */}
            {!goal ? (
              <>
                <div className="text-[13.5px] font-bold tracking-[0.08em] text-[#5E6E76] mb-4">
                  迎えたい日を選ぶ
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => chooseGoal(g.id)}
                      className="group text-left rounded-[1.2rem] bg-[#FAFBFB] hover:bg-white px-5 py-4 transition-all duration-200 hover:shadow-[0_18px_40px_-28px_rgba(20,32,26,0.55)] hover:-translate-y-0.5"
                    >
                      <span className="text-[15.5px] font-bold text-[#1B2024] leading-[1.5]" style={HEAD}>
                        {g.label}
                      </span>
                      <p className="mt-1.5 text-[13.5px] text-[#414A50] leading-[1.8]">
                        {g.outcome}
                      </p>
                      <span className="mt-2.5 inline-flex items-center gap-1 text-[13.5px] font-bold text-[#2F6F79]">
                        {g.defaultDays}日プランを作る{" "}
                        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                {/* 期限がない人・贈りたい人は別導線へ（主導線は3つに絞る） */}
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-[#414A50]">
                  <Link href="/#index" className="hover:text-[#1B2024] underline underline-offset-2">
                    期限はないが、整えたい
                  </Link>
                  <Link href="/apply" className="hover:text-[#1B2024] underline underline-offset-2">
                    大切な人に贈りたい
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* 期日の調整 */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-[13.5px] font-bold tracking-[0.08em] text-[#5E6E76] mr-1">
                    その日まで
                  </span>
                  {DAY_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => chooseDays(d)}
                      className={`rounded-full px-3.5 py-1.5 text-[14px] font-bold transition-colors ${
                        d === days
                          ? "bg-[#2E4A66] text-[#F1F3F3]"
                          : "bg-[#FAFBFB] text-[#414A50] hover:bg-[#E2EAEA]"
                      }`}
                    >
                      {d}日
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={reset}
                    className="ml-auto text-[13.5px] text-[#5E6E76] hover:text-[#1B2024] underline underline-offset-2"
                  >
                    目的を選び直す
                  </button>
                </div>

                {/* 進捗バー */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[14px] font-bold text-[#1B2024]">
                      {doneCount} / {total} 完了
                    </span>
                    <span className="font-mono text-[13.5px] text-[#2F6F79] tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#e7ece4] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2F6F79] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* 今週やること */}
                {loaded && nextStep ? (
                  <div className="mb-6 rounded-[1.2rem] bg-[#2E4A66] text-[#F1F3F3] px-5 py-4">
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#70B0B0]">
                      今週やること
                    </div>
                    <p className="mt-1.5 text-[15px] font-bold" style={HEAD}>
                      {nextStep.title}
                    </p>
                    <p className="mt-1 text-[13.5px] text-[#C3D3D6] leading-[1.8]">{nextStep.why}</p>
                    <Link
                      href={`/areas/${nextStep.areaId}/${nextStep.slug}`}
                      className="mt-2.5 inline-flex items-center gap-1 text-[14px] font-bold text-[#70B0B0] hover:text-[#F1F3F3] transition-colors"
                    >
                      やり方を読む <span aria-hidden>→</span>
                    </Link>
                  </div>
                ) : null}

                {loaded && !nextStep ? (
                  <div className="mb-6 rounded-[1.2rem] bg-[#2E4A66] text-[#F1F3F3] px-5 py-4">
                    <p className="text-[15px] font-bold" style={HEAD}>
                      全部、終わりました。
                    </p>
                    <p className="mt-1 text-[13.5px] text-[#C3D3D6] leading-[1.8]">
                      あとは当日を迎えるだけです。仕上げを一緒に確認することもできます。
                    </p>
                  </div>
                ) : null}

                {/* ロードマップ（タイムライン） */}
                <div className="text-[13.5px] font-bold tracking-[0.08em] text-[#5E6E76] mb-3">
                  {goal.label}までのロードマップ
                </div>
                <ol className="relative">
                  {goal.steps.map((s, i) => {
                    const isDone = done.includes(s.id);
                    const isNext = nextStep?.id === s.id;
                    return (
                      <li key={s.id} className="relative flex gap-3 pb-4 last:pb-0">
                        {/* 縦線 */}
                        {i < goal.steps.length - 1 && (
                          <span
                            aria-hidden
                            className={`absolute left-[11px] top-7 bottom-0 w-px ${
                              isDone ? "bg-[#2F6F79]" : "bg-[#e7ece4]"
                            }`}
                          />
                        )}
                        {/* チェック */}
                        <button
                          type="button"
                          onClick={() => toggleStep(s.id)}
                          aria-pressed={isDone}
                          aria-label={`${s.title}を${isDone ? "未完了に戻す" : "完了にする"}`}
                          className={`relative z-10 mt-0.5 grid place-items-center w-[23px] h-[23px] shrink-0 rounded-full border-2 transition-colors ${
                            isDone
                              ? "bg-[#2F6F79] border-[#2F6F79] text-white"
                              : "bg-white border-[#D6DCDC] hover:border-[#2F6F79]"
                          }`}
                        >
                          {isDone ? <span className="text-[13.5px] leading-none">✓</span> : null}
                        </button>
                        {/* 中身 */}
                        <div className={`flex-1 min-w-0 ${isDone ? "opacity-55" : ""}`}>
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="font-mono text-[11px] text-[#5E6E76]">{s.when}</span>
                            {isNext && (
                              <span className="rounded-full bg-[#E2EAEA] text-[#2F6F79] px-2 py-0.5 text-[10px] font-bold">
                                次はここ
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-[15.5px] font-bold text-[#1B2024] leading-[1.5] ${
                              isDone ? "line-through" : ""
                            }`}
                            style={HEAD}
                          >
                            {s.title}
                          </p>
                          <p className="mt-0.5 text-[13.5px] text-[#414A50] leading-[1.8]">{s.why}</p>
                          <Link
                            href={`/areas/${s.areaId}/${s.slug}`}
                            className="mt-1 inline-flex items-center gap-1 text-[13.5px] font-bold text-[#2F6F79] hover:opacity-70 transition-opacity"
                          >
                            やり方を読む <span aria-hidden>→</span>
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {/* 相談は最後。まず自分で進められる。困ったら相談。 */}
                <div className="mt-7 border-t border-[#1B2024]/10 pt-5">
                  <p className="text-[14px] text-[#414A50] leading-[1.9]">
                    ここまで自分で進められます。迷ったとき・自分の場合を詰めたいときだけ、
                    どうぞ。
                  </p>
                  <ConsultLink
                    market={goal.id}
                    className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#1B2024]/20 hover:border-[#2F6F79] text-[#1B2024] text-[14.5px] font-bold px-6 py-2.5 transition-colors"
                  >
                    このプランを、一緒に詰める <span aria-hidden>→</span>
                  </ConsultLink>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
